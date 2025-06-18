"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, addDays, startOfWeek, isSameDay } from "date-fns"
import { MapPin } from "lucide-react"
import Link from "next/link"

interface Doctor {
  id: number
  name: string
  specialization: string | null
  services: { id: number; name: string }[]
}

interface GymLocation {
  gym_id: number
  gym_name: string
  gym_address: string
}

interface Availability {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
  gym_id: number
  gym_name: string
  gym_address: string
}

interface TimeSlot {
  time: string
  available: boolean
  appointmentId?: number
}

export default function DoctorSchedule() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.id as string
  const { user } = useAuth()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [locations, setLocations] = useState<GymLocation[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!doctorId) return

      try {
        // Get doctor details
        const { data: doctorData, error: doctorError } = await supabase
          .from("doctors")
          .select("id, name, specialization")
          .eq("id", doctorId)
          .single()

        if (doctorError) throw doctorError

        // Get doctor services
        const { data: servicesData, error: servicesError } = await supabase
          .from("doctor_services")
          .select("service_types:service_type_id(id, name)")
          .eq("doctor_id", doctorId)

        if (servicesError) throw servicesError

        const services = servicesData?.map((s) => s.service_types) || []

        // Get doctor locations
        const { data: locationsData, error: locationsError } = await supabase
          .from("doctor_locations")
          .select(`
            gym_id,
            gyms:gym_id(id, name, address)
          `)
          .eq("doctor_id", doctorId)

        if (locationsError) throw locationsError

        const gymLocations =
          locationsData?.map((l) => ({
            gym_id: l.gym_id,
            gym_name: l.gyms.name,
            gym_address: l.gyms.address,
          })) || []

        // Get doctor availability
        const { data: availabilityData, error: availabilityError } = await supabase
          .from("doctor_availability")
          .select(`
            id,
            day_of_week,
            start_time,
            end_time,
            gym_id,
            gyms:gym_id(name, address)
          `)
          .eq("doctor_id", doctorId)

        if (availabilityError) throw availabilityError

        const formattedAvailability =
          availabilityData?.map((a) => ({
            id: a.id,
            day_of_week: a.day_of_week,
            start_time: a.start_time,
            end_time: a.end_time,
            gym_id: a.gym_id,
            gym_name: a.gyms.name,
            gym_address: a.gyms.address,
          })) || []

        setDoctor({
          id: doctorData.id,
          name: doctorData.name,
          specialization: doctorData.specialization,
          services,
        })

        setLocations(gymLocations)
        setAvailability(formattedAvailability)

        if (gymLocations.length > 0) {
          setSelectedGymId(gymLocations[0].gym_id)
        }

        // Generate time slots for the selected date and gym
        if (gymLocations.length > 0) {
          generateTimeSlots(new Date(), gymLocations[0].gym_id, formattedAvailability)
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorData()
  }, [doctorId, supabase])

  useEffect(() => {
    if (selectedDate && selectedGymId && availability.length > 0) {
      generateTimeSlots(selectedDate, selectedGymId, availability)
    }
  }, [selectedDate, selectedGymId, availability])

  const generateTimeSlots = async (date: Date, gymId: number, availabilityData: Availability[]) => {
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.

    // Find availability for this day and gym
    const dayAvailability = availabilityData.find((a) => a.day_of_week === dayOfWeek && a.gym_id === gymId)

    if (!dayAvailability) {
      setTimeSlots([])
      return
    }

    // Generate time slots in 30-minute increments
    const slots: TimeSlot[] = []
    const [startHour, startMinute] = dayAvailability.start_time.split(":").map(Number)
    const [endHour, endMinute] = dayAvailability.end_time.split(":").map(Number)

    let currentHour = startHour
    let currentMinute = startMinute

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`

      // Check if this slot is already booked
      const formattedDate = format(date, "yyyy-MM-dd")
      const { data: existingAppointment } = await supabase
        .from("appointments")
        .select("id")
        .eq("doctor_id", doctorId)
        .eq("gym_id", gymId)
        .eq("appointment_date", formattedDate)
        .eq("appointment_time", timeString)
        .single()

      slots.push({
        time: timeString,
        available: !existingAppointment,
        appointmentId: existingAppointment?.id,
      })

      // Increment by 30 minutes
      currentMinute += 30
      if (currentMinute >= 60) {
        currentHour += 1
        currentMinute = 0
      }
    }

    setTimeSlots(slots)
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const handleBookAppointment = (time: string) => {
    if (!doctor || !selectedGymId) return

    router.push(
      `/patient/book-appointment?doctor=${doctor.id}&gym=${selectedGymId}&date=${format(selectedDate, "yyyy-MM-dd")}&time=${time}`,
    )
  }

  // Generate dates for the next 7 days
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(new Date()), i))

  return (
    <RouteGuard allowedRoles={["patient"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container max-w-5xl">
            {loading ? (
              <div className="text-center py-10">Loading doctor schedule...</div>
            ) : doctor ? (
              <>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold">{doctor.name}</h1>
                    <p className="text-muted-foreground">{doctor.specialization || "General Healthcare"}</p>
                  </div>

                  <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                    {doctor.services.map((service) => (
                      <Badge key={service.id} variant="outline">
                        {service.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Select Location</CardTitle>
                    <CardDescription>Choose a gym location to view availability</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs
                      value={selectedGymId?.toString() || ""}
                      onValueChange={(value) => setSelectedGymId(Number.parseInt(value))}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {locations.map((location) => (
                          <TabsTrigger key={location.gym_id} value={location.gym_id.toString()}>
                            {location.gym_name}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {locations.map((location) => (
                        <TabsContent key={location.gym_id} value={location.gym_id.toString()}>
                          <div className="flex items-center mt-2">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{location.gym_address}</span>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Date</CardTitle>
                      <CardDescription>Choose a date to view available time slots</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-4">
                        <div className="flex overflow-x-auto pb-2 mb-2">
                          {weekDates.map((date) => (
                            <Button
                              key={date.toISOString()}
                              variant={isSameDay(date, selectedDate) ? "default" : "outline"}
                              className="mr-2 min-w-[100px]"
                              onClick={() => setSelectedDate(date)}
                            >
                              <div className="flex flex-col">
                                <span>{format(date, "EEE")}</span>
                                <span>{format(date, "MMM d")}</span>
                              </div>
                            </Button>
                          ))}
                        </div>

                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          className="rounded-md border"
                          disabled={(date) => {
                            // Disable dates where the doctor doesn't work at this gym
                            const dayOfWeek = date.getDay()
                            return !availability.some((a) => a.day_of_week === dayOfWeek && a.gym_id === selectedGymId)
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Available Time Slots</CardTitle>
                      <CardDescription>{format(selectedDate, "EEEE, MMMM d, yyyy")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {timeSlots.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {timeSlots.map((slot, index) => (
                            <Button
                              key={index}
                              variant={slot.available ? "outline" : "ghost"}
                              className={!slot.available ? "opacity-50 cursor-not-allowed" : ""}
                              disabled={!slot.available}
                              onClick={() => handleBookAppointment(slot.time)}
                            >
                              {formatTime(slot.time)}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No available time slots for this date.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="mb-4">Doctor not found.</p>
                <Button asChild>
                  <Link href="/patient/find-provider">Find Another Provider</Link>
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
