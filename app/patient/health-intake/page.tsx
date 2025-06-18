"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

export default function HealthIntakeForm() {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [primaryConcern, setPrimaryConcern] = useState("")
  const [concernDuration, setConcernDuration] = useState("")
  const [painLevel, setPainLevel] = useState<string | null>(null)
  const [medications, setMedications] = useState("")
  const [allergies, setAllergies] = useState("")
  const [pastMedicalHistory, setPastMedicalHistory] = useState("")
  const [surgeries, setSurgeries] = useState("")
  const [emergencyContactName, setEmergencyContactName] = useState("")
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("")
  const [emergencyContactRelation, setEmergencyContactRelation] = useState("")

  const [conditions, setConditions] = useState({
    diabetes: false,
    heartDisease: false,
    highBloodPressure: false,
    asthma: false,
    arthritis: false,
    cancer: false,
    depression: false,
    anxiety: false,
    other: false,
  })

  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !userProfile) {
      setError("You must be logged in to submit this form")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get patient ID
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (patientError) throw patientError

      // Format conditions as a string
      const conditionsList = Object.entries(conditions)
        .filter(([_, value]) => value)
        .map(([key, _]) => key)
        .join(", ")

      // Save health intake data
      const { error: healthIntakeError } = await supabase.from("patient_health_intake").upsert({
        patient_id: patientData.id,
        primary_concern: primaryConcern,
        concern_duration: concernDuration,
        pain_level: painLevel,
        medications,
        allergies,
        past_medical_history: pastMedicalHistory,
        surgeries,
        conditions: conditionsList,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        emergency_contact_relation: emergencyContactRelation,
        updated_at: new Date().toISOString(),
      })

      if (healthIntakeError) throw healthIntakeError

      setSuccess(true)
      toast({
        title: "Health information saved",
        description: "Your health intake form has been submitted successfully.",
      })
    } catch (error: any) {
      console.error("Error saving health intake form:", error)
      setError(error.message || "Failed to save health information")
      toast({
        title: "Error",
        description: "There was a problem saving your health information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <RouteGuard allowedRoles={["patient"]}>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 p-6">
          <div className="container max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Health Intake Form</h1>

            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
                <CardDescription>
                  Please provide your health information to help us better understand your needs. This information will
                  be shared with your healthcare providers.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <AlertDescription>Your health information has been saved successfully.</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="primary-concern">What is your primary health concern?</Label>
                    <Textarea
                      id="primary-concern"
                      value={primaryConcern}
                      onChange={(e) => setPrimaryConcern(e.target.value)}
                      placeholder="Describe your main reason for seeking care"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concern-duration">How long have you had this concern?</Label>
                    <Input
                      id="concern-duration"
                      value={concernDuration}
                      onChange={(e) => setConcernDuration(e.target.value)}
                      placeholder="e.g., 2 weeks, 3 months, etc."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>If you're experiencing pain, how would you rate it?</Label>
                    <RadioGroup value={painLevel || ""} onValueChange={setPainLevel}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="pain-1" />
                        <Label htmlFor="pain-1">1 (Minimal)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="pain-2" />
                        <Label htmlFor="pain-2">2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="pain-3" />
                        <Label htmlFor="pain-3">3</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4" id="pain-4" />
                        <Label htmlFor="pain-4">4</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="5" id="pain-5" />
                        <Label htmlFor="pain-5">5 (Moderate)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="6" id="pain-6" />
                        <Label htmlFor="pain-6">6</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="7" id="pain-7" />
                        <Label htmlFor="pain-7">7</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="8" id="pain-8" />
                        <Label htmlFor="pain-8">8</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="9" id="pain-9" />
                        <Label htmlFor="pain-9">9</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="10" id="pain-10" />
                        <Label htmlFor="pain-10">10 (Severe)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Do you have any of the following conditions?</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="diabetes"
                          checked={conditions.diabetes}
                          onCheckedChange={(checked) => setConditions({ ...conditions, diabetes: checked === true })}
                        />
                        <Label htmlFor="diabetes">Diabetes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="heart-disease"
                          checked={conditions.heartDisease}
                          onCheckedChange={(checked) =>
                            setConditions({ ...conditions, heartDisease: checked === true })
                          }
                        />
                        <Label htmlFor="heart-disease">Heart Disease</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="high-blood-pressure"
                          checked={conditions.highBloodPressure}
                          onCheckedChange={(checked) =>
                            setConditions({ ...conditions, highBloodPressure: checked === true })
                          }
                        />
                        <Label htmlFor="high-blood-pressure">High Blood Pressure</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="asthma"
                          checked={conditions.asthma}
                          onCheckedChange={(checked) => setConditions({ ...conditions, asthma: checked === true })}
                        />
                        <Label htmlFor="asthma">Asthma</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="arthritis"
                          checked={conditions.arthritis}
                          onCheckedChange={(checked) => setConditions({ ...conditions, arthritis: checked === true })}
                        />
                        <Label htmlFor="arthritis">Arthritis</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="cancer"
                          checked={conditions.cancer}
                          onCheckedChange={(checked) => setConditions({ ...conditions, cancer: checked === true })}
                        />
                        <Label htmlFor="cancer">Cancer</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="depression"
                          checked={conditions.depression}
                          onCheckedChange={(checked) => setConditions({ ...conditions, depression: checked === true })}
                        />
                        <Label htmlFor="depression">Depression</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="anxiety"
                          checked={conditions.anxiety}
                          onCheckedChange={(checked) => setConditions({ ...conditions, anxiety: checked === true })}
                        />
                        <Label htmlFor="anxiety">Anxiety</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="other"
                          checked={conditions.other}
                          onCheckedChange={(checked) => setConditions({ ...conditions, other: checked === true })}
                        />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">Current Medications</Label>
                    <Textarea
                      id="medications"
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      placeholder="List all medications you are currently taking, including dosage"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="List any allergies you have (medications, food, environmental)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="past-medical-history">Past Medical History</Label>
                    <Textarea
                      id="past-medical-history"
                      value={pastMedicalHistory}
                      onChange={(e) => setPastMedicalHistory(e.target.value)}
                      placeholder="List any significant past medical conditions or diagnoses"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="surgeries">Previous Surgeries</Label>
                    <Textarea
                      id="surgeries"
                      value={surgeries}
                      onChange={(e) => setSurgeries(e.target.value)}
                      placeholder="List any surgeries you've had, including approximate dates"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Emergency Contact Information</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="emergency-name">Name</Label>
                        <Input
                          id="emergency-name"
                          value={emergencyContactName}
                          onChange={(e) => setEmergencyContactName(e.target.value)}
                          placeholder="Emergency contact name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergency-relation">Relationship</Label>
                        <Input
                          id="emergency-relation"
                          value={emergencyContactRelation}
                          onChange={(e) => setEmergencyContactRelation(e.target.value)}
                          placeholder="e.g., Spouse, Parent, Friend"
                          required
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="emergency-phone">Phone Number</Label>
                        <Input
                          id="emergency-phone"
                          value={emergencyContactPhone}
                          onChange={(e) => setEmergencyContactPhone(e.target.value)}
                          placeholder="Emergency contact phone number"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Saving..." : "Save Health Information"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
