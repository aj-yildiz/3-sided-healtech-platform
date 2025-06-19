"use server"

import { createServerActionClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { fetchById, create, update, remove, uploadFile, deleteFile } from "@/lib/api-utils"

export async function getPatientProfile(userId: string) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase.from("patients").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching patient profile:", error)
    return null
  }

  return data
}

export async function updatePatientProfile(patientId: number, data: any) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("patients").update(data).eq("id", patientId)

  if (error) {
    console.error("Error updating patient profile:", error)
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  revalidatePath("/patient/profile")
  return { success: true }
}

export async function uploadPatientProfileImage(patientId: number, file: File) {
  try {
    // Upload the file to storage
    const filePath = await uploadFile("profile-images", `patients/${patientId}`, file)

    // Update the patient profile with the new image URL
    await update("patients", patientId, { profile_image: filePath })

    revalidatePath("/patient/profile")
    return { success: true, imageUrl: filePath }
  } catch (error: any) {
    console.error("Error uploading profile image:", error)
    throw new Error(`Failed to upload profile image: ${error.message}`)
  }
}

export async function getPatientInsurance(patientId: number) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from("patient_insurance")
    .select(`
      id,
      policy_number,
      group_number,
      coverage_details,
      insurance_providers:insurance_provider_id(
        id,
        name
      )
    `)
    .eq("patient_id", patientId)

  if (error) {
    console.error("Error fetching patient insurance:", error)
    return []
  }

  return data
}

export async function addPatientInsurance(
  patientId: number,
  insuranceProviderId: number,
  policyNumber: string,
  groupNumber?: string,
  coverageDetails?: any,
) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("patient_insurance").insert({
    patient_id: patientId,
    insurance_provider_id: insuranceProviderId,
    policy_number: policyNumber,
    group_number: groupNumber,
    coverage_details: coverageDetails,
  })

  if (error) {
    console.error("Error adding patient insurance:", error)
    throw new Error(`Failed to add insurance: ${error.message}`)
  }

  revalidatePath("/patient/insurance")
  return { success: true }
}

export async function removePatientInsurance(insuranceId: number) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("patient_insurance").delete().eq("id", insuranceId)

  if (error) {
    console.error("Error removing patient insurance:", error)
    throw new Error(`Failed to remove insurance: ${error.message}`)
  }

  revalidatePath("/patient/insurance")
  return { success: true }
}

export async function getPatientAppointments(patientId: number) {
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
      doctors:doctor_id(
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
      price,
      insurance_claims:insurance_claim_id(
        id,
        status,
        claim_amount,
        claim_reference
      )
    `)
    .eq("patient_id", patientId)
    .order("appointment_date", { ascending: true })

  if (error) {
    console.error("Error fetching patient appointments:", error)
    return []
  }

  return data
}

export async function bookAppointment(
  patientId: number,
  doctorId: number,
  gymId: number,
  serviceTypeId: number,
  appointmentDate: string,
  appointmentTime: string,
  price: number,
  appointmentType = "consultation",
) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      gym_id: gymId,
      service_type_id: serviceTypeId,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      appointment_type: appointmentType,
      appointment_status: "scheduled",
      price: price,
    })
    .select()
    .single()

  if (error) {
    console.error("Error booking appointment:", error)
    throw new Error(`Failed to book appointment: ${error.message}`)
  }

  revalidatePath("/patient/appointments")
  return data
}

export async function cancelAppointment(appointmentId: number) {
  const supabase = await createServerActionClient()

  const { error } = await supabase
    .from("appointments")
    .update({ appointment_status: "cancelled" })
    .eq("id", appointmentId)

  if (error) {
    console.error("Error cancelling appointment:", error)
    throw new Error(`Failed to cancel appointment: ${error.message}`)
  }

  revalidatePath("/patient/appointments")
  return { success: true }
}

export async function submitInsuranceClaim(appointmentId: number, patientInsuranceId: number, claimAmount: number) {
  const supabase = await createServerActionClient()

  // Create the insurance claim
  const { data, error } = await supabase
    .from("insurance_claims")
    .insert({
      appointment_id: appointmentId,
      patient_insurance_id: patientInsuranceId,
      claim_amount: claimAmount,
      status: "submitted",
      claim_reference: `CLAIM-${Date.now()}`,
    })
    .select()
    .single()

  if (error) {
    console.error("Error submitting insurance claim:", error)
    throw new Error(`Failed to submit claim: ${error.message}`)
  }

  // Update the appointment with the insurance claim ID
  await supabase.from("appointments").update({ insurance_claim_id: data.id }).eq("id", appointmentId)

  revalidatePath("/patient/appointments")
  return data
}

export async function getAvailableDoctors(serviceTypeId?: number) {
  const supabase = await createServerActionClient()

  let query = supabase.from("doctors").select(`
      id, 
      name, 
      specialization,
      doctor_services!inner(service_type_id),
      doctor_locations!inner(
        gym_id,
        gyms:gym_id(id, name, address, latitude, longitude)
      )
    `)

  if (serviceTypeId) {
    query = query.eq("doctor_services.service_type_id", serviceTypeId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching available doctors:", error)
    return []
  }

  return data
}

export async function getDoctorAvailabilityForPatient(doctorId: number) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
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

  if (error) {
    console.error("Error fetching doctor availability for patient:", error)
    return []
  }

  return data
}

export async function getServiceTypes() {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase.from("service_types").select("*")

  if (error) {
    console.error("Error fetching service types:", error)
    return []
  }

  return data
}

export async function uploadMedicalRecord(patientId: number, file: File, recordType: string, description: string) {
  console.log('[uploadMedicalRecord] called', { patientId, file, recordType, description });
  try {
    // Upload the file to storage
    console.log('[uploadMedicalRecord] uploading file to storage...');
    const filePath = await uploadFile("medical-records", `patients/${patientId}/${recordType}`, file);
    console.log('[uploadMedicalRecord] file uploaded, filePath:', filePath);

    // Create a record in the medical_records table
    await create("medical_records", {
      patient_id: patientId,
      record_type: recordType,
      description: description,
      file_path: filePath,
      file_name: file.name,
    });
    console.log('[uploadMedicalRecord] record created in DB');

    revalidatePath("/patient/medical-history");
    return { success: true, recordUrl: filePath };
  } catch (error: any) {
    console.error("[uploadMedicalRecord] Error uploading medical record:", error);
    throw new Error(`Failed to upload record: ${error.message}`);
  }
}

export async function getMedicalRecords(patientId: number) {
  const supabase = await createServerActionClient()

  try {
    const { data, error } = await supabase
      .from("medical_records")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })

    if (error) {
      // Check if the error is because the table doesn't exist
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        console.error("Medical records table does not exist yet:", error)
        return []
      }

      console.error("Error fetching medical records:", error)
      throw error
    }

    return data || []
  } catch (error: any) {
    console.error("Error in getMedicalRecords:", error)
    return []
  }
}

export async function deleteMedicalRecord(recordId: number) {
  try {
    // Get the record to find the file path
    const record = await fetchById("medical_records", recordId)

    // Delete the file from storage
    await deleteFile("medical-records", record.file_path)

    // Delete the record
    await remove("medical_records", recordId)

    revalidatePath("/patient/medical-history")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting medical record:", error)
    throw new Error(`Failed to delete record: ${error.message}`)
  }
}
