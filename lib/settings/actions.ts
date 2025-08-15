"use server"

import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { profiles, emails, projects, tools, subscriptions, projectTools, activity } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
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

    // Update or create profile
    await db
      .insert(profiles)
      .values({
        id: user.id,
        userId: user.id,
        firstName: validatedData.firstName || null,
        lastName: validatedData.lastName || null,
        avatarUrl: validatedData.avatarUrl || null,
        timezone: validatedData.timezone || "UTC",
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          firstName: validatedData.firstName || null,
          lastName: validatedData.lastName || null,
          avatarUrl: validatedData.avatarUrl || null,
          timezone: validatedData.timezone || "UTC",
          updatedAt: new Date(),
        },
      })

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
    const existingEmail = await db.select().from(emails).where(eq(emails.email, email)).limit(1)

    if (existingEmail.length > 0) {
      return {
        error: "This email address is already registered.",
      }
    }

    // Add new email
    await db.insert(emails).values({
      userId: user.id,
      email: email,
      isPrimary: false,
      isVerified: false,
    })

    // Log activity
    await db.insert(activity).values({
      userId: user.id,
      type: "project_updated",
      description: `Added new email: ${email}`,
      metadata: JSON.stringify({ email }),
    })

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

    // Unset all primary emails
    await db.update(emails).set({ isPrimary: false }).where(eq(emails.userId, user.id))

    // Set new primary email
    await db
      .update(emails)
      .set({ isPrimary: true })
      .where(and(eq(emails.id, emailId), eq(emails.userId, user.id)))

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
    const [email] = await db
      .select({ isPrimary: emails.isPrimary, email: emails.email })
      .from(emails)
      .where(and(eq(emails.id, emailId), eq(emails.userId, user.id)))

    if (!email) {
      return { error: "Email not found" }
    }

    if (email.isPrimary) {
      return { error: "Cannot delete primary email address" }
    }

    // Delete email
    await db.delete(emails).where(and(eq(emails.id, emailId), eq(emails.userId, user.id)))

    // Log activity
    await db.insert(activity).values({
      userId: user.id,
      type: "project_updated",
      description: `Deleted email: ${email.email}`,
      metadata: JSON.stringify({ emailId, email: email.email }),
    })

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
    await db
      .update(emails)
      .set({ isVerified: true })
      .where(and(eq(emails.id, emailId), eq(emails.userId, user.id)))

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
      const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id))

      exportData.profile = profile
    }

    // Export emails
    if (selectedData.emails) {
      const userEmails = await db.select().from(emails).where(eq(emails.userId, user.id))

      exportData.emails = userEmails
    }

    // Export projects
    if (selectedData.projects) {
      const userProjects = await db.select().from(projects).where(eq(projects.userId, user.id))

      exportData.projects = userProjects
    }

    // Export tools
    if (selectedData.tools) {
      const userTools = await db.select().from(tools).where(eq(tools.userId, user.id))

      exportData.tools = userTools
    }

    // Export subscriptions
    if (selectedData.subscriptions) {
      const userSubscriptions = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id))

      exportData.subscriptions = userSubscriptions
    }

    // Export project-tool mappings
    if (selectedData.mappings) {
      const userMappings = await db.select().from(projectTools).where(eq(projectTools.userId, user.id))

      exportData.mappings = userMappings
    }

    // Export activity log
    if (selectedData.activity) {
      const userActivity = await db.select().from(activity).where(eq(activity.userId, user.id))

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
