"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Download, Shield } from "lucide-react"
import ProfileSettings from "./profile-settings"
import EmailSettings from "./email-settings"
import DataExport from "./data-export"
import SecuritySettings from "./security-settings"

interface Profile {
  id: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  timezone: string | null
  createdAt: Date
}

interface Email {
  id: string
  email: string
  isPrimary: boolean
  isVerified: boolean
  createdAt: Date
}

interface SettingsTabsProps {
  user: {
    id: string
    email?: string
    user_metadata?: {
      avatar_url?: string
      full_name?: string
    }
  }
  profile: Profile | undefined
  emails: Email[]
}

export default function SettingsTabs({ user, profile, emails }: SettingsTabsProps) {
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="emails" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Emails
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security
        </TabsTrigger>
        <TabsTrigger value="data" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Data
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileSettings user={user} profile={profile} />
      </TabsContent>

      <TabsContent value="emails">
        <EmailSettings emails={emails} />
      </TabsContent>

      <TabsContent value="security">
        <SecuritySettings user={user} />
      </TabsContent>

      <TabsContent value="data">
        <DataExport />
      </TabsContent>
    </Tabs>
  )
}
