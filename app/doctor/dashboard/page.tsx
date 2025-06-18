"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, User, Activity, BarChart3 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface AppointmentSummary {
  total: number
  upcoming: number
  completed: number
  cancelled: number
}

interface ClientSummary {
  total: number
  new: number
  returning: number
}

interface TopClient {
  id: number
  name: string
  visits: number
  lastVisit: string
}

interface TopService {
  id: number
  name: string
  count: number
  revenue: number
}

export default function DoctorDashboard() {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<AppointmentSummary>({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  })
  const [clients, setClients] = useState<ClientSummary>({
    total: 0,
    new: 0,
    returning: 0,
  })
  const [topClients, setTopClients] = useState<TopClient[]>([])
  const [topServices, setTopServices] = useState<TopService[]>([])
  const [averageVisitsPerClient, setAverageVisitsPerClient] = useState<number>(0)
  const [todaysAppointments, setTodaysAppointments] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90" | "365">("30")

  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !userProfile) return

      try {
        // Fetch appointment summary
        const { data: appointmentData } = await supabase
          .from("appointments")
          .select("appointment_status, appointment_date")
          .eq("doctor_id", userProfile.id)

        if (appointmentData) {
          const total = appointmentData.length
          const upcoming = appointmentData.filter((a) => a.appointment_status === "scheduled").length
          const completed = appointmentData.filter((a) => a.appointment_status === "completed").length
          const cancelled = appointmentData.filter((a) => a.appointment_status === "cancelled").length

          setAppointments({
            total,
            upcoming,
            completed,
            cancelled,
          })
        }

        // Fetch client summary
        const { data: patientData } = await supabase
          .from("appointments")
          .select("patient_id, created_at")
          .eq("doctor_id", userProfile.id)
          .order("created_at", { ascending: false })

        if (patientData) {
          const uniquePatients = [...new Set(patientData.map((p) => p.patient_id))]
          const total = uniquePatients.length

          // Consider patients from last 30 days as new
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

          const recentPatients = patientData.filter((p) => new Date(p.created_at) > thirtyDaysAgo)
          const uniqueRecentPatients = [...new Set(recentPatients.map((p) => p.patient_id))]
          const newPatients = uniqueRecentPatients.length

          setClients({
            total,
            new: newPatients,
            returning: total - newPatients,
          })

          // Calculate average visits per client
          if (total > 0) {
            setAverageVisitsPerClient(Number((patientData.length / total).toFixed(1)))
          }
        }

        // Fetch top clients
        const { data: topClientData } = await supabase
          .from("appointments")
          .select(`
            patient_id,
            patients:patient_id(
              id,
              name
            ),
            appointment_date
          `)
          .eq("doctor_id", userProfile.id)
          .order("appointment_date", { ascending: false })

        if (topClientData) {
          const clientVisits = topClientData.reduce((acc: any, curr) => {
            const patientId = curr.patient_id
            if (!acc[patientId]) {
              acc[patientId] = {
                id: curr.patients.id,
                name: curr.patients.name,
                visits: 0,
                lastVisit: curr.appointment_date,
              }
            }
            acc[patientId].visits += 1
            return acc
          }, {})

          const topClientsList = Object.values(clientVisits)
            .sort((a: any, b: any) => b.visits - a.visits)
            .slice(0, 5)

          setTopClients(topClientsList as TopClient[])
        }

        // Fetch top services
        const { data: topServiceData } = await supabase
          .from("appointments")
          .select(`
            service_type_id,
            service_types:service_type_id(
              id,
              name
            ),
            price
          `)
          .eq("doctor_id", userProfile.id)

        if (topServiceData) {
          const serviceStats = topServiceData.reduce((acc: any, curr) => {
            const serviceId = curr.service_type_id
            if (!acc[serviceId]) {
              acc[serviceId] = {
                id: curr.service_types.id,
                name: curr.service_types.name,
                count: 0,
                revenue: 0,
              }
            }
            acc[serviceId].count += 1
            acc[serviceId].revenue += curr.price || 0
            return acc
          }, {})

          const topServicesList = Object.values(serviceStats)
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 5)

          setTopServices(topServicesList as TopService[])
        }

        // Fetch today's appointments
        const today = new Date().toISOString().split("T")[0]
        const { data: todayData } = await supabase
          .from("appointments")
          .select(`
            id,
            appointment_time,
            appointment_type,
            patients:patient_id(
              id,
              name
            ),
            gyms:gym_id(
              id,
              name
            ),
            service_types:service_type_id(
              id,
              name
            )
          `)
          .eq("doctor_id", userProfile.id)
          .eq("appointment_date", today)
          .order("appointment_time", { ascending: true })

        setTodaysAppointments(todayData || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, userProfile, supabase, timeRange])

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours, 10))
    date.setMinutes(Number.parseInt(minutes, 10))
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <RouteGuard allowedRoles={["doctor"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{format(new Date(), "MMMM d, yyyy")}</p>
              </div>
            </div>

            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{clients.total}</div>
                      <p className="text-xs text-muted-foreground mt-1">{clients.new} new in the last 30 days</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{appointments.total}</div>
                      <p className="text-xs text-muted-foreground mt-1">{appointments.upcoming} upcoming</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg. Visits Per Client</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{averageVisitsPerClient}</div>
                      <p className="text-xs text-muted-foreground mt-1">Lifetime average</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {appointments.total ? Math.round((appointments.completed / appointments.total) * 100) : 0}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {appointments.completed} completed appointments
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {topClients.length > 0 ? (
                        <div className="space-y-4">
                          {topClients.map((client) => (
                            <div key={client.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{client.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Last visit: {format(new Date(client.lastVisit), "MMM d, yyyy")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <p className="font-medium">{client.visits}</p>
                                  <p className="text-xs text-muted-foreground">visits</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">No client data available</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {topServices.length > 0 ? (
                        <div className="space-y-4">
                          {topServices.map((service) => (
                            <div key={service.id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-sm text-muted-foreground">{service.count} appointments</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${service.revenue.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">revenue</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">No service data available</div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center mt-6">
                  <Button asChild>
                    <Link href="/doctor/schedule">View Full Schedule</Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todaysAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {todaysAppointments.map((appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Clock className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{formatTime(appointment.appointment_time)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.service_types?.name || appointment.appointment_type}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">{appointment.patients?.name}</p>
                              <p className="text-sm text-muted-foreground">{appointment.gyms?.name}</p>
                            </div>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No appointments today</h3>
                        <p className="text-muted-foreground mb-4">
                          You don't have any appointments scheduled for today.
                        </p>
                        <Button asChild>
                          <Link href="/doctor/schedule">View Full Schedule</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
