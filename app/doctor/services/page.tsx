"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ServiceType {
  id: number
  name: string
  description: string
  selected: boolean
}

export default function DoctorServices() {
  const { user, userProfile } = useAuth()
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !userProfile) return

      try {
        setDoctorId(userProfile.id)

        // Get all service types
        const { data: allServiceTypes, error: serviceTypesError } = await supabase
          .from("service_types")
          .select("*")
          .order("name")

        if (serviceTypesError) throw serviceTypesError

        // Get doctor's selected services
        const { data: doctorServices, error: doctorServicesError } = await supabase
          .from("doctor_services")
          .select("service_type_id")
          .eq("doctor_id", userProfile.id)

        if (doctorServicesError) throw doctorServicesError

        const selectedServiceIds = doctorServices?.map((ds) => ds.service_type_id) || []

        // Combine the data
        const servicesWithSelection =
          allServiceTypes?.map((st) => ({
            id: st.id,
            name: st.name,
            description: st.description,
            selected: selectedServiceIds.includes(st.id),
          })) || []

        setServiceTypes(servicesWithSelection)
      } catch (error) {
        console.error("Error fetching services data:", error)
        setError("Failed to load service types")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, userProfile, supabase])

  const toggleServiceSelection = (id: number) => {
    setServiceTypes(serviceTypes.map((st) => (st.id === id ? { ...st, selected: !st.selected } : st)))
  }

  const saveServices = async () => {
    if (!doctorId) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Delete existing services
      await supabase.from("doctor_services").delete().eq("doctor_id", doctorId)

      // Insert selected services
      const selectedServices = serviceTypes
        .filter((st) => st.selected)
        .map((st) => ({
          doctor_id: doctorId,
          service_type_id: st.id,
        }))

      if (selectedServices.length > 0) {
        const { error } = await supabase.from("doctor_services").insert(selectedServices)

        if (error) throw error
      }

      setSuccess("Services updated successfully")
    } catch (error) {
      console.error("Error saving services:", error)
      setError("Failed to save services")
    } finally {
      setSaving(false)
    }
  }

  return (
    <RouteGuard allowedRoles={["doctor"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Manage Services</h1>

            <Card>
              <CardHeader>
                <CardTitle>Select Your Services</CardTitle>
                <CardDescription>Choose the healthcare services you provide to patients</CardDescription>
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
                  <div className="text-center py-4">Loading services...</div>
                ) : (
                  <div className="grid gap-4">
                    {serviceTypes.map((service) => (
                      <div key={service.id} className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={service.selected}
                          onCheckedChange={() => toggleServiceSelection(service.id)}
                        />
                        <div className="space-y-1 leading-none">
                          <Label
                            htmlFor={`service-${service.id}`}
                            className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {service.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={saveServices} disabled={loading || saving}>
                  {saving ? "Saving..." : "Save Services"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
