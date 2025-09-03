// File: lib/tools/actions.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const toolSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tool name is required").max(100, "Tool name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").nullable().optional(),
  category: z
    .enum(["development", "design", "productivity", "communication", "analytics", "marketing", "other"])
    .nullable()
    .optional(),
  websiteUrl: z.string().url("Please enter a valid URL").nullable().optional(),
  logoUrl: z.string().url("Please enter a valid URL").nullable().optional(),
  baseCost: z.coerce.number().min(0, "Base cost must be a valid positive number").nullable().optional(),
  renewalDate: z.string().nullable().optional(),
  trialEndDate: z.string().nullable().optional(),
  billingCycle: z.enum(["monthly", "yearly", "quarterly", "one-time"]).nullable().optional(),
  // These fields are not used for the final object, but we include them for validation
  emailIds: z.array(z.string()).optional(),
  newEmails: z.array(z.string()).optional(),
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

    // Coerce form data into a plain object, handling arrays
    const rawData = Object.fromEntries(formData.entries())
    const emailIds = formData.getAll("emailIds") as string[]
    const newEmails = formData.getAll("newEmails") as string[]
    
    // Combine raw data with array data
    const dataToValidate = {
      ...rawData,
      emailIds,
      newEmails,
    }

    // Explicitly convert empty strings to null for optional fields
    const cleanedData = Object.fromEntries(
      Object.entries(dataToValidate).map(([key, value]) => {
        if (typeof value === 'string' && value.trim() === '') {
          // Exclude 'name' from this conversion as it is required
          return key === 'name' ? [key, value.trim()] : [key, null];
        }
        return [key, value];
      })
    );

    console.log("🔧 Cleaned Data for Validation:", cleanedData)
    console.log("🔧 Email IDs:", emailIds)
    console.log("🔧 New emails:", newEmails)
    
    // ENHANCED: Require at least one email (existing or new)
    const toolId = cleanedData.id as string
    if (!toolId && emailIds.length === 0 && newEmails.length === 0) {
      return {
        error: "Please select at least one email to associate with this tool.",
      }
    }

    const result = toolSchema.safeParse(cleanedData)
    if (!result.success) {
      console.error("Zod validation error:", result.error.errors)
      return {
        error: result.error.errors[0].message,
      }
    }

    const validatedData = result.data
    let tool

    if (toolId) {
      // Update existing tool using Supabase
      const { data: updatedTool, error: updateError } = await supabase
        .from('tools')
        .update({
          name: validatedData.name,
          description: validatedData.description,
          category: validatedData.category,
          website_url: validatedData.websiteUrl,
          logo_url: validatedData.logoUrl,
          base_cost: validatedData.baseCost,
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
          description: validatedData.description,
          category: validatedData.category,
          website_url: validatedData.websiteUrl,
          logo_url: validatedData.logoUrl,
          base_cost: validatedData.baseCost,
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

    // ENHANCED: Handle new emails first
    const allEmailIds = [...emailIds]
    
    if (newEmails.length > 0) {
      // Validate new emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const invalidEmails = newEmails.filter(email => !emailRegex.test(email))
      
      if (invalidEmails.length > 0) {
        return { error: `Invalid email format: ${invalidEmails.join(", ")}` }
      }

      // Check for duplicate emails
      const { data: existingEmails, error: checkError } = await supabase
        .from('emails')
        .select('email')
        .eq('user_id', user.id)
        .in('email', newEmails)

      if (checkError) {
        console.error("Email check error:", checkError)
        return { error: "Failed to verify emails. Please try again." }
      }

      const duplicateEmails = existingEmails?.map(e => e.email) || []
      const uniqueNewEmails = newEmails.filter(email => !duplicateEmails.includes(email))

      // Create new emails
      if (uniqueNewEmails.length > 0) {
        const newEmailsData = uniqueNewEmails.map(email => ({
          user_id: user.id,
          email: email,
          is_primary: false, // New emails are not primary by default
        }))

        const { data: createdEmails, error: emailInsertError } = await supabase
          .from('emails')
          .insert(newEmailsData)
          .select('id')

        if (emailInsertError) {
          console.error("Email creation error:", emailInsertError)
          return { error: "Failed to create new emails. Please try again." }
        }

        // Add new email IDs to the list
        allEmailIds.push(...createdEmails.map(email => email.id))
      }
    }

    // Handle email assignments - REQUIRED for all tools
    if (allEmailIds.length > 0) {
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

      // Create new tool accounts for all emails (existing + new)
      const toolAccountsData = allEmailIds.map((emailId) => ({
        user_id: user.id,
        tool_id: tool.id,
        email_id: emailId,
        account_name: validatedData.name,
      }))

      const { data: createdToolAccounts, error: accountsError } = await supabase
        .from('tool_accounts')
        .insert(toolAccountsData)
        .select('id')

      if (accountsError) {
        console.error("Tool accounts creation error:", accountsError)
        return { error: "Failed to assign tool to emails. Please try again." }
      }

      // NEW: Handle subscription data
      if (validatedData.renewalDate || validatedData.trialEndDate || validatedData.billingCycle) {
        // Remove existing subscriptions if editing
        if (toolId) {
          const { error: deleteSubsError } = await supabase
            .from('subscriptions')
            .delete()
            .eq('user_id', user.id)
            .in('tool_account_id', createdToolAccounts.map(ta => ta.id))

          if (deleteSubsError) {
            console.error("Subscriptions deletion error:", deleteSubsError)
          }
        }

        // Create subscriptions for each tool account
        const subscriptionData = createdToolAccounts.map((toolAccount) => {
          const subscriptionCost = validatedData.baseCost ? validatedData.baseCost : 0

          return {
            user_id: user.id,
            tool_account_id: toolAccount.id,
            name: `${validatedData.name} Subscription`,
            cost: subscriptionCost,
            currency: 'USD',
            billing_cycle: validatedData.billingCycle || 'monthly',
            status: validatedData.trialEndDate ? 'trial' : 'active',
            start_date: new Date().toISOString(),
            renewal_date: validatedData.renewalDate || null,
            trial_end_date: validatedData.trialEndDate || null,
            is_auto_renew: true,
          }
        })

        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert(subscriptionData)

        if (subscriptionError) {
          console.error("Subscription creation error:", subscriptionError)
          // Don't fail the entire operation for subscription errors
          console.warn("Tool created but subscription creation failed")
        } else {
          console.log("✅ Subscriptions created successfully")
        }
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
