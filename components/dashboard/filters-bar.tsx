"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, X, Filter } from "lucide-react"

export interface FilterState {
  search: string
  project: string
  category: string
}

interface Project {
  id: string
  name: string
}

interface FiltersBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  projects: Project[]
  categories: string[]
}

export default function FiltersBar({ filters, onFiltersChange, projects, categories }: FiltersBarProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      project: "all",
      category: "all"
    })
  }

  const hasActiveFilters = 
    filters.search !== "" || 
    filters.project !== "all" || 
    filters.category !== "all"

  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm transition-all duration-200 hover:bg-white/80">
      
      {/* Filter Label & Clear Button */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 hidden sm:block">Filter:</span>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-8 px-2 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 border border-gray-200/60 rounded-lg transition-colors"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="flex-1 min-w-[240px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search tools..." 
            className="h-9 pl-9 text-sm border-gray-200/60 bg-white/90 hover:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all" 
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
          {filters.search && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Project Filter */}
      <div className="min-w-[140px]">
        <Select value={filters.project} onValueChange={(value) => updateFilter("project", value)}>
          <SelectTrigger className="h-9 text-sm border-gray-200/60 bg-white/90 hover:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all">
            <div className="flex items-center w-full">
              <SelectValue placeholder="Project" />
              {filters.project !== "all" && (
                <div className="ml-auto h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter */}
      <div className="min-w-[140px]">
        <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
          <SelectTrigger className="h-9 text-sm border-gray-200/60 bg-white/90 hover:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all">
            <div className="flex items-center w-full">
              <SelectValue placeholder="Category" />
              {filters.category !== "all" && (
                <div className="ml-auto h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </div>
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
      </div>
    </div>
  )
}
