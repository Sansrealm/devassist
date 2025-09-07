"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ToolTemplate {
  id: string
  name: string
  description: string | null
  category: string | null
  logo_url: string | null
  website_url: string | null
  typical_cost: number | null
  billing_cycle: string | null
}

interface ToolSearchInputProps {
  value?: string
  onChange: (value: string) => void
  onTemplateSelect?: (template: ToolTemplate | null) => void
  className?: string
  disabled?: boolean
  required?: boolean
  placeholder?: string
  label?: string
  description?: string
}

export function ToolSearchInput({
  value = "",
  onChange,
  onTemplateSelect,
  className,
  disabled = false,
  required = false,
  placeholder = "Search for a tool or enter custom name...",
  label = "Tool Name",
  description,
}: ToolSearchInputProps) {
  const [options, setOptions] = useState<ComboboxOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [useCombobox, setUseCombobox] = useState(true)

  // Debounce the search to avoid too many API calls
  const debounceTimeout = React.useRef<NodeJS.Timeout>()

  const searchTools = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setOptions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tools/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const templates: ToolTemplate[] = await response.json()
        const comboboxOptions: ComboboxOption[] = templates.map((template) => ({
          value: template.name,
          label: template.name,
          template, // Store the full template data
        }))
        setOptions(comboboxOptions)
      } else {
        console.error('Failed to search tools:', response.statusText)
        setOptions([])
      }
    } catch (error) {
      console.error('Error searching tools:', error)
      setOptions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }
    
    debounceTimeout.current = setTimeout(() => {
      searchTools(query)
    }, 300)
  }, [searchTools])

  const handleValueChange = (newValue: string) => {
    onChange(newValue)
    setSearchQuery(newValue)
    
    // Trigger search for templates
    if (useCombobox) {
      debouncedSearch(newValue)
    }
  }

  const handleTemplateSelect = (option: ComboboxOption | null) => {
    if (option?.template) {
      // Template was selected
      onTemplateSelect?.(option.template as ToolTemplate)
    } else {
      // Custom value entered or no template selected
      onTemplateSelect?.(null)
    }
  }

  const toggleInputMode = () => {
    setUseCombobox(!useCombobox)
    setOptions([])
    setSearchQuery("")
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  // Initialize search if there's an initial value
  useEffect(() => {
    if (value && useCombobox) {
      setSearchQuery(value)
      debouncedSearch(value)
    }
  }, [value, useCombobox, debouncedSearch])

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="tool-name">
          {label} {required && "*"}
        </Label>
        <button
          type="button"
          onClick={toggleInputMode}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          {useCombobox ? "Enter manually" : "Search templates"}
        </button>
      </div>
      
      {useCombobox ? (
        <Combobox
          options={options}
          value={value}
          onValueChange={handleValueChange}
          onSelect={handleTemplateSelect}
          placeholder={placeholder}
          emptyText="No tools found. Try a different search term."
          searchPlaceholder="Search for tools..."
          allowCustomValue={true}
          isLoading={isLoading}
          disabled={disabled}
          className="w-full"
        />
      ) : (
        <Input
          id="tool-name"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            onTemplateSelect?.(null) // Clear template when manually typing
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full"
        />
      )}
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      {useCombobox && (
        <p className="text-xs text-muted-foreground">
          Start typing to search for tools, or click "Enter manually" to type a custom name
        </p>
      )}
    </div>
  )
}
