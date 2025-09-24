"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signupForBeta() {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    // Update user's beta ready status
    const { error } = await supabase
      .from('profiles')
      .update({ is_beta_ready: true })
      .eq('user_id', user.id)

    if (error) {
      console.error("Beta signup error:", error)
      return { success: false, error: "Failed to sign up for beta. Please try again." }
    }

    // Revalidate the dashboard to update the UI
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error("Beta signup error:", error)
    return { success: false, error: "An unexpected error occurred. Please try again." }
  }
}
