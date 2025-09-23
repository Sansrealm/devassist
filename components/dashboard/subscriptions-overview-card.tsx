import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Clock } from "lucide-react"

interface SubscriptionsOverviewCardProps {
  activeSubscriptions: number
  trialSubscriptions: number
}

export default function SubscriptionsOverviewCard({
  activeSubscriptions,
  trialSubscriptions,
}: SubscriptionsOverviewCardProps) {
  const totalSubscriptions = activeSubscriptions + trialSubscriptions

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
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
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

        {totalSubscriptions === 0 && (
          <p className="text-xs text-muted-foreground">
            No active subscriptions or trials
          </p>
        )}
      </CardContent>
    </Card>
  )
}
