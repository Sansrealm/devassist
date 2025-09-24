import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Check, X, Link2, AlertCircle } from "lucide-react"
import { createMapping, deleteMapping } from "@/lib/mapping/actions"

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

interface MappingMatrixProps {
  projects: Project[]
  toolAccounts: ToolAccount[]
  existingMappings: Mapping[]
  getCategoryColor: (category: string | null) => string
  getStatusColor: (status: string | null) => string
}

export default function MappingMatrix({
  projects,
  toolAccounts,
  existingMappings,
  getCategoryColor,
  getStatusColor
}: MappingMatrixProps) {
  const [isPending, startTransition] = useTransition()
  const [pendingMappings, setPendingMappings] = useState<Set<string>>(new Set())

  const isMapped = (projectId: string, toolAccountId: string): boolean => {
    return existingMappings.some(
      m => m.projectId === projectId && m.toolAccountId === toolAccountId && m.isActive
    )
  }

  const getMappingUsage = (projectId: string, toolAccountId: string): number => {
    const mapping = existingMappings.find(
      m => m.projectId === projectId && m.toolAccountId === toolAccountId
    )
    return mapping?.usageCount || 0
  }

  const handleToggleMapping = async (projectId: string, toolAccountId: string) => {
    const mappingKey = `${projectId}-${toolAccountId}`
    
    setPendingMappings(prev => new Set([...prev, mappingKey]))
    
    startTransition(async () => {
      try {
        if (isMapped(projectId, toolAccountId)) {
          const mapping = existingMappings.find(
            m => m.projectId === projectId && m.toolAccountId === toolAccountId
          )
          if (mapping) {
            await deleteMapping(mapping.id)
          }
        } else {
          await createMapping(projectId, toolAccountId)
        }
      } finally {
        setPendingMappings(prev => {
          const newSet = new Set(prev)
          newSet.delete(mappingKey)
          return newSet
        })
      }
    })
  }

  if (projects.length === 0 || toolAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground">
            {projects.length === 0 && "Create some projects first. "}
            {toolAccounts.length === 0 && "Add some tools to get started with mapping."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Project-Tool Mapping Matrix
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Toggle switches to map or unmap tools to projects. Green indicates active mappings.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header with Projects */}
            <div className="grid gap-2 mb-4" style={{
              gridTemplateColumns: `300px repeat(${projects.length}, minmax(120px, 1fr))`
            }}>
              <div className="font-medium text-sm text-muted-foreground px-4 py-2">
                Tools
              </div>
              {projects.map((project) => (
                <div key={project.id} className="text-center p-2 border rounded-lg bg-muted/50">
                  <div className="font-medium text-sm truncate" title={project.name}>
                    {project.name}
                  </div>
                  {project.status && (
                    <Badge variant="outline" size="sm" className={`mt-1 ${getStatusColor(project.status)}`}>
                      {project.status}
                    </Badge>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {existingMappings.filter(m => m.projectId === project.id).length} tools
                  </div>
                </div>
              ))}
            </div>

            {/* Tool Rows */}
            <div className="space-y-2">
              {toolAccounts.map((tool) => (
                <div
                  key={tool.id}
                  className="grid gap-2 items-center border rounded-lg p-2 hover:bg-muted/50 transition-colors"
                  style={{
                    gridTemplateColumns: `300px repeat(${projects.length}, minmax(120px, 1fr))`
                  }}
                >
                  {/* Tool Info */}
                  <div className="flex items-center gap-3 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={tool.toolLogoUrl || "/placeholder.svg"} alt={tool.toolName} />
                      <AvatarFallback className="text-xs">
                        {tool.toolName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" title={tool.toolName}>
                        {tool.toolName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate" title={tool.emailAddress}>
                        {tool.emailAddress}
                      </div>
                    </div>
                    {tool.toolCategory && (
                      <Badge variant="outline" size="sm" className={getCategoryColor(tool.toolCategory)}>
                        {tool.toolCategory}
                      </Badge>
                    )}
                  </div>

                  {/* Mapping Toggles for Each Project */}
                  {projects.map((project) => {
                    const mapped = isMapped(project.id, tool.id)
                    const usageCount = getMappingUsage(project.id, tool.id)
                    const mappingKey = `${project.id}-${tool.id}`
                    const isPendingToggle = pendingMappings.has(mappingKey)
                    
                    return (
                      <div key={project.id} className="flex justify-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col items-center gap-1">
                                <Switch
                                  checked={mapped}
                                  onCheckedChange={() => handleToggleMapping(project.id, tool.id)}
                                  disabled={isPending || isPendingToggle}
                                  className="data-[state=checked]:bg-green-600"
                                />
                                {mapped && usageCount > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    {usageCount} uses
                                  </div>
                                )}
                                {isPendingToggle && (
                                  <div className="text-xs text-blue-600 animate-pulse">
                                    Updating...
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {mapped 
                                  ? `Unmap ${tool.toolName} from ${project.name}` 
                                  : `Map ${tool.toolName} to ${project.name}`
                                }
                              </p>
                              {mapped && usageCount > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Used {usageCount} time{usageCount !== 1 ? 's' : ''}
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Summary Row */}
            <div className="mt-4 pt-4 border-t">
              <div className="grid gap-2 items-center" style={{
                gridTemplateColumns: `300px repeat(${projects.length}, minmax(120px, 1fr))`
              }}>
                <div className="px-2 font-medium text-sm">
                  Total Mappings:
                </div>
                {projects.map((project) => (
                  <div key={project.id} className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {existingMappings.filter(m => m.projectId === project.id).length}
                    </div>
                    <div className="text-xs text-muted-foreground">mapped tools</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
