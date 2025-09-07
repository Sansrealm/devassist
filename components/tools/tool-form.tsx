"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ArrowLeft, Plus, X } from "lucide-react"
import { createTool } from "@/lib/tools/actions"
import { ToolSearchInput } from "@/components/tools/tool-search-input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface UserEmail {
  id: string
  email: string
  isPrimary: boolean
  isAssociated?: boolean
}

interface ToolTemplate {
  id: string
  name: string
  description: string | null
  category: string | null
  logo_url: string | null
  website_url: string | null
  typical_cost: number | null
  billing_cycle: string | null
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
    renewalDate?: string | null
    trialEndDate?: string | null
    billingCycle?: string | null
    subscriptionStatus?: string | null
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
  const [newEmail, setNewEmail] = useState("")
  const [tempEmails, setTempEmails] = useState<string[]>([])
  const [subscriptionType, setSubscriptionType] = useState<string>(() => {
    if (initialData?.subscriptionStatus) return initialData.subscriptionStatus
    if (initialData?.trialEndDate) return 'trial'
    if (initialData?.renewalDate) return 'active'
    return ''
  })

  // Form field states for template auto-population
  const [toolName, setToolName] = useState(initialData?.name || "")
  const [category, setCategory] = useState(initialData?.category || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl || "")
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "")
  const [baseCost, setBaseCost] = useState(initialData?.baseCost || "")
  const [billingCycle, setBillingCycle] = useState(initialData?.billingCycle || "")

  useEffect(() => {
    if (state?.success) {
      router.push("/tools")
    }
  }, [state, router])

  const addTempEmail = () => {
    if (newEmail && !tempEmails.includes(newEmail) && !userEmails.some(e => e.email === newEmail)) {
      setTempEmails([...tempEmails, newEmail])
      setNewEmail("")
    }
  }

  const removeTempEmail = (email: string) => {
    setTempEmails(tempEmails.filter(e => e !== email))
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleTemplateSelect = (template: ToolTemplate | null) => {
    if (template && !isEditing) {
      // Silently auto-populate fields from template (only for new tools)
      if (template.category) setCategory(template.category)
      if (template.description) setDescription(template.description)
      if (template.website_url) setWebsiteUrl(template.website_url)
      if (template.logo_url) setLogoUrl(template.logo_url)
      if (template.typical_cost) setBaseCost(template.typical_cost.toString())
      if (template.billing_cycle) setBillingCycle(template.billing_cycle)
    }
  }

  const handleToolNameChange = (value: string) => {
    setToolName(value)
  }

  // Determine what date fields to show
  const showRenewalDate = subscriptionType === 'active' || (!isEditing && subscriptionType !== 'trial')
  const showTrialEndDate = subscriptionType === 'trial' || (!isEditing && subscriptionType !== 'active')
  const showSubscriptionTypeSelector = !isEditing // Only show for new tools

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
              {/* Clean Tool Name Input */}
              <div className="space-y-2">
                <ToolSearchInput
                  value={toolName}
                  onChange={handleToolNameChange}
                  onTemplateSelect={handleTemplateSelect}
                  required
                  label="Tool Name"
                  placeholder="e.g., Figma, Linear, Vercel"
                  disabled={isEditing}
                />
                {/* Hidden input for form submission */}
                <input type="hidden" name="name" value={toolName} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" value={category} onValueChange={setCategory}>
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
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
                value={baseCost}
                onChange={(e) => setBaseCost(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Monthly cost for this tool (can be overridden per subscription)
              </p>
            </div>

            {/* Conditional Subscription Type Selector for New Tools */}
            {showSubscriptionTypeSelector && (
              <div className="space-y-2">
                <Label htmlFor="subscriptionType">Subscription Type</Label>
                <Select value={subscriptionType} onValueChange={setSubscriptionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subscription type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active Subscription</SelectItem>
                    <SelectItem value="trial">Free Trial</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose whether this is an active paid subscription or free trial
                </p>
              </div>
            )}

            {/* Conditional Date Fields */}
            <div className="grid gap-6 md:grid-cols-2">
              {showRenewalDate && (
                <div className="space-y-2">
                  <Label htmlFor="renewalDate">Renewal Date</Label>
                  <Input
                    id="renewalDate"
                    name="renewalDate"
                    type="date"
                    placeholder="YYYY-MM-DD"
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    defaultValue={initialData?.renewalDate || ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    When your subscription renews (must be a future date)
                  </p>
                </div>
              )}

              {showTrialEndDate && (
                <div className="space-y-2">
                  <Label htmlFor="trialEndDate">Trial End Date</Label>
                  <Input
                    id="trialEndDate"
                    name="trialEndDate"
                    type="date"
                    placeholder="YYYY-MM-DD"
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    defaultValue={initialData?.trialEndDate || ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    When your free trial expires (must be a future date)
                  </p>
                </div>
              )}

              {/* Show billing cycle field if we have either date type */}
              {(showRenewalDate || showTrialEndDate) && (
                <div className="space-y-2">
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select name="billingCycle" value={billingCycle} onValueChange={setBillingCycle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How often you're billed for this tool
                  </p>
                </div>
              )}
            </div>

            {/* Email Management */}
            <div className="space-y-4">
              <Label>Email Accounts *</Label>
              
              {/* Add New Email */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Add new email (e.g., work@company.com)"
                    type="email"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTempEmail}
                    disabled={!newEmail || !isValidEmail(newEmail)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add emails you use for different tools (personal, work, etc.)
                </p>
              </div>

              {/* Existing Emails */}
              <div className="space-y-3">
                {userEmails.map((email) => (
                  <div key={email.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`email-${email.id}`} 
                      name="emailIds" 
                      value={email.id}
                      defaultChecked={
                        isEditing 
                          ? email.isAssociated || false 
                          : email.isPrimary
                      }
                    />
                    <Label htmlFor={`email-${email.id}`} className="flex-1">
                      {email.email}
                      {email.isPrimary && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">Primary</span>
                      )}
                    </Label>
                  </div>
                ))}

                {/* Temporary Emails */}
                {tempEmails.map((email, index) => (
                  <div key={`temp-${index}`} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`temp-email-${index}`} 
                      name="newEmails" 
                      value={email}
                      defaultChecked={true}
                    />
                    <Label htmlFor={`temp-email-${index}`} className="flex-1">
                      {email}
                      <span className="ml-2 text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded">New</span>
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTempEmail(email)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Select which email accounts this tool should be associated with (at least one required)
              </p>
            </div>

            {/* Show warning if no emails exist */}
            {userEmails.length === 0 && tempEmails.length === 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                <p className="text-sm text-orange-800">
                  Please add at least one email address above, or 
                  <Link href="/settings" className="underline ml-1">
                    add email in settings
                  </Link>
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
