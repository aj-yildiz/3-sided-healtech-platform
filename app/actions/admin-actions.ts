"use server"

import { createServerActionClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { create, update, remove } from "@/lib/api-utils"

export async function getAllPatients() {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase.from("patients").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching patients:", error)
    return []
  }

  return data
}

export async function getAllDoctors() {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase.from("doctors").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching doctors:", error)
    return []
  }

  return data
}

export async function getAllGyms() {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase.from("gyms").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching gyms:", error)
    return []
  }

  return data
}

export async function getAllAppointments() {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      appointment_date,
      appointment_time,
      appointment_type,
      appointment_status,
      patients:patient_id(
        id,
        name
      ),
      doctors:doctor_id(
        id,
        name
      ),
      gyms:gym_id(
        id,
        name
      ),
      service_types:service_type_id(
        id,
        name
      ),
      price,
      insurance_claims:insurance_claim_id(
        id,
        status,
        claim_amount
      )
    `)
    .order("appointment_date", { ascending: false })

  if (error) {
    console.error("Error fetching appointments:", error)
    return []
  }

  return data
}

export async function getAllPayments() {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from("payment_transactions")
    .select(`
      id,
      amount,
      status,
      payment_method,
      transaction_reference,
      created_at,
      appointments:appointment_id(
        id,
        appointment_date,
        appointment_time,
        patients:patient_id(
          id,
          name
        ),
        doctors:doctor_id(
          id,
          name
        ),
        gyms:gym_id(
          id,
          name
        )
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payments:", error)
    return []
  }

  return data
}

export async function getAllInsuranceClaims() {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from("insurance_claims")
    .select(`
      id,
      claim_amount,
      status,
      claim_reference,
      created_at,
      appointments:appointment_id(
        id,
        appointment_date,
        appointment_time,
        patients:patient_id(
          id,
          name
        ),
        doctors:doctor_id(
          id,
          name
        )
      ),
      patient_insurance:patient_insurance_id(
        id,
        policy_number,
        insurance_providers:insurance_provider_id(
          id,
          name
        )
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching insurance claims:", error)
    return []
  }

  return data
}

export async function inviteDoctor(email: string) {
  const supabase = await createServerActionClient()

  // Generate a unique token
  const token = uuidv4()

  // Check if email already invited
  const { data: existingInvite } = await supabase.from("doctor_invites").select("*").eq("email", email).single()

  if (existingInvite) {
    // Update existing invite
    const { error } = await supabase
      .from("doctor_invites")
      .update({
        token,
        status: "pending",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      })
      .eq("email", email)

    if (error) {
      console.error("Error updating doctor invite:", error)
      throw new Error(`Failed to invite doctor: ${error.message}`)
    }
  } else {
    // Create new invite
    const { error } = await supabase.from("doctor_invites").insert({
      email,
      token,
      status: "pending",
    })

    if (error) {
      console.error("Error creating doctor invite:", error)
      throw new Error(`Failed to invite doctor: ${error.message}`)
    }
  }

  revalidatePath("/admin/doctors")
  return { success: true }
}

export async function updatePaymentDistributionStatus(distributionId: number, status: string) {
  const supabase = await createServerActionClient()

  const updateData: any = {
    status,
  }

  if (status === "paid") {
    updateData.paid_at = new Date().toISOString()
  }

  const { error } = await supabase.from("payment_distributions").update(updateData).eq("id", distributionId)

  if (error) {
    console.error("Error updating payment distribution:", error)
    throw new Error(`Failed to update payment: ${error.message}`)
  }

  revalidatePath("/admin/payments")
  return { success: true }
}

export async function updateInsuranceClaimStatus(claimId: number, status: string, responseDetails?: any) {
  const supabase = await createServerActionClient()

  const updateData: any = {
    status,
  }

  if (responseDetails) {
    updateData.response_details = responseDetails
  }

  const { error } = await supabase.from("insurance_claims").update(updateData).eq("id", claimId)

  if (error) {
    console.error("Error updating insurance claim:", error)
    throw new Error(`Failed to update claim: ${error.message}`)
  }

  revalidatePath("/admin/insurance-claims")
  return { success: true }
}

export async function getDashboardStats() {
  const supabase = await createServerActionClient()

  // Get total patients
  const { count: patientsCount, error: patientsError } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true })

  if (patientsError) {
    console.error("Error counting patients:", patientsError)
  }

  // Get total doctors
  const { count: doctorsCount, error: doctorsError } = await supabase
    .from("doctors")
    .select("*", { count: "exact", head: true })

  if (doctorsError) {
    console.error("Error counting doctors:", doctorsError)
  }

  // Get total gyms
  const { count: gymsCount, error: gymsError } = await supabase.from("gyms").select("*", { count: "exact", head: true })

  if (gymsError) {
    console.error("Error counting gyms:", gymsError)
  }

  // Get total appointments
  const { count: appointmentsCount, error: appointmentsError } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })

  if (appointmentsError) {
    console.error("Error counting appointments:", appointmentsError)
  }

  // Get total revenue
  const { data: revenueData, error: revenueError } = await supabase
    .from("payment_transactions")
    .select("amount")
    .eq("status", "completed")

  if (revenueError) {
    console.error("Error fetching revenue:", revenueError)
  }

  const totalRevenue = revenueData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0

  // Get recent appointments
  const { data: recentAppointments, error: recentAppointmentsError } = await supabase
    .from("appointments")
    .select(`
      id,
      appointment_date,
      appointment_time,
      appointment_status,
      patients:patient_id(name),
      doctors:doctor_id(name),
      gyms:gym_id(name)
    `)
    .order("appointment_date", { ascending: false })
    .limit(5)

  if (recentAppointmentsError) {
    console.error("Error fetching recent appointments:", recentAppointmentsError)
  }

  return {
    totalPatients: patientsCount || 0,
    totalDoctors: doctorsCount || 0,
    totalGyms: gymsCount || 0,
    totalAppointments: appointmentsCount || 0,
    totalRevenue,
    recentAppointments: recentAppointments || [],
  }
}

export async function createServiceType(name: string, description?: string) {
  try {
    await create("service_types", {
      name,
      description,
    })

    revalidatePath("/admin/service-types")
    return { success: true }
  } catch (error: any) {
    console.error("Error creating service type:", error)
    throw new Error(`Failed to create service type: ${error.message}`)
  }
}

export async function updateServiceType(id: number, name: string, description?: string) {
  try {
    await update("service_types", id, {
      name,
      description,
    })

    revalidatePath("/admin/service-types")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating service type:", error)
    throw new Error(`Failed to update service type: ${error.message}`)
  }
}

export async function deleteServiceType(id: number) {
  try {
    await remove("service_types", id)

    revalidatePath("/admin/service-types")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting service type:", error)
    throw new Error(`Failed to delete service type: ${error.message}`)
  }
}

export async function createInsuranceProvider(name: string, apiKey?: string, apiEndpoint?: string) {
  try {
    await create("insurance_providers", {
      name,
      api_key: apiKey,
      api_endpoint: apiEndpoint,
    })

    revalidatePath("/admin/insurance-providers")
    return { success: true }
  } catch (error: any) {
    console.error("Error creating insurance provider:", error)
    throw new Error(`Failed to create insurance provider: ${error.message}`)
  }
}

export async function updateInsuranceProvider(id: number, name: string, apiKey?: string, apiEndpoint?: string) {
  try {
    await update("insurance_providers", id, {
      name,
      api_key: apiKey,
      api_endpoint: apiEndpoint,
    })

    revalidatePath("/admin/insurance-providers")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating insurance provider:", error)
    throw new Error(`Failed to update insurance provider: ${error.message}`)
  }
}

export async function deleteInsuranceProvider(id: number) {
  try {
    await remove("insurance_providers", id)

    revalidatePath("/admin/insurance-providers")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting insurance provider:", error)
    throw new Error(`Failed to delete insurance provider: ${error.message}`)
  }
}
