"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Calendar, Building, Activity, DollarSign, PieChart, UserPlus } from "lucide-react"

interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  totalGyms: number
  totalAppointments: number
  recentAppointments: any[]
  newPatients: number
  newDoctors: number
  newGyms: number
  totalRevenue: number
  pendingPayments: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalGyms: 0,
    totalAppointments: 0,
    recentAppointments: [],
    newPatients: 0,
    newDoctors: 0,
    newGyms: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("week")
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        // Get total patients
        const { count: patientsCount } = await supabase.from("patients").select("*", { count: "exact", head: true })

        // Get total doctors
        const { count: doctorsCount } = await supabase.from("doctors").select("*", { count: "exact", head: true })

        // Get total gyms
        const { count: gymsCount } = await supabase.from("gyms").select("*", { count: "exact", head: true })

        // Get total appointments
        const { count: appointmentsCount } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })

        // Get recent appointments
        const { data: recentAppointments } = await supabase
          .from("appointments")
          .select(`
            id,
            appointment_date,
            appointment_time,
            appointment_status,
            patients:patient_id(name),
            doctors:doctor_id(name),
            gyms:gym_id(name)
          `)
          .order("appointment_date", { ascending: false })
          .limit(10)

        // Get new patients in the last week/month
        const dateFilter =
          timeframe === "week"
            ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

        const { count: newPatientsCount } = await supabase
          .from("patients")
          .select("*", { count: "exact", head: true })
          .gte("created_at", dateFilter)

        // Get new doctors in the last week/month
        const { count: newDoctorsCount } = await supabase
          .from("doctors")
          .select("*", { count: "exact", head: true })
          .gte("created_at", dateFilter)

        // Get new gyms in the last week/month
        const { count: newGymsCount } = await supabase
          .from("gyms")
          .select("*", { count: "exact", head: true })
          .gte("created_at", dateFilter)

        // In a real app, you would fetch actual payment data
        // For this demo, we'll use placeholder values
        const totalRevenue = 15750.25
        const pendingPayments = 2340.5

        setStats({
          totalPatients: patientsCount || 0,
          totalDoctors: doctorsCount || 0,
          totalGyms: gymsCount || 0,
          totalAppointments: appointmentsCount || 0,
          recentAppointments: recentAppointments || [],
          newPatients: newPatientsCount || 0,
          newDoctors: newDoctorsCount || 0,
          newGyms: newGymsCount || 0,
          totalRevenue,
          pendingPayments,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, supabase, timeframe])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours, 10))
    date.setMinutes(Number.parseInt(minutes, 10))
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <RouteGuard allowedRoles={["admin"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>

              <div className="flex items-center mt-4 md:mt-0">
                <Tabs value={timeframe} onValueChange={setTimeframe} className="w-[400px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="week">This Week</TabsTrigger>
                    <TabsTrigger value="month">This Month</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10">Loading dashboard data...</div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Users className="h-10 w-10 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Patients</p>
                          <div className="flex items-end gap-2">
                            <p className="text-3xl font-bold">{stats.totalPatients}</p>
                            <p className="text-sm text-green-600 mb-1">+{stats.newPatients} new</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Activity className="h-10 w-10 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Healthcare Providers</p>
                          <div className="flex items-end gap-2">
                            <p className="text-3xl font-bold">{stats.totalDoctors}</p>
                            <p className="text-sm text-green-600 mb-1">+{stats.newDoctors} new</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Building className="h-10 w-10 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Gyms</p>
                          <div className="flex items-end gap-2">
                            <p className="text-3xl font-bold">{stats.totalGyms}</p>
                            <p className="text-sm text-green-600 mb-1">+{stats.newGyms} new</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-10 w-10 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Appointments</p>
                          <p className="text-3xl font-bold">{stats.totalAppointments}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <DollarSign className="h-10 w-10 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                          <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <DollarSign className="h-10 w-10 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Pending Payments</p>
                          <p className="text-3xl font-bold">{formatCurrency(stats.pendingPayments)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 mt-6 md:grid-cols-3">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Recent Appointments</CardTitle>
                      <CardDescription>Overview of the latest appointments across the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.recentAppointments.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Patient</th>
                                <th className="text-left p-2">Provider</th>
                                <th className="text-left p-2">Location</th>
                                <th className="text-left p-2">Date & Time</th>
                                <th className="text-left p-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.recentAppointments.map((appointment) => (
                                <tr key={appointment.id} className="border-b">
                                  <td className="p-2">{appointment.patients?.name || "Unknown"}</td>
                                  <td className="p-2">{appointment.doctors?.name || "Unknown"}</td>
                                  <td className="p-2">{appointment.gyms?.name || "Unknown"}</td>
                                  <td className="p-2">
                                    {formatDate(appointment.appointment_date)} at{" "}
                                    {formatTime(appointment.appointment_time)}
                                  </td>
                                  <td className="p-2">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        appointment.appointment_status === "scheduled"
                                          ? "bg-blue-100 text-blue-800"
                                          : appointment.appointment_status === "completed"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {appointment.appointment_status.charAt(0).toUpperCase() +
                                        appointment.appointment_status.slice(1)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4">No recent appointments found</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Link href="/admin/invite-doctor">
                        <Button className="w-full flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          <span>Invite Healthcare Provider</span>
                        </Button>
                      </Link>

                      <Link href="/admin/reports">
                        <Button className="w-full flex items-center gap-2" variant="outline">
                          <PieChart className="h-4 w-4" />
                          <span>Generate Reports</span>
                        </Button>
                      </Link>

                      <Link href="/admin/payments">
                        <Button className="w-full flex items-center gap-2" variant="outline">
                          <DollarSign className="h-4 w-4" />
                          <span>Process Payments</span>
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
