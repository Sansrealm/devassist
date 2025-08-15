export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
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

  try {
    // Fetch user profile and emails using Supabase client
    const [profileResult, emailsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, timezone, created_at')
        .eq('user_id', user.id)
        .single(),

      supabase
        .from('emails')
        .select('id, email, is_primary, is_verified, created_at')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false }) // Primary email first
    ])

    console.log("👤 Profile result:", profileResult)
    console.log("📧 Emails result:", emailsResult)

    // Handle profile data (might not exist for new users)
    const userProfile = profileResult.data ? {
      id: profileResult.data.id,
      firstName: profileResult.data.first_name,
      lastName: profileResult.data.last_name,
      avatarUrl: profileResult.data.avatar_url,
      timezone: profileResult.data.timezone,
      createdAt: profileResult.data.created_at,
    } : null

    // Handle emails data
    const userEmails = (emailsResult.data || []).map(email => ({
      id: email.id,
      email: email.email,
      isPrimary: email.is_primary,
      isVerified: email.is_verified,
      createdAt: email.created_at,
    }))

    console.log("👤 Processed profile:", userProfile)
    console.log("📧 Processed emails:", userEmails)

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
  } catch (error) {
    console.error("🚨 Settings page error:", error)
    
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Unable to Load Settings</h3>
              <p className="text-muted-foreground mb-4">
                There was an issue loading your profile and email settings.
              </p>
              
              {/* Fallback: Show settings with minimal data */}
              <div className="mt-6">
                <SettingsTabs 
                  user={user} 
                  profile={null} 
                  emails={[]} 
                />
              </div>
            </div>

            {/* Debug info */}
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground">Debug Info</summary>
              <pre className="mt-4 p-4 bg-muted rounded text-xs overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          </div>
        </main>
      </div>
    )
  }
}
