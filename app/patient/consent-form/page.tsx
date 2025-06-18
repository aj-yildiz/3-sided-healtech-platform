"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import SignatureCanvas from "react-signature-canvas"

export default function ConsentForm() {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [consentToTreatment, setConsentToTreatment] = useState(false)
  const [consentToShareInfo, setConsentToShareInfo] = useState(false)
  const [consentToPayment, setConsentToPayment] = useState(false)
  const [signatureURL, setSignatureURL] = useState<string | null>(null)

  const [signaturePad, setSignaturePad] = useState<SignatureCanvas | null>(null)

  const supabase = createClientComponentClient()

  const clearSignature = () => {
    if (signaturePad) {
      signaturePad.clear()
      setSignatureURL(null)
    }
  }

  const saveSignature = () => {
    if (signaturePad && !signaturePad.isEmpty()) {
      const dataURL = signaturePad.toDataURL("image/png")
      setSignatureURL(dataURL)
    } else {
      setError("Please sign the form before submitting")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !userProfile) {
      setError("You must be logged in to submit this form")
      return
    }

    if (!consentToTreatment || !consentToShareInfo || !consentToPayment) {
      setError("You must agree to all consent items")
      return
    }

    if (!signatureURL) {
      setError("Please sign the form before submitting")
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

      // Save consent form data
      const { error: consentError } = await supabase.from("patient_consent_forms").insert({
        patient_id: patientData.id,
        consent_to_treatment: consentToTreatment,
        consent_to_share_info: consentToShareInfo,
        consent_to_payment: consentToPayment,
        signature_url: signatureURL,
        signed_at: new Date().toISOString(),
      })

      if (consentError) throw consentError

      setSuccess(true)
      toast({
        title: "Consent form submitted",
        description: "Your consent form has been submitted successfully.",
      })
    } catch (error: any) {
      console.error("Error saving consent form:", error)
      setError(error.message || "Failed to save consent form")
      toast({
        title: "Error",
        description: "There was a problem submitting your consent form. Please try again.",
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
            <h1 className="text-3xl font-bold mb-6">Consent Form</h1>

            <Card>
              <CardHeader>
                <CardTitle>Patient Consent</CardTitle>
                <CardDescription>
                  Please read and agree to the following consent items before receiving treatment.
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
                      <AlertDescription>Your consent form has been submitted successfully.</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="border p-4 rounded-md">
                      <h3 className="font-medium mb-2">Consent to Treatment</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        I hereby consent to receive healthcare services from healthcare providers through the Vastis
                        platform. I understand that my treatment may include assessment, diagnosis, and therapeutic
                        interventions. I acknowledge that no guarantees have been made to me about the results of
                        treatments or examinations.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="consent-treatment"
                          checked={consentToTreatment}
                          onCheckedChange={(checked) => setConsentToTreatment(checked === true)}
                          required
                        />
                        <Label htmlFor="consent-treatment">I agree to the consent to treatment</Label>
                      </div>
                    </div>

                    <div className="border p-4 rounded-md">
                      <h3 className="font-medium mb-2">Consent to Share Information</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        I authorize Vastis and its affiliated healthcare providers to share my medical information with
                        other healthcare providers involved in my care. This may include sharing information with my
                        primary care physician, specialists, and other healthcare professionals as necessary for my
                        treatment.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="consent-share"
                          checked={consentToShareInfo}
                          onCheckedChange={(checked) => setConsentToShareInfo(checked === true)}
                          required
                        />
                        <Label htmlFor="consent-share">I agree to the consent to share information</Label>
                      </div>
                    </div>

                    <div className="border p-4 rounded-md">
                      <h3 className="font-medium mb-2">Consent to Payment</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        I understand that I am responsible for payment for services rendered. I authorize Vastis to bill
                        my insurance provider on my behalf, if applicable. I understand that I am responsible for any
                        charges not covered by my insurance, including co-payments, deductibles, and non-covered
                        services.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="consent-payment"
                          checked={consentToPayment}
                          onCheckedChange={(checked) => setConsentToPayment(checked === true)}
                          required
                        />
                        <Label htmlFor="consent-payment">I agree to the consent to payment</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Signature</Label>
                    <div className="border rounded-md p-2">
                      <div className="border-b border-dashed border-gray-300 mb-2">
                        {typeof window !== "undefined" && (
                          <SignatureCanvas
                            ref={(ref) => setSignaturePad(ref)}
                            canvasProps={{
                              width: 500,
                              height: 200,
                              className: "w-full h-[200px] signature-canvas",
                            }}
                          />
                        )}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                          Clear
                        </Button>
                        <Button type="button" size="sm" onClick={saveSignature}>
                          Save Signature
                        </Button>
                      </div>
                    </div>
                    {signatureURL && <p className="text-sm text-green-600">Signature saved</p>}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading || success}>
                    {loading ? "Submitting..." : success ? "Submitted" : "Submit Consent Form"}
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
