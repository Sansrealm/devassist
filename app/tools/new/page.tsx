import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import ToolForm from "@/components/tools/tool-form"
import { db } from "@/lib/db"
import { emails } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export default async function NewToolPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Fetch user's emails for the form
  const userEmails = await db
    .select({
      id: emails.id,
      email: emails.email,
      isPrimary: emails.isPrimary,
    })
    .from(emails)
    .where(eq(emails.userId, user.id))

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Add New Tool</h1>
            <p className="text-muted-foreground">Add a development tool to track its usage and costs</p>
          </div>

          <ToolForm userEmails={userEmails} />
        </div>
      </main>
    </div>
  )
}
