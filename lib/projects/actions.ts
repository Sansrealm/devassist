"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  status: z.enum(["active", "paused", "completed", "archived"]).default("active"),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
})

export async function createProject(prevState: any, formData: FormData) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    // Extract and validate form data
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as string,
      notes: formData.get("notes") as string,
    }

    const result = projectSchema.safeParse(rawData)
    if (!result.success) {
      return {
        error: result.error.errors[0].message,
      }
    }

    const validatedData = result.data

    // Check if editing existing project
    const projectId = formData.get("id") as string
    let project

    if (projectId) {
      // Update existing project using Supabase
      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update({
          name: validatedData.name,
          description: validatedData.description || null,
          status: validatedData.status,
          notes: validatedData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', user.id) // Security: ensure user owns the project
        .select()
        .single()

      if (updateError) {
        console.error("Project update error:", updateError)
        return { error: "Failed to update project. Please try again." }
      }

      project = updatedProject

      // Log activity
      const { error: activityError } = await supabase
        .from('activity')
        .insert({
          user_id: user.id,
          type: 'project_updated',
          description: `Updated project: ${validatedData.name}`,
          metadata: JSON.stringify({ projectId: project.id }),
        })

      if (activityError) {
        console.error("Activity log error:", activityError)
      }
    } else {
      // Create new project using Supabase
      const { data: newProject, error: insertError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: validatedData.name,
          description: validatedData.description || null,
          status: validatedData.status,
          notes: validatedData.notes || null,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Project creation error:", insertError)
        return { error: "Failed to create project. Please try again." }
      }

      project = newProject

      // Log activity
      const { error: activityError } = await supabase
        .from('activity')
        .insert({
          user_id: user.id,
          type: 'project_created',
          description: `Created new project: ${validatedData.name}`,
          metadata: JSON.stringify({ projectId: project.id }),
        })

      if (activityError) {
        console.error("Activity log error:", activityError)
      }
    }

    revalidatePath("/projects")
    revalidatePath("/dashboard")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Project creation/update error:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function deleteProject(projectId: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    // Get project name for activity log
    const { data: project, error: selectError } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .eq('user_id', user.id) // Security: ensure user owns the project
      .single()

    if (selectError || !project) {
      console.error("Project not found error:", selectError)
      return { error: "Project not found" }
    }

    // Delete project using Supabase (cascades should handle related records)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error("Project deletion error:", deleteError)
      return { error: "Failed to delete project. Please try again." }
    }

    // Log activity
    const { error: activityError } = await supabase
      .from('activity')
      .insert({
        user_id: user.id,
        type: 'project_updated', // Note: keeping original type for consistency
        description: `Deleted project: ${project.name}`,
        metadata: JSON.stringify({ projectId }),
      })

    if (activityError) {
      console.error("Activity log error:", activityError)
    }

    revalidatePath("/projects")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Project deletion error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function updateProjectStatus(projectId: string, status: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    const validStatus = z.enum(["active", "paused", "completed", "archived"]).parse(status)

    // Get current project info for activity log
    const { data: currentProject, error: selectError } = await supabase
      .from('projects')
      .select('name, status')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (selectError || !currentProject) {
      console.error("Project not found error:", selectError)
      return { error: "Project not found" }
    }

    // Update project status using Supabase
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        status: validStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Project status update error:", updateError)
      return { error: "Failed to update project status. Please try again." }
    }

    // Log activity
    const { error: activityError } = await supabase
      .from('activity')
      .insert({
        user_id: user.id,
        type: 'project_updated',
        description: `Changed project status to ${validStatus}: ${updatedProject.name}`,
        metadata: JSON.stringify({ 
          projectId, 
          oldStatus: currentProject.status, 
          newStatus: validStatus 
        }),
      })

    if (activityError) {
      console.error("Activity log error:", activityError)
    }

    revalidatePath("/projects")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Project status update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
