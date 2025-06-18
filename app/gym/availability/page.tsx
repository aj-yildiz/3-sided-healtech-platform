"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TimeSlot {
  day: number
  startTime: string
  endTime: string
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

export default function GymAvailability() {
  const { user } = useAuth()
  const [gymId, setGymId] = useState<number | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>({
    day: 1,
    startTime: "09:00",
    endTime: "17:00",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchGymData = async () => {
      if (!user) return

      try {
        // Get gym ID
        const { data: gymData, error: gymError } = await supabase
          .from("gyms")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (gymError) throw gymError

        setGymId(gymData.id)

        // Get availability
        const { data: availabilityData, error: availabilityError } = await supabase
          .from("gym_availability")
          .select("*")
          .eq("gym_id", gymData.id)

        if (availabilityError) throw availabilityError

        const slots = availabilityData.map((slot) => ({
          day: slot.day_of_week,
          startTime: slot.start_time,
          endTime: slot.end_time,
        }))

        setTimeSlots(slots)
      } catch (error) {
        console.error("Error fetching gym data:", error)
        setError("Failed to load your availability data")
      } finally {
        setLoading(false)
      }
    }

    fetchGymData()
  }, [user, supabase])

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { ...newTimeSlot }])
  }

  const removeTimeSlot = (index: number) => {
    const updatedSlots = [...timeSlots]
    updatedSlots.splice(index, 1)
    setTimeSlots(updatedSlots)
  }

  const saveAvailability = async () => {
    if (!gymId) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Delete existing availability
      await supabase.from("gym_availability").delete().eq("gym_id", gymId)

      // Insert new availability
      const availabilityData = timeSlots.map((slot) => ({
        gym_id: gymId,
        day_of_week: slot.day,
        start_time: slot.startTime,
        end_time: slot.endTime,
      }))

      const { error } = await supabase.from("gym_availability").insert(availabilityData)

      if (error) throw error

      setSuccess("Availability saved successfully")
    } catch (error) {
      console.error("Error saving availability:", error)
      setError("Failed to save availability")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-6">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Manage Availability</h1>

          <Card>
            <CardHeader>
              <CardTitle>Set Your Available Time Slots</CardTitle>
              <CardDescription>Define when your gym space is available for physiotherapy sessions</CardDescription>
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
              ) : (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Current Availability</h3>

                    {timeSlots.length === 0 ? (
                      <div className="text-muted-foreground">No availability set. Add time slots below.</div>
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
                            <Button variant="outline" size="sm" onClick={() => removeTimeSlot(index)}>
                              Remove
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

                    <Button onClick={addTimeSlot}>Add Time Slot</Button>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={saveAvailability}
                disabled={loading || saving || timeSlots.length === 0}
              >
                {saving ? "Saving..." : "Save Availability"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
