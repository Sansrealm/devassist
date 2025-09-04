// File: components/home/usp-widgets.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Bell, FolderKanban } from "lucide-react"

const uspItems = [
  {
    title: "Complete Dashboard",
    description: "Track all your active subscriptions, monthly expenses, and upcoming renewals in one central location.",
    icon: <BarChart3 className="h-6 w-6 text-[#0A4BA0]" />,
    iconBg: "bg-blue-500/10"
  },
  {
    title: "Automated Reminders",
    description: "Never forget a renewal or trial end date again with automated notifications and reminders.",
    icon: <Bell className="h-6 w-6 text-yellow-500" />,
    iconBg: "bg-yellow-500/10"
  },
  {
    title: "Project-Based Insights",
    description: "Visualize your spending by mapping subscriptions to your projects and teams for better budget control.",
    icon: <FolderKanban className="h-6 w-6 text-emerald-500" />,
    iconBg: "bg-emerald-500/10"
  },
]

export default function UspWidgets() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {uspItems.map((item, index) => (
            <Card key={index} className="border-border/60">
              <CardHeader className="flex flex-row items-center space-x-4">
                <div className={`p-2 rounded-md ${item.iconBg}`}>
                  {item.icon}
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
