"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin } from "lucide-react"

interface Gym {
  id: number
  name: string
  address: string
  selected: boolean
}

export default function DoctorLocations() {
  const { user, userProfile } = useAuth()
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([])

  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !userProfile) return

      try {
        setDoctorId(userProfile.id)

        // Get all gyms
        const { data: allGyms, error: gymsError } = await supabase
          .from("gyms")
          .select("id, name, address")
          .order("name")

        if (gymsError) throw gymsError

        // Get doctor's selected gyms
        const { data: doctorLocations, error: locationsError } = await supabase
          .from("doctor_locations")
          .select("gym_id")
          .eq("doctor_id", userProfile.id)

        if (locationsError) throw locationsError

        const selectedGymIds = doctorLocations?.map((dl) => dl.gym_id) || []

        // Combine the data
        const gymsWithSelection =
          allGyms?.map((gym) => ({
            id: gym.id,
            name: gym.name,
            address: gym.address,
            selected: selectedGymIds.includes(gym.id),
          })) || []

        setGyms(gymsWithSelection)
        setFilteredGyms(gymsWithSelection)
      } catch (error) {
        console.error("Error fetching gyms data:", error)
        setError("Failed to load gyms")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, userProfile, supabase])

  useEffect(() => {
    // Filter gyms based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const filtered = gyms.filter(
        (gym) => gym.name.toLowerCase().includes(query) || gym.address.toLowerCase().includes(query),
      )
      setFilteredGyms(filtered)
    } else {
      setFilteredGyms(gyms)
    }
  }, [searchQuery, gyms])

  const toggleGymSelection = (id: number) => {
    setGyms(gyms.map((gym) => (gym.id === id ? { ...gym, selected: !gym.selected } : gym)))
    setFilteredGyms(filteredGyms.map((gym) => (gym.id === id ? { ...gym, selected: !gym.selected } : gym)))
  }

  const saveLocations = async () => {
    if (!doctorId) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Delete existing locations
      await supabase.from("doctor_locations").delete().eq("doctor_id", doctorId)

      // Insert selected locations
      const selectedLocations = gyms
        .filter((gym) => gym.selected)
        .map((gym) => ({
          doctor_id: doctorId,
          gym_id: gym.id,
        }))

      if (selectedLocations.length > 0) {
        const { error } = await supabase.from("doctor_locations").insert(selectedLocations)

        if (error) throw error
      }

      setSuccess("Locations updated successfully")
    } catch (error) {
      console.error("Error saving locations:", error)
      setError("Failed to save locations")
    } finally {
      setSaving(false)
    }
  }

  return (
    <RouteGuard allowedRoles={["doctor"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Manage Locations</h1>

            <Card>
              <CardHeader>
                <CardTitle>Select Your Practice Locations</CardTitle>
                <CardDescription>Choose the gyms where you provide healthcare services</CardDescription>
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

                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Search gyms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-4"
                  />
                </div>

                {loading ? (
                  <div className="text-center py-4">Loading gyms...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {filteredGyms.map((gym) => (
                        <div
                          key={gym.id}
                          className={`flex items-start space-x-3 space-y-0 rounded-md border p-4 ${
                            gym.selected ? "border-primary" : ""
                          }`}
                        >
                          <div className="flex-1">
                            <h3 className="text-base font-medium">{gym.name}</h3>
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <MapPin className="mr-1 h-3 w-3" />
                              <span>{gym.address}</span>
                            </div>
                          </div>
                          <Button
                            variant={gym.selected ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleGymSelection(gym.id)}
                          >
                            {gym.selected ? "Selected" : "Select"}
                          </Button>
                        </div>
                      ))}
                    </div>

                    {filteredGyms.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No gyms found matching your search.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={saveLocations} disabled={loading || saving}>
                  {saving ? "Saving..." : "Save Locations"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
