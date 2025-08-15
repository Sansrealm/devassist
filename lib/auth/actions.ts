"use server"

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export async function signInWithOTP(prevState: any, formData: FormData) {
  try {
    if (!isSupabaseConfigured) {
      return {
        error: "Authentication service is not configured. Please contact support.",
      }
    }

    const email = formData.get("email") as string

    // Validate the email
    const result = signInSchema.safeParse({ email })
    if (!result.success) {
      return {
        error: result.error.errors[0].message,
      }
    }

    const supabase = createClient()

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const redirectUrl = `${baseUrl}/auth/callback`

    const { error } = await supabase.auth.signInWithOtp({
      email: result.data.email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      console.error("Supabase auth error:", error)
      return {
        error: error.message,
      }
    }

    return {
      success: "Check your email for a magic link to sign in.",
    }
  } catch (error) {
    console.error("Sign in error:", error)

    if (error instanceof Error && error.message.includes("environment variables")) {
      return {
        error: "Authentication service is not properly configured. Please check your environment variables.",
      }
    }

    return {
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/sign-in")
}

export async function createUserProfile(userId: string, email: string) {
  const supabase = createClient()

  try {
    // Insert profile with correct schema
    const { error: profileError } = await supabase.from("profiles").insert({
      id: crypto.randomUUID(), // ✅ Generate new UUID for profile ID
      user_id: userId,         // ✅ This references auth.users.id
      first_name: null,
      last_name: null,
      avatar_url: null,
      timezone: "UTC",
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
    } else {
      console.log("✅ Profile created successfully")
    }

    // Insert primary email with correct schema
    const { error: emailError } = await supabase.from("emails").insert({
      id: crypto.randomUUID(), // ✅ Generate new UUID for email ID
      user_id: userId,         // ✅ This references auth.users.id
      email: email,
      is_primary: true,
      is_verified: true,
    })

    if (emailError) {
      console.error("Error creating email record:", emailError)
    } else {
      console.log("✅ Email record created successfully")
    }
  } catch (error) {
    console.error("❌ Error in createUserProfile:", error)
  }
}
