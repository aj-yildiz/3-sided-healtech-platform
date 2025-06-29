"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LocationSharing } from "@/components/location-sharing"
import { MapPin } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface ServiceType {
  id: number
  name: string
}

interface Doctor {
  id: number
  name: string
  specialization: string | null
  gym_id: number
  gym_name: string
  gym_address: string
  distance?: number
}

export default function FindProvider() {
  const { user } = useAuth()
  const [location, setLocation] = useState("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [selectedServiceType, setSelectedServiceType] = useState<number | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [service, setService] = useState("")
  const [results, setResults] = useState([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const { data, error } = await supabase.from("service_types").select("id, name").order("name")

        if (error) throw error

        setServiceTypes(data || [])
      } catch (error) {
        console.error("Error fetching service types:", error)
      }
    }

    fetchServiceTypes()
  }, [supabase])

  const handleLocationReceived = (lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
    setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
  }

  const searchProviders = async () => {
    setLoading(true)
    setSearchPerformed(true)

    try {
      // Example: search by specialization and location (adjust as needed)
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, specialization")
        .ilike("specialization", `%${service}%`)

      if (error) throw error

      setResults(data || [])
    } catch (error) {
      console.error("Error searching providers:", error)
    } finally {
      setLoading(false)
    }
  }

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return distance
  }

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
  }

  return (
    <RouteGuard allowedRoles={["patient"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container">
            <h1 className="text-3xl font-bold mb-6">Find Healthcare Practitioner</h1>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Search Providers</CardTitle>
                <CardDescription>Find healthcare providers by service type and location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="service-type">Service Type</Label>
                    <Select
                      value={service}
                      onValueChange={(value) => setService(value)}
                    >
                      <SelectTrigger id="service-type">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        <SelectItem value="Physiotherapy">Physiotherapy</SelectItem>
                        <SelectItem value="Optometry">Optometry</SelectItem>
                        <SelectItem value="Counselling">Counselling</SelectItem>
                        <SelectItem value="Chiropractic">Chiropractic</SelectItem>
                        <SelectItem value="Massage Therapy">Massage Therapy</SelectItem>
                        <SelectItem value="Acupuncture">Acupuncture</SelectItem>
                        <SelectItem value="Dietetics">Dietetics</SelectItem>
                        <SelectItem value="Psychology">Psychology</SelectItem>
                        <SelectItem value="Speech Therapy">Speech Therapy</SelectItem>
                        <SelectItem value="Occupational Therapy">Occupational Therapy</SelectItem>
                        <SelectItem value="Athletic Therapy">Athletic Therapy</SelectItem>
                        <SelectItem value="Podiatry">Podiatry</SelectItem>
                        <SelectItem value="Naturopathic Medicine">Naturopathic Medicine</SelectItem>
                        <SelectItem value="Midwifery">Midwifery</SelectItem>
                        <SelectItem value="Osteopathy">Osteopathy</SelectItem>
                        <SelectItem value="Personal Training">Personal Training</SelectItem>
                        <SelectItem value="Kinesiology">Kinesiology</SelectItem>
                        <SelectItem value="Aesthetics">Aesthetics</SelectItem>
                        <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="flex gap-2">
                      <Input
                        id="location"
                        placeholder="Enter your location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="flex-1"
                      />
                      <LocationSharing onLocationReceived={handleLocationReceived} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={searchProviders} disabled={loading} className="w-full md:w-auto">
                  {loading ? "Searching..." : "Search Providers"}
                </Button>
              </CardFooter>
            </Card>

            {searchPerformed && (
              <>
                <h2 className="text-2xl font-bold mb-4">Search Results</h2>

                {results.length > 0 ? (
                  <div className="grid gap-4">
                    {results.map((doc) => (
                      <Card key={doc.id} className="flex flex-col md:flex-row justify-between">
                        <CardContent className="p-6">
                          <div>
                            <h3 className="text-lg font-bold">{doc.name}</h3>
                            <p className="text-muted-foreground">{doc.specialization || "General Healthcare"}</p>
                          </div>
                        </CardContent>
                        <CardFooter className="mt-4 md:mt-0">
                          <Link href={`/patient/book-appointment?doctor=${doc.id}&service=${service}`}>
                            <Button>Book Appointment</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="mb-4">No healthcare providers found matching your criteria.</p>
                      <p className="text-muted-foreground">Try adjusting your search parameters.</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
