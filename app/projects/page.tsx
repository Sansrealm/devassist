import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { projects, projectTools } from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import ProjectsHeader from "@/components/projects/projects-header"
import ProjectsList from "@/components/projects/projects-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function ProjectsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Fetch projects with related data
  const projectsData = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      notes: projects.notes,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      toolCount: sql<number>`COUNT(DISTINCT ${projectTools.toolAccountId})`.as("toolCount"),
    })
    .from(projects)
    .leftJoin(projectTools, eq(projects.id, projectTools.projectId))
    .where(eq(projects.userId, user.id))
    .groupBy(projects.id)
    .orderBy(desc(projects.createdAt))

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <ProjectsHeader />

        {projectsData.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#002F71]/10 to-[#0A4BA0]/10">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
            <p className="mt-2 text-muted-foreground">Get started by creating your first project.</p>
            <Button
              asChild
              className="mt-4 bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]"
            >
              <Link href="/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Link>
            </Button>
          </div>
        ) : (
          <ProjectsList projects={projectsData} />
        )}
      </main>
    </div>
  )
}
