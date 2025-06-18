import { NextResponse } from "next/server"
import { createServerActionClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, specialization, message, inviteCode, inviteType } = await request.json()

    const supabase = await createServerActionClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 })
    }

    // Create invitation record
    const { data, error } = await supabase
      .from("invitations")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        specialization,
        message,
        invite_code: inviteCode,
        status: "pending",
        role: "doctor",
      })
      .select()

    if (error) {
      console.error("Error creating invitation:", error)
      return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 })
    }

    // If email invitation, send email (in a real app)
    if (inviteType === "email") {
      // In a real app, you would send an email here
      console.log(`Sending invitation email to ${email}`)
    }

    return NextResponse.json({ success: true, invitation: data[0] })
  } catch (error) {
    console.error("Error processing invitation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
