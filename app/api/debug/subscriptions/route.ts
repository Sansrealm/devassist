// File: app/api/debug/subscriptions/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  console.log("🔍 Debug: Checking all subscriptions...")
  
  try {
    const supabase = createClient()
    
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("👤 User ID:", user.id)

    // Get ALL subscriptions for this user (no filters)
    const { data: allSubscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        tool_account_id,
        name,
        cost,
        currency,
        billing_cycle,
        status,
        renewal_date,
        trial_end_date,
        tool_accounts!inner (
          tools!inner (
            name
          )
        )
      `)
      .eq('user_id', user.id)

    if (subError) {
      console.error("❌ Error fetching subscriptions:", subError)
      return NextResponse.json({ 
        error: "Database error", 
        details: subError.message 
      }, { status: 500 })
    }

    console.log("📊 Raw subscriptions found:", allSubscriptions?.length || 0)

    // Get ALL tools for this user (to see if tools exist without subscriptions)
    const { data: allTools, error: toolsError } = await supabase
      .from('tools')
      .select(`
        id,
        name,
        user_id,
        tool_accounts (
          id,
          subscriptions (
            id,
            status,
            renewal_date,
            billing_cycle
          )
        )
      `)
      .eq('user_id', user.id)

    if (toolsError) {
      console.error("❌ Error fetching tools:", toolsError)
    }

    // Analyze the data
    const analysis = {
      totalSubscriptions: allSubscriptions?.length || 0,
      totalTools: allTools?.length || 0,
      subscriptionsByStatus: {},
      toolsWithoutSubscriptions: [],
      subscriptionsDetail: []
    }

    // Group subscriptions by status
    if (allSubscriptions) {
      for (const sub of allSubscriptions) {
        const status = sub.status || 'null'
        if (!analysis.subscriptionsByStatus[status]) {
          analysis.subscriptionsByStatus[status] = 0
        }
        analysis.subscriptionsByStatus[status]++

        // Add detailed info
        analysis.subscriptionsDetail.push({
          toolName: sub.tool_accounts?.tools?.name || 'Unknown',
          status: sub.status,
          renewalDate: sub.renewal_date,
          billingCycle: sub.billing_cycle,
          cost: sub.cost,
          hasRenewalDate: !!sub.renewal_date,
          hasValidBillingCycle: sub.billing_cycle && sub.billing_cycle !== 'one-time'
        })
      }
    }

    // Find tools without subscriptions
    if (allTools) {
      for (const tool of allTools) {
        const hasSubscriptions = tool.tool_accounts?.some(ta => 
          ta.subscriptions && ta.subscriptions.length > 0
        )
        if (!hasSubscriptions) {
          analysis.toolsWithoutSubscriptions.push(tool.name)
        }
      }
    }

    // Check notification criteria specifically for Microsoft Teams
    const msTeamsSubscriptions = allSubscriptions?.filter(sub => 
      sub.tool_accounts?.tools?.name?.toLowerCase().includes('teams') ||
      sub.tool_accounts?.tools?.name?.toLowerCase().includes('microsoft')
    ) || []

    const notificationCriteria = msTeamsSubscriptions.map(sub => ({
      toolName: sub.tool_accounts?.tools?.name,
      status: sub.status,
      meetsStatusCriteria: sub.status === 'active',
      renewalDate: sub.renewal_date,
      meetsRenewalDateCriteria: !!sub.renewal_date,
      billingCycle: sub.billing_cycle,
      meetsBillingCycleCriteria: sub.billing_cycle && sub.billing_cycle !== 'one-time',
      meetsAllCriteria: sub.status === 'active' && !!sub.renewal_date && sub.billing_cycle && sub.billing_cycle !== 'one-time'
    }))

    return NextResponse.json({
      success: true,
      userId: user.id,
      analysis,
      msTeamsSubscriptions: notificationCriteria,
      allSubscriptions: allSubscriptions || [],
      debug: {
        message: "Check the analysis and msTeamsSubscriptions to see why notifications aren't triggering",
        notificationRequirements: [
          "status = 'active'",
          "renewal_date is not null", 
          "billing_cycle != 'one-time'"
        ]
      }
    })
    
  } catch (error) {
    console.error("🔍 Debug error:", error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
