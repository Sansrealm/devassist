"use client"

import { useState, useMemo } from "react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import MonthlySpendCard from "@/components/dashboard/monthly-spend-card"
import SubscriptionsOverviewCard from "@/components/dashboard/subscriptions-overview-card"
import FiltersBar, { FilterState } from "@/components/dashboard/filters-bar"
import ToolsOverviewTable from "@/components/dashboard/tools-overview-table"
import SpendingByCategories from "@/components/dashboard/spending-by-categories"

interface ToolOverview {
  toolId: string
  toolName: string
  toolCategory: string | null
  monthlyCost: number
  renewalDate: Date | null
  trialEndDate: Date | null
  projectCount: number
  projects: Array<{
    id: string
    name: string
  }>
  status: string | null
}

interface Project {
  id: string
  name: string
}

interface User {
  id: string
  email?: string
}

interface DashboardClientProps {
  user: User
  toolsOverviewData: ToolOverview[]
  totalSpend: number
  activeSubscriptions: number
  trialSubscriptions: number
  allProjects: Project[]
}

export default function DashboardClient({
  user,
  toolsOverviewData,
  totalSpend,
  activeSubscriptions,
  trialSubscriptions,
  allProjects
}: DashboardClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    project: "all",
    category: "all"
  })

  // Extract unique categories from the tools data
  const uniqueCategories = useMemo(() => {
    const categories = toolsOverviewData
      .map(tool => tool.toolCategory)
      .filter((category): category is string => category !== null)
    return [...new Set(categories)].sort()
  }, [toolsOverviewData])

  // Filter the tools data based on current filters
  const filteredToolsData = useMemo(() => {
    return toolsOverviewData.filter(tool => {
      // Search filter (tool name)
      if (filters.search && !tool.toolName.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Category filter
      if (filters.category !== "all" && tool.toolCategory !== filters.category) {
        return false
      }

      // Project filter
      if (filters.project !== "all") {
        if (filters.project === "unassigned") {
          // Show tools with no projects
          if (tool.projects.length > 0) {
            return false
          }
        } else {
          // Show tools assigned to specific project
          if (!tool.projects.some(project => project.id === filters.project)) {
            return false
          }
        }
      }

      return true
    })
  }, [toolsOverviewData, filters])

  // Calculate filtered totals for display
  const filteredTotals = useMemo(() => {
    const filteredSpend = filteredToolsData
      .filter(tool => tool.status === 'active')
      .reduce((sum, tool) => sum + tool.monthlyCost, 0)
    
    const filteredActive = filteredToolsData.filter(tool => tool.status === 'active').length
    const filteredTrial = filteredToolsData.filter(tool => tool.status === 'trial').length

    return {
      totalSpend: filteredSpend,
      activeSubscriptions: filteredActive,
      trialSubscriptions: filteredTrial
    }
  }, [filteredToolsData])

  // Check if any filters are active
  const hasActiveFilters = filters.search !== "" || filters.project !== "all" || filters.category !== "all"

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8 space-y-4">
        {/* Combined Spending and Subscriptions Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <MonthlySpendCard
            totalSpend={hasActiveFilters ? filteredTotals.totalSpend : totalSpend}
          />
          <SubscriptionsOverviewCard
            activeSubscriptions={hasActiveFilters ? filteredTotals.activeSubscriptions : activeSubscriptions}
            trialSubscriptions={hasActiveFilters ? filteredTotals.trialSubscriptions : trialSubscriptions}
          />
        </div>

        {/* Filters */}
        <FiltersBar 
          filters={filters}
          onFiltersChange={setFilters}
          projects={allProjects}
          categories={uniqueCategories}
        />

        {/* Tools Overview - always show filtered data */}
        <ToolsOverviewTable data={filteredToolsData} />

        {/* Spending by Categories */}
        <SpendingByCategories data={toolsOverviewData} />
      </main>
    </div>
  )
}
