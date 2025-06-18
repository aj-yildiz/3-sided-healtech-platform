"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  getPatientProfile,
  getPatientInsurance,
  addPatientInsurance,
  removePatientInsurance,
} from "@/app/actions/patient-actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Insurance {
  id: number
  policy_number: string
  group_number: string | null
  insurance_providers: {
    id: number
    name: string
  }
}

interface InsuranceProvider {
  id: number
  name: string
}

export default function PatientInsurance() {
  const { user } = useAuth()
  const [patientId, setPatientId] = useState<number | null>(null)
  const [insurances, setInsurances] = useState<Insurance[]>([])
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([
    { id: 1, name: "Telus eHealth" },
    { id: 2, name: "Blue Cross" },
    { id: 3, name: "Sun Life" },
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // New insurance form state
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    providerId: "",
    policyNumber: "",
    groupNumber: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const patientProfile = await getPatientProfile(user.id)
        if (!patientProfile) {
          setError("Patient profile not found")
          setLoading(false)
          return
        }

        setPatientId(patientProfile.id)

        const patientInsurance = await getPatientInsurance(patientProfile.id)
        setInsurances(patientInsurance)
      } catch (error: any) {
        console.error("Error fetching data:", error)
        setError(error.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleAddInsurance = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!patientId) return

    if (!formData.providerId || !formData.policyNumber) {
      setError("Please fill in all required fields")
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await addPatientInsurance(
        patientId,
        Number.parseInt(formData.providerId),
        formData.policyNumber,
        formData.groupNumber || undefined,
      )

      // Refresh insurance data
      const patientInsurance = await getPatientInsurance(patientId)
      setInsurances(patientInsurance)

      // Reset form
      setFormData({
        providerId: "",
        policyNumber: "",
        groupNumber: "",
      })

      setShowForm(false)
      setSuccess("Insurance information added successfully")
    } catch (error: any) {
      console.error("Error adding insurance:", error)
      setError(error.message || "Failed to add insurance information")
    }
  }

  const handleRemoveInsurance = async (insuranceId: number) => {
    if (!patientId) return

    setError(null)
    setSuccess(null)

    try {
      await removePatientInsurance(insuranceId)

      // Refresh insurance data
      const patientInsurance = await getPatientInsurance(patientId)
      setInsurances(patientInsurance)

      setSuccess("Insurance information removed successfully")
    } catch (error: any) {
      console.error("Error removing insurance:", error)
      setError(error.message || "Failed to remove insurance information")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-6">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Insurance Information</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Insurance Plans</CardTitle>
              <CardDescription>Manage your insurance information for direct billing</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading your insurance information...</div>
              ) : insurances.length > 0 ? (
                <div className="space-y-4">
                  {insurances.map((insurance) => (
                    <div key={insurance.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{insurance.insurance_providers.name}</h3>
                        <p className="text-sm text-muted-foreground">Policy: {insurance.policy_number}</p>
                        {insurance.group_number && (
                          <p className="text-sm text-muted-foreground">Group: {insurance.group_number}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleRemoveInsurance(insurance.id)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">You don't have any insurance information saved.</p>
                </div>
              )}

              {!showForm ? (
                <Button className="mt-4" onClick={() => setShowForm(true)}>
                  Add Insurance
                </Button>
              ) : (
                <form onSubmit={handleAddInsurance} className="mt-6 space-y-4 border-t pt-4">
                  <h3 className="font-medium">Add New Insurance</h3>

                  <div className="space-y-2">
                    <Label htmlFor="provider">Insurance Provider</Label>
                    <Select
                      value={formData.providerId}
                      onValueChange={(value) => setFormData({ ...formData, providerId: value })}
                    >
                      <SelectTrigger id="provider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {insuranceProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id.toString()}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="policy-number">Policy Number</Label>
                    <Input
                      id="policy-number"
                      value={formData.policyNumber}
                      onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                      placeholder="Enter your policy number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-number">Group Number (Optional)</Label>
                    <Input
                      id="group-number"
                      value={formData.groupNumber}
                      onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value })}
                      placeholder="Enter your group number if applicable"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">Save Insurance</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setFormData({
                          providerId: "",
                          policyNumber: "",
                          groupNumber: "",
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Telus eHealth Integration</CardTitle>
              <CardDescription>Connect with Telus eHealth for seamless insurance claims</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Vastis partners with Telus eHealth to provide direct insurance billing for your appointments. Add your
                Telus eHealth insurance information to enable this feature.
              </p>
              <Button>Connect with Telus eHealth</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
