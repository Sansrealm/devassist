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
    <div className="filters-sleek">
      <style jsx>{`
        .filters-sleek {
          @apply flex flex-wrap items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm;
        }
        
        .filter-search-wrapper {
          @apply flex-1 min-w-[240px];
        }
        
        .filter-select-wrapper {
          @apply min-w-[140px];
        }
        
        .filter-select-trigger {
          @apply h-9 text-sm border-gray-200/60 bg-white/80 hover:bg-white focus:ring-1 focus:ring-blue-500/20 focus:border-blue-300;
        }
        
        .filter-search-input {
          @apply h-9 text-sm border-gray-200/60 bg-white/80 hover:bg-white focus:ring-1 focus:ring-blue-500/20 focus:border-blue-300;
        }
        
        .filter-clear-button {
          @apply h-9 px-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 border-gray-200/60;
        }
        
        .filter-icon {
          @apply h-4 w-4 text-gray-400;
        }
        
        .active-filter-indicator {
          @apply ml-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse;
        }
        
        .filter-label {
          @apply text-sm font-medium text-gray-700 hidden sm:block;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .filters-sleek {
            @apply flex-col items-stretch gap-2 px-3 py-2;
          }
          
          .filter-search-wrapper {
            @apply min-w-full;
          }
          
          .filter-select-wrapper {
            @apply min-w-full;
          }
        }
      `}</style>
      
      {/* Filter Label & Clear Button */}
      <div className="flex items-center gap-2">
        <Filter className="filter-icon" />
        <span className="filter-label">Filter:</span>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="filter-clear-button"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="filter-search-wrapper">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 filter-icon" />
          <Input 
            placeholder="Search tools..." 
            className="filter-search-input pl-9" 
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
          {filters.search && <div className="absolute right-2 top-1/2 transform -translate-y-1/2 active-filter-indicator"></div>}
        </div>
      </div>

      {/* Project Filter */}
      <div className="filter-select-wrapper">
        <Select value={filters.project} onValueChange={(value) => updateFilter("project", value)}>
          <SelectTrigger className="filter-select-trigger">
            <div className="flex items-center">
              <SelectValue placeholder="Project" />
              {filters.project !== "all" && <div className="active-filter-indicator"></div>}
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
      <div className="filter-select-wrapper">
        <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
          <SelectTrigger className="filter-select-trigger">
            <div className="flex items-center">
              <SelectValue placeholder="Category" />
              {filters.category !== "all" && <div className="active-filter-indicator"></div>}
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
