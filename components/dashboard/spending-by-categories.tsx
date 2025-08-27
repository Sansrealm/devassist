import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp } from "lucide-react"

interface ToolOverview {
  toolId: string
  toolName: string
  toolCategory: string | null
  monthlyCost: number
  renewalDate: Date | null
  projectCount: number
  projects: Array<{
    id: string
    name: string
  }>
  status: string | null
}

interface SpendingByCategoriesProps {
  data: ToolOverview[]
}

export default function SpendingByCategories({ data }: SpendingByCategoriesProps) {
  // Process data to group by category
  const categorySpending = data
    .filter(tool => tool.status === 'active' && tool.monthlyCost > 0)
    .reduce((acc, tool) => {
      const category = tool.toolCategory || 'uncategorized'
      
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          tools: [],
          activeTools: 0
        }
      }
      
      acc[category].total += tool.monthlyCost
      acc[category].tools.push(tool.toolName)
      acc[category].activeTools += 1
      
      return acc
    }, {} as Record<string, { total: number; tools: string[]; activeTools: number }>)

  // Convert to array and sort by spending
  const categoriesArray = Object.entries(categorySpending)
    .map(([category, data]) => ({
      category,
      ...data
    }))
    .sort((a, b) => b.total - a.total)

  const totalSpending = categoriesArray.reduce((sum, cat) => sum + cat.total, 0)

  const getCategoryColor = (category: string) => {
    const colors = {
      development: "bg-purple-100 text-purple-800 border-purple-200",
      design: "bg-pink-100 text-pink-800 border-pink-200", 
      productivity: "bg-orange-100 text-orange-800 border-orange-200",
      communication: "bg-cyan-100 text-cyan-800 border-cyan-200",
      analytics: "bg-indigo-100 text-indigo-800 border-indigo-200",
      marketing: "bg-yellow-100 text-yellow-800 border-yellow-200",
      security: "bg-red-100 text-red-800 border-red-200",
      infrastructure: "bg-blue-100 text-blue-800 border-blue-200",
      uncategorized: "bg-gray-100 text-gray-800 border-gray-200"
    }
    return colors[category as keyof typeof colors] || colors.uncategorized
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`

  if (categoriesArray.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active subscriptions to analyze</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Spending by Category
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            {formatCurrency(totalSpending)}/month total
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoriesArray.map((categoryData) => {
          const percentage = totalSpending > 0 ? (categoryData.total / totalSpending) * 100 : 0
          
          return (
            <div key={categoryData.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getCategoryColor(categoryData.category)}>
                    {categoryData.category.charAt(0).toUpperCase() + categoryData.category.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {categoryData.activeTools} tool{categoryData.activeTools !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(categoryData.total)}/month</div>
                  <div className="text-xs text-muted-foreground">{percentage.toFixed(0)}% of total</div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              {/* Tool names */}
              <div className="flex flex-wrap gap-1">
                {categoryData.tools.slice(0, 3).map((toolName) => (
                  <span key={toolName} className="text-xs bg-muted px-2 py-1 rounded">
                    {toolName}
                  </span>
                ))}
                {categoryData.tools.length > 3 && (
                  <span className="text-xs text-muted-foreground px-2 py-1">
                    +{categoryData.tools.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
        
        {/* Summary card */}
        <div className="mt-6 p-4 bg-gradient-to-r from-[#002F71]/5 to-[#0A4BA0]/5 border border-[#002F71]/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Category Distribution</h4>
              <p className="text-sm text-muted-foreground">
                {categoriesArray.length} active categories
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#002F71]">
                {categoriesArray.length > 0 && formatCurrency(categoriesArray[0].total)}
              </div>
              <p className="text-xs text-muted-foreground">
                {categoriesArray.length > 0 && `${categoriesArray[0].category} (highest)`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
