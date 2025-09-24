"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { MoreHorizontal, ExternalLink, FolderOpen, Lightbulb, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { calculateNextRenewalDate, getRenewalDescription } from "@/lib/renewal-dates"
import { formatDisplayDate } from "@/lib/date"
import { deleteTool } from "@/lib/tools/actions"

interface ToolOverview {
  toolId: string
  toolName: string
  toolCategory: string | null
  emailAddress: string
  monthlyCost: number
  renewalDate: string | null
  trialEndDate: string | null
  projectCount: number
  projects: Array<{
    id: string
    name: string
  }>
  status: string | null
  billingCycle: string | null
}

interface ToolsOverviewTableProps {
  data: ToolOverview[]
}

export default function ToolsOverviewTable({ data }: ToolsOverviewTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [toolToDelete, setToolToDelete] = useState<ToolOverview | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const getStatusColor = (status: string | null) => {
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

  const formatDate = (date: string | null) => {
    return formatDisplayDate(date)
  }

  const handleDeleteClick = (tool: ToolOverview) => {
    setToolToDelete(tool)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!toolToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteTool(toolToDelete.toolId)
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        setIsDeleting(false)
      } else {
        toast({
          title: "Success",
          description: `${toolToDelete.toolName} has been deleted.`,
        })
        
        setDeleteDialogOpen(false)
        setToolToDelete(null)
        setIsDeleting(false)
        
        // Refresh the page to show updated data
        setTimeout(() => {
          router.refresh()
        }, 500)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tools Overview</CardTitle>
          <CardDescription>Your tools, costs, and project usage</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tools found. Start by adding your first tool.</p>
              <Button asChild className="mt-4 bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]">
                <Link href="/tools/new">
                  Add Tool
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Renewal</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((tool) => (
                    <TableRow key={tool.toolId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{tool.toolName}</span>
                          {/* Under-utilization indicator */}
                          {tool.projectCount === 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Lightbulb className="h-4 w-4 text-yellow-500 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-muted text-muted-foreground border-border max-w-xs space-y-2">
                                  <p>You don't use this product much. Assign it to a project or consider unsubscribing.</p>
                                  <Button asChild size="sm" className="w-full bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]">
                                    <Link href={`/map?tool=${tool.toolId}`}>
                                      <FolderOpen className="h-4 w-4 mr-2" />
                                      Map to a Project
                                    </Link>
                                  </Button>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {tool.toolCategory && (
                          <Badge variant="outline" className={getCategoryColor(tool.toolCategory)}>
                            {tool.toolCategory}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(tool.monthlyCost)}</span>
                        <span className="text-muted-foreground">/month</span>
                      </TableCell>
                      <TableCell>
                        {tool.status && (
                          <Badge variant="outline" className={getStatusColor(tool.status)}>
                            {tool.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {tool.status === 'trial'
                          ? formatDate(tool.trialEndDate)
                          : (tool.renewalDate && tool.billingCycle
                            ? (() => {
                              return getRenewalDescription(tool.renewalDate, tool.billingCycle as any);
                            })()
                            : formatDate(tool.renewalDate)
                          )
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{tool.projectCount}</span>
                          {tool.projects.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {tool.projects.slice(0, 2).map((project) => (
                                <Link
                                  key={project.id}
                                  href={`/projects/${project.id}`}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
                                >
                                  <FolderOpen className="h-3 w-3" />
                                  {project.name}
                                </Link>
                              ))}
                              {tool.projects.length > 2 && (
                                <span className="text-xs text-muted-foreground px-2 py-1">
                                  +{tool.projects.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/tools/${tool.toolId}`}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Tool
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/tools/${tool.toolId}/edit`}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Edit Tool
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/map?tool=${tool.toolId}`}>
                                <FolderOpen className="mr-2 h-4 w-4" />
                                Manage Projects
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteClick(tool)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tool</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{toolToDelete?.toolName}</strong>? 
              This action cannot be undone and will remove all associated subscriptions and mappings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
