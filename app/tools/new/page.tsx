export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import ToolForm from "@/components/tools/tool-form"
import { getUserToolCount, hasReachedToolLimit } from "@/lib/tool-limits"

export default async function NewToolPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  try {
    // NEW: Check if user has reached tool limit
    const toolCount = await getUserToolCount(user.id)
    if (hasReachedToolLimit(toolCount)) {
      // Redirect to dashboard where they can see the beta signup button
      redirect("/dashboard")
    }

    // Fetch user's emails for the form using Supabase client
    const { data: userEmailsData, error } = await supabase
      .from('emails')
      .select('id, email, is_primary')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false }) // Primary email first

    if (error) {
      console.error("Error fetching user emails:", error)
    }

    // Transform to match expected format (camelCase)
    const userEmails = (userEmailsData || []).map(email => ({
      id: email.id,
      email: email.email,
      isPrimary: email.is_primary
    }))

    console.log("📧 User emails for form:", userEmails)

    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Add New Tool</h1>
              <p className="text-muted-foreground">Add a development tool to track its usage and costs</p>
            </div>

            <ToolForm userEmails={userEmails} />
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("🚨 New tool page error:", error)
    
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Add New Tool</h1>
              <p className="text-muted-foreground">Add a development tool to track its usage and costs</p>
            </div>

            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Unable to Load Form</h3>
              <p className="text-muted-foreground mb-4">
                There was an issue loading your email addresses for the form.
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }
}
