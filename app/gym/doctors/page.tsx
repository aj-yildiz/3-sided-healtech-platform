"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, Phone, Mail } from "lucide-react"
import Link from "next/link"

interface Doctor {
  id: number
  name: string
  email: string
  phone: string
  specialization: string | null
  services: { id: number; name: string }[]
  appointmentCount: number
}

export default function GymDoctors() {
  const { user, userProfile } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!user || !userProfile) return

      try {
        const gymId = userProfile.id

        // Get doctors who work at this gym
        const { data: doctorLocations, error: locationsError } = await supabase
          .from("doctor_locations")
          .select("doctor_id")
          .eq("gym_id", gymId)

        if (locationsError) throw locationsError

        const doctorIds = doctorLocations?.map((dl) => dl.doctor_id) || []

        if (doctorIds.length === 0) {
          setLoading(false)
          return
        }

        // Get doctor details
        const { data: doctorsData, error: doctorsError } = await supabase
          .from("doctors")
          .select("id, name, email, phone, specialization")
          .in("id", doctorIds)

        if (doctorsError) throw doctorsError

        // Get services for each doctor
        const doctorsWithServices = await Promise.all(
          doctorsData?.map(async (doctor) => {
            // Get services
            const { data: servicesData } = await supabase
              .from("doctor_services")
              .select("service_types:service_type_id(id, name)")
              .eq("doctor_id", doctor.id)

            const services = servicesData?.map((s) => s.service_types) || []

            // Get appointment count
            const { count: appointmentCount } = await supabase
              .from("appointments")
              .select("*", { count: "exact", head: true })
              .eq("doctor_id", doctor.id)
              .eq("gym_id", gymId)

            return {
              ...doctor,
              services,
              appointmentCount: appointmentCount || 0,
            }
          }) || [],
        )

        setDoctors(doctorsWithServices)
        setFilteredDoctors(doctorsWithServices)
      } catch (error) {
        console.error("Error fetching doctors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [user, userProfile, supabase])

  useEffect(() => {
    // Filter doctors based on search query and active tab
    let filtered = doctors

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialization?.toLowerCase().includes(query) ||
          doctor.services.some((service) => service.name.toLowerCase().includes(query)),
      )
    }

    if (activeTab === "active") {
      filtered = filtered.filter((doctor) => doctor.appointmentCount > 0)
    }

    setFilteredDoctors(filtered)
  }, [searchQuery, activeTab, doctors])

  return (
    <RouteGuard allowedRoles={["gym"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-3xl font-bold">Healthcare Providers</h1>

              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search providers..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All Providers</TabsTrigger>
                <TabsTrigger value="active">Active Providers</TabsTrigger>
              </TabsList>
            </Tabs>

            {loading ? (
              <div className="text-center py-10">Loading healthcare providers...</div>
            ) : filteredDoctors.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id}>
                    <CardHeader>
                      <CardTitle>{doctor.name}</CardTitle>
                      <CardDescription>{doctor.specialization || "General Healthcare"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{doctor.email}</span>
                        </div>

                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{doctor.phone}</span>
                        </div>

                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{doctor.appointmentCount} appointments</span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Services:</p>
                          <div className="flex flex-wrap gap-2">
                            {doctor.services.map((service) => (
                              <Badge key={service.id} variant="outline">
                                {service.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Link href={`/gym/doctor/${doctor.id}`}>
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="mb-4">No healthcare providers found.</p>
                  {searchQuery && <p className="text-muted-foreground">Try adjusting your search query.</p>}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
