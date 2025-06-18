"use server"

import { createServerActionClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function registerUser(formData: FormData) {
  try {
    const email = (formData.get("email") as string).trim().toLowerCase()
    const password = formData.get("password") as string
    const role = formData.get("role") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const phone = formData.get("phone") as string
    const specialization = formData.get("specialization") as string
    const gymName = formData.get("gymName") as string
    const inviteCode = (formData.get("inviteCode") as string) || null

    // Add new variables to get additional form data
    const address = (formData.get("address") as string) || ""
    const dateOfBirth = (formData.get("dateOfBirth") as string) || ""
    const gender = (formData.get("gender") as string) || ""
    const bloodType = (formData.get("bloodType") as string) || ""
    const licenseNumber = (formData.get("licenseNumber") as string) || ""
    const gymAddress = (formData.get("gymAddress") as string) || ""

    if (!email || !password || !role) {
      return { success: false, error: "Missing required fields" }
    }

    // Create Supabase client with cookies
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    console.log("Server action: Attempting to sign up user with email:", email)

    // Create auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/login`,
      },
    })

    if (signUpError) {
      console.error("Server action: Sign up error:", signUpError)

      // Check for rate limiting error
      if (signUpError.message?.includes("security purposes") || signUpError.message?.includes("rate limit")) {
        return {
          success: false,
          error: "Rate limit reached. Please wait at least 32 seconds before trying again.",
        }
      }
      return { success: false, error: signUpError.message || "Failed to create user" }
    }

    if (!data?.user) {
      console.error("Server action: No user returned from signUp")
      return { success: false, error: "Failed to create user account" }
    }

    console.log("Server action: User created successfully with ID:", data.user.id)
    const userId = data.user.id

    // Create user role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role,
    })

    if (roleError) {
      console.error("Server action: Role creation error:", roleError)
      return { success: false, error: roleError.message }
    }

    // Create profile based on role
    let profileError = null

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
      profileError = error
      if (error) console.error("Server action: Patient profile creation error:", error)
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
      profileError = error
      if (error) console.error("Server action: Doctor profile creation error:", error)
    } else if (role === "gym") {
      const { error } = await supabase.from("gyms").insert({
        user_id: userId,
        name: gymName,
        email,
        phone,
        address: gymAddress || address, // Use gymAddress if provided, otherwise use address
      })
      profileError = error
      if (error) console.error("Server action: Gym profile creation error:", error)
    }

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // Update invitation status if applicable
    if (inviteCode) {
      await supabase.from("invitations").update({ status: "accepted" }).eq("invite_code", inviteCode).eq("email", email)
    }

    revalidatePath("/login")
    return { success: true }
  } catch (error: any) {
    console.error("Server action: Registration error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
