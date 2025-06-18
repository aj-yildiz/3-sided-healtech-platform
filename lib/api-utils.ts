"use server"

import { createServerActionClient } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

// Generic type for database tables
type TableName = keyof Database["public"]["Tables"]

// Generic CRUD functions
export async function fetchAll<T>(table: TableName, query?: any): Promise<T[]> {
  const supabase = await createServerActionClient()
  const queryBuilder = supabase.from(table).select(query || "*")

  const { data, error } = await queryBuilder

  if (error) {
    console.error(`Error fetching from ${table}:`, error)
    throw new Error(`Failed to fetch ${table}: ${error.message}`)
  }

  return data as T[]
}

export async function fetchById(table: string, id: number) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase.from(table).select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching ${table} by id:`, error)
    throw new Error(`Failed to fetch ${table}: ${error.message}`)
  }

  return data
}

export async function fetchByField<T>(table: TableName, field: string, value: any, query?: any): Promise<T[]> {
  const supabase = await createServerActionClient()
  const { data, error } = await supabase
    .from(table)
    .select(query || "*")
    .eq(field, value)

  if (error) {
    console.error(`Error fetching ${table} with ${field}=${value}:`, error)
    throw new Error(`Failed to fetch ${table}: ${error.message}`)
  }

  return data as T[]
}

export async function create(table: string, data: any) {
  const supabase = await createServerActionClient()

  const { data: result, error } = await supabase.from(table).insert(data).select().single()

  if (error) {
    console.error(`Error creating ${table}:`, error)
    throw new Error(`Failed to create ${table}: ${error.message}`)
  }

  return result
}

export async function update(table: string, id: number, data: any) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from(table).update(data).eq("id", id)

  if (error) {
    console.error(`Error updating ${table}:`, error)
    throw new Error(`Failed to update ${table}: ${error.message}`)
  }

  return { success: true }
}

export async function remove(table: string, id: number) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from(table).delete().eq("id", id)

  if (error) {
    console.error(`Error deleting ${table}:`, error)
    throw new Error(`Failed to delete ${table}: ${error.message}`)
  }

  return { success: true }
}

// File storage functions
export async function uploadFile(bucket: string, path: string, file: File) {
  const supabase = await createServerActionClient()

  // Create a unique file name
  const fileExt = file.name.split(".").pop()
  const fileName = `${path}-${Date.now()}.${fileExt}`
  const filePath = `${path}/${fileName}`

  // Upload the file
  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file)

  if (uploadError) {
    console.error("Error uploading file:", uploadError)
    throw new Error(`Failed to upload file: ${uploadError.message}`)
  }

  // Get the public URL
  const { data: publicURL } = supabase.storage.from(bucket).getPublicUrl(filePath)

  return publicURL.publicUrl
}

export async function deleteFile(bucket: string, filePath: string) {
  const supabase = await createServerActionClient()

  // Extract the path from the full URL if needed
  const path = filePath.includes("https://") ? filePath.split(`${bucket}/`)[1] : filePath

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    console.error("Error deleting file:", error)
    throw new Error(`Failed to delete file: ${error.message}`)
  }

  return { success: true }
}

// Specialized functions for specific entities
export async function fetchDoctorsByServiceType(serviceTypeId: number) {
  const supabase = await createServerActionClient()
  const { data, error } = await supabase
    .from("doctor_services")
    .select(`
      doctor_id,
      doctors:doctor_id(
        id,
        name,
        email,
        phone,
        specialization,
        license_number
      )
    `)
    .eq("service_type_id", serviceTypeId)

  if (error) {
    console.error("Error fetching doctors by service type:", error)
    throw new Error(`Failed to fetch doctors: ${error.message}`)
  }

  return data.map((item) => item.doctors)
}

export async function fetchDoctorLocations(doctorId: number) {
  const supabase = await createServerActionClient()
  const { data, error } = await supabase
    .from("doctor_locations")
    .select(`
      id,
      gyms:gym_id(
        id,
        name,
        address,
        phone,
        email
      )
    `)
    .eq("doctor_id", doctorId)

  if (error) {
    console.error("Error fetching doctor locations:", error)
    throw new Error(`Failed to fetch doctor locations: ${error.message}`)
  }

  return data.map((item) => ({
    id: item.id,
    gym: item.gyms,
  }))
}

export async function fetchDoctorAvailability(doctorId: number, gymId?: number) {
  const supabase = await createServerActionClient()
  let query = supabase
    .from("doctor_availability")
    .select(`
      id,
      doctor_id,
      gym_id,
      day_of_week,
      start_time,
      end_time,
      gyms:gym_id(
        id,
        name,
        address
      )
    `)
    .eq("doctor_id", doctorId)

  if (gymId) {
    query = query.eq("gym_id", gymId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching doctor availability:", error)
    throw new Error(`Failed to fetch doctor availability: ${error.message}`)
  }

  return data
}

export async function fetchDoctorTreatments(doctorId: number) {
  const supabase = await createServerActionClient()
  const { data, error } = await supabase
    .from("treatments")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching doctor treatments:", error)
    throw new Error(`Failed to fetch treatments: ${error.message}`)
  }

  return data
}

export async function fetchAppointmentsForDoctor(doctorId: number) {
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
        name,
        email,
        phone
      ),
      gyms:gym_id(
        id,
        name,
        address
      ),
      service_types:service_type_id(
        id,
        name
      ),
      price
    `)
    .eq("doctor_id", doctorId)
    .order("appointment_date", { ascending: true })

  if (error) {
    console.error("Error fetching doctor appointments:", error)
    throw new Error(`Failed to fetch appointments: ${error.message}`)
  }

  return data
}

export async function fetchAppointmentsForGym(gymId: number) {
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
      service_types:service_type_id(
        id,
        name
      )
    `)
    .eq("gym_id", gymId)
    .order("appointment_date", { ascending: true })

  if (error) {
    console.error("Error fetching gym appointments:", error)
    throw new Error(`Failed to fetch appointments: ${error.message}`)
  }

  return data
}

export async function fetchAppointmentsForPatient(patientId: number) {
  const supabase = await createServerActionClient()
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      appointment_date,
      appointment_time,
      appointment_type,
      appointment_status,
      doctors:doctor_id(
        id,
        name,
        phone,
        email
      ),
      gyms:gym_id(
        id,
        name,
        address
      ),
      service_types:service_type_id(
        id,
        name
      ),
      price,
      insurance_claim_id,
      insurance_claims:insurance_claim_id(
        id,
        status,
        claim_amount
      )
    `)
    .eq("patient_id", patientId)
    .order("appointment_date", { ascending: true })

  if (error) {
    console.error("Error fetching patient appointments:", error)
    throw new Error(`Failed to fetch appointments: ${error.message}`)
  }

  return data
}

export async function createInsuranceClaim(appointmentId: number, patientInsuranceId: number, amount: number) {
  const supabase = await createServerActionClient()
  const { data, error } = await supabase
    .from("insurance_claims")
    .insert({
      appointment_id: appointmentId,
      patient_insurance_id: patientInsuranceId,
      claim_amount: amount,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating insurance claim:", error)
    throw new Error(`Failed to create insurance claim: ${error.message}`)
  }

  // Update the appointment with the insurance claim ID
  await supabase.from("appointments").update({ insurance_claim_id: data.id }).eq("id", appointmentId)

  return data
}

export async function processPayment(appointmentId: number, amount: number, paymentMethod: string) {
  const supabase = await createServerActionClient()

  // Create payment transaction
  const { data: transaction, error: transactionError } = await supabase
    .from("payment_transactions")
    .insert({
      appointment_id: appointmentId,
      amount,
      status: "completed",
      payment_method: paymentMethod,
      transaction_reference: `TX-${Date.now()}`,
    })
    .select()
    .single()

  if (transactionError) {
    console.error("Error creating payment transaction:", transactionError)
    throw new Error(`Failed to process payment: ${transactionError.message}`)
  }

  // Get appointment details to distribute payment
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select(`
      doctor_id,
      gym_id
    `)
    .eq("id", appointmentId)
    .single()

  if (appointmentError) {
    console.error("Error fetching appointment for payment distribution:", appointmentError)
    throw new Error(`Failed to distribute payment: ${appointmentError.message}`)
  }

  // Calculate payment distributions (example: 70% to doctor, 20% to gym, 10% to admin)
  const doctorAmount = amount * 0.7
  const gymAmount = amount * 0.2
  const adminAmount = amount * 0.1

  // Create payment distributions
  const { error: distributionError } = await supabase.from("payment_distributions").insert([
    {
      transaction_id: transaction.id,
      recipient_type: "doctor",
      recipient_id: appointment.doctor_id,
      amount: doctorAmount,
      status: "pending",
    },
    {
      transaction_id: transaction.id,
      recipient_type: "gym",
      recipient_id: appointment.gym_id,
      amount: gymAmount,
      status: "pending",
    },
    {
      transaction_id: transaction.id,
      recipient_type: "admin",
      recipient_id: 1, // Assuming admin ID 1
      amount: adminAmount,
      status: "pending",
    },
  ])

  if (distributionError) {
    console.error("Error creating payment distributions:", distributionError)
    throw new Error(`Failed to distribute payment: ${distributionError.message}`)
  }

  return transaction
}
