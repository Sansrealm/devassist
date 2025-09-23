import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingDown, AlertTriangle } from "lucide-react"

interface ToolOverview {
  toolId: string
  toolName: string
  toolCategory: string | null
  monthlyCost: number
  projectCount: number
  status: string | null
}

interface UnderutilizationInsight {
  toolName: string
  projectCount: number
  monthlyCost: number
  savings: number
  priority: 'high' | 'medium' | 'low'
  action: string
}

interface MonthlySpendCardProps {
  totalSpend: number
  filteredToolsData: ToolOverview[]
  onPotentialSavingsClick?: () => void
}

// Underutilization analysis logic
function getUnderutilizationInsights(
  tools: ToolOverview[], 
  totalSpend: number
): UnderutilizationInsight[] {
  const insights: UnderutilizationInsight[] = []

  for (const tool of tools) {
    // Rules: No projects + cost > $10 + not a trial
    if (tool.projectCount < 1 && tool.monthlyCost > 10 && tool.status !== 'trial') {
      const savings = tool.monthlyCost
      const priority = (tool.monthlyCost / totalSpend) > 0.10 ? 'high' : 'medium'
      const action = `Cancel to save $${savings.toFixed(0)}/mo`
      
      insights.push({
        toolName: tool.toolName,
        projectCount: tool.projectCount,
        monthlyCost: tool.monthlyCost,
        savings,
        priority,
        action
      })
    }
  }

  // Sort by potential savings (highest first)
  return insights.sort((a, b) => b.savings - a.savings)
}

export default function MonthlySpendCard({ 
  totalSpend, 
  filteredToolsData, 
  onPotentialSavingsClick 
}: MonthlySpendCardProps) {
  // Calculate potential savings insights
  const insights = getUnderutilizationInsights(filteredToolsData, totalSpend)
  const totalPotentialSavings = insights.reduce((sum, insight) => sum + insight.savings, 0)
  const underutilizedCount = insights.length

  return (
    <Card className="border-2 border-transparent bg-gradient-to-r from-[#002F71] to-[#0A4BA0] p-[2px]">
      <div className="bg-background rounded-[calc(var(--radius)-2px)] h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Spend & Savings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Current Spending */}
          <div>
            <div className="text-2xl font-bold">${totalSpend.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current monthly cost</p>
          </div>

          {/* Potential Savings */}
          {underutilizedCount > 0 ? (
            <div className="pt-2 border-t border-gray-200/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">
                  Optimization Opportunity
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {underutilizedCount} tool{underutilizedCount !== 1 ? 's' : ''} underutilized
                  </span>
                  <span className="text-sm font-semibold text-orange-600">
                    Save ${totalPotentialSavings.toFixed(0)}/mo
                  </span>
                </div>
                
                {/* Top insight preview */}
                <div className="text-xs text-muted-foreground">
                  {insights[0].toolName} (0 projects, ${insights[0].monthlyCost.toFixed(0)}/mo)
                  {insights.length > 1 && ` +${insights.length - 1} more`}
                </div>

                {/* Action Button */}
                {onPotentialSavingsClick && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-8 text-xs mt-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                    onClick={onPotentialSavingsClick}
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    View Optimization Details
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-200/20">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">All tools well-utilized</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                No immediate savings opportunities detected
              </p>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}
