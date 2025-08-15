import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { projects, tools, toolAccounts, projectTools, emails } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import MappingInterface from "@/components/mapping/mapping-interface"

export default async function MapPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Fetch all user's projects
  const userProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      description: projects.description,
    })
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(desc(projects.createdAt))

  // Fetch all user's tool accounts with tool and email info
  const userToolAccounts = await db
    .select({
      id: toolAccounts.id,
      toolId: tools.id,
      toolName: tools.name,
      toolCategory: tools.category,
      toolLogoUrl: tools.logoUrl,
      emailAddress: emails.email,
      accountName: toolAccounts.accountName,
    })
    .from(toolAccounts)
    .innerJoin(tools, eq(toolAccounts.toolId, tools.id))
    .innerJoin(emails, eq(toolAccounts.emailId, emails.id))
    .where(eq(toolAccounts.userId, user.id))
    .orderBy(desc(toolAccounts.createdAt))

  // Fetch existing project-tool mappings
  const existingMappings = await db
    .select({
      id: projectTools.id,
      projectId: projectTools.projectId,
      toolAccountId: projectTools.toolAccountId,
      isActive: projectTools.isActive,
      lastUsed: projectTools.lastUsed,
      usageCount: projectTools.usageCount,
    })
    .from(projectTools)
    .where(eq(projectTools.userId, user.id))

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Project-Tool Mapping</h1>
          <p className="text-muted-foreground">Connect your tools to projects and manage their relationships</p>
        </div>

        <MappingInterface projects={userProjects} toolAccounts={userToolAccounts} existingMappings={existingMappings} />
      </main>
    </div>
  )
}
