"use server"

import { createServerActionClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { fetchById, create, update, remove, uploadFile, deleteFile, fetchDoctorTreatments } from "@/lib/api-utils"

export async function getDoctorProfile(userId: string) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase.from("doctors").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching doctor profile:", error)
    return null
  }

  return data
}

export async function updateDoctorProfile(doctorId: number, data: any) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("doctors").update(data).eq("id", doctorId)

  if (error) {
    console.error("Error updating doctor profile:", error)
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  revalidatePath("/doctor/profile")
  return { success: true }
}

export async function uploadDoctorProfileImage(doctorId: number, file: File) {
  try {
    // Upload the file to storage
    const filePath = await uploadFile("profile-images", `doctors/${doctorId}`, file)

    // Update the doctor profile with the new image URL
    await update("doctors", doctorId, { profile_image: filePath })

    revalidatePath("/doctor/profile")
    return { success: true, imageUrl: filePath }
  } catch (error: any) {
    console.error("Error uploading profile image:", error)
    throw new Error(`Failed to upload profile image: ${error.message}`)
  }
}

export async function getDoctorServices(doctorId: number) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from("doctor_services")
    .select(`
    id,
    service_types:service_type_id(
      id,
      name,
      description
    )
  `)
    .eq("doctor_id", doctorId)

  if (error) {
    console.error("Error fetching doctor services:", error)
    return []
  }

  return data.map((item) => ({
    id: item.id,
    serviceType: item.service_types,
  }))
}

export async function addDoctorService(doctorId: number, serviceTypeId: number) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("doctor_services").insert({
    doctor_id: doctorId,
    service_type_id: serviceTypeId,
  })

  if (error) {
    console.error("Error adding doctor service:", error)
    throw new Error(`Failed to add service: ${error.message}`)
  }

  revalidatePath("/doctor/services")
  return { success: true }
}

export async function removeDoctorService(serviceId: number) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("doctor_services").delete().eq("id", serviceId)

  if (error) {
    console.error("Error removing doctor service:", error)
    throw new Error(`Failed to remove service: ${error.message}`)
  }

  revalidatePath("/doctor/services")
  return { success: true }
}

export async function getDoctorLocations(doctorId: number) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from("doctor_locations")
    .select(`
    id,
    gyms:gym_id(
      id,
      name,
      address,
      email,
      phone
    )
  `)
    .eq("doctor_id", doctorId)

  if (error) {
    console.error("Error fetching doctor locations:", error)
    return []
  }

  return data.map((item) => ({
    id: item.id,
    gym: item.gyms,
  }))
}

export async function addDoctorLocation(doctorId: number, gymId: number) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("doctor_locations").insert({
    doctor_id: doctorId,
    gym_id: gymId,
  })

  if (error) {
    console.error("Error adding doctor location:", error)
    throw new Error(`Failed to add location: ${error.message}`)
  }

  revalidatePath("/doctor/locations")
  return { success: true }
}

export async function removeDoctorLocation(locationId: number) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("doctor_locations").delete().eq("id", locationId)

  if (error) {
    console.error("Error removing doctor location:", error)
    throw new Error(`Failed to remove location: ${error.message}`)
  }

  revalidatePath("/doctor/locations")
  return { success: true }
}

export async function getDoctorAvailability(doctorId: number) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from("doctor_availability")
    .select(`
    id,
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

  if (error) {
    console.error("Error fetching doctor availability:", error)
    return []
  }

  return data
}

export async function addDoctorAvailability(
  doctorId: number,
  gymId: number,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("doctor_availability").insert({
    doctor_id: doctorId,
    gym_id: gymId,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
  })

  if (error) {
    console.error("Error adding doctor availability:", error)
    throw new Error(`Failed to add availability: ${error.message}`)
  }

  revalidatePath("/doctor/availability")
  return { success: true }
}

export async function removeDoctorAvailability(availabilityId: number) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("doctor_availability").delete().eq("id", availabilityId)

  if (error) {
    console.error("Error removing doctor availability:", error)
    throw new Error(`Failed to remove availability: ${error.message}`)
  }

  revalidatePath("/doctor/availability")
  return { success: true }
}

export async function getDoctorAppointments(doctorId: number) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from("appointments")
    .select(`
    id,
    appointment_date,
    appointment_time,
    appointment_type,
    appointment_status,
    appointment_notes,
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
    return []
  }

  return data
}

export async function updateAppointmentStatus(appointmentId: number, status: string) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("appointments").update({ appointment_status: status }).eq("id", appointmentId)

  if (error) {
    console.error("Error updating appointment status:", error)
    throw new Error(`Failed to update appointment status: ${error.message}`)
  }

  revalidatePath("/doctor/appointments")
  return { success: true }
}

export async function addAppointmentNotes(appointmentId: number, notes: string) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("appointments").update({ appointment_notes: notes }).eq("id", appointmentId)

  if (error) {
    console.error("Error adding appointment notes:", error)
    throw new Error(`Failed to add appointment notes: ${error.message}`)
  }

  revalidatePath("/doctor/appointments")
  return { success: true }
}

export async function getTreatments(doctorId: number) {
  try {
    return await fetchDoctorTreatments(doctorId)
  } catch (error) {
    console.error("Error in getTreatments:", error)
    return []
  }
}

export async function createTreatment(treatmentData: any) {
  try {
    const treatment = await create("treatments", treatmentData)
    revalidatePath("/doctor/treatments")
    return treatment
  } catch (error: any) {
    console.error("Error creating treatment:", error)
    throw new Error(`Failed to create treatment: ${error.message}`)
  }
}

export async function updateTreatment(treatmentId: number, treatmentData: any) {
  try {
    const treatment = await update("treatments", treatmentId, treatmentData)
    revalidatePath("/doctor/treatments")
    return treatment
  } catch (error: any) {
    console.error("Error updating treatment:", error)
    throw new Error(`Failed to update treatment: ${error.message}`)
  }
}

export async function deleteTreatment(treatmentId: number) {
  try {
    await remove("treatments", treatmentId)
    revalidatePath("/doctor/treatments")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting treatment:", error)
    throw new Error(`Failed to delete treatment: ${error.message}`)
  }
}

export async function uploadMedicalDocument(doctorId: number, patientId: number, file: File, documentType: string) {
  try {
    // Upload the file to storage
    const filePath = await uploadFile(
      "medical-documents",
      `doctors/${doctorId}/patients/${patientId}/${documentType}`,
      file,
    )

    // Create a record in the medical_documents table
    await create("medical_documents", {
      doctor_id: doctorId,
      patient_id: patientId,
      document_type: documentType,
      file_path: filePath,
      file_name: file.name,
    })

    revalidatePath(`/doctor/patients/${patientId}`)
    return { success: true, documentUrl: filePath }
  } catch (error: any) {
    console.error("Error uploading medical document:", error)
    throw new Error(`Failed to upload document: ${error.message}`)
  }
}

export async function getMedicalDocuments(doctorId: number, patientId: number) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from("medical_documents")
    .select("*")
    .eq("doctor_id", doctorId)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching medical documents:", error)
    return []
  }

  return data
}

export async function deleteMedicalDocument(documentId: number) {
  try {
    // Get the document to find the file path
    const document = await fetchById("medical_documents", documentId)

    // Delete the file from storage
    await deleteFile("medical-documents", document.file_path)

    // Delete the record
    await remove("medical_documents", document.file_path)

    // Delete the record
    await remove("medical_documents", documentId)

    revalidatePath(`/doctor/patients/${document.patient_id}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting medical document:", error)
    throw new Error(`Failed to delete document: ${error.message}`)
  }
}

export async function getDoctorPatients(doctorId: number) {
  const supabase = await createServerActionClient()

  // Get all appointments for this doctor
  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select(`
      patient_id,
      patients:patient_id(
        id,
        name,
        email,
        phone,
        date_of_birth,
        gender,
        medical_history,
        allergies,
        current_medications,
        current_conditions
      )
    `)
    .eq("doctor_id", doctorId)
    .order("appointment_date", { ascending: false })

  if (appointmentsError) {
    console.error("Error fetching doctor patients:", appointmentsError)
    return []
  }

  // Create a map to deduplicate patients
  const patientsMap = new Map()

  appointments.forEach((appointment) => {
    if (appointment.patients && !patientsMap.has(appointment.patients.id)) {
      patientsMap.set(appointment.patients.id, appointment.patients)
    }
  })

  return Array.from(patientsMap.values())
}

export async function getPatientAppointmentHistory(doctorId: number, patientId: number) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      appointment_date,
      appointment_time,
      appointment_type,
      appointment_status,
      appointment_notes,
      service_types:service_type_id(
        id,
        name
      ),
      gyms:gym_id(
        id,
        name,
        address
      )
    `)
    .eq("doctor_id", doctorId)
    .eq("patient_id", patientId)
    .order("appointment_date", { ascending: false })

  if (error) {
    console.error("Error fetching patient appointment history:", error)
    return []
  }

  return data
}

export async function addPatientNote(doctorId: number, patientId: number, note: string) {
  try {
    await create("patient_notes", {
      doctor_id: doctorId,
      patient_id: patientId,
      note,
    })

    revalidatePath(`/doctor/patients/${patientId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error adding patient note:", error)
    throw new Error(`Failed to add note: ${error.message}`)
  }
}

export async function getPatientNotes(doctorId: number, patientId: number) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from("patient_notes")
    .select("*")
    .eq("doctor_id", doctorId)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching patient notes:", error)
    return []
  }

  return data
}
