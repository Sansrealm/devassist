// File: app/tools/[id]/page.tsx
export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, ExternalLink } from "lucide-react"
import Link from "next/link"
import { calculateNextRenewalDate, getRenewalDescription } from "@/lib/renewal-dates"

interface ToolPageProps {
  params: {
    id: string
  }
}

export default async function ToolPage({ params }: ToolPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  try {
    // Fetch the tool data with subscription info
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select(`
        *,
        tool_accounts(
          id,
          subscriptions(
            cost,
            billing_cycle,
            status,
            renewal_date,
            trial_end_date
          )
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (toolError || !tool) {
      console.error("Tool fetch error:", toolError)
      notFound()
    }

    // Get subscription data
    const subscription = tool.tool_accounts?.[0]?.subscriptions?.[0]

    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />

        <main className="container mx-auto px-4 py-8">
          <Card className="border-2 border-transparent bg-gradient-to-r from-[#002F71] to-[#0A4BA0] p-[2px]">
            <div className="bg-background rounded-[calc(var(--radius)-2px)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href="/tools">
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </Button>
                    <div>
                      <CardTitle className="text-xl">{tool.name}</CardTitle>
                      <CardDescription>{tool.description || "No description provided"}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {tool.website_url && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={tool.website_url} target="_blank">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Site
                        </Link>
                      </Button>
                    )}
                    <Button size="sm" asChild className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0]">
                      <Link href={`/tools/${tool.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Tool
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-2">Tool Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        {tool.category && (
                          <Badge variant="outline">{tool.category}</Badge>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Cost:</span>
                        <span>${parseFloat(tool.base_cost || '0').toFixed(2)}/month</span>
                      </div>
                    </div>
                  </div>

                  {subscription && (
                    <div>
                      <h3 className="font-medium mb-2">Subscription Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="outline">{subscription.status}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost:</span>
                          <span>${parseFloat(subscription.cost || '0').toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Billing:</span>
                          <span>{subscription.billing_cycle}</span>
                        </div>
                        {subscription.status === 'trial' && subscription.trial_end_date && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Trial Ends:</span>
                            <span>{new Date(subscription.trial_end_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {subscription.status === 'active' && subscription.renewal_date && subscription.billing_cycle && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Next Renewal:</span>
                            <span>{getRenewalDescription(subscription.renewal_date, subscription.billing_cycle as any)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Tool page error:", error)
    notFound()
  }
}
