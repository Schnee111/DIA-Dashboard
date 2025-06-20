"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Option {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: Option[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Pilih opsi...",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value || "")

  // Update internal value when external value changes
  React.useEffect(() => {
    setInternalValue(value || "")
  }, [value])

  // Listen for auto-select events
  React.useEffect(() => {
    const handleAutoSelect = (event: CustomEvent) => {
      const newValue = event.detail.value
      setInternalValue(newValue)
      onValueChange(newValue)
    }

    const element = document.querySelector(`[data-field="${placeholder}"]`)
    if (element) {
      element.addEventListener("autoSelect", handleAutoSelect as EventListener)
      return () => {
        element.removeEventListener("autoSelect", handleAutoSelect as EventListener)
      }
    }
  }, [placeholder, onValueChange])

  const selectedOption = options.find((option) => option.value === internalValue)

  const handleSelect = (selectedLabel: string) => {
    // Find the option by label since CommandItem uses label as value for search
    const selectedOption = options.find((option) => option.label === selectedLabel)
    if (selectedOption) {
      const newValue = selectedOption.value === internalValue ? "" : selectedOption.value
      setInternalValue(newValue)
      onValueChange(newValue)
    }
    setOpen(false)
  }

  return (
    <div data-field={placeholder} className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Cari ${placeholder.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>Tidak ada data ditemukan.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label} // Use label for search functionality
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", internalValue === option.value ? "opacity-100" : "opacity-0")}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
