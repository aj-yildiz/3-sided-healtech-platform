"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { CalendarIcon, Clock, MapPin, User, AlertCircle } from "lucide-react"
import { cancelAppointment } from "@/app/actions/patient-actions"
import Link from "next/link"

// Set up the localizer for the calendar
const localizer = momentLocalizer(moment)

interface Appointment {
  id: string
  appointment_date: string
  start_time: string
  status: string
  practitioner_id: string
  gym_id: string
}

export default function PatientAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true)
      setError(null)
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData.session?.user
        if (!user) throw new Error("No user session")
        // Get patient id
        const { data: patientRow, error: patientError } = await supabase
          .from("patients")
          .select("id")
          .eq("user_id", user.id)
          .single()
        if (patientError) throw patientError
        if (!patientRow) throw new Error("No patient record found for this user.")
        const { data, error } = await supabase
          .from("appointments")
          .select("id, appointment_date, start_time, status, practitioner_id, gym_id")
          .eq("patient_id", patientRow.id)
          .order("appointment_date", { ascending: true })
        if (error) throw error
        setAppointments((data as Appointment[]) || [])
        setLoading(false)
        console.log("Loaded appointments:", data)
      } catch (err: any) {
        setError(err.message || "Failed to load appointments")
        setLoading(false)
        console.error("Error loading appointments:", err)
      }
    }
    fetchAppointments()
  }, [])

  const handleCancelAppointment = async (id: number) => {
    try {
      setCancellingId(id)
      await cancelAppointment(id)

      // Update the local state
      setAppointments(appointments.map((app) => (app.id === id ? { ...app, status: "cancelled" } : app)))

      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been successfully cancelled.",
      })
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
      })
    } finally {
      setCancellingId(null)
      setIsCancelDialogOpen(false)
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

  // Filter appointments by status
  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter(
          (app) =>
            app.status === "scheduled" &&
            new Date(`${app.appointment_date}T${app.start_time}`) >= new Date(),
        )
        .sort(
          (a, b) =>
            new Date(`${a.appointment_date}T${a.start_time}`).getTime() -
            new Date(`${b.appointment_date}T${b.start_time}`).getTime(),
        ),
    [appointments],
  )

  const pastAppointments = useMemo(
    () =>
      appointments
        .filter(
          (app) =>
            app.status === "completed" ||
            (app.status === "scheduled" &&
              new Date(`${app.appointment_date}T${app.start_time}`) < new Date()),
        )
        .sort(
          (a, b) =>
            new Date(`${b.appointment_date}T${b.start_time}`).getTime() -
            new Date(`${a.appointment_date}T${a.start_time}`).getTime(),
        ),
    [appointments],
  )

  const cancelledAppointments = useMemo(
    () =>
      appointments
        .filter((app) => app.status === "cancelled")
        .sort(
          (a, b) =>
            new Date(`${b.appointment_date}T${b.start_time}`).getTime() -
            new Date(`${a.appointment_date}T${a.start_time}`).getTime(),
        ),
    [appointments],
  )

  // Format appointments for the calendar
  const calendarEvents = useMemo(
    () =>
      appointments.map((appointment) => {
        const startDate = new Date(`${appointment.appointment_date}T${appointment.start_time}`)
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // Assuming 1 hour appointments

        return {
          id: appointment.id,
          title: `${appointment.status} with ${appointment.practitioner_id}`,
          start: startDate,
          end: endDate,
          status: appointment.status,
          resource: appointment,
        }
      }),
    [appointments],
  )

  // Custom event styling for the calendar
  const eventStyleGetter = (event: any) => {
    const style = {
      backgroundColor: "#3182ce", // Default blue
      borderRadius: "4px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    }

    if (event.status === "cancelled") {
      style.backgroundColor = "#A0AEC0" // Gray for cancelled
    } else if (event.status === "completed") {
      style.backgroundColor = "#38A169" // Green for completed
    }

    return { style }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-6">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold">My Appointments</h1>
            <Link href="/patient/find-provider">
              <Button className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Book New Appointment
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <Tabs defaultValue="upcoming" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
                  <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled ({cancelledAppointments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                  {loading ? (
                    <div className="text-center py-10">Loading appointments...</div>
                  ) : upcomingAppointments.length > 0 ? (
                    <div className="grid gap-4">
                      {upcomingAppointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          onViewDetails={() => {
                            setSelectedAppointment(appointment)
                            setIsDetailsOpen(true)
                          }}
                          onCancel={() => {
                            setSelectedAppointment(appointment)
                            setIsCancelDialogOpen(true)
                          }}
                          isCancelling={cancellingId === appointment.id}
                          formatDate={formatDate}
                          formatTime={formatTime}
                          getStatusBadge={getStatusBadge}
                        />
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
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          onViewDetails={() => {
                            setSelectedAppointment(appointment)
                            setIsDetailsOpen(true)
                          }}
                          showCancel={false}
                          formatDate={formatDate}
                          formatTime={formatTime}
                          getStatusBadge={getStatusBadge}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p>You don't have any past appointments.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="cancelled">
                  {loading ? (
                    <div className="text-center py-10">Loading appointments...</div>
                  ) : cancelledAppointments.length > 0 ? (
                    <div className="grid gap-4">
                      {cancelledAppointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          onViewDetails={() => {
                            setSelectedAppointment(appointment)
                            setIsDetailsOpen(true)
                          }}
                          showCancel={false}
                          formatDate={formatDate}
                          formatTime={formatTime}
                          getStatusBadge={getStatusBadge}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p>You don't have any cancelled appointments.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="calendar">
              <Card>
                <CardContent className="p-6">
                  <div className="h-[600px]">
                    <Calendar
                      localizer={localizer}
                      events={calendarEvents}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: "100%" }}
                      eventPropGetter={eventStyleGetter}
                      onSelectEvent={(event) => {
                        setSelectedAppointment(event.resource)
                        setIsDetailsOpen(true)
                      }}
                      views={["month", "week", "day"]}
                      defaultView="month"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedAppointment.status}</h3>
                {getStatusBadge(selectedAppointment.status)}
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedAppointment.practitioner_id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <p>{formatDate(selectedAppointment.appointment_date)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <p>{formatTime(selectedAppointment.start_time)}</p>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedAppointment.gym_id}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-xs font-medium mb-1">Contact Information:</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {selectedAppointment && selectedAppointment.status === "scheduled" && (
              <Button
                variant="destructive"
                onClick={() => {
                  setIsDetailsOpen(false)
                  setIsCancelDialogOpen(true)
                }}
              >
                Cancel Appointment
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="font-medium">
                  {selectedAppointment.status} with {selectedAppointment.practitioner_id}
                </p>
                <p className="text-sm">
                  {formatDate(selectedAppointment.appointment_date)} at{" "}
                  {formatTime(selectedAppointment.start_time)}
                </p>
                <p className="text-sm">{selectedAppointment.gym_id}</p>
              </div>

              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">Cancellation policy may apply. Please check with your provider.</p>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={() => selectedAppointment && handleCancelAppointment(selectedAppointment.id)}
              disabled={cancellingId !== null}
            >
              {cancellingId !== null ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-center py-4">{error}</div>
      )}
    </div>
  )
}

// Appointment Card Component
function AppointmentCard({
  appointment,
  onViewDetails,
  onCancel,
  showCancel = true,
  isCancelling = false,
  formatDate,
  formatTime,
  getStatusBadge,
}: {
  appointment: Appointment
  onViewDetails: () => void
  onCancel?: () => void
  showCancel?: boolean
  isCancelling?: boolean
  formatDate: (date: string) => string
  formatTime: (time: string) => string
  getStatusBadge: (status: string) => JSX.Element
}) {
  const isPast = new Date(`${appointment.appointment_date}T${appointment.start_time}`) < new Date()

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold">{appointment.practitioner_id}</h3>
            </div>
            <p className="text-muted-foreground">{appointment.status}</p>

            <div className="flex items-center mt-4">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>{formatDate(appointment.appointment_date)}</span>
            </div>

            <div className="flex items-center mt-2">
              <Clock className="mr-2 h-4 w-4" />
              <span>{formatTime(appointment.start_time)}</span>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
            {getStatusBadge(appointment.status)}

            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={onViewDetails}>
                View Details
              </Button>

              {showCancel && appointment.status === "scheduled" && !isPast && (
                <Button variant="destructive" size="sm" onClick={onCancel} disabled={isCancelling}>
                  {isCancelling ? "Cancelling..." : "Cancel"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
