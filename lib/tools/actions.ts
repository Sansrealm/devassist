"use server"

import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { tools, toolAccounts, activity } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
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
      // Update existing tool
      const [updatedTool] = await db
        .update(tools)
        .set({
          name: validatedData.name,
          description: validatedData.description || null,
          category: validatedData.category || null,
          websiteUrl: validatedData.websiteUrl || null,
          logoUrl: validatedData.logoUrl || null,
          baseCost: validatedData.baseCost || null,
          updatedAt: new Date(),
        })
        .where(eq(tools.id, toolId))
        .returning()

      tool = updatedTool

      // Log activity
      await db.insert(activity).values({
        userId: user.id,
        type: "tool_updated",
        description: `Updated tool: ${validatedData.name}`,
        metadata: JSON.stringify({ toolId: tool.id }),
      })
    } else {
      // Create new tool
      const [newTool] = await db
        .insert(tools)
        .values({
          userId: user.id,
          name: validatedData.name,
          description: validatedData.description || null,
          category: validatedData.category || null,
          websiteUrl: validatedData.websiteUrl || null,
          logoUrl: validatedData.logoUrl || null,
          baseCost: validatedData.baseCost || null,
        })
        .returning()

      tool = newTool

      // Log activity
      await db.insert(activity).values({
        userId: user.id,
        type: "tool_added",
        description: `Added new tool: ${validatedData.name}`,
        metadata: JSON.stringify({ toolId: tool.id }),
      })
    }

    // Handle email assignments
    if (emailIds.length > 0) {
      // Remove existing tool accounts if editing
      if (toolId) {
        await db.delete(toolAccounts).where(eq(toolAccounts.toolId, toolId))
      }

      // Create new tool accounts for selected emails
      const toolAccountsData = emailIds.map((emailId) => ({
        userId: user.id,
        toolId: tool.id,
        emailId: emailId,
        accountName: validatedData.name,
      }))

      await db.insert(toolAccounts).values(toolAccountsData)
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
    const [tool] = await db.select({ name: tools.name }).from(tools).where(eq(tools.id, toolId))

    if (!tool) {
      return { error: "Tool not found" }
    }

    // Delete tool (cascades to tool_accounts and subscriptions)
    await db.delete(tools).where(eq(tools.id, toolId))

    // Log activity
    await db.insert(activity).values({
      userId: user.id,
      type: "tool_removed",
      description: `Deleted tool: ${tool.name}`,
      metadata: JSON.stringify({ toolId }),
    })

    revalidatePath("/tools")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Tool deletion error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
