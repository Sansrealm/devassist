export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import ProjectForm from "@/components/projects/project-form"
import DashboardHeader from "@/components/dashboard/dashboard-header"

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  try {
    // Fetch the project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id) // Security: ensure user owns the project
      .single()

    if (projectError || !project) {
      console.error("Project fetch error:", projectError)
      notFound()
    }

    // Transform project data to match expected format
    const initialData = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      notes: project.notes,
    }

    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
              <p className="text-muted-foreground">Update your project information</p>
            </div>

            <ProjectForm
              initialData={initialData}
              isEditing={true}
            />
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("🚨 Edit project page error:", error)
    notFound()
  }
}
