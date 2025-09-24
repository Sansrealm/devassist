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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Loader2, ArrowLeft, Plus, X, ChevronDown, ChevronRight } from "lucide-react"
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
      className="w-full bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87] h-11"
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
  const [showOptionalFields, setShowOptionalFields] = useState(false)
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
  const showSubscriptionTypeSelector = !isEditing || (isEditing && subscriptionType === 'trial')

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tools">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Tool" : "Add New Tool"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditing ? "Update your tool and subscription details" : "Add a tool to track costs and usage"}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <form action={formAction} className="space-y-6">
            {initialData && <input type="hidden" name="id" value={initialData.id} />}

            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {state.error}
              </div>
            )}

            {/* Essential Fields */}
            <div className="space-y-6">
              {/* Tool Name & Category */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="toolName" className="text-sm font-medium">
                    Tool Name <span className="text-red-500">*</span>
                  </Label>
                  <ToolSearchInput
                    value={toolName}
                    onChange={handleToolNameChange}
                    onTemplateSelect={handleTemplateSelect}
                    required
                    placeholder="e.g., Figma, Linear, Vercel"
                    disabled={isEditing}
                  />
                  <input type="hidden" name="name" value={toolName} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
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

              {/* Cost */}
              <div className="space-y-2">
                <Label htmlFor="baseCost" className="text-sm font-medium">Monthly Cost (USD)</Label>
                <Input
                  id="baseCost"
                  name="baseCost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={baseCost}
                  onChange={(e) => setBaseCost(e.target.value)}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  The monthly cost for this tool
                </p>
              </div>

              {/* Subscription Type & Billing */}
              {showSubscriptionTypeSelector && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionType" className="text-sm font-medium">Subscription Status</Label>
                    <Select value={subscriptionType} onValueChange={setSubscriptionType}>
                      <SelectTrigger className="max-w-xs">
                        <SelectValue placeholder="Select subscription type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No subscription</SelectItem>
                        <SelectItem value="trial">Free Trial</SelectItem>
                        <SelectItem value="active">Paid Subscription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {showTrialEndDate && (
                      <div className="space-y-2">
                        <Label htmlFor="trialEndDate" className="text-sm font-medium">Trial End Date</Label>
                        <Input
                          id="trialEndDate"
                          name="trialEndDate"
                          type="date"
                          defaultValue={initialData?.trialEndDate || ""}
                        />
                      </div>
                    )}

                    {showRenewalDate && (
                      <div className="space-y-2">
                        <Label htmlFor="renewalDate" className="text-sm font-medium">Next Renewal</Label>
                        <Input
                          id="renewalDate"
                          name="renewalDate"
                          type="date"
                          defaultValue={initialData?.renewalDate || ""}
                        />
                      </div>
                    )}
                  </div>

                  {/* Billing Cycle */}
                  {(showRenewalDate || showTrialEndDate) && (
                    <div className="space-y-2">
                      <Label htmlFor="billingCycle" className="text-sm font-medium">Billing Cycle</Label>
                      <Select name="billingCycle" value={billingCycle} onValueChange={setBillingCycle}>
                        <SelectTrigger className="max-w-xs">
                          <SelectValue placeholder="Select billing cycle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="one-time">One-time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* Email Accounts */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  Email Accounts <span className="text-red-500">*</span>
                </Label>
                
                {/* Existing Emails */}
                <div className="space-y-3">
                  {userEmails.map((email) => (
                    <div key={email.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                      <Checkbox 
                        id={`email-${email.id}`} 
                        name="emailIds" 
                        value={email.id}
                        defaultChecked={
                          isEditing 
                            ? email.isAssociated 
                            : email.isPrimary
                        }
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={`email-${email.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {email.email}
                        </label>
                        {email.isPrimary && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Temporary Emails */}
                  {tempEmails.map((email) => (
                    <div key={email} className="flex items-center space-x-3 p-3 border rounded-lg bg-blue-50">
                      <Checkbox 
                        name="newEmails" 
                        value={email}
                        defaultChecked={true}
                        disabled={true}
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{email}</span>
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          New
                        </span>
                      </div>
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

                {/* Add New Email */}
                <div className="flex gap-2">
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Add email (e.g., work@company.com)"
                    type="email"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTempEmail}
                    disabled={!newEmail || !isValidEmail(newEmail)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Optional Fields - Collapsible */}
            <Collapsible open={showOptionalFields} onOpenChange={setShowOptionalFields}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-0 h-auto font-normal text-sm text-muted-foreground hover:text-foreground"
                  type="button"
                >
                  <span>Additional details (optional)</span>
                  {showOptionalFields ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4 pt-4">
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of what this tool is used for"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* URLs */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl" className="text-sm font-medium">Website URL</Label>
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
                    <Label htmlFor="logoUrl" className="text-sm font-medium">Logo URL</Label>
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
              </CollapsibleContent>
            </Collapsible>

            {/* Submit Button */}
            <div className="pt-4">
              <SubmitButton isEditing={isEditing} />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
