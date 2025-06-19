"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Calendar, Clock, MapPin, User, CalendarDays, Search } from "lucide-react"

interface Appointment {
  id: string
  doctor_name: string
  doctor_specialization: string
  gym_name: string
  gym_address: string
  appointment_date: string
  start_time: string
  end_time: string
  appointment_type: string
  service_name: string
  appointment_status: string
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false)
  const [googleCalendarError, setGoogleCalendarError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return
      setLoading(true)
      setError(null)
      try {
        // First get the patient ID
        const { data: patientData, error: patientError } = await supabase.from("patients").select("id").eq("user_id", user.id).single()
        if (patientError) throw patientError
        if (!patientData) {
          setError("No patient record found for this user.")
          setLoading(false)
          return
        }
        // Then get the appointments with doctor and gym info
        const { data, error } = await supabase
          .from("appointments")
          .select(`
            id,
            appointment_date,
            start_time,
            end_time,
            appointment_type,
            appointment_status,
            doctors:doctor_id(name, specialization),
            gyms:gym_id(name, address),
            service_types:service_type_id(name)
          `)
          .eq("patient_id", patientData.id)
          .order("appointment_date", { ascending: true })
        if (error) throw error
        if (!data) {
          setAppointments([])
          setLoading(false)
          return
        }
        // Transform the data
        const formattedAppointments: Appointment[] = data.map((item: any) => ({
          id: item.id,
          doctor_name: item.doctors?.name || "Unknown",
          doctor_specialization: item.doctors?.specialization || "Healthcare Provider",
          gym_name: item.gyms?.name || "Unknown",
          gym_address: item.gyms?.address || "Unknown",
          appointment_date: item.appointment_date,
          start_time: item.start_time,
          end_time: item.end_time,
          appointment_type: item.appointment_type,
          service_name: item.service_types?.name || item.appointment_type,
          appointment_status: item.appointment_status,
        }))
        setAppointments(formattedAppointments)
        setLoading(false)
        console.log("Loaded appointments:", formattedAppointments)
      } catch (err: any) {
        setError(err.message || "Failed to load appointments")
        setLoading(false)
        console.error("Error loading appointments:", err)
      }
    }
    fetchAppointments()
  }, [user, supabase])

  useEffect(() => {
    const ensurePatientRow = async () => {
      if (!user) return;
      const { data: patientRow } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!patientRow) {
        await supabase.from("patients").insert({
          user_id: user.id,
          name: user.email,
        });
      }
    };
    ensurePatientRow();
  }, [user, supabase]);

  const connectGoogleCalendar = async () => {
    try {
      // In a real implementation, this would redirect to Google OAuth
      // For demo purposes, we'll just simulate a successful connection
      setGoogleCalendarConnected(true)
      setGoogleCalendarError(null)
    } catch (error: any) {
      setGoogleCalendarError(error.message || "Failed to connect to Google Calendar")
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours, 10))
    date.setMinutes(Number.parseInt(minutes, 10))
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const upcomingAppointments = appointments.filter(
    (app) => app.appointment_status === "scheduled" && new Date(app.appointment_date) >= new Date(),
  )

  const pastAppointments = appointments.filter(
    (app) => app.appointment_status === "completed" || new Date(app.appointment_date) < new Date(),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-6">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold">Patient Dashboard</h1>

            <Button
              variant={googleCalendarConnected ? "outline" : "default"}
              onClick={connectGoogleCalendar}
              className="flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              {googleCalendarConnected ? "Google Calendar Connected" : "Connect Google Calendar"}
            </Button>
          </div>

          {googleCalendarError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{googleCalendarError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Find Healthcare Provider</CardTitle>
                <CardDescription>Search for healthcare providers at nearby gyms</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/patient/find-provider">
                  <Button className="w-full flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Find Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Appointments</CardTitle>
                <CardDescription>View and manage your upcoming appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/patient/appointments">
                  <Button className="w-full flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    View All
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/patient/profile">
                  <Button className="w-full flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="text-red-500 text-center py-4">{error}</div>
          )}
          {loading && (
            <div className="text-center py-10">Loading appointments...</div>
          )}

          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
              <TabsTrigger value="past">Past Appointments</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {loading ? (
                <div className="text-center py-10">Loading appointments...</div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="grid gap-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold">{appointment.doctor_name}</h3>
                              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                {appointment.doctor_specialization}
                              </span>
                            </div>
                            <p className="text-muted-foreground">{appointment.service_name}</p>

                            <div className="flex items-center mt-4">
                              <Calendar className="mr-2 h-4 w-4" />
                              <span>{formatDate(appointment.appointment_date)}</span>
                            </div>

                            <div className="flex items-center mt-2">
                              <Clock className="mr-2 h-4 w-4" />
                              <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                            </div>

                            <div className="flex items-center mt-2">
                              <MapPin className="mr-2 h-4 w-4" />
                              <span>
                                {appointment.gym_name} - {appointment.gym_address}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 md:mt-0 flex items-start">
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                appointment.appointment_status === "scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : appointment.appointment_status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {appointment.appointment_status.charAt(0).toUpperCase() +
                                appointment.appointment_status.slice(1)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="mb-4">You don't have any upcoming appointments.</p>
                    <Link href="/patient/find-provider">
                      <Button>Book an Appointment</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past">
              {loading ? (
                <div className="text-center py-10">Loading appointments...</div>
              ) : pastAppointments.length > 0 ? (
                <div className="grid gap-4">
                  {pastAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold">{appointment.doctor_name}</h3>
                              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                {appointment.doctor_specialization}
                              </span>
                            </div>
                            <p className="text-muted-foreground">{appointment.service_name}</p>

                            <div className="flex items-center mt-4">
                              <Calendar className="mr-2 h-4 w-4" />
                              <span>{formatDate(appointment.appointment_date)}</span>
                            </div>

                            <div className="flex items-center mt-2">
                              <Clock className="mr-2 h-4 w-4" />
                              <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                            </div>

                            <div className="flex items-center mt-2">
                              <MapPin className="mr-2 h-4 w-4" />
                              <span>
                                {appointment.gym_name} - {appointment.gym_address}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 md:mt-0 flex items-start">
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                appointment.appointment_status === "scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : appointment.appointment_status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {appointment.appointment_status.charAt(0).toUpperCase() +
                                appointment.appointment_status.slice(1)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="mb-4">You don't have any past appointments.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="calendar">
              {googleCalendarConnected ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="bg-gray-100 rounded-lg p-4 min-h-[400px]">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                          <div key={day} className="text-center font-medium text-sm py-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 35 }).map((_, i) => {
                          const date = new Date()
                          date.setDate(date.getDate() - date.getDay() + 1 + i)

                          // Check if there's an appointment on this date
                          const hasAppointment = appointments.some(
                            (app) => new Date(app.appointment_date).toDateString() === date.toDateString(),
                          )

                          return (
                            <div
                              key={i}
                              className={`
                                text-center p-2 h-16 border rounded-md text-sm
                                ${date.getMonth() === new Date().getMonth() ? "" : "text-gray-400"}
                                ${date.toDateString() === new Date().toDateString() ? "bg-primary/20" : ""}
                                ${hasAppointment ? "border-primary border-2" : ""}
                              `}
                            >
                              <div className="font-medium">{date.getDate()}</div>
                              {hasAppointment && (
                                <div className="mt-1">
                                  <div className="bg-primary h-1.5 w-1.5 rounded-full mx-auto"></div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Connect to Google Calendar</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect your Google Calendar to view and manage your appointments.
                    </p>
                    <Button onClick={connectGoogleCalendar}>Connect Google Calendar</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
