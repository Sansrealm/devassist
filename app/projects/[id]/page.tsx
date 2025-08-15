export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Settings, Calendar, FolderOpen, ExternalLink, DollarSign } from "lucide-react"
import Link from "next/link"

interface ProjectDetailPageProps {
  params: {
    id: string
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  try {
    // Fetch project data
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

    // Fetch project tools with tool details and email information
    const { data: projectTools, error: toolsError } = await supabase
      .from('project_tools')
      .select(`
        tool_account_id,
        tool_accounts(
          id,
          account_name,
          email_id,
          tools(
            id,
            name,
            category,
            base_cost,
            logo_url,
            website_url,
            renewal_date,
            trial_end_date,
            billing_cycle
          ),
          subscriptions(
            id,
            cost,
            status,
            billing_cycle,
            renewal_date,
            trial_end_date
          )
        )
      `)
      .eq('project_id', params.id)
      .eq('user_id', user.id)

    // Fetch emails to map email_id to email address
    const { data: emails, error: emailsError } = await supabase
      .from('emails')
      .select('id, email')
      .eq('user_id', user.id)

    if (toolsError || emailsError) {
      console.error("Project tools fetch error:", toolsError, emailsError)
    }

    // Process tools data
    const toolsData = (projectTools || []).map(pt => {
      const toolAccount = pt.tool_accounts
      const tool = toolAccount?.tools
      const subscriptions = toolAccount?.subscriptions || []

      // Find email address
      const email = emails?.find(e => e.id === toolAccount?.email_id)

      // Calculate cost (subscription or base cost)
      let monthlyCost = 0
      let status = null
      let renewalDate = null
      let trialEndDate = null
      let billingCycle = null

      if (subscriptions.length > 0) {
        const activeSub = subscriptions.find(sub => sub.status === 'active') || subscriptions[0]
        const cost = parseFloat(activeSub.cost) || 0
        monthlyCost = cost // Keep original cost for display
        status = activeSub.status
        renewalDate = activeSub.renewal_date
        trialEndDate = activeSub.trial_end_date
        billingCycle = activeSub.billing_cycle
      } else {
        monthlyCost = parseFloat(tool?.base_cost) || 0
        renewalDate = tool?.renewal_date
        trialEndDate = tool?.trial_end_date
        billingCycle = tool?.billing_cycle || 'monthly'
        status = monthlyCost > 0 ? 'active' : null
      }

      return {
        toolAccountId: toolAccount?.id,
        toolId: tool?.id,
        toolName: tool?.name,
        accountName: toolAccount?.account_name,
        emailAddress: email?.email || 'Unknown',
        category: tool?.category,
        logoUrl: tool?.logo_url,
        websiteUrl: tool?.website_url,
        monthlyCost,
        status,
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        trialEndDate: trialEndDate ? new Date(trialEndDate) : null,
        billingCycle
      }
    })

    // Calculate total monthly cost
    const totalMonthlyCost = toolsData.reduce((sum, tool) => {
      if (tool.status === 'active') {
        const monthlyEquivalent = tool.billingCycle === 'yearly' ? tool.monthlyCost / 12 : tool.monthlyCost
        return sum + monthlyEquivalent
      }
      return sum
    }, 0)

    const getStatusColor = (status: string | null) => {
      switch (status) {
        case "active":
          return "bg-green-500/10 text-green-600 border-green-500/20"
        case "paused":
          return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
        case "completed":
          return "bg-blue-500/10 text-blue-600 border-blue-500/20"
        case "archived":
          return "bg-gray-500/10 text-gray-600 border-gray-500/20"
        default:
          return "bg-gray-500/10 text-gray-600 border-gray-500/20"
      }
    }

    const getStatusIcon = (status: string | null) => {
      switch (status) {
        case "active":
          return "🟢"
        case "paused":
          return "⏸️"
        case "completed":
          return "✅"
        case "archived":
          return "📦"
        default:
          return "⚪"
      }
    }

    const getCategoryColor = (category: string | null) => {
      switch (category) {
        case "development":
          return "bg-purple-500/10 text-purple-600 border-purple-500/20"
        case "design":
          return "bg-pink-500/10 text-pink-600 border-pink-500/20"
        case "productivity":
          return "bg-orange-500/10 text-orange-600 border-orange-500/20"
        case "communication":
          return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
        case "analytics":
          return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
        case "marketing":
          return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
        default:
          return "bg-gray-500/10 text-gray-600 border-gray-500/20"
      }
    }

    const getToolStatusColor = (status: string | null) => {
      switch (status) {
        case "active":
          return "bg-green-500/10 text-green-600 border-green-500/20"
        case "trial":
          return "bg-blue-500/10 text-blue-600 border-blue-500/20"
        case "cancelled":
          return "bg-red-500/10 text-red-600 border-red-500/20"
        case "expired":
          return "bg-gray-500/10 text-gray-600 border-gray-500/20"
        default:
          return "bg-gray-500/10 text-gray-600 border-gray-500/20"
      }
    }

    const formatCurrency = (cost: number) => {
      return `$${cost.toFixed(2)}`
    }

    const formatDate = (date: Date | null) => {
      if (!date) return "-"
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date))
    }

    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/projects">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    {project.status && (
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        <span className="mr-1">{getStatusIcon(project.status)}</span>
                        {project.status}
                      </Badge>
                    )}
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Updated {formatDate(new Date(project.updated_at))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href={`/map?project=${project.id}`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Tools
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/projects/${project.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </Link>
              </Button>
            </div>
          </div>

          {/* Project Info */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              {project.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{project.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {project.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{project.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Project Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tools</span>
                    <span className="font-medium">{toolsData.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Cost</span>
                    <span className="font-medium">{formatCurrency(totalMonthlyCost)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      <span className="mr-1">{getStatusIcon(project.status)}</span>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">{formatDate(new Date(project.created_at))}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tools Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Tools</CardTitle>
              <CardDescription>Tools associated with this project</CardDescription>
            </CardHeader>
            <CardContent>
              {toolsData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tools mapped to this project yet.</p>
                  <Button asChild className="mt-4">
                    <Link href={`/map?project=${project.id}`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Add Tools
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tool</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Renewal</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {toolsData.map((tool) => (
                        <TableRow key={tool.toolAccountId}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={tool.logoUrl || "/placeholder.svg"} alt={tool.toolName} />
                                <AvatarFallback>{tool.toolName?.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{tool.toolName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">{tool.emailAddress}</span>
                          </TableCell>
                          <TableCell>
                            {tool.category && (
                              <Badge variant="outline" className={getCategoryColor(tool.category)}>
                                {tool.category}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div>
                                <span className="font-medium">{formatCurrency(tool.monthlyCost)}</span>
                                <span className="text-muted-foreground">
                                  {tool.billingCycle === 'yearly' ? '/year' : 
                                   tool.billingCycle === 'monthly' ? '/month' : 
                                   tool.billingCycle ? `/${tool.billingCycle}` : '/month'}
                                </span>
                              </div>
                              {tool.billingCycle === 'yearly' && (
                                <div className="text-xs text-muted-foreground">
                                  (${(tool.monthlyCost / 12).toFixed(2)}/month)
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {tool.status && (
                              <Badge variant="outline" className={getToolStatusColor(tool.status)}>
                                {tool.status}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {tool.renewalDate && (
                                <div className="text-sm">{formatDate(tool.renewalDate)}</div>
                              )}
                              {tool.trialEndDate && (
                                <div className="text-xs text-orange-600">
                                  Trial ends: {formatDate(tool.trialEndDate)}
                                </div>
                              )}
                              {!tool.renewalDate && !tool.trialEndDate && <span>-</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/tools/${tool.toolId}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    )
  } catch (error) {
    console.error("🚨 Project detail page error:", error)
    notFound()
  }
}
