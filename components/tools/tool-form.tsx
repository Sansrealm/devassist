"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ArrowLeft } from "lucide-react"
import { createTool } from "@/lib/tools/actions"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface UserEmail {
  id: string
  email: string
  isPrimary: boolean
}

interface ToolFormProps {
  userEmails: UserEmail[]
  initialData?: {
    id: string
    name: string
    description: string | null
    category: string | null
    logoUrl: string | null
    websiteUrl: string | null
    baseCost: string | null
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
        <>{isEditing ? "Update Tool" : "Create Tool"}</>
      )}
    </Button>
  )
}

export default function ToolForm({ userEmails, initialData, isEditing = false }: ToolFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(createTool, null)

  useEffect(() => {
    if (state?.success) {
      router.push("/tools")
    }
  }, [state, router])

  return (
    <Card className="border-2 border-transparent bg-gradient-to-r from-[#002F71] to-[#0A4BA0] p-[2px]">
      <div className="bg-background rounded-[calc(var(--radius)-2px)]">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/tools">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <CardTitle>{isEditing ? "Edit Tool" : "Add New Tool"}</CardTitle>
              <CardDescription>
                {isEditing ? "Update tool information" : "Enter the details for your development tool"}
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
                <Label htmlFor="name">Tool Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Figma, Linear, Vercel"
                  required
                  defaultValue={initialData?.name}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={initialData?.category || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of what this tool is used for"
                rows={3}
                defaultValue={initialData?.description || ""}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  placeholder="https://example.com"
                  defaultValue={initialData?.websiteUrl || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  defaultValue={initialData?.logoUrl || ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseCost">Base Cost (USD)</Label>
              <Input
                id="baseCost"
                name="baseCost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={initialData?.baseCost || ""}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Base cost for this tool (can be overridden per subscription)
              </p>
            </div>

            {userEmails.length > 0 && (
              <div className="space-y-4">
                <Label>Assign to Email Accounts</Label>
                <div className="space-y-3">
                  {userEmails.map((email) => (
                    <div key={email.id} className="flex items-center space-x-2">
                      <Checkbox id={`email-${email.id}`} name="emailIds" value={email.id} />
                      <Label htmlFor={`email-${email.id}`} className="flex-1">
                        {email.email}
                        {email.isPrimary && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">Primary</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select which email accounts this tool should be associated with
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button variant="outline" asChild>
                <Link href="/tools">Cancel</Link>
              </Button>
              <SubmitButton isEditing={isEditing} />
            </div>
          </form>
        </CardContent>
      </div>
    </Card>
  )
}
