export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import MonthlySpendCard from "@/components/dashboard/monthly-spend-card"
import FiltersBar from "@/components/dashboard/filters-bar"
import EmailToolTable from "@/components/dashboard/email-tool-table"
import SavingsOpportunities from "@/components/dashboard/savings-opportunities"

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  console.log("🔍 User authenticated:", user.id)

  try {
    // Ensure user has profile - create if missing
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!existingProfile) {
      console.log("🔨 Creating missing profile...")
      await supabase.from('profiles').insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        first_name: null,
        last_name: null,
        avatar_url: null,
        timezone: 'UTC'
      })
    }

    // Fetch dashboard data using Supabase client (matches your schema)
    const [subscriptionsResult, emailToolResult] = await Promise.all([
      // Get subscription data
      supabase
        .from('subscriptions')
        .select('cost, billing_cycle, status')
        .eq('user_id', user.id),

      // Get email-tool mapping data with joins
      supabase
        .from('emails')
        .select(`
          email,
          tool_accounts(
            id,
            tools(
              id,
              name,
              category
            ),
            subscriptions(
              id,
              cost,
              status,
              billing_cycle,
              renewal_date
            )
          )
        `)
        .eq('user_id', user.id)
    ])

    console.log("📊 Subscriptions result:", subscriptionsResult)
    console.log("📧 Email tool result:", emailToolResult)

    // Process subscription data for summary cards
    let totalSpend = 0
    let activeSubscriptions = 0
    let trialSubscriptions = 0

    if (subscriptionsResult.data && subscriptionsResult.data.length > 0) {
      subscriptionsResult.data.forEach(sub => {
        if (sub.status === 'active') {
          activeSubscriptions++
          const cost = parseFloat(sub.cost) || 0
          if (sub.billing_cycle === 'monthly') {
            totalSpend += cost
          } else if (sub.billing_cycle === 'yearly') {
            totalSpend += cost / 12
          }
        } else if (sub.status === 'trial') {
          trialSubscriptions++
        }
      })
    }

    // Process email-tool data for table
    const emailToolData = []
    
    if (emailToolResult.data) {
      for (const email of emailToolResult.data) {
        if (email.tool_accounts && email.tool_accounts.length > 0) {
          for (const toolAccount of email.tool_accounts) {
            if (toolAccount.subscriptions && toolAccount.subscriptions.length > 0) {
              for (const subscription of toolAccount.subscriptions) {
                emailToolData.push({
                  emailAddress: email.email,
                  toolName: toolAccount.tools?.name || null,
                  toolCategory: toolAccount.tools?.category || null,
                  subscriptionCost: subscription.cost?.toString() || null,
                  subscriptionStatus: subscription.status || null,
                  billingCycle: subscription.billing_cycle || null,
                  renewalDate: subscription.renewal_date ? new Date(subscription.renewal_date) : null,
                  toolId: toolAccount.tools?.id || null,
                  subscriptionId: subscription.id || null,
                })
              }
            } else {
              // Tool account without subscription
              emailToolData.push({
                emailAddress: email.email,
                toolName: toolAccount.tools?.name || null,
                toolCategory: toolAccount.tools?.category || null,
                subscriptionCost: null,
                subscriptionStatus: null,
                billingCycle: null,
                renewalDate: null,
                toolId: toolAccount.tools?.id || null,
                subscriptionId: null,
              })
            }
          }
        }
      }
    }

    console.log("📋 Processed email tool data:", emailToolData)

    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Monthly Spend Overview */}
          <MonthlySpendCard
            totalSpend={totalSpend}
            activeSubscriptions={activeSubscriptions}
            trialSubscriptions={trialSubscriptions}
          />

          {/* Filters */}
          <FiltersBar />

          {/* Email-Tool Table */}
          <EmailToolTable data={emailToolData} />

          {/* Savings Opportunities */}
          <SavingsOpportunities />
        </main>
      </div>
    )
  } catch (error) {
    console.error("🚨 Dashboard error:", error)
    
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Welcome to DevStack Companion!</h1>
            <p className="text-muted-foreground mb-8">
              Your authentication is working! Ready to start tracking your development tools.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Getting Started</h3>
              <p className="text-blue-700 text-sm mb-4">
                Your database is set up and ready. You can now start adding tools and subscriptions.
              </p>
              <button className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87] text-white px-6 py-3 rounded-lg font-medium">
                Add Your First Tool
              </button>
            </div>

            {/* Debug info */}
            <details className="mt-8 text-left max-w-2xl mx-auto">
              <summary className="cursor-pointer text-sm text-muted-foreground">Debug Info</summary>
              <pre className="mt-4 p-4 bg-muted rounded text-xs overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          </div>
        </main>
      </div>
    )
  }
}
