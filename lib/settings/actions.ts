"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const profileSchema = z.object({
  firstName: z.string().max(50, "First name must be less than 50 characters").optional(),
  lastName: z.string().max(50, "Last name must be less than 50 characters").optional(),
  avatarUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  timezone: z.string().optional(),
})

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export async function updateProfile(prevState: any, formData: FormData) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    const rawData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      avatarUrl: formData.get("avatarUrl") as string,
      timezone: formData.get("timezone") as string,
    }

    const result = profileSchema.safeParse(rawData)
    if (!result.success) {
      return {
        error: result.error.errors[0].message,
      }
    }

    const validatedData = result.data

    // Update or create profile using Supabase upsert
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: crypto.randomUUID(), // Will be ignored if record exists
        user_id: user.id,
        first_name: validatedData.firstName || null,
        last_name: validatedData.lastName || null,
        avatar_url: validatedData.avatarUrl || null,
        timezone: validatedData.timezone || "UTC",
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id', // Conflict resolution on user_id
        ignoreDuplicates: false
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

export async function addEmail(email: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    const result = emailSchema.safeParse({ email })
    if (!result.success) {
      return {
        error: result.error.errors[0].message,
      }
    }

    // Check if email already exists
    const { data: existingEmail, error: selectError } = await supabase
      .from('emails')
      .select('id')
      .eq('email', email)
      .limit(1)
      .single()

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Email check error:", selectError)
      return { error: "Failed to check email. Please try again." }
    }

    if (existingEmail) {
      return {
        error: "This email address is already registered.",
      }
    }

    // Add new email
    const { error: insertError } = await supabase
      .from('emails')
      .insert({
        user_id: user.id,
        email: email,
        is_primary: false,
        is_verified: false,
      })

    if (insertError) {
      console.error("Add email error:", insertError)
      return { error: "Failed to add email. Please try again." }
    }

    // Log activity
    const { error: activityError } = await supabase
      .from('activity')
      .insert({
        user_id: user.id,
        type: 'project_updated', // Keeping original type for consistency
        description: `Added new email: ${email}`,
        metadata: JSON.stringify({ email }),
      })

    if (activityError) {
      console.error("Activity log error:", activityError)
    }

    revalidatePath("/settings")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Add email error:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function setPrimaryEmail(emailId: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    // Unset all primary emails for the user
    const { error: unsetError } = await supabase
      .from('emails')
      .update({ is_primary: false })
      .eq('user_id', user.id)

    if (unsetError) {
      console.error("Unset primary emails error:", unsetError)
      return { error: "Failed to update primary email. Please try again." }
    }

    // Set new primary email
    const { error: setPrimaryError } = await supabase
      .from('emails')
      .update({ is_primary: true })
      .eq('id', emailId)
      .eq('user_id', user.id) // Security: ensure user owns the email

    if (setPrimaryError) {
      console.error("Set primary email error:", setPrimaryError)
      return { error: "Failed to set primary email. Please try again." }
    }

    revalidatePath("/settings")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Set primary email error:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function deleteEmail(emailId: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    // Check if it's the primary email
    const { data: email, error: selectError } = await supabase
      .from('emails')
      .select('is_primary, email')
      .eq('id', emailId)
      .eq('user_id', user.id) // Security: ensure user owns the email
      .single()

    if (selectError || !email) {
      console.error("Email not found error:", selectError)
      return { error: "Email not found" }
    }

    if (email.is_primary) {
      return { error: "Cannot delete primary email address" }
    }

    // Delete email
    const { error: deleteError } = await supabase
      .from('emails')
      .delete()
      .eq('id', emailId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error("Delete email error:", deleteError)
      return { error: "Failed to delete email. Please try again." }
    }

    // Log activity
    const { error: activityError } = await supabase
      .from('activity')
      .insert({
        user_id: user.id,
        type: 'project_updated', // Keeping original type for consistency
        description: `Deleted email: ${email.email}`,
        metadata: JSON.stringify({ emailId, email: email.email }),
      })

    if (activityError) {
      console.error("Activity log error:", activityError)
    }

    revalidatePath("/settings")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Delete email error:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function resendVerification(emailId: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    // In a real implementation, you would send a verification email here
    // For now, we'll just mark it as verified for demo purposes
    const { error: updateError } = await supabase
      .from('emails')
      .update({ is_verified: true })
      .eq('id', emailId)
      .eq('user_id', user.id) // Security: ensure user owns the email

    if (updateError) {
      console.error("Resend verification error:", updateError)
      return { error: "Failed to update verification status. Please try again." }
    }

    revalidatePath("/settings")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Resend verification error:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function exportUserData(selectedData: Record<string, boolean>) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    const exportData: Record<string, any> = {
      exportedAt: new Date().toISOString(),
      userId: user.id,
    }

    // Export profile data
    if (selectedData.profile) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      exportData.profile = profile
    }

    // Export emails
    if (selectedData.emails) {
      const { data: userEmails } = await supabase
        .from('emails')
        .select('*')
        .eq('user_id', user.id)

      exportData.emails = userEmails
    }

    // Export projects
    if (selectedData.projects) {
      const { data: userProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)

      exportData.projects = userProjects
    }

    // Export tools
    if (selectedData.tools) {
      const { data: userTools } = await supabase
        .from('tools')
        .select('*')
        .eq('user_id', user.id)

      exportData.tools = userTools
    }

    // Export subscriptions
    if (selectedData.subscriptions) {
      const { data: userSubscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)

      exportData.subscriptions = userSubscriptions
    }

    // Export project-tool mappings
    if (selectedData.mappings) {
      const { data: userMappings } = await supabase
        .from('project_tools')
        .select('*')
        .eq('user_id', user.id)

      exportData.mappings = userMappings
    }

    // Export activity log
    if (selectedData.activity) {
      const { data: userActivity } = await supabase
        .from('activity')
        .select('*')
        .eq('user_id', user.id)

      exportData.activity = userActivity
    }

    return {
      success: true,
      data: exportData,
    }
  } catch (error) {
    console.error("Data export error:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
    }
  }
}
