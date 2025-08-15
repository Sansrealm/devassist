"use server"

import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { projectTools, activity } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { sql } from "drizzle-orm"

export async function createMapping(projectId: string, toolAccountId: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    // Check if mapping already exists
    const existingMapping = await db
      .select()
      .from(projectTools)
      .where(and(eq(projectTools.projectId, projectId), eq(projectTools.toolAccountId, toolAccountId)))
      .limit(1)

    if (existingMapping.length > 0) {
      return { error: "Mapping already exists" }
    }

    // Create new mapping
    const [newMapping] = await db
      .insert(projectTools)
      .values({
        userId: user.id,
        projectId,
        toolAccountId,
        isActive: true,
        usageCount: 0,
      })
      .returning()

    // Log activity
    await db.insert(activity).values({
      userId: user.id,
      type: "project_updated",
      description: "Created project-tool mapping",
      metadata: JSON.stringify({ projectId, toolAccountId, mappingId: newMapping.id }),
    })

    revalidatePath("/map")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Mapping creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function deleteMapping(mappingId: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    // Get mapping details for activity log
    const [mapping] = await db
      .select({
        projectId: projectTools.projectId,
        toolAccountId: projectTools.toolAccountId,
      })
      .from(projectTools)
      .where(eq(projectTools.id, mappingId))

    if (!mapping) {
      return { error: "Mapping not found" }
    }

    // Delete mapping
    await db.delete(projectTools).where(eq(projectTools.id, mappingId))

    // Log activity
    await db.insert(activity).values({
      userId: user.id,
      type: "project_updated",
      description: "Deleted project-tool mapping",
      metadata: JSON.stringify({ projectId: mapping.projectId, toolAccountId: mapping.toolAccountId, mappingId }),
    })

    revalidatePath("/map")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Mapping deletion error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function bulkCreateMappings(projectId: string, toolAccountIds: string[]) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    // Filter out existing mappings
    const existingMappings = await db
      .select({ toolAccountId: projectTools.toolAccountId })
      .from(projectTools)
      .where(eq(projectTools.projectId, projectId))

    const existingToolAccountIds = existingMappings.map((m) => m.toolAccountId)
    const newToolAccountIds = toolAccountIds.filter((id) => !existingToolAccountIds.includes(id))

    if (newToolAccountIds.length === 0) {
      return { error: "All tools are already mapped to this project" }
    }

    // Create new mappings
    const mappingsData = newToolAccountIds.map((toolAccountId) => ({
      userId: user.id,
      projectId,
      toolAccountId,
      isActive: true,
      usageCount: 0,
    }))

    await db.insert(projectTools).values(mappingsData)

    // Log activity
    await db.insert(activity).values({
      userId: user.id,
      type: "project_updated",
      description: `Bulk created ${newToolAccountIds.length} project-tool mappings`,
      metadata: JSON.stringify({ projectId, toolAccountIds: newToolAccountIds }),
    })

    revalidatePath("/map")
    revalidatePath("/dashboard")

    return { success: true, count: newToolAccountIds.length }
  } catch (error) {
    console.error("Bulk mapping creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function updateMappingUsage(mappingId: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    // Update usage count and last used timestamp
    await db
      .update(projectTools)
      .set({
        usageCount: sql`${projectTools.usageCount} + 1`,
        lastUsed: new Date(),
      })
      .where(eq(projectTools.id, mappingId))

    revalidatePath("/map")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Mapping usage update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
