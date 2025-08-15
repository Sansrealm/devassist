"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

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
    const { data: existingMapping, error: checkError } = await supabase
      .from('project_tools')
      .select('id')
      .eq('project_id', projectId)
      .eq('tool_account_id', toolAccountId)
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Mapping check error:", checkError)
      return { error: "Failed to check existing mapping. Please try again." }
    }

    if (existingMapping) {
      return { error: "Mapping already exists" }
    }

    // Create new mapping
    const { data: newMapping, error: insertError } = await supabase
      .from('project_tools')
      .insert({
        user_id: user.id,
        project_id: projectId,
        tool_account_id: toolAccountId,
        is_active: true,
        usage_count: 0,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Mapping creation error:", insertError)
      return { error: "Failed to create mapping. Please try again." }
    }

    // Log activity
    const { error: activityError } = await supabase
      .from('activity')
      .insert({
        user_id: user.id,
        type: "project_updated",
        description: "Created project-tool mapping",
        metadata: JSON.stringify({ 
          project_id: projectId, 
          tool_account_id: toolAccountId, 
          mapping_id: newMapping.id 
        }),
      })

    if (activityError) {
      console.error("Activity log error:", activityError)
      // Don't fail the operation if activity logging fails
    }

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

    // Get mapping details for activity log (ensure user owns it)
    const { data: mapping, error: fetchError } = await supabase
      .from('project_tools')
      .select('project_id, tool_account_id')
      .eq('id', mappingId)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error("Mapping fetch error:", fetchError)
      return { error: "Mapping not found" }
    }

    if (!mapping) {
      return { error: "Mapping not found" }
    }

    // Delete mapping
    const { error: deleteError } = await supabase
      .from('project_tools')
      .delete()
      .eq('id', mappingId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error("Mapping deletion error:", deleteError)
      return { error: "Failed to delete mapping. Please try again." }
    }

    // Log activity
    const { error: activityError } = await supabase
      .from('activity')
      .insert({
        user_id: user.id,
        type: "project_updated",
        description: "Deleted project-tool mapping",
        metadata: JSON.stringify({ 
          project_id: mapping.project_id, 
          tool_account_id: mapping.tool_account_id, 
          mapping_id: mappingId 
        }),
      })

    if (activityError) {
      console.error("Activity log error:", activityError)
      // Don't fail the operation if activity logging fails
    }

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

    // Get existing mappings for this project and user
    const { data: existingMappings, error: fetchError } = await supabase
      .from('project_tools')
      .select('tool_account_id')
      .eq('project_id', projectId)
      .eq('user_id', user.id)

    if (fetchError) {
      console.error("Existing mappings fetch error:", fetchError)
      return { error: "Failed to check existing mappings. Please try again." }
    }

    const existingToolAccountIds = existingMappings?.map((m) => m.tool_account_id) || []
    const newToolAccountIds = toolAccountIds.filter((id) => !existingToolAccountIds.includes(id))

    if (newToolAccountIds.length === 0) {
      return { error: "All tools are already mapped to this project" }
    }

    // Create new mappings
    const mappingsData = newToolAccountIds.map((toolAccountId) => ({
      user_id: user.id,
      project_id: projectId,
      tool_account_id: toolAccountId,
      is_active: true,
      usage_count: 0,
    }))

    const { error: insertError } = await supabase
      .from('project_tools')
      .insert(mappingsData)

    if (insertError) {
      console.error("Bulk mapping creation error:", insertError)
      return { error: "Failed to create mappings. Please try again." }
    }

    // Log activity
    const { error: activityError } = await supabase
      .from('activity')
      .insert({
        user_id: user.id,
        type: "project_updated",
        description: `Bulk created ${newToolAccountIds.length} project-tool mappings`,
        metadata: JSON.stringify({ 
          project_id: projectId, 
          tool_account_ids: newToolAccountIds 
        }),
      })

    if (activityError) {
      console.error("Activity log error:", activityError)
      // Don't fail the operation if activity logging fails
    }

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

    // First, get the current usage count (ensure user owns the mapping)
    const { data: currentMapping, error: fetchError } = await supabase
      .from('project_tools')
      .select('usage_count')
      .eq('id', mappingId)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error("Mapping fetch error:", fetchError)
      return { error: "Mapping not found" }
    }

    if (!currentMapping) {
      return { error: "Mapping not found" }
    }

    // Update usage count and last used timestamp
    const { error: updateError } = await supabase
      .from('project_tools')
      .update({
        usage_count: currentMapping.usage_count + 1,
        last_used: new Date().toISOString(),
      })
      .eq('id', mappingId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error("Mapping usage update error:", updateError)
      return { error: "Failed to update usage. Please try again." }
    }

    revalidatePath("/map")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Mapping usage update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
