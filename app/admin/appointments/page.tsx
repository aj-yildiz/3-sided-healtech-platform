"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { Search, MoreHorizontal, MapPin, Calendar, Clock, User } from "lucide-react"
import Link from "next/link"

interface Appointment {
  id: number
  patient_name: string
  doctor_name: string
  gym_name: string
  gym_address: string
  service_name: string
  appointment_date: string
  appointment_time: string
  appointment_status: string
  price: number | null
}

export default function AdminAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("appointments")
          .select(`
            id,
            appointment_date,
            appointment_time,
            appointment_status,
            price,
            patients:patient_id(name),
            doctors:doctor_id(name),
            gyms:gym_id(name, address),
            service_types:service_type_id(name)
          `)
          .order("appointment_date", { ascending: false })

        if (error) throw error

        const formattedAppointments =
          data?.map((a) => ({
            id: a.id,
            patient_name: a.patients?.name || "Unknown",
            doctor_name: a.doctors?.name || "Unknown",
            gym_name: a.gyms?.name || "Unknown",
            gym_address: a.gyms?.address || "",
            service_name: a.service_types?.name || "General",
            appointment_date: a.appointment_date,
            appointment_time: a.appointment_time,
            appointment_status: a.appointment_status,
            price: a.price,
          })) || []

        setAppointments(formattedAppointments)
        setFilteredAppointments(formattedAppointments)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user, supabase])

  useEffect(() => {
    // Filter appointments based on search query and status filter
    let filtered = appointments

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (appointment) =>
          appointment.patient_name.toLowerCase().includes(query) ||
          appointment.doctor_name.toLowerCase().includes(query) ||
          appointment.gym_name.toLowerCase().includes(query) ||
          appointment.service_name.toLowerCase().includes(query),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.appointment_status === statusFilter)
    }

    setFilteredAppointments(filtered)
  }, [searchQuery, statusFilter, appointments])

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <RouteGuard allowedRoles={["admin"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-3xl font-bold">Appointments</h1>

              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search appointments..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>Manage and monitor all appointments across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-10">Loading appointments...</div>
                ) : filteredAppointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{appointment.patient_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{appointment.doctor_name}</TableCell>
                            <TableCell>{appointment.service_name}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{appointment.gym_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>{formatDate(appointment.appointment_date)}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>{formatTime(appointment.appointment_time)}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.appointment_status)}`}
                              >
                                {appointment.appointment_status.charAt(0).toUpperCase() +
                                  appointment.appointment_status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>{formatCurrency(appointment.price)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/appointments/${appointment.id}`}>View Details</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/appointments/${appointment.id}/edit`}>Edit</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Cancel Appointment</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="mb-4">No appointments found.</p>
                    {(searchQuery || statusFilter !== "all") && (
                      <p className="text-muted-foreground">Try adjusting your filters.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
