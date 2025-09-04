export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ToolsClient from "./tools-client"

export default async function ToolsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  try {
    // Fetch tools with related data using Supabase client
    const [toolsResult, toolAccountsResult, subscriptionsResult] = await Promise.all([
      // Get all tools for the user
      supabase
        .from('tools')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      // Get all tool accounts for the user
      supabase
        .from('tool_accounts')
        .select('id, tool_id')
        .eq('user_id', user.id),

      // Get all subscriptions for the user's tool accounts
      supabase
        .from('subscriptions')
        .select('cost, tool_account_id')
        .eq('user_id', user.id)
    ])

    console.log("🔧 Tools result:", toolsResult)
    console.log("🔗 Tool accounts result:", toolAccountsResult)
    console.log("💰 Subscriptions result:", subscriptionsResult)

    // Process the data client-side to match the expected format
    const toolsData = (toolsResult.data || []).map(tool => {
      // Count tool accounts for this tool
      const accountCount = (toolAccountsResult.data || []).filter(
        account => account.tool_id === tool.id
      ).length

      // Calculate total cost for this tool
      const toolAccountIds = (toolAccountsResult.data || [])
        .filter(account => account.tool_id === tool.id)
        .map(account => account.id)

      const subscriptionCost = (subscriptionsResult.data || [])
        .filter(sub => toolAccountIds.includes(sub.tool_account_id))
        .reduce((sum, sub) => sum + (parseFloat(sub.cost) || 0), 0)

      // Use base_cost when no subscriptions exist
      const baseCost = parseFloat(tool.base_cost) || 0
      const totalCost = subscriptionCost > 0 ? subscriptionCost : baseCost

      return {
        id: tool.id,
        name: tool.name,
        description: tool.description,
        category: tool.category,
        logoUrl: tool.logo_url,
        websiteUrl: tool.website_url,
        baseCost: tool.base_cost,
        createdAt: new Date(tool.created_at),
        updatedAt: new Date(tool.updated_at),
        accountCount,
        totalCost
      }
    })

    console.log("📊 Processed tools data:", toolsData)

    return <ToolsClient user={user} toolsData={toolsData} />

  } catch (error) {
    console.error("🚨 Tools page error:", error)
    
    return <ToolsClient user={user} toolsData={[]} />
  }
}
