"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Link2, FolderOpen, Settings, Grid3X3, List } from "lucide-react"
import ProjectToolGrid from "./project-tool-grid"
import MappingMatrix from "./mapping-matrix"
import EnhancedMappingActions from "./enhanced-mapping-actions"

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

interface MappingInterfaceProps {
  projects: Project[]
  toolAccounts: ToolAccount[]
  existingMappings: Mapping[]
}

export default function MappingInterface({ 
  projects, 
  toolAccounts, 
  existingMappings 
}: MappingInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Helper functions
  const isMapped = (projectId: string, toolAccountId: string): boolean => {
    return existingMappings.some(
      (m) => m.projectId === projectId && m.toolAccountId === toolAccountId && m.isActive
    )
  }

  const getMappingsForProject = (projectId: string) => {
    return existingMappings.filter((m) => m.projectId === projectId && m.isActive)
  }

  const getMappingsForToolAccount = (toolAccountId: string) => {
    return existingMappings.filter((m) => m.toolAccountId === toolAccountId && m.isActive)
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "on_hold":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "completed":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "archived":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
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

  // Filter logic
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredToolAccounts = toolAccounts.filter((toolAccount) => {
    const matchesSearch =
      toolAccount.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      toolAccount.emailAddress.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || toolAccount.toolCategory === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (projects.length === 0 || toolAccounts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#002F71]/10 to-[#0A4BA0]/10">
          <Link2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No projects or tools to map</h3>
        <p className="mt-2 text-muted-foreground">
          {projects.length === 0 && "Create some projects first, then "}
          {toolAccounts.length === 0 && "add some tools to get started with mapping."}
        </p>
        <div className="mt-4 space-x-4">
          {projects.length === 0 && (
            <Button asChild>
              <a href="/projects/new">Create Project</a>
            </Button>
          )}
          {toolAccounts.length === 0 && (
            <Button asChild>
              <a href="/tools/new">Add Tool</a>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions Section - Moved to top for prominence */}
      <EnhancedMappingActions
        projects={projects}
        toolAccounts={toolAccounts}
        existingMappings={existingMappings}
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
          <CardDescription>Filter projects and tools to find what you're looking for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search projects and tools..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Mapping Views */}
      <Tabs defaultValue="matrix" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Matrix View
          </TabsTrigger>
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Project View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>

        {/* Matrix View - New primary view */}
        <TabsContent value="matrix" className="space-y-6">
          <MappingMatrix
            projects={
              selectedProject === "all" 
                ? filteredProjects 
                : filteredProjects.filter(p => p.id === selectedProject)
            }
            toolAccounts={filteredToolAccounts}
            existingMappings={existingMappings}
            getCategoryColor={getCategoryColor}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        {/* Grid View - Enhanced project-focused view */}
        <TabsContent value="grid" className="space-y-6">
          <ProjectToolGrid
            projects={
              selectedProject === "all" 
                ? filteredProjects 
                : filteredProjects.filter(p => p.id === selectedProject)
            }
            toolAccounts={filteredToolAccounts}
            existingMappings={existingMappings}
            isMapped={isMapped}
            getStatusColor={getStatusColor}
            getCategoryColor={getCategoryColor}
          />
        </TabsContent>

        {/* List View - Side-by-side columns */}
        <TabsContent value="list" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Projects Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Projects ({filteredProjects.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredProjects.map((project) => {
                  const projectMappings = getMappingsForProject(project.id)
                  return (
                    <div key={project.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{project.name}</h4>
                        {project.status && (
                          <Badge variant="outline" className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {projectMappings.length} tool{projectMappings.length !== 1 ? "s" : ""} mapped
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/map?project=${project.id}`}>
                            <Settings className="h-4 w-4 mr-1" />
                            Focus
                          </a>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Tools Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Tools ({filteredToolAccounts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredToolAccounts.map((toolAccount) => {
                  const toolMappings = getMappingsForToolAccount(toolAccount.id)
                  return (
                    <div key={toolAccount.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={toolAccount.toolLogoUrl || "/placeholder.svg"} alt={toolAccount.toolName} />
                          <AvatarFallback>{toolAccount.toolName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">{toolAccount.toolName}</h4>
                          <p className="text-sm text-muted-foreground">{toolAccount.emailAddress}</p>
                        </div>
                        {toolAccount.toolCategory && (
                          <Badge variant="outline" className={getCategoryColor(toolAccount.toolCategory)}>
                            {toolAccount.toolCategory}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Mapped to {toolMappings.length} project{toolMappings.length !== 1 ? "s" : ""}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/map?tool=${toolAccount.toolId}`}>
                            <Link2 className="h-4 w-4 mr-1" />
                            Focus
                          </a>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
