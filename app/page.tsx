import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect("/dashboard")
    } else {
      redirect("/sign-in")
    }
  } catch (error) {
    console.error("Auth check failed:", error)
    redirect("/sign-in")
  }
}
