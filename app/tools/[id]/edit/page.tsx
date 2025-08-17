export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import ToolForm from "@/components/tools/tool-form"
import DashboardHeader from "@/components/dashboard/dashboard-header"

interface EditToolPageProps {
  params: {
    id: string
  }
}

export default async function EditToolPage({ params }: EditToolPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  try {
    // Fetch the tool data
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id) // Security: ensure user owns the tool
      .single()

    if (toolError || !tool) {
      console.error("Tool fetch error:", toolError)
      notFound()
    }

    // Fetch user's emails
    const { data: emails, error: emailsError } = await supabase
      .from('emails')
      .select('id, email, is_primary')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })

    if (emailsError) {
      console.error("Emails fetch error:", emailsError)
    }

    // Transform emails data to match expected format
    const userEmails = (emails || []).map(email => ({
      id: email.id,
      email: email.email,
      isPrimary: email.is_primary || false
    }))

    // Transform tool data to match expected format
    const initialData = {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      logoUrl: tool.logo_url,
      websiteUrl: tool.website_url,
      baseCost: tool.base_cost,
    }

    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />

        <main className="container mx-auto px-4 py-8">
          <ToolForm
            userEmails={userEmails}
            initialData={initialData}
            isEditing={true}
          />
        </main>
      </div>
    )
  } catch (error) {
    console.error("🚨 Edit tool page error:", error)
    notFound()
  }
}
