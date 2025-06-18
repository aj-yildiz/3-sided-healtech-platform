"use server"

import { createServerActionClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { fetchById, fetchByField, create, update, remove, uploadFile, deleteFile } from "@/lib/api-utils"

export async function getGymProfile(userId: string) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase.from("gyms").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching gym profile:", error)
    return null
  }

  return data
}

export async function updateGymProfile(gymId: number, data: any) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("gyms").update(data).eq("id", gymId)

  if (error) {
    console.error("Error updating gym profile:", error)
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  revalidatePath("/gym/profile")
  return { success: true }
}

export async function uploadGymImages(gymId: number, files: File[]) {
  try {
    const imageUrls = []

    for (const file of files) {
      // Upload the file to storage
      const filePath = await uploadFile("gym-images", `gyms/${gymId}`, file)

      // Create a record in the gym_images table
      await create("gym_images", {
        gym_id: gymId,
        image_url: filePath,
        image_name: file.name,
      })

      imageUrls.push(filePath)
    }

    revalidatePath("/gym/profile")
    return { success: true, imageUrls }
  } catch (error: any) {
    console.error("Error uploading gym images:", error)
    throw new Error(`Failed to upload images: ${error.message}`)
  }
}

export async function deleteGymImage(imageId: number) {
  try {
    // Get the image to find the file path
    const image = await fetchById("gym_images", imageId)

    // Delete the file from storage
    await deleteFile("gym-images", image.image_url)

    // Delete the record
    await remove("gym_images", imageId)

    revalidatePath("/gym/profile")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting gym image:", error)
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

export async function getGymAvailability(gymId: number) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase.from("gym_availability").select("*").eq("gym_id", gymId)

  if (error) {
    console.error("Error fetching gym availability:", error)
    return []
  }

  return data
}

export async function addGymAvailability(gymId: number, dayOfWeek: number, startTime: string, endTime: string) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("gym_availability").insert({
    gym_id: gymId,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
  })

  if (error) {
    console.error("Error adding gym availability:", error)
    throw new Error(`Failed to add availability: ${error.message}`)
  }

  revalidatePath("/gym/availability")
  return { success: true }
}

export async function removeGymAvailability(availabilityId: number) {
  const supabase = await createServerActionClient()

  const { error } = await supabase.from("gym_availability").delete().eq("id", availabilityId)

  if (error) {
    console.error("Error removing gym availability:", error)
    throw new Error(`Failed to remove availability: ${error.message}`)
  }

  revalidatePath("/gym/availability")
  return { success: true }
}

export async function getGymAppointments(gymId: number) {
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
      ),
      price
    `)
    .eq("gym_id", gymId)
    .order("appointment_date", { ascending: true })

  if (error) {
    console.error("Error fetching gym appointments:", error)
    return []
  }

  return data
}

export async function getDoctorsAtGym(gymId: number) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from("doctor_locations")
    .select(`
      doctors:doctor_id(
        id,
        name,
        specialization,
        email,
        phone
      )
    `)
    .eq("gym_id", gymId)

  if (error) {
    console.error("Error fetching doctors at gym:", error)
    return []
  }

  return data.map((item) => item.doctors)
}

export async function getGymPayments(gymId: number) {
  const supabase = await createServerActionClient()

  const { data, error } = await supabase
    .from("payment_distributions")
    .select(`
      id,
      amount,
      status,
      paid_at,
      payment_transactions:transaction_id(
        id,
        amount,
        status,
        created_at,
        appointments:appointment_id(
          id,
          appointment_date,
          appointment_time,
          doctors:doctor_id(
            id,
            name
          ),
          patients:patient_id(
            id,
            name
          )
        )
      )
    `)
    .eq("recipient_type", "gym")
    .eq("recipient_id", gymId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching gym payments:", error)
    return []
  }

  return data
}

export async function addGymAmenity(gymId: number, amenityName: string, amenityDescription: string) {
  try {
    await create("gym_amenities", {
      gym_id: gymId,
      name: amenityName,
      description: amenityDescription,
    })

    revalidatePath("/gym/profile")
    return { success: true }
  } catch (error: any) {
    console.error("Error adding gym amenity:", error)
    throw new Error(`Failed to add amenity: ${error.message}`)
  }
}

export async function getGymAmenities(gymId: number) {
  try {
    return await fetchByField("gym_amenities", "gym_id", gymId)
  } catch (error) {
    console.error("Error fetching gym amenities:", error)
    return []
  }
}

export async function removeGymAmenity(amenityId: number) {
  try {
    await remove("gym_amenities", amenityId)
    revalidatePath("/gym/profile")
    return { success: true }
  } catch (error: any) {
    console.error("Error removing gym amenity:", error)
    throw new Error(`Failed to remove amenity: ${error.message}`)
  }
}

export async function updateGymLocation(gymId: number, latitude: number, longitude: number) {
  try {
    await update("gyms", gymId, { latitude, longitude })
    revalidatePath("/gym/profile")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating gym location:", error)
    throw new Error(`Failed to update location: ${error.message}`)
  }
}
