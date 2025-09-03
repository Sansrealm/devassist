"use client"

import { useActionState, useState, useRef } from "react"
import { useFormStatus } from "react-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"
import { updateProfile, uploadAvatar } from "@/lib/settings/actions"
import { toast } from "@/hooks/use-toast"

interface Profile {
  id: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  timezone: string | null
  createdAt: Date
}

interface ProfileSettingsProps {
  user: {
    id: string
    email?: string
    user_metadata?: {
      avatar_url?: string
      full_name?: string
    }
  }
  profile: Profile | undefined
}

function SubmitButton() {
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
          Updating...
        </>
      ) : (
        "Update Profile"
      )}
    </Button>
  )
}

export default function ProfileSettings({ user, profile }: ProfileSettingsProps) {
  const [state, formAction] = useActionState(updateProfile, null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatarUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
  ]

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("avatarFile", file)

    const result = await uploadAvatar(null, formData)
    
    if (result.success && result.avatarUrl) {
      setAvatarUrl(result.avatarUrl)
      toast({
        title: "Success",
        description: "Profile image updated!",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to upload image.",
        variant: "destructive",
      })
    }
    setIsUploading(false)
  }

  const handleFormAction = async (formData: FormData) => {
    // If the avatarUrl state has changed, use that value
    if (avatarUrl !== profile?.avatarUrl) {
        formData.set('avatarUrl', avatarUrl || '');
    }
    formAction(formData);
  };

  return (
    <Card className="border-2 border-transparent bg-gradient-to-r from-[#002F71] to-[#0A4BA0] p-[2px]">
      <div className="bg-background rounded-[calc(var(--radius)-2px)]">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={handleFormAction} className="space-y-6">
            <input type="hidden" name="id" value={profile?.id || ''} />

            {state?.error && (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md text-sm">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-600 dark:text-green-400 px-4 py-3 rounded-md text-sm">
                Profile updated successfully!
              </div>
            )}

            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl || user.user_metadata?.avatar_url || "/placeholder.svg"} alt="Profile" />
                <AvatarFallback className="text-lg">
                  {profile?.firstName?.charAt(0) || user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar</Label>
                <div className="flex space-x-2">
                  <Input
                    id="avatarUrl"
                    name="avatarUrl"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    defaultValue={profile?.avatarUrl || ""}
                    className="flex-1"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/gif, image/svg+xml"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can upload an image or provide a URL.
                </p>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" placeholder="John" defaultValue={profile?.firstName || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" placeholder="Doe" defaultValue={profile?.lastName || ""} />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here. Use the Emails tab to manage your email addresses.
              </p>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select name="timezone" defaultValue={profile?.timezone || "UTC"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Info */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Account Information</h4>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <span className="text-muted-foreground">User ID:</span>
                  <p className="font-mono text-xs mt-1">{user.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Member since:</span>
                  <p className="mt-1">
                    {profile?.createdAt
                      ? new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }).format(new Date(profile.createdAt))
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </div>
    </Card>
  )
}
