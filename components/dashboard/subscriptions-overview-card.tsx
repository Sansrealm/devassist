import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, CreditCard, Clock, AlertTriangle, FolderOpen, X } from "lucide-react"
import Link from "next/link"

interface ToolOverview {
  toolId: string
  toolName: string
  status: string | null
  trialEndDate: Date | string | null
  monthlyCost: number
}

interface SubscriptionsOverviewCardProps {
  activeSubscriptions: number
  trialSubscriptions: number
  toolsOverviewData: ToolOverview[]
}

export default function SubscriptionsOverviewCard({
  activeSubscriptions,
  trialSubscriptions,
  toolsOverviewData,
}: SubscriptionsOverviewCardProps) {
  const totalSubscriptions = activeSubscriptions + trialSubscriptions

  // Find trials ending within 7 days
  const upcomingTrialExpirations = toolsOverviewData.filter(tool => {
    if (tool.status !== 'trial' || !tool.trialEndDate) return false
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const trialEndDate = new Date(tool.trialEndDate)
    trialEndDate.setHours(0, 0, 0, 0)
    
    const daysUntilExpiry = Math.ceil((trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 7
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Subscriptions Overview</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {activeSubscriptions > 0 && (
            <>
              <span className="text-green-600">{activeSubscriptions} Active</span>
              {trialSubscriptions > 0 && <span className="text-muted-foreground"> | </span>}
            </>
          )}
          {trialSubscriptions > 0 && (
            <span className="text-blue-600">{trialSubscriptions} Trial</span>
          )}
          {totalSubscriptions === 0 && <span className="text-muted-foreground">No subscriptions</span>}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          {activeSubscriptions > 0 && (
            <div className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              <span>Currently paying for {activeSubscriptions}</span>
            </div>
          )}
          {trialSubscriptions > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{trialSubscriptions} free trial{trialSubscriptions !== 1 ? 's' : ''} active</span>
            </div>
          )}
        </div>

        {/* Trial Expiration Alerts */}
        {upcomingTrialExpirations.length > 0 && (
          <div className="pt-3 border-t border-gray-200/20">
            {upcomingTrialExpirations.map(tool => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const trialEndDate = new Date(tool.trialEndDate!)
              trialEndDate.setHours(0, 0, 0, 0)
              const daysUntilExpiry = Math.ceil((trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              
              return (
                <div key={tool.toolId} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-600">
                      Trial Alert: {tool.toolName} expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-2">
                    ${tool.monthlyCost.toFixed(0)}/mo starting {trialEndDate.toLocaleDateString()} - Assign projects
                  </div>

                  <div className="flex gap-2">
                   <Button asChild variant="outline" size="sm" className="h-7 text-xs">
  <Link href={`/map?tool=${tool.toolId}`}>
    <FolderOpen className="h-3 w-3 mr-1" />
    Assign to Project
  </Link>
</Button>
                    <Button asChild variant="outline" size="sm" className="h-7 text-xs border-orange-200 text-orange-700 hover:bg-orange-50">
                      <Link href={`/tools/${tool.toolId}/edit`}>
                        <X className="h-3 w-3 mr-1" />
                        Edit Tool
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {totalSubscriptions === 0 && (
          <p className="text-xs text-muted-foreground">
            No active subscriptions or trials
          </p>
        )}
      </CardContent>
    </Card>
  )
}
