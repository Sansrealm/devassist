import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"

interface MonthlySpendCardProps {
  totalSpend: number
}

export default function MonthlySpendCard({ totalSpend }: MonthlySpendCardProps) {
  return (
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
  )
}
