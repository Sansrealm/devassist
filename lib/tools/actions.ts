"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const toolSchema = z.object({
  name: z.string().min(1, "Tool name is required").max(100, "Tool name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  category: z
    .enum(["development", "design", "productivity", "communication", "analytics", "marketing", "other"])
    .optional(),
  websiteUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  logoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  baseCost: z
    .string()
    .refine((val) => {
      if (!val) return true
      const num = Number.parseFloat(val)
      return !Number.isNaN(num) && num >= 0
    }, "Base cost must be a valid positive number")
    .optional(),
})

export async function createTool(prevState: any, formData: FormData) {
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
      category: formData.get("category") as string,
      websiteUrl: formData.get("websiteUrl") as string,
      logoUrl: formData.get("logoUrl") as string,
      baseCost: formData.get("baseCost") as string,
    }

    // Get selected email IDs
    const emailIds = formData.getAll("emailIds") as string[]

    const result = toolSchema.safeParse(rawData)
    if (!result.success) {
      return {
        error: result.error.errors[0].message,
      }
    }

    const validatedData = result.data

    // Check if editing existing tool
    const toolId = formData.get("id") as string
    let tool

    if (toolId) {
      // Update existing tool using Supabase
      const { data: updatedTool, error: updateError } = await supabase
        .from('tools')
        .update({
          name: validatedData.name,
          description: validatedData.description || null,
          category: validatedData.category || null,
          website_url: validatedData.websiteUrl || null,
          logo_url: validatedData.logoUrl || null,
          base_cost: validatedData.baseCost || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', toolId)
        .eq('user_id', user.id) // Security: ensure user owns the tool
        .select()
        .single()

      if (updateError) {
        console.error("Tool update error:", updateError)
        return { error: "Failed to update tool. Please try again." }
      }

      tool = updatedTool

      // Log activity
      const { error: activityError } = await supabase
        .from('activity')
        .insert({
          user_id: user.id,
          type: 'tool_updated',
          description: `Updated tool: ${validatedData.name}`,
          metadata: JSON.stringify({ toolId: tool.id }),
        })

      if (activityError) {
        console.error("Activity log error:", activityError)
      }
    } else {
      // Create new tool using Supabase
      const { data: newTool, error: insertError } = await supabase
        .from('tools')
        .insert({
          user_id: user.id,
          name: validatedData.name,
          description: validatedData.description || null,
          category: validatedData.category || null,
          website_url: validatedData.websiteUrl || null,
          logo_url: validatedData.logoUrl || null,
          base_cost: validatedData.baseCost || null,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Tool creation error:", insertError)
        return { error: "Failed to create tool. Please try again." }
      }

      tool = newTool

      // Log activity
      const { error: activityError } = await supabase
        .from('activity')
        .insert({
          user_id: user.id,
          type: 'tool_added',
          description: `Added new tool: ${validatedData.name}`,
          metadata: JSON.stringify({ toolId: tool.id }),
        })

      if (activityError) {
        console.error("Activity log error:", activityError)
      }
    }

    // Handle email assignments
    if (emailIds.length > 0) {
      // Remove existing tool accounts if editing
      if (toolId) {
        const { error: deleteError } = await supabase
          .from('tool_accounts')
          .delete()
          .eq('tool_id', toolId)
          .eq('user_id', user.id)

        if (deleteError) {
          console.error("Tool accounts deletion error:", deleteError)
        }
      }

      // Create new tool accounts for selected emails
      const toolAccountsData = emailIds.map((emailId) => ({
        user_id: user.id,
        tool_id: tool.id,
        email_id: emailId,
        account_name: validatedData.name,
      }))

      const { error: accountsError } = await supabase
        .from('tool_accounts')
        .insert(toolAccountsData)

      if (accountsError) {
        console.error("Tool accounts creation error:", accountsError)
        return { error: "Tool created but failed to assign to emails. Please edit the tool to assign emails." }
      }
    }

    revalidatePath("/tools")
    revalidatePath("/dashboard")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Tool creation/update error:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function deleteTool(toolId: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/sign-in")
    }

    // Get tool name for activity log
    const { data: tool, error: selectError } = await supabase
      .from('tools')
      .select('name')
      .eq('id', toolId)
      .eq('user_id', user.id) // Security: ensure user owns the tool
      .single()

    if (selectError || !tool) {
      console.error("Tool not found error:", selectError)
      return { error: "Tool not found" }
    }

    // Delete tool using Supabase (cascades should handle related records)
    const { error: deleteError } = await supabase
      .from('tools')
      .delete()
      .eq('id', toolId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error("Tool deletion error:", deleteError)
      return { error: "Failed to delete tool. Please try again." }
    }

    // Log activity
    const { error: activityError } = await supabase
      .from('activity')
      .insert({
        user_id: user.id,
        type: 'tool_removed',
        description: `Deleted tool: ${tool.name}`,
        metadata: JSON.stringify({ toolId }),
      })

    if (activityError) {
      console.error("Activity log error:", activityError)
    }

    revalidatePath("/tools")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Tool deletion error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
