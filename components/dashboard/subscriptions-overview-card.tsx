import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, CreditCard, Clock, AlertTriangle, FolderOpen, X } from "lucide-react"
import Link from "next/link"
import { formatDisplayDate } from "@/lib/date"

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
        <CardTitle className="text-sm font-medium">Subscriptions Overview</CardTitle>
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
              <span>{trialSubscriptions} free trial{trialSubscriptions !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Trial Expiration Alerts */}
        {upcomingTrialExpirations.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span>Trial Alert{upcomingTrialExpirations.length > 1 ? 's' : ''}</span>
            </div>
            
            {upcomingTrialExpirations.map((tool) => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              
              const trialEndDate = new Date(tool.trialEndDate!)
              trialEndDate.setHours(0, 0, 0, 0)
              
              const daysUntilExpiry = Math.ceil((trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              
              const expiryText = daysUntilExpiry === 0 
                ? 'expires today' 
                : daysUntilExpiry === 1 
                  ? 'expires tomorrow' 
                  : `expires in ${daysUntilExpiry} days`

              return (
                <div key={tool.toolId} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-800">
                        {tool.toolName} {expiryText}
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        ${tool.monthlyCost}/mo starting {formatDisplayDate(trialEndDate)} - Assign projects or cancel
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/map">
                        <FolderOpen className="h-3 w-3 mr-1" />
                        Assign to Project
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/tools/${tool.toolId}/edit`}>
                        <X className="h-3 w-3 mr-1" />
                        Cancel Trial
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
