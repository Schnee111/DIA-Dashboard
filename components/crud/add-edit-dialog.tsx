"use client"

import type React from "react"

// components/dashboard/add-edit-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect } from "@/components/crud/searchable-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import type { Field } from "@/types"
import { Button } from "../ui/button"
import { useState, useEffect } from "react"

interface AddEditDialogProps {
  title: string
  description: string
  fields: Field[]
  values: { [key: string]: any }
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    formType?: "mitra" | "kerjasama" | "personel" | "jabatan",
  ) => void
  onSelectChange: (name: string, value: string, formType?: "mitra" | "kerjasama" | "personel" | "jabatan") => void
  onSubmit: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
  formType?: "mitra" | "kerjasama" | "personel" | "jabatan"
}

export function AddEditDialog({
  title,
  description,
  fields,
  values,
  onChange,
  onSelectChange,
  onSubmit,
  open,
  onOpenChange,
  formType = "mitra",
}: AddEditDialogProps) {
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (open) {
      setError("")
      setShowSuccess(false)
    }
  }, [open])

  // Update debugSelectValue function:
  const debugSelectValue = (fieldName: string, value: any, options: any[]) => {
    console.log(`🔍 Debug ${fieldName}:`, {
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
  }

  // Simple validation - hanya saat submit
  const validateAndSubmit = async () => {
    // Check required fields
    const missingFields = fields
      .filter((field) => field.required)
      .filter((field) => {
        const value = values[field.name]
        return !value || (typeof value === "string" && value.trim() === "")
      })
      .map((field) => field.label)

    if (missingFields.length > 0) {
      setError(`Field wajib: ${missingFields.join(", ")}`)
      return
    }

    // Date validation
    if (values.tanggal_mulai && values.tanggal_berakhir) {
      if (new Date(values.tanggal_mulai) >= new Date(values.tanggal_berakhir)) {
        setError("Tanggal berakhir harus setelah tanggal mulai")
        return
      }
    }

    setError("")
    setIsSubmitting(true)

    try {
      await onSubmit()
      setShowSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setShowSuccess(false)
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: Field) => {
    const { name, label, type, placeholder, options, className } = field
    const value = values[name] || ""

    // Debug select fields
    if ((type === "select" || type === "searchable-select") && open) {
      debugSelectValue(name, value, options || [])
    }

    switch (type) {
      case "text":
      case "email":
      case "number":
        return (
          <div key={name} className={className}>
            <label className="block text-sm font-medium mb-1">
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              name={name}
              value={value}
              onChange={(e) => onChange(e, formType)}
              placeholder={placeholder}
              type={type}
            />
          </div>
        )
      case "textarea":
        return (
          <div key={name} className={className}>
            <label className="block text-sm font-medium mb-1">
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Textarea name={name} value={value} onChange={(e) => onChange(e, formType)} placeholder={placeholder} />
          </div>
        )
      case "select":
        return (
          <div key={name} className={className}>
            <label className="block text-sm font-medium mb-1">
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Select value={value?.toString() || ""} onValueChange={(val) => onSelectChange(name, val, formType)}>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      case "searchable-select":
        return (
          <div key={name} className={className}>
            <label className="block text-sm font-medium mb-1">
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <SearchableSelect
              options={options || []}
              value={value?.toString() || ""} // Convert to string for matching
              onValueChange={(val) => {
                // Handle null values safely
                const safeVal = val?.toString() || ""
                onSelectChange(name, safeVal, formType)
              }}
              placeholder={placeholder}
            />
          </div>
        )
      case "date":
        return (
          <div key={name} className={className}>
            <label className="block text-sm font-medium mb-1">
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input name={name} value={value || ""} onChange={(e) => onChange(e, formType)} type="date" />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {showSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">✅ Data berhasil disimpan!</AlertDescription>
            </Alert>
          )}
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {Object.entries(
            fields.reduce((acc: { [key: string]: Field[] }, field) => {
              acc[field.section] = acc[field.section] || []
              acc[field.section].push(field)
              return acc
            }, {}),
          ).map(([section, sectionFields]) => (
            <div key={section}>
              <h3 className="text-lg font-semibold mb-2">{section}</h3>
              <div className="grid gap-4 md:grid-cols-2">{sectionFields.map(renderField)}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={validateAndSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
