export const dynamic = 'force-dynamic'
export const runtime = 'nodejs';
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardClient from "./dashboard-client"
import { getUserToolCount } from "@/lib/tool-limits"

// The parseLocalDate function is no longer needed.
// Supabase now returns dates with time zones, so we can pass them directly to the client.

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
      .select('id, is_beta_ready')
      .eq('user_id', user.id)
      .single()

    let isBetaReady = false
    
    if (!existingProfile) {
      console.log("🔨 Creating missing profile...")
      const { data: newProfile } = await supabase.from('profiles').insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        first_name: null,
        last_name: null,
        avatar_url: null,
        timezone: 'UTC',
        is_beta_ready: false
      }).select('is_beta_ready').single()
      
      isBetaReady = newProfile?.is_beta_ready || false
    } else {
      isBetaReady = existingProfile.is_beta_ready || false
    }

    // Get user's tool count
    const toolCount = await getUserToolCount(user.id)

    // Fetch dashboard data using Supabase client
    const [subscriptionsResult, toolsResult, projectToolsResult, projectsResult] = await Promise.all([
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
        .eq('user_id', user.id)
    ])

    console.log("📊 Subscriptions result:", subscriptionsResult)
    console.log("🔧 Tools result:", toolsResult)
    console.log("🔗 Project tools result:", projectToolsResult)
    console.log("📁 Projects result:", projectsResult)

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
  
    // Process tools overview data
    const toolsOverviewData = []
    
    if (toolsResult.data) {
      for (const tool of toolsResult.data) {
        // Get tool accounts for this tool
        const toolAccounts = tool.tool_accounts || []
        
        // Get subscriptions for this tool's accounts
        const toolSubscriptions = (subscriptionsResult.data || []).filter(sub =>
          toolAccounts.some(ta => ta.id === sub.tool_account_id)
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
          monthlyCost = activeSub.billing_cycle === 'yearly' ? cost / 12 : cost
          renewalDate = activeSub.renewal_date
          trialEndDate = activeSub.trial_end_date
          status = activeSub.status
          billingCycle = activeSub.billing_cycle
        } else {
          // Use base cost
          monthlyCost = parseFloat(tool.base_cost) || 0
          status = monthlyCost > 0 ? 'active' : null
          billingCycle = null
        }

        // Get project mappings for this tool
        const toolAccountIds = toolAccounts.map(ta => ta.id)
        const projectMappings = (projectToolsResult.data || []).filter(pt =>
          toolAccountIds.includes(pt.tool_account_id)
        )

        // Get unique project IDs and names
        const projectIds = [...new Set(projectMappings.map(pm => pm.project_id))]
        const projects = (projectsResult.data || [])
          .filter(project => projectIds.includes(project.id))
          .map(project => ({
            id: project.id,
            name: project.name
          }))

        // Only include tools that have accounts (are actually being used)
        if (toolAccounts.length > 0) {
          toolsOverviewData.push({
            toolId: tool.id,
            toolName: tool.name,
            toolCategory: tool.category,
            monthlyCost,
            renewalDate: renewalDate, // No parsing needed here
            trialEndDate: trialEndDate, // No parsing needed here
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
      <DashboardClient 
        user={{
          ...user,
          toolCount,
          isBetaReady
        }}
        toolsOverviewData={toolsOverviewData}
        totalSpend={totalSpend}
        activeSubscriptions={activeSubscriptions}
        trialSubscriptions={trialSubscriptions}
        allProjects={projectsResult.data || []}
      />
    )
  } catch (error) {
    console.error("🚨 Dashboard error:", error)
    
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
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
        </div>
      </div>
    )
  }
}
