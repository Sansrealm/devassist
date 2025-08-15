"use server"

import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { projects, activity } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
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
      // Update existing project
      const [updatedProject] = await db
        .update(projects)
        .set({
          name: validatedData.name,
          description: validatedData.description || null,
          status: validatedData.status,
          notes: validatedData.notes || null,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId))
        .returning()

      project = updatedProject

      // Log activity
      await db.insert(activity).values({
        userId: user.id,
        type: "project_updated",
        description: `Updated project: ${validatedData.name}`,
        metadata: JSON.stringify({ projectId: project.id }),
      })
    } else {
      // Create new project
      const [newProject] = await db
        .insert(projects)
        .values({
          userId: user.id,
          name: validatedData.name,
          description: validatedData.description || null,
          status: validatedData.status,
          notes: validatedData.notes || null,
        })
        .returning()

      project = newProject

      // Log activity
      await db.insert(activity).values({
        userId: user.id,
        type: "project_created",
        description: `Created new project: ${validatedData.name}`,
        metadata: JSON.stringify({ projectId: project.id }),
      })
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
    const [project] = await db.select({ name: projects.name }).from(projects).where(eq(projects.id, projectId))

    if (!project) {
      return { error: "Project not found" }
    }

    // Delete project (cascades to project_tools)
    await db.delete(projects).where(eq(projects.id, projectId))

    // Log activity
    await db.insert(activity).values({
      userId: user.id,
      type: "project_updated",
      description: `Deleted project: ${project.name}`,
      metadata: JSON.stringify({ projectId }),
    })

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

    const [updatedProject] = await db
      .update(projects)
      .set({
        status: validStatus,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning()

    // Log activity
    await db.insert(activity).values({
      userId: user.id,
      type: "project_updated",
      description: `Changed project status to ${validStatus}: ${updatedProject.name}`,
      metadata: JSON.stringify({ projectId, oldStatus: status, newStatus: validStatus }),
    })

    revalidatePath("/projects")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Project status update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
