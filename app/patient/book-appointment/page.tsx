"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { CalendarIcon, MapPin, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  getPatientProfile,
  getPatientInsurance,
  bookAppointment,
  submitInsuranceClaim,
} from "@/app/actions/patient-actions"
import { getDoctorAvailabilityForPatient } from "@/app/actions/patient-actions"

interface Doctor {
  id: number
  name: string
  specialization: string | null
}

interface Gym {
  id: number
  name: string
  address: string
}

interface ServiceType {
  id: number
  name: string
}

interface TimeSlot {
  value: string
  label: string
  available: boolean
}

interface Availability {
  id: number
  doctor_id: number
  gym_id: number
  day_of_week: number
  start_time: string
  end_time: string
  gyms: {
    id: number
    name: string
    address: string
  }
}

interface Insurance {
  id: number
  policy_number: string
  group_number: string | null
  insurance_providers: {
    id: number
    name: string
  }
}

export default function BookAppointment() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const doctorId = searchParams.get("doctor")
  const serviceTypeId = searchParams.get("service")

  const [patientId, setPatientId] = useState<number | null>(null)
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [serviceType, setServiceType] = useState<ServiceType | null>(null)
  const [availableLocations, setAvailableLocations] = useState<Availability[]>([])
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [timeSlot, setTimeSlot] = useState<string | null>(null)
  const [price, setPrice] = useState<number>(100) // Default price
  const [useInsurance, setUseInsurance] = useState<boolean>(false)
  const [insuranceOptions, setInsuranceOptions] = useState<Insurance[]>([])
  const [selectedInsurance, setSelectedInsurance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !doctorId || !serviceTypeId) {
        router.push("/patient/find-physio")
        return
      }

      try {
        // Get patient profile
        const patientProfile = await getPatientProfile(user.id)
        if (!patientProfile) {
          router.push("/patient/complete-profile")
          return
        }

        setPatientId(patientProfile.id)

        // Get doctor availability
        const availability = await getDoctorAvailabilityForPatient(Number.parseInt(doctorId))
        setAvailableLocations(availability)

        if (availability.length > 0) {
          setSelectedLocation(availability[0].gym_id)
        }

        // Get patient insurance
        const insurance = await getPatientInsurance(patientProfile.id)
        setInsuranceOptions(insurance)

        if (insurance.length > 0) {
          setSelectedInsurance(insurance[0].id)
        }

        // Set doctor and service type from URL params
        // In a real app, you would fetch these from the API
        setDoctor({
          id: Number.parseInt(doctorId),
          name: "Dr. Smith", // Placeholder
          specialization: "Physiotherapy", // Placeholder
        })

        setServiceType({
          id: Number.parseInt(serviceTypeId),
          name: "Physiotherapy", // Placeholder
        })
      } catch (error: any) {
        console.error("Error fetching data:", error)
        setError(error.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, doctorId, serviceTypeId, router])

  useEffect(() => {
    if (date && selectedLocation) {
      // Generate time slots based on doctor availability
      const dayOfWeek = date.getDay()
      const locationAvailability = availableLocations.find(
        (a) => a.gym_id === selectedLocation && a.day_of_week === dayOfWeek,
      )

      if (locationAvailability) {
        const { start_time, end_time } = locationAvailability
        const startHour = Number.parseInt(start_time.split(":")[0])
        const endHour = Number.parseInt(end_time.split(":")[0])

        const slots: TimeSlot[] = []
        for (let hour = startHour; hour < endHour; hour++) {
          slots.push({
            value: `${hour.toString().padStart(2, "0")}:00`,
            label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`,
            available: true,
          })
        }

        setTimeSlots(slots)
      } else {
        setTimeSlots([])
      }
    } else {
      setTimeSlots([])
    }
  }, [date, selectedLocation, availableLocations])

  const handleBookAppointment = async () => {
    if (!patientId || !doctor || !selectedLocation || !date || !timeSlot || !serviceType) {
      setError("Please select all required fields")
      return
    }

    setBooking(true)
    setError(null)

    try {
      // Book the appointment
      const appointment = await bookAppointment(
        patientId,
        doctor.id,
        selectedLocation,
        serviceType.id,
        format(date, "yyyy-MM-dd"),
        timeSlot,
        price,
      )

      // If using insurance, submit a claim
      if (useInsurance && selectedInsurance) {
        await submitInsuranceClaim(appointment.id, selectedInsurance, price)
      }

      setSuccess(true)

      // Redirect after a delay
      setTimeout(() => {
        router.push("/patient/appointments")
      }, 2000)
    } catch (error: any) {
      console.error("Error booking appointment:", error)
      setError(error.message || "Failed to book appointment")
    } finally {
      setBooking(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-6">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>

          {success ? (
            <Alert className="mb-6">
              <AlertDescription>Appointment booked successfully! Redirecting to your appointments...</AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>Select your preferred location, date and time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {doctor && (
                  <div className="grid gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialization || "Healthcare Provider"}
                        </p>
                      </div>
                    </div>
                    {serviceType && (
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">Service: {serviceType.name}</p>
                          <p className="text-sm text-muted-foreground">Price: ${price}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Select Location</Label>
                  <RadioGroup
                    value={selectedLocation?.toString() || ""}
                    onValueChange={(value) => setSelectedLocation(Number.parseInt(value))}
                    className="grid grid-cols-1 gap-2"
                  >
                    {availableLocations.map((location) => (
                      <div key={location.gym_id} className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem value={location.gym_id.toString()} id={`location-${location.gym_id}`} />
                        <Label htmlFor={`location-${location.gym_id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{location.gyms.name}</p>
                              <p className="text-sm text-muted-foreground">{location.gyms.address}</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0 || date.getDay() === 6
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {date && timeSlots.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Time</Label>
                    <RadioGroup
                      value={timeSlot || ""}
                      onValueChange={setTimeSlot}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                    >
                      {timeSlots.map((slot) => (
                        <div
                          key={slot.value}
                          className={cn(
                            "flex items-center space-x-2 border rounded-md p-3",
                            !slot.available && "opacity-50",
                          )}
                        >
                          <RadioGroupItem value={slot.value} id={slot.value} disabled={!slot.available} />
                          <Label htmlFor={slot.value} className="flex-1 cursor-pointer">
                            {slot.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {date && timeSlots.length === 0 && (
                  <Alert>
                    <AlertDescription>No available time slots for the selected date and location.</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-insurance"
                      checked={useInsurance}
                      onCheckedChange={(checked) => setUseInsurance(checked === true)}
                    />
                    <Label htmlFor="use-insurance">Use insurance for this appointment</Label>
                  </div>

                  {useInsurance && insuranceOptions.length > 0 && (
                    <div className="mt-2">
                      <Label>Select Insurance</Label>
                      <RadioGroup
                        value={selectedInsurance?.toString() || ""}
                        onValueChange={(value) => setSelectedInsurance(Number.parseInt(value))}
                        className="grid grid-cols-1 gap-2 mt-2"
                      >
                        {insuranceOptions.map((insurance) => (
                          <div key={insurance.id} className="flex items-center space-x-2 border rounded-md p-3">
                            <RadioGroupItem value={insurance.id.toString()} id={`insurance-${insurance.id}`} />
                            <Label htmlFor={`insurance-${insurance.id}`} className="flex-1 cursor-pointer">
                              <div>
                                <p className="font-medium">{insurance.insurance_providers.name}</p>
                                <p className="text-sm text-muted-foreground">Policy: {insurance.policy_number}</p>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {useInsurance && insuranceOptions.length === 0 && (
                    <Alert className="mt-2">
                      <AlertDescription>
                        You don't have any insurance information saved. Please add insurance details in your profile.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleBookAppointment}
                  disabled={!selectedLocation || !date || !timeSlot || booking || (useInsurance && !selectedInsurance)}
                >
                  {booking ? "Booking..." : "Book Appointment"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
