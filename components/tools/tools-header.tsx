"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, X } from "lucide-react"
import Link from "next/link"

export interface ToolsFilterState {
  search: string
  category: string
}

interface ToolsHeaderProps {
  filters: ToolsFilterState
  onFiltersChange: (filters: ToolsFilterState) => void
  categories: string[]
}

export default function ToolsHeader({ filters, onFiltersChange, categories }: ToolsHeaderProps) {
  const updateFilter = (key: keyof ToolsFilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      category: "all"
    })
  }

  const hasActiveFilters = filters.search !== "" || filters.category !== "all"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tools</h1>
          <p className="text-muted-foreground">Manage your development tools and subscriptions</p>
        </div>
       
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search tools..." 
              className="pl-10" 
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>
        </div>

        <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={clearFilters} 
          disabled={!hasActiveFilters}
          title={hasActiveFilters ? "Clear filters" : "No active filters"}
        >
          {hasActiveFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
        </Button>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Active filters:</span>
          {filters.search && (
            <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
              <span>Search: "{filters.search}"</span>
              <button
                onClick={() => updateFilter("search", "")}
                className="text-muted-foreground hover:text-foreground ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.category !== "all" && (
            <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
              <span>Category: {filters.category}</span>
              <button
                onClick={() => updateFilter("category", "all")}
                className="text-muted-foreground hover:text-foreground ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
