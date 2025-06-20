"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExportDataButtonProps {
  data: any[]
  filename: string
  label?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function ExportDataButton({ data, filename, label = "Export", variant = "outline" }: ExportDataButtonProps) {
  const { toast } = useToast()
  const [exporting, setExporting] = useState(false)

  const exportToCSV = () => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export",
        variant: "destructive",
      })
      return
    }

    setExporting(true)

    try {
      // Convert data to CSV format
      const headers = Object.keys(data[0]).join(",")
      const rows = data.map((item) => {
        return Object.values(item)
          .map((value) => {
            // Handle values that might contain commas or quotes
            if (value === null || value === undefined) {
              return ""
            }
            const stringValue = String(value)
            if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
              return `"${stringValue.replace(/"/g, '""')}"`
            }
            return stringValue
          })
          .join(",")
      })
      const csvContent = [headers, ...rows].join("\n")

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: `Data has been exported to ${filename}.csv`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting data",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button variant={variant} onClick={exportToCSV} disabled={exporting || data.length === 0}>
      <FileDown className="mr-2 h-4 w-4" />
      {exporting ? "Exporting..." : label}
    </Button>
  )
}
