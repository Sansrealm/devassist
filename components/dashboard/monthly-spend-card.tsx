import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard, Clock } from "lucide-react"

interface MonthlySpendCardProps {
  totalSpend: number
  activeSubscriptions: number
  trialSubscriptions: number
}

export default function MonthlySpendCard({
  totalSpend,
  activeSubscriptions,
  trialSubscriptions,
}: MonthlySpendCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-2 border-transparent bg-gradient-to-r from-[#002F71] to-[#0A4BA0] p-[2px]">
        <div className="bg-background rounded-[calc(var(--radius)-2px)] h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpend.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Estimated monthly cost</p>
          </CardContent>
        </div>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSubscriptions}</div>
          <p className="text-xs text-muted-foreground">Currently paying for</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trial Subscriptions</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{trialSubscriptions}</div>
          <p className="text-xs text-muted-foreground">Free trials active</p>
        </CardContent>
      </Card>
    </div>
  )
}
