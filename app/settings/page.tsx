import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { profiles, emails } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import SettingsTabs from "@/components/settings/settings-tabs"

export default async function SettingsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Fetch user profile
  const [userProfile] = await db
    .select({
      id: profiles.id,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      avatarUrl: profiles.avatarUrl,
      timezone: profiles.timezone,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(eq(profiles.userId, user.id))

  // Fetch user emails
  const userEmails = await db
    .select({
      id: emails.id,
      email: emails.email,
      isPrimary: emails.isPrimary,
      isVerified: emails.isVerified,
      createdAt: emails.createdAt,
    })
    .from(emails)
    .where(eq(emails.userId, user.id))

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <SettingsTabs user={user} profile={userProfile} emails={userEmails} />
        </div>
      </main>
    </div>
  )
}
