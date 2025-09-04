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
      <div className="flex flex-col items-center space-y-8">
        <SignInForm />
        
        {/* Feature widgets */}
        <div className="w-full max-w-md">
          <div className="grid grid-cols-1 gap-3 mt-8">
            <div className="flex items-center space-x-3 bg-background/50 backdrop-blur-sm border rounded-lg px-4 py-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <span className="text-sm font-medium">Track all subscriptions</span>
            </div>

            <div className="flex items-center space-x-3 bg-background/50 backdrop-blur-sm border rounded-lg px-4 py-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <span className="text-sm font-medium">Get timely renewal reminders</span>
            </div>

            <div className="flex items-center space-x-3 bg-background/50 backdrop-blur-sm border rounded-lg px-4 py-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <span className="text-sm font-medium">Visualize spending across tools and projects</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
