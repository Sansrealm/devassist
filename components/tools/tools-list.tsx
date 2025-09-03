"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { MoreHorizontal, ExternalLink, Edit, Trash2, Users, DollarSign, FolderOpen } from "lucide-react"
import { deleteTool } from "@/lib/tools/actions"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface Tool {
  id: string
  name: string
  description: string | null
  category: string | null
  logoUrl: string | null
  websiteUrl: string | null
  baseCost: string | null
  createdAt: Date
  updatedAt: Date
  accountCount: number
  totalCost: number
}

interface ToolsListProps {
  tools: Tool[]
}

export default function ToolsList({ tools }: ToolsListProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Helper function to check if a tool was created in the last 24 hours
  const isNewlyAdded = (tool: Tool) => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return new Date(tool.createdAt) > twentyFourHoursAgo
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

  const formatCurrency = (cost: number) => {
    return `$${cost.toFixed(2)}`
  }

  const handleDeleteClick = (tool: Tool) => {
    setToolToDelete(tool)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!toolToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteTool(toolToDelete.id)
      
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
          description: `${toolToDelete.name} has been deleted.`,
        })
        
        setDeleteDialogOpen(false)
        setToolToDelete(null)
        setIsDeleting(false)
        
        setTimeout(() => {
          window.location.href = window.location.pathname
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={tool.logoUrl || "/placeholder.svg"} alt={tool.name} />
                    <AvatarFallback>{tool.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    {tool.category && (
                      <Badge variant="outline" className={`mt-1 ${getCategoryColor(tool.category)}`}>
                        {tool.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/tools/${tool.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/tools/${tool.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    {tool.websiteUrl && (
                      <DropdownMenuItem asChild>
                        <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Visit Website
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDeleteClick(tool)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tool.description && <CardDescription className="line-clamp-2">{tool.description}</CardDescription>}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {tool.accountCount} account{tool.accountCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(tool.totalCost)}/mo</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {isNewlyAdded(tool) && tool.accountCount === 0 ? (
                  <Button
                    asChild
                    className="flex-1 bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]"
                  >
                    <Link href={`/map?tool=${tool.id}`}>
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Link to a Project
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                      <Link href={`/tools/${tool.id}`}>View</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                      <Link href={`/tools/${tool.id}/edit`}>Edit</Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tool</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{toolToDelete?.name}</strong>? 
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
