"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlusCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

interface Gym {
  id: string
  name: string
}

interface TimeSlot {
  id?: number
  day: number
  startTime: string
  endTime: string
  gymId: number
}

interface Availability {
  id: string
  doctor_id: string
  gym_id: string
  available_date: string
  start_time: string
  end_time: string
}

const daysOfWeek = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
]

export default function DoctorAvailability() {
  const { user, userProfile } = useAuth()
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [gyms, setGyms] = useState<Gym[]>([])
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>({
    day: 1,
    startTime: "09:00",
    endTime: "17:00",
    gymId: 0,
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedGym, setSelectedGym] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [availabilities, setAvailabilities] = useState<Availability[]>([])

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchGymsAndAvailabilities() {
      setLoading(true)
      setError(null)
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData.session?.user
        if (!user) throw new Error("No user session")
        const { data: gymsData, error: gymsError } = await supabase
          .from("practitioner_gym_requests")
          .select("gym_id, gyms(name)")
          .eq("doctor_id", user.id)
          .eq("status", "approved")
        if (gymsError) throw gymsError
        setGyms((gymsData?.map(r => ({ id: String(r.gym_id), name: r.gyms.name })) as Gym[]) || [])
        // Fetch availabilities
        const { data: avails, error: availsError } = await supabase
          .from("doctor_availability")
          .select("id, doctor_id, gym_id, available_date, start_time, end_time")
          .eq("doctor_id", user.id)
        if (availsError) throw availsError
        setAvailabilities((avails as Availability[]) || [])
        setLoading(false)
        console.log("Loaded gyms:", gymsData, "Loaded availabilities:", avails)
      } catch (err: any) {
        setError(err.message || "Failed to load gyms/availabilities")
        setLoading(false)
        console.error("Error loading gyms/availabilities:", err)
      }
    }
    fetchGymsAndAvailabilities()
  }, [])

  const fetchAvailability = async (doctorId: number, gymId: number) => {
    try {
      const { data, error } = await supabase
        .from("doctor_availability")
        .select("*")
        .eq("doctor_id", doctorId)
        .eq("gym_id", gymId)

      if (error) throw error

      const slots =
        data?.map((slot) => ({
          id: slot.id,
          day: slot.day_of_week,
          startTime: slot.start_time,
          endTime: slot.end_time,
          gymId: slot.gym_id,
        })) || []

      setTimeSlots(slots)
    } catch (error) {
      console.error("Error fetching availability:", error)
      setError("Failed to load availability data")
    }
  }

  const handleGymChange = async (gymId: string) => {
    const id = Number.parseInt(gymId, 10)
    setSelectedGymId(id)
    setNewTimeSlot((prev) => ({ ...prev, gymId: id }))

    if (doctorId) {
      await fetchAvailability(doctorId, id)
    }
  }

  const addTimeSlot = () => {
    if (!selectedGymId) return

    setTimeSlots([...timeSlots, { ...newTimeSlot, gymId: selectedGymId }])
  }

  const removeTimeSlot = (index: number) => {
    const updatedSlots = [...timeSlots]
    updatedSlots.splice(index, 1)
    setTimeSlots(updatedSlots)
  }

  const saveAvailability = async () => {
    if (!doctorId || !selectedGymId) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Delete existing availability for this doctor at this gym
      await supabase.from("doctor_availability").delete().eq("doctor_id", doctorId).eq("gym_id", selectedGymId)

      // Insert new availability
      const availabilityData = timeSlots.map((slot) => ({
        doctor_id: doctorId,
        gym_id: selectedGymId,
        day_of_week: slot.day,
        start_time: slot.startTime,
        end_time: slot.endTime,
      }))

      if (availabilityData.length > 0) {
        const { error } = await supabase.from("doctor_availability").insert(availabilityData)

        if (error) throw error
      }

      setSuccess("Availability saved successfully")
    } catch (error) {
      console.error("Error saving availability:", error)
      setError("Failed to save availability")
    } finally {
      setSaving(false)
    }
  }

  async function addAvailability() {
    const supabase = createClientComponentClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user
    if (!user) return
    await supabase.from("doctor_availability").insert({
      doctor_id: user.id,
      gym_id: selectedGym,
      available_date: date,
      start_time: startTime,
      end_time: endTime,
    })
    // Optionally refresh availabilities here
  }

  return (
    <RouteGuard allowedRoles={["doctor"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Manage Availability</h1>

            <Card>
              <CardHeader>
                <CardTitle>Set Your Available Time Slots</CardTitle>
                <CardDescription>Define when you're available for appointments at each gym</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {loading ? (
                  <div className="text-center py-4">Loading your availability...</div>
                ) : gyms.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="mb-4">You don't have any gym locations set up yet.</p>
                    <Button asChild>
                      <Link href="/doctor/locations">Add Gym Locations</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <Label htmlFor="gym">Select Gym Location</Label>
                      <Select value={selectedGymId?.toString() || ""} onValueChange={handleGymChange}>
                        <SelectTrigger id="gym">
                          <SelectValue placeholder="Select gym" />
                        </SelectTrigger>
                        <SelectContent>
                          {gyms.map((gym) => (
                            <SelectItem key={gym.id} value={gym.id}>
                              {gym.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedGymId && (
                      <>
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Current Availability</h3>

                          {timeSlots.length === 0 ? (
                            <div className="text-muted-foreground">
                              No availability set for this location. Add time slots below.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {timeSlots.map((slot, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 border rounded-md">
                                  <div className="flex-1">
                                    <span className="font-medium">
                                      {daysOfWeek.find((d) => d.value === slot.day.toString())?.label}
                                    </span>
                                    <span className="text-muted-foreground ml-2">
                                      {slot.startTime} - {slot.endTime}
                                    </span>
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => removeTimeSlot(index)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4 border-t pt-4">
                          <h3 className="text-lg font-medium">Add New Time Slot</h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="day">Day of Week</Label>
                              <Select
                                value={newTimeSlot.day.toString()}
                                onValueChange={(value) =>
                                  setNewTimeSlot({
                                    ...newTimeSlot,
                                    day: Number.parseInt(value),
                                  })
                                }
                              >
                                <SelectTrigger id="day">
                                  <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                  {daysOfWeek.map((day) => (
                                    <SelectItem key={day.value} value={day.value}>
                                      {day.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="start-time">Start Time</Label>
                              <Select
                                value={newTimeSlot.startTime}
                                onValueChange={(value) =>
                                  setNewTimeSlot({
                                    ...newTimeSlot,
                                    startTime: value,
                                  })
                                }
                              >
                                <SelectTrigger id="start-time">
                                  <SelectValue placeholder="Start time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }).map((_, i) => {
                                    const hour = i + 8 // Start from 8 AM
                                    const value = `${hour.toString().padStart(2, "0")}:00`
                                    return (
                                      <SelectItem key={value} value={value}>
                                        {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="end-time">End Time</Label>
                              <Select
                                value={newTimeSlot.endTime}
                                onValueChange={(value) =>
                                  setNewTimeSlot({
                                    ...newTimeSlot,
                                    endTime: value,
                                  })
                                }
                              >
                                <SelectTrigger id="end-time">
                                  <SelectValue placeholder="End time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }).map((_, i) => {
                                    const hour = i + 9 // Start from 9 AM
                                    const value = `${hour.toString().padStart(2, "0")}:00`
                                    return (
                                      <SelectItem key={value} value={value}>
                                        {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <Button onClick={addTimeSlot} className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Time Slot</span>
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={saveAvailability}
                  disabled={loading || saving || timeSlots.length === 0 || !selectedGymId}
                >
                  {saving ? "Saving..." : "Save Availability"}
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Release Availability</h2>
              <div className="flex gap-4 mb-4">
                <Select value={selectedGym} onValueChange={setSelectedGym}>
                  <SelectItem value="">Select Gym</SelectItem>
                  {gyms.map(gym => (
                    <SelectItem key={gym.id} value={String(gym.id)}>{gym.name}</SelectItem>
                  ))}
                </Select>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                <Button onClick={addAvailability}>Add Slot</Button>
              </div>
              {/* List of availabilities can be rendered here */}
            </div>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
