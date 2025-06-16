"use client"

import * as React from "react"
import { Plus, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface QuickAddInputProps {
  onAdd: (value: string) => Promise<void>
  placeholder?: string
  addText?: string
  className?: string
}

export function QuickAddInput({
  onAdd,
  placeholder = "Enter new item...",
  addText = "Add",
  className,
}: QuickAddInputProps) {
  const [isAdding, setIsAdding] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleAdd = async () => {
    if (!value.trim()) return

    setIsLoading(true)
    try {
      await onAdd(value.trim())
      setValue("")
      setIsAdding(false)
    } catch (error) {
      console.error("Error adding item:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setValue("")
    setIsAdding(false)
  }

  if (!isAdding) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className={cn("h-8", className)}>
        <Plus className="mr-2 h-4 w-4" />
        {addText}
      </Button>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-8"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            handleAdd()
          } else if (e.key === "Escape") {
            handleCancel()
          }
        }}
        autoFocus
      />
      <Button size="sm" onClick={handleAdd} disabled={!value.trim() || isLoading} className="h-8 px-2">
        <Check className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={handleCancel} className="h-8 px-2">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
