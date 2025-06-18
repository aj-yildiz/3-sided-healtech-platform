"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, User, MapPin, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Appointment {
  id: number
  appointment_date: string
  appointment_time: string
  appointment_type: string
  patient_name: string
  gym_name: string
  gym_address: string
  service_name: string
}

export default function DoctorSchedule() {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [date, setDate] = useState<Date>(new Date())
  const [view, setView] = useState<"day" | "week" | "month">("week")
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false)
  const [googleCalendarError, setGoogleCalendarError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  const fetchAppointments = useCallback(async () => {
    if (!user || !userProfile) return

    try {
      setLoading(true)

      let startDate, endDate

      if (view === "day") {
        startDate = format(date, "yyyy-MM-dd")
        endDate = startDate
      } else if (view === "week") {
        const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday
        const end = endOfWeek(date, { weekStartsOn: 1 }) // Sunday
        startDate = format(start, "yyyy-MM-dd")
        endDate = format(end, "yyyy-MM-dd")
      } else {
        // Month view
        const start = new Date(date.getFullYear(), date.getMonth(), 1)
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        startDate = format(start, "yyyy-MM-dd")
        endDate = format(end, "yyyy-MM-dd")
      }

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          appointment_type,
          patients:patient_id(name),
          gyms:gym_id(name, address),
          service_types:service_type_id(name)
        `)
        .eq("doctor_id", userProfile.id)
        .gte("appointment_date", startDate)
        .lte("appointment_date", endDate)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true })

      if (error) throw error

      const formattedAppointments = data.map((item) => ({
        id: item.id,
        appointment_date: item.appointment_date,
        appointment_time: item.appointment_time,
        appointment_type: item.appointment_type,
        patient_name: item.patients?.name || "Unknown Patient",
        gym_name: item.gyms?.name || "Unknown Location",
        gym_address: item.gyms?.address || "",
        service_name: item.service_types?.name || item.appointment_type,
      }))

      setAppointments(formattedAppointments)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }, [user, userProfile, supabase, date, view])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

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

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours, 10))
    date.setMinutes(Number.parseInt(minutes, 10))
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const navigatePrevious = () => {
    if (view === "day") {
      setDate((prev) => addDays(prev, -1))
    } else if (view === "week") {
      setDate((prev) => addDays(prev, -7))
    } else {
      setDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    }
  }

  const navigateNext = () => {
    if (view === "day") {
      setDate((prev) => addDays(prev, 1))
    } else if (view === "week") {
      setDate((prev) => addDays(prev, 7))
    } else {
      setDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    }
  }

  const getDateTitle = () => {
    if (view === "day") {
      return format(date, "MMMM d, yyyy")
    } else if (view === "week") {
      const start = startOfWeek(date, { weekStartsOn: 1 })
      const end = endOfWeek(date, { weekStartsOn: 1 })
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
    } else {
      return format(date, "MMMM yyyy")
    }
  }

  const renderDayView = () => {
    const dayAppointments = appointments.filter((app) => isSameDay(parseISO(app.appointment_date), date))

    return (
      <div className="space-y-4">
        {dayAppointments.length > 0 ? (
          dayAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{formatTime(appointment.appointment_time)}</p>
                      <p className="text-sm text-muted-foreground">{appointment.service_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patient_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.gym_name}</p>
                      <p className="text-sm text-muted-foreground">{appointment.gym_address}</p>
                    </div>
                  </div>

                  <Button size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium mb-2">No appointments</h3>
            <p className="text-muted-foreground">You don't have any appointments scheduled for this day.</p>
          </div>
        )}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return (
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, index) => {
          const dayAppointments = appointments.filter((app) => isSameDay(parseISO(app.appointment_date), day))

          return (
            <div key={index} className="border rounded-md p-2">
              <div className="text-center mb-2 sticky top-0 bg-background pb-2 border-b">
                <p className="font-medium">{format(day, "EEE")}</p>
                <p
                  className={`text-sm ${isSameDay(day, new Date()) ? "bg-primary text-primary-foreground rounded-full px-2" : ""}`}
                >
                  {format(day, "d")}
                </p>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {dayAppointments.length > 0 ? (
                  dayAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-primary/10 p-2 rounded text-xs">
                      <p className="font-medium">{formatTime(appointment.appointment_time)}</p>
                      <p className="truncate">{appointment.patient_name}</p>
                      <p className="truncate text-muted-foreground">{appointment.service_name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center text-muted-foreground">No appointments</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderMonthView = () => {
    return (
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && setDate(newDate)}
          className="rounded-md border"
          modifiers={{
            hasAppointment: appointments.map((app) => parseISO(app.appointment_date)),
          }}
          modifiersStyles={{
            hasAppointment: {
              fontWeight: "bold",
              backgroundColor: "hsl(var(--primary) / 0.1)",
              color: "hsl(var(--primary))",
            },
          }}
        />
      </div>
    )
  }

  return (
    <RouteGuard allowedRoles={["doctor"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h1 className="text-3xl font-bold">Schedule</h1>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={navigatePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="min-w-[150px] text-center font-medium">{getDateTitle()}</div>

                <Button variant="outline" size="sm" onClick={navigateNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant={googleCalendarConnected ? "outline" : "default"}
                  size="sm"
                  onClick={connectGoogleCalendar}
                  className="ml-4"
                >
                  {googleCalendarConnected ? "Google Calendar Connected" : "Connect Google Calendar"}
                </Button>
              </div>
            </div>

            {googleCalendarError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{googleCalendarError}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="week" className="space-y-4" onValueChange={(value) => setView(value as any)}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>

              <TabsContent value="day">
                {loading ? <div className="text-center py-10">Loading...</div> : renderDayView()}
              </TabsContent>

              <TabsContent value="week">
                {loading ? <div className="text-center py-10">Loading...</div> : renderWeekView()}
              </TabsContent>

              <TabsContent value="month">
                {loading ? <div className="text-center py-10">Loading...</div> : renderMonthView()}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
