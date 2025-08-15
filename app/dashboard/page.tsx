export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import MonthlySpendCard from "@/components/dashboard/monthly-spend-card"
import FiltersBar from "@/components/dashboard/filters-bar"
import ToolsOverviewTable from "@/components/dashboard/tools-overview-table"
import SavingsOpportunities from "@/components/dashboard/savings-opportunities"

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  console.log("🔑 User authenticated:", user.id)

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

    // Fetch dashboard data using Supabase client
    const [subscriptionsResult, toolsResult, projectToolsResult, projectsResult, emailsResult] = await Promise.all([
      // Get subscription data
      supabase
        .from('subscriptions')
        .select('cost, billing_cycle, status, renewal_date, trial_end_date, tool_account_id')
        .eq('user_id', user.id),

      // Get tools with tool accounts
      supabase
        .from('tools')
        .select(`
          id,
          name,
          category,
          base_cost,
          renewal_date,
          trial_end_date,
          billing_cycle,
          tool_accounts(
            id,
            email_id
          )
        `)
        .eq('user_id', user.id),

      // Get project-tool mappings
      supabase
        .from('project_tools')
        .select('project_id, tool_account_id')
        .eq('user_id', user.id),

      // Get projects
      supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', user.id),

      // Get emails
      supabase
        .from('emails')
        .select('id, email')
        .eq('user_id', user.id)
    ])

    console.log("📊 Subscriptions result:", subscriptionsResult)
    console.log("🔧 Tools result:", toolsResult)
    console.log("🔗 Project tools result:", projectToolsResult)
    console.log("📁 Projects result:", projectsResult)
    console.log("📧 Emails result:", emailsResult)

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

    // Process tools overview data - one entry per tool-email combination
    const toolsOverviewData = []
    
    if (toolsResult.data && emailsResult.data) {
      for (const tool of toolsResult.data) {
        // Get tool accounts for this tool
        const toolAccounts = tool.tool_accounts || []
        
        // Create an entry for each tool account (each email association)
        for (const toolAccount of toolAccounts) {
          // Find the email for this tool account
          const email = emailsResult.data.find(e => e.id === toolAccount.email_id)
          if (!email) continue

          // Get subscriptions for this specific tool account
          const toolSubscriptions = (subscriptionsResult.data || []).filter(sub =>
            sub.tool_account_id === toolAccount.id
          )

          // Calculate cost (subscription cost or base cost)
          let monthlyCost = 0
          let renewalDate = null
          let trialEndDate = null
          let status = null
          let billingCycle = null

          if (toolSubscriptions.length > 0) {
            // Use subscription data
            const activeSub = toolSubscriptions.find(sub => sub.status === 'active') || toolSubscriptions[0]
            const cost = parseFloat(activeSub.cost) || 0
            monthlyCost = cost // Keep original cost, display logic will handle conversion
            renewalDate = activeSub.renewal_date
            trialEndDate = activeSub.trial_end_date
            status = activeSub.status
            billingCycle = activeSub.billing_cycle
          } else {
            // Use base cost from tool
            monthlyCost = parseFloat(tool.base_cost) || 0
            renewalDate = tool.renewal_date
            trialEndDate = tool.trial_end_date
            billingCycle = tool.billing_cycle || 'monthly'
            status = monthlyCost > 0 ? 'active' : null
          }

          // Add to total spend (convert to monthly for total calculation)
          if (monthlyCost > 0 && status === 'active') {
            const monthlyEquivalent = billingCycle === 'yearly' ? monthlyCost / 12 : monthlyCost
            totalSpend += monthlyEquivalent
          }

          // Get project mappings for this specific tool account
          const projectMappings = (projectToolsResult.data || []).filter(pt =>
            pt.tool_account_id === toolAccount.id
          )

          // Get unique project IDs and names
          const projectIds = [...new Set(projectMappings.map(pm => pm.project_id))]
          const projects = (projectsResult.data || [])
            .filter(project => projectIds.includes(project.id))
            .map(project => ({
              id: project.id,
              name: project.name
            }))

          toolsOverviewData.push({
            toolId: tool.id,
            toolName: tool.name,
            toolCategory: tool.category,
            emailAddress: email.email,
            monthlyCost,
            renewalDate: renewalDate ? new Date(renewalDate) : null,
            trialEndDate: trialEndDate ? new Date(trialEndDate) : null,
            projectCount: projects.length,
            projects,
            status,
            billingCycle
          })
        }
      }
    }

    console.log("📋 Processed tools overview data:", toolsOverviewData)

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

          {/* Tools Overview */}
          <ToolsOverviewTable data={toolsOverviewData} />

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
