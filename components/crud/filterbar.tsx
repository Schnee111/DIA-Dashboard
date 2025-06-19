"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, FileDown } from "lucide-react"

interface Filter {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}

interface FilterBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filters: Filter[]
  onExport: () => void
  exportDisabled: boolean
  showYearFilter?: boolean
  yearFrom?: string
  yearTo?: string
  onYearFromChange?: (value: string) => void
  onYearToChange?: (value: string) => void
}

export function FilterBar({
  searchTerm,
  setSearchTerm,
  filters,
  onExport,
  exportDisabled,
  showYearFilter,
  yearFrom,
  yearTo,
  onYearFromChange,
  onYearToChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Cari..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter, index) => (
          <Select key={index} value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={filter.placeholder || filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        <Button variant="outline" onClick={onExport} disabled={exportDisabled}>
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  )
}
