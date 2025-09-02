interface UserEmail {
  id: string
  email: string
  isPrimary: boolean
  isAssociated?: boolean // Add this for pre-checking associated emails
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
    // Add subscription fields to the interface
    renewalDate?: string | null
    trialEndDate?: string | null
    billingCycle?: string | null
  }
  isEditing?: boolean
}

// Update the subscription fields section to use defaultValue properly:
// Replace the subscription fields in your tool-form.tsx with this:

<div className="grid gap-6 md:grid-cols-2">
  <div className="space-y-2">
    <Label htmlFor="renewalDate">Renewal Date</Label>
    <Input
      id="renewalDate"
      name="renewalDate"
      type="date"
      placeholder="YYYY-MM-DD"
      defaultValue={initialData?.renewalDate || ""}
    />
    <p className="text-xs text-muted-foreground">
      When your subscription renews (optional)
    </p>
  </div>

  <div className="space-y-2">
    <Label htmlFor="trialEndDate">Trial End Date</Label>
    <Input
      id="trialEndDate"
      name="trialEndDate"
      type="date"
      placeholder="YYYY-MM-DD"
      defaultValue={initialData?.trialEndDate || ""}
    />
    <p className="text-xs text-muted-foreground">
      When your free trial expires (optional)
    </p>
  </div>
</div>

<div className="space-y-2">
  <Label htmlFor="billingCycle">Billing Cycle</Label>
  <Select name="billingCycle" defaultValue={initialData?.billingCycle || ""}>
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

// Also update the email checkboxes to pre-check associated emails:
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
