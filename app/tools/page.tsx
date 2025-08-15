import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { tools, toolAccounts, subscriptions } from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"
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

  // Fetch tools with related data
  const toolsData = await db
    .select({
      id: tools.id,
      name: tools.name,
      description: tools.description,
      category: tools.category,
      logoUrl: tools.logoUrl,
      websiteUrl: tools.websiteUrl,
      baseCost: tools.baseCost,
      createdAt: tools.createdAt,
      updatedAt: tools.updatedAt,
      accountCount: sql<number>`COUNT(DISTINCT ${toolAccounts.id})`.as("accountCount"),
      totalCost: sql<number>`COALESCE(SUM(${subscriptions.cost}), 0)`.as("totalCost"),
    })
    .from(tools)
    .leftJoin(toolAccounts, eq(tools.id, toolAccounts.toolId))
    .leftJoin(subscriptions, eq(toolAccounts.id, subscriptions.toolAccountId))
    .where(eq(tools.userId, user.id))
    .groupBy(tools.id)
    .orderBy(desc(tools.createdAt))

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
}
