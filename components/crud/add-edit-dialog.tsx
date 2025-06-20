"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, Plus } from "lucide-react"
import type { Field } from "@/types"
import { Button } from "../ui/button"
import { SearchableSelect } from "./searchable-select"
import { useState, useEffect, useCallback } from "react"

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
  // Add new props for handling related data additions
  onAddMitra?: () => void
  onAddPersonel?: () => void
  onAddJenisDokumen?: () => void
  onAddJabatan?: () => void
  onAddNegara?: () => void
  onAddJenisPartner?: () => void
  // Loading states
  isLoading?: boolean
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
  onAddMitra,
  onAddPersonel,
  onAddJenisDokumen,
  onAddJabatan,
  onAddNegara,
  onAddJenisPartner,
  isLoading = false,
}: AddEditDialogProps) {
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [searchableSelectValues, setSearchableSelectValues] = useState<{ [key: string]: string }>({})

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (open) {
      setError("")
      setShowSuccess(false)
      setIsSubmitting(false)
    } else {
      // Reset form when closing
      formRef.current?.reset()
      setSearchableSelectValues({})
    }
  }, [open, formRef])

  // Initialize searchable select values from editData - separate useEffect
  useEffect(() => {
    if (open && Object.keys(editData).length > 0) {
      const initialValues: { [key: string]: string } = {}
      fields.forEach((field) => {
        if (field.type === "searchable-select" && editData[field.name]) {
          initialValues[field.name] = editData[field.name].toString()
        }
      })

      // Only update if values are different to prevent infinite loop
      setSearchableSelectValues((prev) => {
        const hasChanges =
          Object.keys(initialValues).some((key) => prev[key] !== initialValues[key]) ||
          Object.keys(prev).length !== Object.keys(initialValues).length

        return hasChanges ? initialValues : prev
      })
    }
  }, [open, JSON.stringify(editData)]) // Use JSON.stringify for stable comparison

  // Set default values for edit mode and new entries
  useEffect(() => {
    if (open && formRef.current) {
      // Small delay to ensure form is rendered
      const timeoutId = setTimeout(() => {
        // Set edit data values if available
        if (Object.keys(editData).length > 0) {
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
        } else {
          // Set default values for new entries (when editData is empty)
          fields.forEach((field) => {
            if (field.defaultValue) {
              const input = formRef.current?.querySelector(`[name="${field.name}"]`) as
                | HTMLInputElement
                | HTMLSelectElement
                | HTMLTextAreaElement
              if (input) {
                // For date fields, use the function result if it's a function
                const defaultValue =
                  typeof field.defaultValue === "function" ? field.defaultValue() : field.defaultValue
                input.value = defaultValue

                // Trigger change event for select components
                if (input.tagName === "SELECT") {
                  input.dispatchEvent(new Event("change", { bubbles: true }))
                }
              }
            }
          })
        }
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [open, JSON.stringify(editData), formRef, fields])

  const validateAndSubmit = useCallback(async () => {
    if (!formRef.current) return

    // Get form data
    const formData = new FormData(formRef.current)
    const data: { [key: string]: any } = {}

    for (const [key, value] of formData.entries()) {
      data[key] = value
    }

    // Add searchable select values
    Object.entries(searchableSelectValues).forEach(([key, value]) => {
      if (value) {
        data[key] = value
      }
    })

    // Check required fields
    const missingFields = fields
      .filter((field) => field.required)
      .filter((field) => {
        const value = data[field.name]
        return !value || (typeof value === "string" && value.trim() === "")
      })
      .map((field) => field.label)

    if (missingFields.length > 0) {
      setError(`Field wajib belum diisi: ${missingFields.join(", ")}`)
      return
    }

    // Date validation
    if (data.tanggal_mulai && data.tanggal_berakhir) {
      if (new Date(data.tanggal_mulai) >= new Date(data.tanggal_berakhir)) {
        setError("Tanggal berakhir harus setelah tanggal mulai")
        return
      }
    }

    // Email validation
    if (data.email && data.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        setError("Format email tidak valid")
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
      }, 1500)
    } catch (err: any) {
      console.error("Form submission error:", err)
      setError(err.message || "Gagal menyimpan data. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }, [formRef, searchableSelectValues, fields, onSubmit, onOpenChange])

  const renderAddButton = useCallback(
    (fieldName: string) => {
      if (fieldName === "mitra_id" && onAddMitra) {
        return (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddMitra}
            className="ml-2 px-2 py-1 h-8 bg-white text-black border-gray-300 hover:bg-gray-50"
            title="Tambah Mitra Baru"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )
      }

      if (
        (fieldName === "pj_upi" ||
          fieldName === "pj_mitra" ||
          fieldName === "penandatangan_upi" ||
          fieldName === "penandatangan_mitra") &&
        onAddPersonel
      ) {
        return (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddPersonel}
            className="ml-2 px-2 py-1 h-8 bg-white text-black border-gray-300 hover:bg-gray-50"
            title="Tambah Personel Baru"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )
      }

      if (fieldName === "jenis_dok_id" && onAddJenisDokumen) {
        return (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddJenisDokumen}
            className="ml-2 px-2 py-1 h-8 bg-white text-black border-gray-300 hover:bg-gray-50"
            title="Tambah Jenis Dokumen Baru"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )
      }

      if (fieldName === "jabatan_id" && onAddJabatan) {
        return (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddJabatan}
            className="ml-2 px-2 py-1 h-8 bg-white text-black border-gray-300 hover:bg-gray-50"
            title="Tambah Jabatan Baru"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )
      }

      if (fieldName === "negara_id" && onAddNegara) {
        return (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddNegara}
            className="ml-2 px-2 py-1 h-8 bg-white text-black border-gray-300 hover:bg-gray-50"
            title="Tambah Negara Baru"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )
      }

      if (fieldName === "jenis_partner_id" && onAddJenisPartner) {
        return (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddJenisPartner}
            className="ml-2 px-2 py-1 h-8 bg-white text-black border-gray-300 hover:bg-gray-50"
            title="Tambah Jenis Partner Baru"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )
      }

      return null
    },
    [onAddMitra, onAddPersonel, onAddJenisDokumen, onAddJabatan, onAddNegara, onAddJenisPartner, isSubmitting],
  )

  const handleSearchableSelectChange = useCallback((fieldName: string, value: string) => {
    setSearchableSelectValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }, [])

  const renderField = useCallback(
    (field: Field) => {
      const { name, label, type, placeholder, options, className, defaultValue } = field
      const editValue = editData[name] || ""

      // Use editValue if available (edit mode), otherwise use defaultValue (add mode)
      const fieldValue = Object.keys(editData).length > 0 ? editValue : defaultValue || ""

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
                defaultValue={fieldValue}
                placeholder={placeholder}
                type={type}
                disabled={isSubmitting}
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
              <Textarea name={name} defaultValue={fieldValue} placeholder={placeholder} disabled={isSubmitting} />
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
                defaultValue={fieldValue}
                disabled={isSubmitting}
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
              <div className="flex items-center">
                <div className="flex-1" data-field={name}>
                  <SearchableSelect
                    options={options || []}
                    value={searchableSelectValues[name] || fieldValue}
                    onValueChange={(value) => handleSearchableSelectChange(name, value)}
                    placeholder={placeholder}
                    disabled={isSubmitting}
                  />
                  {/* Hidden input for form submission */}
                  <input type="hidden" name={name} value={searchableSelectValues[name] || fieldValue} />
                </div>
                {renderAddButton(name)}
              </div>
            </div>
          )
        case "date":
          return (
            <div key={name} className={className}>
              <label className="block text-sm font-medium mb-1">
                {label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Input name={name} defaultValue={fieldValue} type="date" disabled={isSubmitting} />
            </div>
          )
        default:
          return null
      }
    },
    [editData, searchableSelectValues, handleSearchableSelectChange, renderAddButton, isSubmitting],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {title}
          </DialogTitle>
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

          {/* Loading Alert */}
          {isLoading && (
            <Alert className="border-blue-200 bg-blue-50">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <AlertDescription className="text-blue-800">Sedang memproses data...</AlertDescription>
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
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="bg-white text-black border-gray-300 hover:bg-gray-50"
          >
            Batal
          </Button>
          <Button onClick={validateAndSubmit} disabled={isSubmitting || isLoading}>
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
