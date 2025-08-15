import { createClient } from "@/lib/supabase/server"
import { createUserProfile } from "@/lib/auth/actions"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  console.log("🔍 Auth callback called with code:", code ? "present" : "missing")

  if (code) {
    try {
      const supabase = createClient()
      console.log("🔄 Attempting code exchange...")
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("❌ Code exchange failed:", error.message)
        return NextResponse.redirect(`${origin}/auth/auth-code-error`)
      }

      if (data.user) {
        console.log("✅ User authenticated:", data.user.id)

        // Check if this is a new user and create profile if needed
        try {
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", data.user.id)
            .single()

          if (!existingProfile) {
            console.log("🔨 Creating new user profile...")
            await createUserProfile(data.user.id, data.user.email!)
            console.log("✅ Profile created successfully")
          } else {
            console.log("✅ Existing profile found")
          }
        } catch (profileError) {
          console.error("❌ Profile creation error:", profileError)
          // Don't fail auth if profile creation fails
        }

        console.log("🔄 Redirecting to dashboard...")
        const forwardedHost = request.headers.get("x-forwarded-host")
        const isLocalEnv = process.env.NODE_ENV === "development"
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      } else {
        console.error("❌ No user data returned after code exchange")
      }
    } catch (error) {
      console.error("❌ Unexpected error in auth callback:", error)
    }
  }

  console.log("❌ Redirecting to error page")
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
