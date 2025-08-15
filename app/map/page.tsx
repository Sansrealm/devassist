export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import MappingInterface from "@/components/mapping/mapping-interface"

export default async function MapPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  try {
    // Fetch all required data using Supabase client
    const [projectsResult, toolAccountsResult, toolsResult, emailsResult, projectToolsResult] = await Promise.all([
      // Get user's projects
      supabase
        .from('projects')
        .select('id, name, status, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      // Get user's tool accounts
      supabase
        .from('tool_accounts')
        .select('id, tool_id, email_id, account_name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      // Get all tools (for joining with tool accounts)
      supabase
        .from('tools')
        .select('id, name, category, logo_url')
        .eq('user_id', user.id),

      // Get all emails (for joining with tool accounts)
      supabase
        .from('emails')
        .select('id, email')
        .eq('user_id', user.id),

      // Get existing project-tool mappings
      supabase
        .from('project_tools')
        .select('id, project_id, tool_account_id, is_active, last_used, usage_count')
        .eq('user_id', user.id)
    ])

    console.log("📁 Projects result:", projectsResult)
    console.log("🔧 Tool accounts result:", toolAccountsResult)
    console.log("🛠️ Tools result:", toolsResult)
    console.log("📧 Emails result:", emailsResult)
    console.log("🔗 Project tools result:", projectToolsResult)

    // Process projects data
    const userProjects = (projectsResult.data || []).map(project => ({
      id: project.id,
      name: project.name,
      status: project.status,
      description: project.description,
    }))

    // Process tool accounts data with joins (client-side)
    const userToolAccounts = (toolAccountsResult.data || []).map(toolAccount => {
      // Find the related tool
      const tool = (toolsResult.data || []).find(t => t.id === toolAccount.tool_id)
      
      // Find the related email
      const email = (emailsResult.data || []).find(e => e.id === toolAccount.email_id)

      return {
        id: toolAccount.id,
        toolId: tool?.id || null,
        toolName: tool?.name || null,
        toolCategory: tool?.category || null,
        toolLogoUrl: tool?.logo_url || null,
        emailAddress: email?.email || null,
        accountName: toolAccount.account_name,
      }
    }).filter(ta => ta.toolName && ta.emailAddress) // Only include complete records

    // Process existing mappings data
    const existingMappings = (projectToolsResult.data || []).map(mapping => ({
      id: mapping.id,
      projectId: mapping.project_id,
      toolAccountId: mapping.tool_account_id,
      isActive: mapping.is_active,
      lastUsed: mapping.last_used,
      usageCount: mapping.usage_count,
    }))

    console.log("📊 Processed projects:", userProjects)
    console.log("🔧 Processed tool accounts:", userToolAccounts)
    console.log("🔗 Processed mappings:", existingMappings)

    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Project-Tool Mapping</h1>
            <p className="text-muted-foreground">Connect your tools to projects and manage their relationships</p>
          </div>

          <MappingInterface 
            projects={userProjects} 
            toolAccounts={userToolAccounts} 
            existingMappings={existingMappings} 
          />
        </main>
      </div>
    )
  } catch (error) {
    console.error("🚨 Map page error:", error)
    
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Project-Tool Mapping</h1>
            <p className="text-muted-foreground">Connect your tools to projects and manage their relationships</p>
          </div>

          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Unable to Load Mapping Data</h3>
            <p className="text-muted-foreground mb-4">
              There was an issue loading your projects and tool account data.
            </p>
            
            {/* Fallback: Show mapping interface with empty data */}
            <div className="mt-6">
              <MappingInterface 
                projects={[]} 
                toolAccounts={[]} 
                existingMappings={[]} 
              />
            </div>
          </div>

          {/* Debug info */}
          <details className="mt-8 text-left max-w-2xl mx-auto">
            <summary className="cursor-pointer text-sm text-muted-foreground">Debug Info</summary>
            <pre className="mt-4 p-4 bg-muted rounded text-xs overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </main>
      </div>
    )
  }
}
