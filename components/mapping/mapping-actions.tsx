"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link2, Zap } from "lucide-react"
import { useState, useTransition } from "react"
import { createMapping, bulkCreateMappings } from "@/lib/mapping/actions"

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

interface MappingActionsProps {
  projects: Project[]
  toolAccounts: ToolAccount[]
  existingMappings: Mapping[]
}

export default function MappingActions({ projects, toolAccounts, existingMappings }: MappingActionsProps) {
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [selectedToolAccount, setSelectedToolAccount] = useState<string>("")
  const [isPending, startTransition] = useTransition()

  const handleQuickMap = () => {
    if (!selectedProject || !selectedToolAccount) return

    startTransition(async () => {
      await createMapping(selectedProject, selectedToolAccount)
      setSelectedProject("")
      setSelectedToolAccount("")
    })
  }

  const handleMapAllToProject = () => {
    if (!selectedProject) return

    const unmappedToolAccounts = toolAccounts.filter(
      (toolAccount) =>
        !existingMappings.some(
          (mapping) => mapping.projectId === selectedProject && mapping.toolAccountId === toolAccount.id,
        ),
    )

    if (unmappedToolAccounts.length === 0) return

    startTransition(async () => {
      await bulkCreateMappings(
        selectedProject,
        unmappedToolAccounts.map((ta) => ta.id),
      )
    })
  }

  const selectedProjectData = projects.find((p) => p.id === selectedProject)
  const selectedToolAccountData = toolAccounts.find((ta) => ta.id === selectedToolAccount)

  const isAlreadyMapped =
    selectedProject &&
    selectedToolAccount &&
    existingMappings.some(
      (mapping) => mapping.projectId === selectedProject && mapping.toolAccountId === selectedToolAccount,
    )

  const unmappedToolsForProject = selectedProject
    ? toolAccounts.filter(
        (toolAccount) =>
          !existingMappings.some(
            (mapping) => mapping.projectId === selectedProject && mapping.toolAccountId === toolAccount.id,
          ),
      ).length
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>Quickly create or manage project-tool mappings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Mapping */}
        <div className="space-y-4">
          <h4 className="font-medium">Quick Map</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tool</label>
              <Select value={selectedToolAccount} onValueChange={setSelectedToolAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tool" />
                </SelectTrigger>
                <SelectContent>
                  {toolAccounts.map((toolAccount) => (
                    <SelectItem key={toolAccount.id} value={toolAccount.id}>
                      {toolAccount.toolName} ({toolAccount.emailAddress})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleQuickMap}
              disabled={!selectedProject || !selectedToolAccount || isAlreadyMapped || isPending}
              className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]"
            >
              <Link2 className="h-4 w-4 mr-2" />
              {isAlreadyMapped ? "Already Mapped" : "Create Mapping"}
            </Button>

            {selectedProject && unmappedToolsForProject > 0 && (
              <Button variant="outline" onClick={handleMapAllToProject} disabled={isPending}>
                <Zap className="h-4 w-4 mr-2" />
                Map All Tools ({unmappedToolsForProject})
              </Button>
            )}
          </div>

          {isAlreadyMapped && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
              <p className="text-sm text-yellow-600">This tool is already mapped to the selected project.</p>
            </div>
          )}
        </div>

        {/* Mapping Summary */}
        <div className="space-y-4">
          <h4 className="font-medium">Mapping Summary</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{projects.length}</div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{toolAccounts.length}</div>
              <div className="text-sm text-muted-foreground">Tool Accounts</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{existingMappings.length}</div>
              <div className="text-sm text-muted-foreground">Active Mappings</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
