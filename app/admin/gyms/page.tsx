"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, MapPin, Phone, Mail, Calendar, Users } from "lucide-react"
import Link from "next/link"

interface Gym {
  id: number
  name: string
  email: string
  phone: string
  address: string
  doctorCount: number
  appointmentCount: number
}

export default function AdminGyms() {
  const { user } = useAuth()
  const [gyms, setGyms] = useState<Gym[]>([])
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchGyms = async () => {
      if (!user) return

      try {
        // Get all gyms
        const { data: gymsData, error: gymsError } = await supabase
          .from("gyms")
          .select("id, name, email, phone, address")

        if (gymsError) throw gymsError

        // Get additional stats for each gym
        const gymsWithStats = await Promise.all(
          gymsData?.map(async (gym) => {
            // Get doctor count
            const { count: doctorCount } = await supabase
              .from("doctor_locations")
              .select("*", { count: "exact", head: true })
              .eq("gym_id", gym.id)

            // Get appointment count
            const { count: appointmentCount } = await supabase
              .from("appointments")
              .select("*", { count: "exact", head: true })
              .eq("gym_id", gym.id)

            return {
              ...gym,
              doctorCount: doctorCount || 0,
              appointmentCount: appointmentCount || 0,
            }
          }) || [],
        )

        setGyms(gymsWithStats)
        setFilteredGyms(gymsWithStats)
      } catch (error) {
        console.error("Error fetching gyms:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGyms()
  }, [user, supabase])

  useEffect(() => {
    // Filter gyms based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const filtered = gyms.filter(
        (gym) =>
          gym.name.toLowerCase().includes(query) ||
          gym.address.toLowerCase().includes(query) ||
          gym.email.toLowerCase().includes(query),
      )
      setFilteredGyms(filtered)
    } else {
      setFilteredGyms(gyms)
    }
  }, [searchQuery, gyms])

  return (
    <RouteGuard allowedRoles={["admin"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-3xl font-bold">Gyms</h1>

              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search gyms..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button>Add Gym</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Gyms</CardTitle>
                <CardDescription>Manage and monitor all gym locations in the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-10">Loading gyms...</div>
                ) : filteredGyms.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Providers</TableHead>
                          <TableHead>Appointments</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGyms.map((gym) => (
                          <TableRow key={gym.id}>
                            <TableCell className="font-medium">{gym.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{gym.address}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>{gym.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>{gym.phone}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{gym.doctorCount}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{gym.appointmentCount}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/gyms/${gym.id}`}>View Details</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/gyms/${gym.id}/edit`}>Edit</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Delete</DropdownMenuItem>
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
                    <p className="mb-4">No gyms found.</p>
                    {searchQuery && <p className="text-muted-foreground">Try adjusting your search query.</p>}
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
