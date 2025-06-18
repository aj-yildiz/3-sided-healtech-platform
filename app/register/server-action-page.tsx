"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function RegisterWithServerAction() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"patient" | "doctor" | "gym">("patient")
  const [gymName, setGymName] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [invitationValid, setInvitationValid] = useState(true)
  const [address, setAddress] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState("")
  const [bloodType, setBloodType] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [gymAddress, setGymAddress] = useState("")

  const supabase = createClientComponentClient()

  useEffect(() => {
    // Preserve any query parameters when redirecting
    const params = new URLSearchParams(searchParams)
    router.replace(`/register?${params.toString()}`)
  }, [router, searchParams])

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
      }
    }, 10000) // 10 seconds timeout

    return () => clearTimeout(loadingTimeout)
  }, [searchParams, loading])

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
      if (data.phone) setPhone(data.phone)
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

    if (role === "patient" && (!firstName || !lastName || !address || !dateOfBirth || !gender || !bloodType)) {
      setError("Please fill in all required patient information")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Use the client-side Supabase directly instead of server action
      // Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError || !data.user) {
        throw new Error(signUpError?.message || "Failed to create user")
      }

      const userId = data.user.id

      // Create user role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role,
      })

      if (roleError) {
        throw new Error(roleError.message)
      }

      // Create profile based on role
      if (role === "patient") {
        const { error } = await supabase.from("patients").insert({
          user_id: userId,
          name: `${firstName} ${lastName}`,
          email,
          phone,
          address,
          date_of_birth: dateOfBirth,
          gender,
          blood_type: bloodType,
          credit_card_info: "", // Default empty string for credit_card_info
        })
        if (error) throw new Error(error.message)
      } else if (role === "doctor") {
        const { error } = await supabase.from("doctors").insert({
          user_id: userId,
          name: `${firstName} ${lastName}`,
          email,
          phone,
          specialization,
          license_number: licenseNumber,
          address: address || "", // Use address if provided, otherwise empty string
        })
        if (error) throw new Error(error.message)
      } else if (role === "gym") {
        const { error } = await supabase.from("gyms").insert({
          user_id: userId,
          name: gymName,
          email,
          phone,
          address: gymAddress || address, // Use gymAddress if provided, otherwise use address
        })
        if (error) throw new Error(error.message)
      }

      // Update invitation status if applicable
      if (inviteCode) {
        await supabase
          .from("invitations")
          .update({ status: "accepted" })
          .eq("invite_code", inviteCode)
          .eq("email", email)
      }

      // Redirect to login page with success message
      router.push("/login?registered=true")
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.message || "Failed to register")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Redirecting to registration page...</p>
      </div>
    </div>
  )
}
