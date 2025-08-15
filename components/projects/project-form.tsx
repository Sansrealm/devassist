"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft } from "lucide-react"
import { createProject } from "@/lib/projects/actions"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProjectFormProps {
  initialData?: {
    id: string
    name: string
    description: string | null
    status: string | null
    notes: string | null
  }
  isEditing?: boolean
}

function SubmitButton({ isEditing }: { isEditing?: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEditing ? "Updating..." : "Creating..."}
        </>
      ) : (
        <>{isEditing ? "Update Project" : "Create Project"}</>
      )}
    </Button>
  )
}

export default function ProjectForm({ initialData, isEditing = false }: ProjectFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(createProject, null)

  useEffect(() => {
    if (state?.success) {
      router.push("/projects")
    }
  }, [state, router])

  return (
    <Card className="border-2 border-transparent bg-gradient-to-r from-[#002F71] to-[#0A4BA0] p-[2px]">
      <div className="bg-background rounded-[calc(var(--radius)-2px)]">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <CardTitle>{isEditing ? "Edit Project" : "Create New Project"}</CardTitle>
              <CardDescription>
                {isEditing ? "Update project information" : "Enter the details for your new project"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={formAction} className="space-y-6">
            {initialData && <input type="hidden" name="id" value={initialData.id} />}

            {state?.error && (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md text-sm">
                {state.error}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., E-commerce Platform, Mobile App"
                  required
                  defaultValue={initialData?.name}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={initialData?.status || "active"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">🟢 Active</SelectItem>
                    <SelectItem value="paused">⏸️ Paused</SelectItem>
                    <SelectItem value="completed">✅ Completed</SelectItem>
                    <SelectItem value="archived">📦 Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of your project"
                rows={3}
                defaultValue={initialData?.description || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Additional notes, requirements, or important information"
                rows={4}
                defaultValue={initialData?.notes || ""}
              />
              <p className="text-xs text-muted-foreground">
                Use this space for project requirements, deadlines, or any other important details
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" asChild>
                <Link href="/projects">Cancel</Link>
              </Button>
              <SubmitButton isEditing={isEditing} />
            </div>
          </form>
        </CardContent>
      </div>
    </Card>
  )
}
