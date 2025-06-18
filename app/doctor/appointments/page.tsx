"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useAuth } from "@/contexts/auth-context"
import { getDoctorProfile, getDoctorAppointments } from "@/app/actions/doctor-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { updateAppointmentStatus, addAppointmentNotes } from "@/app/actions/doctor-actions"
import { LoadingScreen } from "@/components/loading-screen"
import { Phone, Mail, MapPin, CalendarIcon, Clock, FileText, User } from "lucide-react"

// Set up the localizer for the calendar
const localizer = momentLocalizer(moment)

// Define appointment status colors
const statusColors = {
  scheduled: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
  "no-show": "bg-amber-500",
}

export default function DoctorAppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [doctor, setDoctor] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [addingNotes, setAddingNotes] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        const doctorData = await getDoctorProfile(user.id)
        if (doctorData) {
          setDoctor(doctorData)
          const appointmentsData = await getDoctorAppointments(doctorData.id)
          setAppointments(appointmentsData)
        }
      } catch (error) {
        console.error("Error loading doctor data:", error)
        toast({
          title: "Error",
          description: "Failed to load appointments. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, toast])

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    setUpdatingStatus(true)
    try {
      await updateAppointmentStatus(appointmentId, newStatus)

      // Update the local state
      setAppointments(
        appointments.map((apt) => (apt.id === appointmentId ? { ...apt, appointment_status: newStatus } : apt)),
      )

      // Update the selected appointment if it's the one being modified
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, appointment_status: newStatus })
      }

      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating appointment status:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleAddNotes = async () => {
    if (!notes.trim()) return

    setAddingNotes(true)
    try {
      await addAppointmentNotes(selectedAppointment.id, notes)

      // Update the local state
      const updatedAppointments = appointments.map((apt) =>
        apt.id === selectedAppointment.id ? { ...apt, appointment_notes: notes } : apt,
      )
      setAppointments(updatedAppointments)

      // Update the selected appointment
      setSelectedAppointment({ ...selectedAppointment, appointment_notes: notes })

      toast({
        title: "Notes Added",
        description: "Appointment notes have been updated",
      })

      setNotes("")
    } catch (error) {
      console.error("Error adding appointment notes:", error)
      toast({
        title: "Error",
        description: "Failed to add notes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingNotes(false)
    }
  }

  const openAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setNotes(appointment.appointment_notes || "")
    setIsDetailsOpen(true)
  }

  // Filter appointments for tabs
  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter(
        (apt) =>
          apt.appointment_status === "scheduled" &&
          new Date(`${apt.appointment_date} ${apt.appointment_time}`) > new Date(),
      )
      .sort(
        (a, b) =>
          new Date(`${a.appointment_date} ${a.appointment_time}`) -
          new Date(`${b.appointment_date} ${b.appointment_time}`),
      )
  }, [appointments])

  const pastAppointments = useMemo(() => {
    return appointments
      .filter(
        (apt) =>
          apt.appointment_status === "completed" ||
          new Date(`${apt.appointment_date} ${apt.appointment_time}`) < new Date(),
      )
      .sort(
        (a, b) =>
          new Date(`${b.appointment_date} ${b.appointment_time}`) -
          new Date(`${a.appointment_date} ${a.appointment_time}`),
      )
  }, [appointments])

  const cancelledAppointments = useMemo(() => {
    return appointments
      .filter((apt) => apt.appointment_status === "cancelled" || apt.appointment_status === "no-show")
      .sort(
        (a, b) =>
          new Date(`${b.appointment_date} ${b.appointment_time}`) -
          new Date(`${a.appointment_date} ${a.appointment_time}`),
      )
  }, [appointments])

  // Format appointments for the calendar
  const calendarEvents = useMemo(() => {
    return appointments.map((apt) => ({
      id: apt.id,
      title: `${apt.patients.name} - ${apt.service_types?.name || apt.appointment_type}`,
      start: new Date(`${apt.appointment_date} ${apt.appointment_time}`),
      end: new Date(new Date(`${apt.appointment_date} ${apt.appointment_time}`).getTime() + 60 * 60 * 1000), // Assuming 1 hour appointments
      resource: apt,
      className: statusColors[apt.appointment_status] || "bg-gray-500",
    }))
  }, [appointments])

  if (loading) {
    return <LoadingScreen />
  }

  if (!doctor) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Doctor Profile Not Found</h1>
        <p>Please complete your profile setup to view appointments.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledAppointments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-4">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center p-6 bg-muted rounded-lg">
                  <p>No upcoming appointments scheduled.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onClick={() => openAppointmentDetails(appointment)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-4">
              {pastAppointments.length === 0 ? (
                <div className="text-center p-6 bg-muted rounded-lg">
                  <p>No past appointments found.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onClick={() => openAppointmentDetails(appointment)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="mt-4">
              {cancelledAppointments.length === 0 ? (
                <div className="text-center p-6 bg-muted rounded-lg">
                  <p>No cancelled appointments found.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {cancelledAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onClick={() => openAppointmentDetails(appointment)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="h-[600px] bg-white p-4 rounded-lg shadow">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              onSelectEvent={(event) => openAppointmentDetails(event.resource)}
              eventPropGetter={(event) => ({
                className: event.className,
                style: {
                  color: "white",
                  borderRadius: "4px",
                  border: "none",
                  padding: "2px 5px",
                },
              })}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle>Appointment Details</DialogTitle>
                <DialogDescription>
                  <Badge
                    className={`${statusColors[selectedAppointment.appointment_status] || "bg-gray-500"} text-white`}
                  >
                    {selectedAppointment.appointment_status.charAt(0).toUpperCase() +
                      selectedAppointment.appointment_status.slice(1)}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" /> Patient Information
                    </h3>
                    <p className="text-lg font-semibold">{selectedAppointment.patients.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{selectedAppointment.patients.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{selectedAppointment.patients.email}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" /> Date & Time
                    </h3>
                    <p>{moment(selectedAppointment.appointment_date).format("dddd, MMMM D, YYYY")}</p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {moment(selectedAppointment.appointment_time, "HH:mm:ss").format("h:mm A")}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Location
                    </h3>
                    <p className="font-semibold">{selectedAppointment.gyms.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedAppointment.gyms.address}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Service</h3>
                    <p>{selectedAppointment.service_types?.name || selectedAppointment.appointment_type}</p>
                    {selectedAppointment.price && (
                      <p className="text-sm">Price: ${selectedAppointment.price.toFixed(2)}</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Notes
                    </h3>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add appointment notes here..."
                      className="mt-2"
                      rows={4}
                    />
                    <Button onClick={handleAddNotes} className="mt-2" disabled={addingNotes || !notes.trim()} size="sm">
                      {addingNotes ? "Saving..." : "Save Notes"}
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                {selectedAppointment.appointment_status === "scheduled" && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => handleUpdateStatus(selectedAppointment.id, "completed")}
                      disabled={updatingStatus}
                    >
                      Mark as Completed
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedAppointment.id, "no-show")}
                      disabled={updatingStatus}
                    >
                      Mark as No-Show
                    </Button>
                  </>
                )}
                {selectedAppointment.appointment_status !== "cancelled" &&
                  selectedAppointment.appointment_status !== "completed" && (
                    <Button
                      variant="destructive"
                      onClick={() => handleUpdateStatus(selectedAppointment.id, "cancelled")}
                      disabled={updatingStatus}
                    >
                      Cancel Appointment
                    </Button>
                  )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Appointment Card Component
function AppointmentCard({ appointment, onClick }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{appointment.patients.name}</CardTitle>
            <CardDescription>{appointment.service_types?.name || appointment.appointment_type}</CardDescription>
          </div>
          <Badge className={`${statusColors[appointment.appointment_status] || "bg-gray-500"} text-white`}>
            {appointment.appointment_status.charAt(0).toUpperCase() + appointment.appointment_status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>{moment(appointment.appointment_date).format("MMM D, YYYY")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{moment(appointment.appointment_time, "HH:mm:ss").format("h:mm A")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.gyms.name}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="ghost" size="sm" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
