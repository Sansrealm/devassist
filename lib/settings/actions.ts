"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const profileSchema = z.object({
  firstName: z.string().max(50, "First name must be less than 50 characters").nullable().optional(),
  lastName: z.string().max(50, "Last name must be less than 50 characters").nullable().optional(),
  avatarUrl: z.string().url("Please enter a valid URL").nullable().optional(),
  timezone: z.string().nullable().optional(),
})

// Helper function to handle a safe file name for Supabase Storage
function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9-.]/g, '_');
}

// NEW: Server Action for Avatar Upload
export async function uploadAvatar(prevState: any, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/sign-in")
  }

  const file = formData.get("avatarFile") as File
  if (!file || file.size === 0) {
    return { error: "No image file selected." }
  }

  const fileExt = file.name.split('.').pop()
  if (!fileExt || !['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExt.toLowerCase())) {
    return { error: "Invalid file type. Please upload an image." }
  }
  
  const filePath = `${user.id}/${sanitizeFileName(crypto.randomUUID())}.${fileExt}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      return { error: `Avatar upload failed: ${uploadError.message}` }
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
    
    return { success: true, avatarUrl: data.publicUrl }
  } catch (error) {
    console.error("Unexpected upload error:", error)
    return { error: "An unexpected error occurred during upload." }
  }
}

// MODIFIED: Server Action for Profile Update
export async function updateProfile(prevState: any, formData: FormData) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    // Explicitly convert empty strings to null for Zod validation
    const rawData = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    )

    const result = profileSchema.safeParse(rawData)
    if (!result.success) {
      console.error("Zod validation error:", result.error.errors)
      return {
        error: result.error.errors[0].message,
      }
    }

    const validatedData = result.data

    // Update or create profile using Supabase upsert
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: validatedData.id || crypto.randomUUID(),
        user_id: user.id,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        avatar_url: validatedData.avatarUrl,
        timezone: validatedData.timezone || "UTC",
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

    if (upsertError) {
      console.error("Profile upsert error:", upsertError)
      return { error: "Failed to update profile. Please try again." }
    }

    revalidatePath("/settings")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Profile update error:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
    }
  }
}
