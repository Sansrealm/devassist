export const dynamic = 'force-dynamic'
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignInForm from "@/components/auth/sign-in-form"

export default async function SignInPage() {
  try {
    // Check if user is already logged in
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is logged in, redirect to dashboard
    if (session) {
      redirect("/dashboard")
    }
  } catch (error) {
    // If Supabase isn't configured, continue to show sign-in form
    console.warn("Supabase not configured:", error)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <SignInForm />
    </div>
  )
}
