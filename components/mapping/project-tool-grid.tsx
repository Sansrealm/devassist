"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link2, Unlink } from "lucide-react"
import { createMapping, deleteMapping } from "@/lib/mapping/actions"
import { useTransition } from "react"

interface Project {
  id: string
  name: string
  status: string | null
  description: string | null
}

interface ToolAccount {
  id: string
  toolId: string
  toolName: string
  toolCategory: string | null
  toolLogoUrl: string | null
  emailAddress: string
  accountName: string | null
}

interface Mapping {
  id: string
  projectId: string
  toolAccountId: string
  isActive: boolean
  lastUsed: Date | null
  usageCount: number
}

interface ProjectToolGridProps {
  projects: Project[]
  toolAccounts: ToolAccount[]
  existingMappings: Mapping[]
  isMapped: (projectId: string, toolAccountId: string) => boolean
  getStatusColor: (status: string | null) => string
  getCategoryColor: (category: string | null) => string
}

export default function ProjectToolGrid({
  projects,
  toolAccounts,
  existingMappings,
  isMapped,
  getStatusColor,
  getCategoryColor,
}: ProjectToolGridProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggleMapping = (projectId: string, toolAccountId: string) => {
    startTransition(async () => {
      if (isMapped(projectId, toolAccountId)) {
        // Find and delete the mapping
        const mapping = existingMappings.find((m) => m.projectId === projectId && m.toolAccountId === toolAccountId)
        if (mapping) {
          await deleteMapping(mapping.id)
        }
      } else {
        // Create new mapping
        await createMapping(projectId, toolAccountId)
      }
    })
  }

  return (
    <div className="space-y-8">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {project.name}
                  {project.status && (
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  )}
                </CardTitle>
                {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
              </div>
              <div className="text-sm text-muted-foreground">
                {existingMappings.filter((m) => m.projectId === project.id).length} tool
                {existingMappings.filter((m) => m.projectId === project.id).length !== 1 ? "s" : ""} mapped
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {toolAccounts.map((toolAccount) => {
                const isCurrentlyMapped = isMapped(project.id, toolAccount.id)
                return (
                  <div
                    key={toolAccount.id}
                    className={`p-4 border rounded-lg transition-all ${
                      isCurrentlyMapped
                        ? "border-[#002F71] bg-gradient-to-r from-[#002F71]/5 to-[#0A4BA0]/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={toolAccount.toolLogoUrl || "/placeholder.svg"} alt={toolAccount.toolName} />
                        <AvatarFallback>{toolAccount.toolName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{toolAccount.toolName}</h4>
                        <p className="text-xs text-muted-foreground truncate">{toolAccount.emailAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {toolAccount.toolCategory && (
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(toolAccount.toolCategory)}`}>
                          {toolAccount.toolCategory}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant={isCurrentlyMapped ? "destructive" : "default"}
                        className={
                          isCurrentlyMapped
                            ? ""
                            : "bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]"
                        }
                        onClick={() => handleToggleMapping(project.id, toolAccount.id)}
                        disabled={isPending}
                      >
                        {isCurrentlyMapped ? (
                          <>
                            <Unlink className="h-3 w-3 mr-1" />
                            Unlink
                          </>
                        ) : (
                          <>
                            <Link2 className="h-3 w-3 mr-1" />
                            Link
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
