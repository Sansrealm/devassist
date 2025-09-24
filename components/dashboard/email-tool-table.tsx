import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface EmailToolData {
  emailAddress: string | null
  toolName: string | null
  toolCategory: string | null
  subscriptionCost: string | null
  subscriptionStatus: string | null
  billingCycle: string | null
  renewalDate: Date | null
  toolId: string | null
  subscriptionId: string | null
}

interface EmailToolTableProps {
  data: EmailToolData[]
}

export default function EmailToolTable({ data }: EmailToolTableProps) {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "trial":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "expired":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case "development":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20"
      case "design":
        return "bg-pink-500/10 text-pink-600 border-pink-500/20"
      case "productivity":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20"
      case "communication":
        return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
      case "analytics":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
      case "marketing":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const formatCurrency = (cost: string | null, cycle: string | null) => {
    if (!cost) return "-"
    const amount = Number.parseFloat(cost)
    const suffix = cycle === "yearly" ? "/year" : cycle === "monthly" ? "/month" : ""
    return `$${amount.toFixed(2)}${suffix}`
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "-"
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Email → Tool Mapping</CardTitle>
        <CardDescription>Overview of tools associated with each email address</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tools found. Start by adding your first tool.</p>
            <Button asChild className="mt-4 bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]">
  <Link href="/tools/new">
    Add Tool
  </Link>
</Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Renewal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.emailAddress || "-"}</TableCell>
                    <TableCell>{item.toolName || "-"}</TableCell>
                    <TableCell>
                      {item.toolCategory && (
                        <Badge variant="outline" className={getCategoryColor(item.toolCategory)}>
                          {item.toolCategory}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(item.subscriptionCost, item.billingCycle)}</TableCell>
                    <TableCell>
                      {item.subscriptionStatus && (
                        <Badge variant="outline" className={getStatusColor(item.subscriptionStatus)}>
                          {item.subscriptionStatus}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(item.renewalDate)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
