"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin } from "lucide-react"
import Link from "next/link"

interface Gym {
  id: number
  name: string
  address: string
  distance?: number
}

interface Doctor {
  id: number
  name: string
  specialization: string
  gym_id: number
  gym_name: string
  gym_address: string
}

export default function FindPhysio() {
  const { user } = useAuth()
  const [location, setLocation] = useState("")
  const [gyms, setGyms] = useState<Gym[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedGym, setSelectedGym] = useState<number | null>(null)
  const supabase = createClientComponentClient()

  const searchGyms = async () => {
    if (!location.trim()) return

    setLoading(true)

    try {
      // In a real app, you would use a geocoding API to convert the location to coordinates
      // For this demo, we'll just fetch all gyms
      const { data, error } = await supabase.from("gyms").select("id, name, address")

      if (error) throw error

      // Simulate distance calculation
      const gymsWithDistance = data.map((gym) => ({
        ...gym,
        distance: Math.floor(Math.random() * 10) + 1, // Random distance 1-10 km
      }))

      // Sort by distance
      gymsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))

      setGyms(gymsWithDistance)
    } catch (error) {
      console.error("Error searching gyms:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectGym = async (gymId: number) => {
    setSelectedGym(gymId)

    try {
      // In a real app, you would fetch doctors who have availability at this gym
      // For this demo, we'll just fetch all doctors
      const { data, error } = await supabase.from("doctors").select("id, name, specialization")

      if (error) throw error

      // Get the selected gym info
      const selectedGymInfo = gyms.find((gym) => gym.id === gymId)

      if (selectedGymInfo) {
        const doctorsWithGym = data.map((doctor) => ({
          ...doctor,
          gym_id: gymId,
          gym_name: selectedGymInfo.name,
          gym_address: selectedGymInfo.address,
        }))

        setDoctors(doctorsWithGym)
      }
    } catch (error) {
      console.error("Error fetching doctors:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-6">
        <div className="container">
          <h1 className="text-3xl font-bold mb-6">Find a Physiotherapist</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Locations</CardTitle>
              <CardDescription>Enter your location to find physiotherapists at nearby gyms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="location" className="sr-only">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="Enter your location or postal code"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <Button onClick={searchGyms} disabled={loading}>
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {gyms.length > 0 && !selectedGym && (
            <>
              <h2 className="text-2xl font-bold mb-4">Nearby Gyms</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {gyms.map((gym) => (
                  <Card
                    key={gym.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => selectGym(gym.id)}
                  >
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold">{gym.name}</h3>
                      <div className="flex items-center mt-2 text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{gym.address}</span>
                      </div>
                      {gym.distance && (
                        <div className="mt-4">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                            {gym.distance} km away
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {selectedGym && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Available Physiotherapists</h2>
                <Button variant="outline" onClick={() => setSelectedGym(null)}>
                  Back to Gyms
                </Button>
              </div>

              {doctors.length > 0 ? (
                <div className="grid gap-4">
                  {doctors.map((doctor) => (
                    <Card key={doctor.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <h3 className="text-lg font-bold">{doctor.name}</h3>
                            <p className="text-muted-foreground">{doctor.specialization || "General Physiotherapy"}</p>

                            <div className="flex items-center mt-4">
                              <MapPin className="mr-2 h-4 w-4" />
                              <span>
                                {doctor.gym_name} - {doctor.gym_address}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 md:mt-0">
                            <Link href={`/patient/book-appointment?doctor=${doctor.id}&gym=${doctor.gym_id}`}>
                              <Button>Book Appointment</Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p>No physiotherapists available at this location.</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
