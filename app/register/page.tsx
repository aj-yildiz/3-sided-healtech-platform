"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClientComponentClient } from "@/lib/supabase"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function Register() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"patient" | "doctor" | "gym">("patient")
  const [gymName, setGymName] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [invitationValid, setInvitationValid] = useState(true)
  const [registrationStep, setRegistrationStep] = useState(1)
  const [loadingMessage, setLoadingMessage] = useState("Creating account...")
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0)
  const [address, setAddress] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState("")
  const [bloodType, setBloodType] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [gymAddress, setGymAddress] = useState("")

  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check for invitation parameters
    const invite = searchParams.get("invite")
    const inviteEmail = searchParams.get("email")
    const inviteRole = searchParams.get("role")

    if (invite && inviteEmail) {
      setInviteCode(invite)
      setEmail(inviteEmail)

      if (inviteRole === "doctor") {
        setRole("doctor")
      } else if (inviteRole === "gym") {
        setRole("gym")
      }

      // Verify invitation
      verifyInvitation(invite, inviteEmail)
    }

    // Add a timeout to reset loading state if it takes too long
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
        setError("The request is taking longer than expected. Please try again.")
        toast({
          title: "Registration timeout",
          description: "The registration process took too long. Please try again.",
          variant: "destructive",
        })
      }
    }, 30000) // 30 seconds timeout

    return () => clearTimeout(loadingTimeout)
  }, [searchParams, loading, toast])

  const verifyInvitation = async (code: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("invite_code", code)
        .eq("email", email)
        .eq("status", "pending")
        .single()

      if (error || !data) {
        setInvitationValid(false)
        setError("Invalid or expired invitation")
        return
      }

      // Pre-fill form with invitation data
      if (data.first_name) setFirstName(data.first_name)
      if (data.last_name) setLastName(data.last_name)
      if (data.specialization) setSpecialization(data.specialization)
    } catch (error) {
      console.error("Error verifying invitation:", error)
      setInvitationValid(false)
      setError("Failed to verify invitation")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (role === "doctor" && (!firstName || !lastName || !specialization || !licenseNumber)) {
      setError("Please fill in all required fields")
      return
    }

    if (role === "gym" && (!gymName || !gymAddress)) {
      setError("Please enter all required gym information")
      return
    }

    if (role === "patient" && (!firstName || !lastName || !address || !dateOfBirth || !gender)) {
      setError("Please fill in all required patient information")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Step 1: Create auth user
      setLoadingMessage("Creating your account...")
      setRegistrationStep(1)

      console.log("Starting signUp...")
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })
      console.log("signUp result:", data, signUpError)

      if (signUpError) {
        console.error("Sign up error details:", signUpError)

        // Check for rate limiting error
        if (signUpError.message?.includes("security purposes") || signUpError.message?.includes("rate limit")) {
          throw new Error("Rate limit reached. Please wait at least 32 seconds before trying again.")
        }
        throw new Error(signUpError.message || "Failed to create user")
      }

      if (!data?.user) {
        console.error("No user returned from signUp")
        throw new Error("Failed to create user account")
      }

      const userId = data.user.id
      console.log("User created successfully with ID:", userId)
      console.log("About to insert into user_roles with userId:", userId, "and role:", role)

      // Step 2: Create user role
      setLoadingMessage("Setting up your profile...")
      setRegistrationStep(2)

      console.log("Inserting into user_roles...")
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role,
      })

      if (roleError) {
        console.error("Role creation error:", roleError)
        throw new Error(
          roleError.message ||
          JSON.stringify(roleError) ||
          "Unknown error occurred while creating user role"
        )
      }

      // Step 3: Create profile based on role
      setLoadingMessage("Finalizing your account...")
      setRegistrationStep(3)

      if (role === "patient") {
        const { error } = await supabase.from("patients").insert({
          user_id: userId,
          name: `${firstName} ${lastName}`,
          email: email.trim().toLowerCase(),
          address,
          date_of_birth: dateOfBirth,
          gender,
        })
        if (error) {
          console.error("Patient profile creation error:", error)
          throw new Error(error.message)
        }
      } else if (role === "doctor") {
        const { error } = await supabase.from("doctors").insert({
          user_id: userId,
          name: `${firstName} ${lastName}`,
          email: email.trim().toLowerCase(),
          specialization,
          license_number: licenseNumber,
          address: address || "", // Use address if provided, otherwise empty string
        })
        if (error) {
          console.error("Doctor profile creation error:", error)
          throw new Error(error.message)
        }
      } else if (role === "gym") {
        const { error } = await supabase.from("gyms").insert({
          user_id: userId,
          name: gymName,
          email: email.trim().toLowerCase(),
          address: gymAddress,
        })
        if (error) {
          console.error("Gym profile creation error:", error)
          throw new Error(error.message)
        }
      }

      // Step 4: Update invitation status if applicable
      if (inviteCode) {
        await supabase
          .from("invitations")
          .update({ status: "accepted" })
          .eq("invite_code", inviteCode)
          .eq("email", email.trim().toLowerCase())
      }

      // Success! Redirect to login page with success message
      toast({
        title: "Success",
        description: "Your account has been created successfully!",
      })

      router.push("/login?registered=true")
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.message || "Failed to register")
      setLoading(false)

      toast({
        title: "Error",
        description: error.message || "There was a problem creating your account. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>Sign up to get started with Vastis</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {error}
                  {error.includes("rate limit") && (
                    <p className="mt-2 text-xs">
                      Note: Supabase has rate limits on sign-ups. Please wait at least 32 seconds between attempts.
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {inviteCode && !invitationValid && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  This invitation is invalid or has expired. Please contact the administrator.
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-medium">{loadingMessage}</p>
                  <p className="text-sm text-muted-foreground mt-1">Step {registrationStep} of 3</p>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(registrationStep / 3) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  This may take a moment. Please don't close this window.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!inviteCode && (
                  <div className="space-y-2">
                    <Label htmlFor="role">I am a</Label>
                    <Select value={role} onValueChange={(value: "patient" | "doctor" | "gym") => setRole(value)}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="doctor">Healthcare Practitioner</SelectItem>
                        <SelectItem value="gym">Gym / Facility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {role === "gym" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="gymName">Gym / Facility Name *</Label>
                      <Input id="gymName" value={gymName} onChange={(e) => setGymName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gymAddress">Gym / Facility Address *</Label>
                      <Input
                        id="gymAddress"
                        value={gymAddress}
                        onChange={(e) => setGymAddress(e.target.value)}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!!inviteCode}
                  />
                </div>

                {role === "patient" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Non-binary">Non-binary</SelectItem>
                          <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {role === "doctor" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization *</Label>
                      <Select
                        value={specialization}
                        onValueChange={setSpecialization}
                        disabled={!!inviteCode && !!specialization}
                      >
                        <SelectTrigger id="specialization">
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
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
                      <Label htmlFor="licenseNumber">License Number *</Label>
                      <Input
                        id="licenseNumber"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading || Boolean(inviteCode && !invitationValid)}>
                  Create Account
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
