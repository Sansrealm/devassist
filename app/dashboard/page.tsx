import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import MonthlySpendCard from "@/components/dashboard/monthly-spend-card"
import FiltersBar from "@/components/dashboard/filters-bar"
import EmailToolTable from "@/components/dashboard/email-tool-table"
import SavingsOpportunities from "@/components/dashboard/savings-opportunities"
import { db } from "@/lib/db"
import { subscriptions, toolAccounts, tools, emails, profiles } from "@/lib/db/schema"
import { eq, sql, desc } from "drizzle-orm"

async function ensureUserProfile(userId: string, userEmail: string) {
  try {
    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1)

    if (existingProfile.length === 0) {
      // Create profile if it doesn't exist
      await db.insert(profiles).values({
        id: crypto.randomUUID(),
        userId: userId,
        firstName: null,
        lastName: null,
        avatarUrl: null,
        timezone: "UTC",
      })
      console.log("✅ Created profile for user:", userId)
    }
  } catch (error) {
    console.error("❌ Error ensuring profile:", error)
    // Don't throw - let the dashboard load even if profile creation fails
  }
}

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  console.log("🔍 User authenticated:", user.id)

  // Ensure user has a profile record
  await ensureUserProfile(user.id, user.email || "")

  try {
    // Fetch dashboard data
    const [monthlySpendData, emailToolData] = await Promise.all([
      // Get total monthly spend
      db
        .select({
          totalSpend: sql<number>`COALESCE(SUM(CASE 
            WHEN ${subscriptions.billingCycle} = 'monthly' THEN ${subscriptions.cost}
            WHEN ${subscriptions.billingCycle} = 'yearly' THEN ${subscriptions.cost} / 12
            ELSE 0
          END), 0)`.as("totalSpend"),
          activeSubscriptions: sql<number>`COUNT(CASE WHEN ${subscriptions.status} = 'active' THEN 1 END)`.as(
            "activeSubscriptions",
          ),
          trialSubscriptions: sql<number>`COUNT(CASE WHEN ${subscriptions.status} = 'trial' THEN 1 END)`.as(
            "trialSubscriptions",
          ),
        })
        .from(subscriptions)
        .where(eq(subscriptions.userId, user.id)),

      // Get email-tool mapping data
      db
        .select({
          emailAddress: emails.email,
          toolName: tools.name,
          toolCategory: tools.category,
          subscriptionCost: subscriptions.cost,
          subscriptionStatus: subscriptions.status,
          billingCycle: subscriptions.billingCycle,
          renewalDate: subscriptions.renewalDate,
          toolId: tools.id,
          subscriptionId: subscriptions.id,
        })
        .from(emails)
        .leftJoin(toolAccounts, eq(emails.id, toolAccounts.emailId))
        .leftJoin(tools, eq(toolAccounts.toolId, tools.id))
        .leftJoin(subscriptions, eq(toolAccounts.id, subscriptions.toolAccountId))
        .where(eq(emails.userId, user.id))
        .orderBy(desc(subscriptions.createdAt)),
    ])

    console.log("📊 Monthly spend data:", monthlySpendData)
    console.log("📧 Email tool data length:", emailToolData.length)

    const monthlySpend = monthlySpendData[0] || {
      totalSpend: 0,
      activeSubscriptions: 0,
      trialSubscriptions: 0,
    }

    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Monthly Spend Overview */}
          <MonthlySpendCard
            totalSpend={monthlySpend.totalSpend}
            activeSubscriptions={monthlySpend.activeSubscriptions}
            trialSubscriptions={monthlySpend.trialSubscriptions}
          />

          {/* Filters */}
          <FiltersBar />

          {/* Email-Tool Table */}
          <EmailToolTable data={emailToolData} />

          {/* Savings Opportunities */}
          <SavingsOpportunities />
        </main>
      </div>
    )
  } catch (error) {
    console.error("🚨 Dashboard error:", error)
    
    // Return a user-friendly error page
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Welcome to DevStack Companion!</h1>
            <p className="text-muted-foreground mb-8">
              It looks like you're just getting started. Let's add your first development tool to begin tracking your subscriptions.
            </p>
            
            <button className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87] text-white px-6 py-3 rounded-lg font-medium">
              Add Your First Tool
            </button>
            
            {/* Debug info for development */}
            <details className="mt-8 text-left max-w-2xl mx-auto">
              <summary className="cursor-pointer text-sm text-muted-foreground">Debug Info (Development Only)</summary>
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
