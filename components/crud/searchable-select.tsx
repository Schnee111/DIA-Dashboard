"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Option {
  value: string | number
  label: string
}

interface SearchableSelectProps {
  options: Option[]
  value?: string | number | null | undefined
  onValueChange: (value: string | number) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  onAddNew?: () => void
  addNewText?: string
  className?: string
  disabled?: boolean
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  onAddNew,
  addNewText = "Add new",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)

  // Debug logging
  console.log("🔍 SearchableSelect Debug:", {
    value,
    valueType: typeof value,
    valueString: value?.toString(),
    optionsCount: options?.length || 0,
    firstFewOptions: options?.slice(0, 3).map((opt) => ({
      value: opt.value,
      valueType: typeof opt.value,
      valueString: opt.value?.toString(),
      label: opt.label,
    })),
    hasExactMatch: options?.some((opt) => opt.value === value),
    hasStringMatch: options?.some((opt) => opt.value.toString() === value?.toString()),
  })

  const selectedOption = options.find((option) => option.value.toString() === value?.toString())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            {/* Sticky Add New Button at the top */}
            {onAddNew && (
              <div className="sticky top-0 z-10 bg-white border-b p-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onAddNew()
                    setOpen(false)
                  }}
                  className="w-full h-8"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {addNewText}
                </Button>
              </div>
            )}

            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-4">
                <span className="text-sm text-muted-foreground">{emptyText}</span>
              </div>
            </CommandEmpty>

            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.toString() === option.value.toString() ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
