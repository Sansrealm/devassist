import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingDown, AlertTriangle, Clock, DollarSign } from "lucide-react"

export default function SavingsOpportunities() {
  // Placeholder data - this will be populated with real logic later
  const opportunities = [
    {
      id: 1,
      type: "unused",
      title: "Unused Tool Detected",
      description: "Figma Pro hasn't been used in 30 days",
      savings: 15,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
    },
    {
      id: 2,
      type: "trial-ending",
      title: "Trial Ending Soon",
      description: "Linear trial expires in 3 days",
      savings: 0,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      id: 3,
      type: "duplicate",
      title: "Potential Duplicate",
      description: "Similar tools: Notion and Obsidian",
      savings: 8,
      icon: TrendingDown,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Savings Opportunities
        </CardTitle>
        <CardDescription>Potential ways to reduce your monthly spend</CardDescription>
      </CardHeader>
      <CardContent>
        {opportunities.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <TrendingDown className="h-6 w-6 text-green-600" />
            </div>
            <p className="mt-4 text-muted-foreground">Great! No savings opportunities found at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opportunity) => {
              const Icon = opportunity.icon
              return (
                <div
                  key={opportunity.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${opportunity.bgColor}`}>
                      <Icon className={`h-4 w-4 ${opportunity.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{opportunity.title}</h4>
                      <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {opportunity.savings > 0 && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        Save ${opportunity.savings}/mo
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </div>
                </div>
              )
            })}

            <div className="mt-6 p-4 bg-gradient-to-r from-[#002F71]/5 to-[#0A4BA0]/5 border border-[#002F71]/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Potential Monthly Savings</h4>
                  <p className="text-sm text-muted-foreground">Based on current opportunities</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">$23.00</div>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
