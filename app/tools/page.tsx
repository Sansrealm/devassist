export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import ToolsHeader from "@/components/tools/tools-header"
import ToolsList from "@/components/tools/tools-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

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

      const totalCost = (subscriptionsResult.data || [])
        .filter(sub => toolAccountIds.includes(sub.tool_account_id))
        .reduce((sum, sub) => sum + (parseFloat(sub.cost) || 0), 0)

      return {
        id: tool.id,
        name: tool.name,
        description: tool.description,
        category: tool.category,
        logoUrl: tool.logo_url,
        websiteUrl: tool.website_url,
        baseCost: tool.base_cost,
        createdAt: tool.created_at,
        updatedAt: tool.updated_at,
        accountCount,
        totalCost
      }
    })

    console.log("📊 Processed tools data:", toolsData)

    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />

        <main className="container mx-auto px-4 py-8 space-y-8">
          <ToolsHeader />

          {toolsData.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#002F71]/10 to-[#0A4BA0]/10">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No tools yet</h3>
              <p className="mt-2 text-muted-foreground">Get started by adding your first development tool.</p>
              <Button
                asChild
                className="mt-4 bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]"
              >
                <Link href="/tools/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Tool
                </Link>
              </Button>
            </div>
          ) : (
            <ToolsList tools={toolsData} />
          )}
        </main>
      </div>
    )
  } catch (error) {
    console.error("🚨 Tools page error:", error)
    
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Tools Page</h1>
            <p className="text-muted-foreground mb-8">
              There was an issue loading your tools. Let's get you started!
            </p>
            
            <Button
              asChild
              className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]"
            >
              <Link href="/tools/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Tool
              </Link>
            </Button>

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
