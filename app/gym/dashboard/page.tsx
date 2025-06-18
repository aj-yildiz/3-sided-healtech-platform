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
import { Users, Calendar, Activity, TrendingUp, Clock } from "lucide-react"

interface GymStats {
  totalAppointments: number
  upcomingAppointments: number
  totalPatients: number
  newPatients: number
  totalDoctors: number
  recentAppointments: any[]
}

export default function GymDashboard() {
  const { user, userProfile } = useAuth()
  const [stats, setStats] = useState<GymStats>({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalPatients: 0,
    newPatients: 0,
    totalDoctors: 0,
    recentAppointments: [],
  })
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("week")
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || !userProfile) return

      try {
        const gymId = userProfile.id

        // Get total appointments for this gym
        const { count: totalAppointmentsCount } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("gym_id", gymId)

        // Get upcoming appointments
        const today = new Date().toISOString().split("T")[0]
        const { count: upcomingAppointmentsCount } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("gym_id", gymId)
          .gte("appointment_date", today)

        // Get unique patients who have had appointments at this gym
        const { data: uniquePatients } = await supabase
          .from("appointments")
          .select("patient_id")
          .eq("gym_id", gymId)
          .order("patient_id")

        const uniquePatientIds = [...new Set(uniquePatients?.map((a) => a.patient_id))]

        // Get new patients in the last week/month
        const dateFilter =
          timeframe === "week"
            ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

        const { data: newPatients } = await supabase
          .from("appointments")
          .select("patient_id, created_at")
          .eq("gym_id", gymId)
          .gte("created_at", dateFilter)
          .order("patient_id")

        const newPatientIds = [...new Set(newPatients?.map((a) => a.patient_id))]

        // Get doctors who work at this gym
        const { data: doctorLocations } = await supabase
          .from("doctor_locations")
          .select("doctor_id")
          .eq("gym_id", gymId)

        const doctorIds = doctorLocations?.map((dl) => dl.doctor_id) || []

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
            service_types:service_type_id(name)
          `)
          .eq("gym_id", gymId)
          .order("appointment_date", { ascending: false })
          .limit(10)

        setStats({
          totalAppointments: totalAppointmentsCount || 0,
          upcomingAppointments: upcomingAppointmentsCount || 0,
          totalPatients: uniquePatientIds.length,
          newPatients: newPatientIds.length,
          totalDoctors: doctorIds.length,
          recentAppointments: recentAppointments || [],
        })
      } catch (error) {
        console.error("Error fetching gym stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, userProfile, supabase, timeframe])

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

  return (
    <RouteGuard allowedRoles={["gym"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-3xl font-bold">Gym Dashboard</h1>

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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-10 w-10 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Appointments</p>
                          <p className="text-3xl font-bold">{stats.totalAppointments}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Clock className="h-10 w-10 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                          <p className="text-3xl font-bold">{stats.upcomingAppointments}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

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
                </div>

                <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Activity className="h-10 w-10 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Healthcare Providers</p>
                          <p className="text-3xl font-bold">{stats.totalDoctors}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <TrendingUp className="h-10 w-10 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Booking Rate</p>
                          <p className="text-3xl font-bold">78%</p>
                          <p className="text-sm text-muted-foreground">Based on available slots</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Appointments</CardTitle>
                      <CardDescription>Overview of the latest appointments at your gym</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.recentAppointments.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Patient</th>
                                <th className="text-left p-2">Provider</th>
                                <th className="text-left p-2">Service</th>
                                <th className="text-left p-2">Date & Time</th>
                                <th className="text-left p-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.recentAppointments.map((appointment) => (
                                <tr key={appointment.id} className="border-b">
                                  <td className="p-2">{appointment.patients?.name || "Unknown"}</td>
                                  <td className="p-2">{appointment.doctors?.name || "Unknown"}</td>
                                  <td className="p-2">{appointment.service_types?.name || "General"}</td>
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
                </div>

                <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Manage Availability</CardTitle>
                      <CardDescription>Set your gym's available hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/gym/availability">
                        <Button className="w-full">Update Availability</Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Healthcare Providers</CardTitle>
                      <CardDescription>View providers working at your gym</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/gym/doctors">
                        <Button className="w-full">View Providers</Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Analytics</CardTitle>
                      <CardDescription>View detailed performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/gym/analytics">
                        <Button className="w-full">View Analytics</Button>
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
