import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, FolderOpen, Settings, Calendar } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  name: string
  description: string | null
  status: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  toolCount: number
}

interface ProjectsListProps {
  projects: Project[]
}

export default function ProjectsList({ projects }: ProjectsListProps) {
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </div>
                {project.status && (
                  <Badge variant="outline" className={getStatusColor(project.status)}>
                    <span className="mr-1">{getStatusIcon(project.status)}</span>
                    {project.status}
                  </Badge>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/projects/${project.id}`}>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/projects/${project.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/map?project=${project.id}`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Tools
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.description && <CardDescription className="line-clamp-2">{project.description}</CardDescription>}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Settings className="h-4 w-4" />
                <span>
                  {project.toolCount} tool{project.toolCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(project.updatedAt)}</span>
              </div>
            </div>

            {project.notes && (
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground line-clamp-2">{project.notes}</p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                <Link href={`/projects/${project.id}`}>View</Link>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                <Link href={`/projects/${project.id}/edit`}>Edit</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
