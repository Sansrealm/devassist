export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
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

  try {
    // Fetch projects with related data using Supabase client
    const [projectsResult, projectToolsResult] = await Promise.all([
      // Get all projects for the user
      supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      // Get all project tools for the user
      supabase
        .from('project_tools')
        .select('project_id, tool_account_id')
        .eq('user_id', user.id)
    ])

    console.log("📁 Projects result:", projectsResult)
    console.log("🔗 Project tools result:", projectToolsResult)

    // Process the data client-side to calculate tool counts
    const projectsData = (projectsResult.data || []).map(project => {
      // Count distinct tool accounts for this project
      const toolCount = new Set(
        (projectToolsResult.data || [])
          .filter(pt => pt.project_id === project.id)
          .map(pt => pt.tool_account_id)
      ).size

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        notes: project.notes,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        toolCount
      }
    })

    console.log("📊 Processed projects data:", projectsData)

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
  } catch (error) {
    console.error("🚨 Projects page error:", error)
    
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Projects</h1>
            <p className="text-muted-foreground mb-8">
              There was an issue loading your projects. Let's get you started!
            </p>
            
            <Button
              asChild
              className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]"
            >
              <Link href="/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
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
