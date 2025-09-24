"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Link2, Zap, Target, TrendingUp, CheckCircle } from "lucide-react"
import { createMapping, createBulkMapping } from "@/lib/mapping/actions"
import { toast } from "@/hooks/use-toast"

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

interface EnhancedMappingActionsProps {
  projects: Project[]
  toolAccounts: ToolAccount[]
  existingMappings: Mapping[]
}

export default function EnhancedMappingActions({
  projects,
  toolAccounts,
  existingMappings
}: EnhancedMappingActionsProps) {
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [selectedTool, setSelectedTool] = useState<string>("")
  const [isPending, startTransition] = useTransition()

  // Calculate mapping statistics
  const totalMappings = existingMappings.length
  const totalPossibleMappings = projects.length * toolAccounts.length
  const mappingPercentage = totalPossibleMappings > 0 ? (totalMappings / totalPossibleMappings) * 100 : 0

  // Find unmapped tools for selected project
  const getUnmappedToolsForProject = (projectId: string) => {
    const mappedToolIds = existingMappings
      .filter(m => m.projectId === projectId)
      .map(m => m.toolAccountId)
    
    return toolAccounts.filter(tool => !mappedToolIds.includes(tool.id))
  }

  // Find unmapped projects for selected tool
  const getUnmappedProjectsForTool = (toolId: string) => {
    const mappedProjectIds = existingMappings
      .filter(m => m.toolAccountId === toolId)
      .map(m => m.projectId)
    
    return projects.filter(project => !mappedProjectIds.includes(project.id))
  }

  const isAlreadyMapped = (projectId: string, toolId: string) => {
    return existingMappings.some(
      m => m.projectId === projectId && m.toolAccountId === toolId
    )
  }

  const handleQuickMap = () => {
    if (!selectedProject || !selectedTool) return
    
    startTransition(async () => {
      try {
        const result = await createMapping(selectedProject, selectedTool)
        if (result.success) {
          toast({
            title: "Success",
            description: "Mapping created successfully!",
          })
          setSelectedProject("")
          setSelectedTool("")
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create mapping",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      }
    })
  }

  const handleMapAllToProject = () => {
    if (!selectedProject) return
    
    const unmappedTools = getUnmappedToolsForProject(selectedProject)
    if (unmappedTools.length === 0) return

    startTransition(async () => {
      try {
        const result = await createBulkMapping(
          selectedProject,
          unmappedTools.map(tool => tool.id)
        )
        if (result.success) {
          toast({
            title: "Success",
            description: `Successfully mapped ${result.count} tools to project!`,
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create bulk mappings",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      }
    })
  }

  const handleMapAllToTool = () => {
    if (!selectedTool) return
    
    const unmappedProjects = getUnmappedProjectsForTool(selectedTool)
    if (unmappedProjects.length === 0) return

    startTransition(async () => {
      try {
        // Create mappings for all unmapped projects
        const promises = unmappedProjects.map(project => 
          createMapping(project.id, selectedTool)
        )
        await Promise.all(promises)
        toast({
          title: "Success",
          description: `Successfully mapped tool to ${unmappedProjects.length} projects!`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      }
    })
  }

  const selectedProjectData = projects.find(p => p.id === selectedProject)
  const selectedToolData = toolAccounts.find(t => t.id === selectedTool)
  const unmappedToolsCount = selectedProject ? getUnmappedToolsForProject(selectedProject).length : 0
  const unmappedProjectsCount = selectedTool ? getUnmappedProjectsForTool(selectedTool).length : 0

  return (
  <div className="space-y-6">
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Quick Mapping Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Mapping Overview
          </CardTitle>
          <CardDescription>
            Current mapping status and quick insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Mapping Completion</span>
                <span className="text-sm text-muted-foreground">
                  {totalMappings} of {totalPossibleMappings} possible mappings
                </span>
              </div>
              <Progress value={mappingPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {mappingPercentage.toFixed(1)}% complete
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
                <div className="text-xs text-muted-foreground">Projects</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">{toolAccounts.length}</div>
                <div className="text-xs text-muted-foreground">Tools</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">{totalMappings}</div>
                <div className="text-xs text-muted-foreground">Active Mappings</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Mapping Actions
          </CardTitle>
          <CardDescription>
            Quickly create individual or bulk mappings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Single Mapping */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Single Mapping
            </h4>
            <CardDescription>
            Select a Project and a tool and Create Mapping. 
          </CardDescription>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Project</label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          {project.name}
                          {project.status && (
                            <Badge variant="outline" className="text-xs">
                              {project.status}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tool</label>
                <Select value={selectedTool} onValueChange={setSelectedTool}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tool" />
                  </SelectTrigger>
                  <SelectContent>
                    {toolAccounts.map((tool) => (
                      <SelectItem key={tool.id} value={tool.id}>
                        <div className="flex items-center gap-2">
                          {tool.toolName}
                          {tool.toolCategory && (
                            <Badge variant="outline" className="text-xs">
                              {tool.toolCategory}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleQuickMap}
                disabled={!selectedProject || !selectedTool || isPending || isAlreadyMapped(selectedProject, selectedTool)}
                className="flex items-center gap-2"
              >
                <Link2 className="h-4 w-4" />
                {isAlreadyMapped(selectedProject, selectedTool) 
                  ? "Already Mapped" 
                  : "Create Mapping"
                }
              </Button>

              {selectedProject && selectedTool && isAlreadyMapped(selectedProject, selectedTool) && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  This mapping already exists
                </div>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Bulk Actions
            </h4>

            <div className="space-y-3">
              {selectedProjectData && unmappedToolsCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-900">
                      Map all tools to "{selectedProjectData.name}"
                    </div>
                    <div className="text-sm text-blue-700">
                      {unmappedToolsCount} tools can be mapped to this project
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMapAllToProject}
                    disabled={isPending}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Map All ({unmappedToolsCount})
                  </Button>
                </div>
              )}

              {selectedToolData && unmappedProjectsCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div>
                    <div className="font-medium text-purple-900">
                      Map "{selectedToolData.toolName}" to all projects
                    </div>
                    <div className="text-sm text-purple-700">
                      {unmappedProjectsCount} projects can use this tool
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMapAllToTool}
                    disabled={isPending}
                    className="border-purple-300 text-purple-700 hover:bg-purple-100"
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Map All ({unmappedProjectsCount})
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
       </div>
    </div>
  )
}
