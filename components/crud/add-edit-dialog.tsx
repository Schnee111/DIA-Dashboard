"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import type { Field } from "@/types"
import { Button } from "../ui/button"
import { useState, useEffect } from "react"

interface AddEditDialogProps {
  title: string
  description: string
  fields: Field[]
  editData?: { [key: string]: any }
  onSubmit: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
  formType?: "mitra" | "kerjasama" | "personel" | "jabatan"
  formRef: React.RefObject<HTMLFormElement | null>
}

export function AddEditDialog({
  title,
  description,
  fields,
  editData = {},
  onSubmit,
  open,
  onOpenChange,
  formType = "mitra",
  formRef,
}: AddEditDialogProps) {
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (open) {
      setError("")
      setShowSuccess(false)
    } else {
      // Reset form when closing
      formRef.current?.reset()
    }
  }, [open, formRef])

  // Set default values for edit mode
  useEffect(() => {
    if (open && Object.keys(editData).length > 0 && formRef.current) {
      // Small delay to ensure form is rendered
      setTimeout(() => {
        Object.entries(editData).forEach(([key, value]) => {
          const input = formRef.current?.querySelector(`[name="${key}"]`) as
            | HTMLInputElement
            | HTMLSelectElement
            | HTMLTextAreaElement
          if (input && value !== null && value !== undefined) {
            input.value = value.toString()

            // Trigger change event for select components
            if (input.tagName === "SELECT") {
              input.dispatchEvent(new Event("change", { bubbles: true }))
            }
          }
        })
      }, 100)
    }
  }, [open, editData, formRef])

  const validateAndSubmit = async () => {
    if (!formRef.current) return

    // Get form data
    const formData = new FormData(formRef.current)
    const data: { [key: string]: any } = {}

    for (const [key, value] of formData.entries()) {
      data[key] = value
    }

    // Check required fields
    const missingFields = fields
      .filter((field) => field.required)
      .filter((field) => {
        const value = data[field.name]
        return !value || (typeof value === "string" && value.trim() === "")
      })
      .map((field) => field.label)

    if (missingFields.length > 0) {
      setError(`Field wajib: ${missingFields.join(", ")}`)
      return
    }

    // Date validation
    if (data.tanggal_mulai && data.tanggal_berakhir) {
      if (new Date(data.tanggal_mulai) >= new Date(data.tanggal_berakhir)) {
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
    const defaultValue = editData[name] || ""

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
            <Input name={name} defaultValue={defaultValue} placeholder={placeholder} type={type} />
          </div>
        )
      case "textarea":
        return (
          <div key={name} className={className}>
            <label className="block text-sm font-medium mb-1">
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Textarea name={name} defaultValue={defaultValue} placeholder={placeholder} />
          </div>
        )
      case "select":
        return (
          <div key={name} className={className}>
            <label className="block text-sm font-medium mb-1">
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              name={name}
              defaultValue={defaultValue}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{placeholder}</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )
      case "searchable-select":
        return (
          <div key={name} className={className}>
            <label className="block text-sm font-medium mb-1">
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              name={name}
              defaultValue={defaultValue}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{placeholder}</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )
      case "date":
        return (
          <div key={name} className={className}>
            <label className="block text-sm font-medium mb-1">
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input name={name} defaultValue={defaultValue} type="date" />
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

        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
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
        </form>

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
