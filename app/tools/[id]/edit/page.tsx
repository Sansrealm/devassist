// File: app/tools/[id]/edit/page.tsx
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

/**
 * Converts a timestamp to YYYY-MM-DD format for HTML date inputs
 */
function formatDateForInput(timestamp: string | null): string | null {
  if (!timestamp) return null
  
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return null
    
    // Format as YYYY-MM-DD for HTML date input
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return null
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

    // Fetch tool accounts and subscription data
    const { data: toolAccounts, error: toolAccountsError } = await supabase
      .from('tool_accounts')
      .select(`
        id,
        email_id,
        subscriptions (
          id,
          cost,
          billing_cycle,
          renewal_date,
          trial_end_date,
          status
        )
      `)
      .eq('tool_id', params.id)
      .eq('user_id', user.id)

    if (toolAccountsError) {
      console.error("Tool accounts fetch error:", toolAccountsError)
    }

    console.log("🔍 Tool accounts with subscriptions:", toolAccounts)

    // Transform emails data to match expected format
    const userEmails = (emails || []).map(email => {
      // Check if this email is already associated with the tool
      const isAssociated = toolAccounts?.some(ta => ta.email_id === email.id) || false
      
      return {
        id: email.id,
        email: email.email,
        isPrimary: email.is_primary || false,
        isAssociated // Add this for pre-checking in the form
      }
    })

    // Extract subscription data (use the first subscription if multiple exist)
    const firstSubscription = toolAccounts?.[0]?.subscriptions?.[0]
    const subscriptionData = firstSubscription ? {
      // FIX: Format dates properly for HTML date inputs (YYYY-MM-DD format)
      renewalDate: formatDateForInput(firstSubscription.renewal_date),
      trialEndDate: formatDateForInput(firstSubscription.trial_end_date),
      billingCycle: firstSubscription.billing_cycle || null,
      cost: firstSubscription.cost?.toString() || null,
      status: firstSubscription.status || null
    } : {
      renewalDate: null,
      trialEndDate: null,
      billingCycle: null,
      cost: null,
      status: null
    }

    console.log("📅 Extracted subscription data:", subscriptionData)

    const initialData = {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      logoUrl: tool.logo_url,
      websiteUrl: tool.website_url,
      baseCost: tool.base_cost,
      renewalDate: subscriptionData.renewalDate,
      trialEndDate: subscriptionData.trialEndDate,
      billingCycle: subscriptionData.billingCycle,
      subscriptionStatus: subscriptionData.status, 
    }

    console.log("📝 Final initial data for form (with properly formatted dates):", initialData)

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
