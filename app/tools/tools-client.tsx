"use client"

import { useState, useMemo } from "react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import ToolsHeader, { ToolsFilterState } from "@/components/tools/tools-header"
import ToolsList from "@/components/tools/tools-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface Tool {
  id: string
  name: string
  description: string | null
  category: string | null
  logoUrl: string | null
  websiteUrl: string | null
  baseCost: string | null
  createdAt: Date
  updatedAt: Date
  accountCount: number
  totalCost: number
}

interface User {
  id: string
  email?: string
}

interface ToolsClientProps {
  user: User
  toolsData: Tool[]
}

export default function ToolsClient({ user, toolsData }: ToolsClientProps) {
  const [filters, setFilters] = useState<ToolsFilterState>({
    search: "",
    category: "all"
  })

  // Extract unique categories from tools data
  const uniqueCategories = useMemo(() => {
    const categories = toolsData
      .map(tool => tool.category)
      .filter((category): category is string => category !== null)
    return [...new Set(categories)].sort()
  }, [toolsData])

  // Filter the tools data based on current filters
  const filteredToolsData = useMemo(() => {
    return toolsData.filter(tool => {
      // Search filter (tool name and description)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesName = tool.name.toLowerCase().includes(searchTerm)
        const matchesDescription = tool.description?.toLowerCase().includes(searchTerm) || false
        
        if (!matchesName && !matchesDescription) {
          return false
        }
      }

      // Category filter
      if (filters.category !== "all" && tool.category !== filters.category) {
        return false
      }

      return true
    })
  }, [toolsData, filters])

  if (toolsData.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={user} />

        <main className="container mx-auto px-4 py-8 space-y-8">
          <ToolsHeader 
            filters={filters}
            onFiltersChange={setFilters}
            categories={uniqueCategories}
          />

          <div className="text-center py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#002F71]/10 to-[#0A4BA0]/10">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No tools yet</h3>
            <p className="mt-2 text-muted-foreground">Get started by adding your first development tool.</p>
            <Button
              asChild
              className="mt-4 bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]"
            >
              <Link href="/tools/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Tool
              </Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <ToolsHeader 
          filters={filters}
          onFiltersChange={setFilters}
          categories={uniqueCategories}
        />

        {filteredToolsData.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#002F71]/10 to-[#0A4BA0]/10">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No tools match your filters</h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search or category filters to see more results.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setFilters({ search: "", category: "all" })}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Show filtered results count */}
            {(filters.search || filters.category !== "all") && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredToolsData.length} of {toolsData.length} tools
              </div>
            )}
            
            <ToolsList tools={filteredToolsData} />
          </>
        )}
      </main>
    </div>
  )
}
