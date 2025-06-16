/**
 * Utility functions for exporting data
 */

/**
 * Convert data to CSV format and trigger download
 * @param data Array of objects to export
 * @param filename Name of the file to download (without extension)
 * @returns void
 */
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) {
    throw new Error("No data to export")
  }

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

    // Clean up
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Export error:", error)
    throw error
  }
}

/**
 * Convert data to Excel format and trigger download
 * This is a simplified version that creates a CSV that Excel can open
 * For a true Excel file, you would need a library like exceljs or xlsx
 * @param data Array of objects to export
 * @param filename Name of the file to download (without extension)
 * @returns void
 */
export function exportToExcel(data: any[], filename: string): void {
  return exportToCSV(data, filename)
}

/**
 * Format date for display
 * @param dateString Date string to format
 * @param format Format to use (default: 'id-ID')
 * @returns Formatted date string
 */
export function formatDate(dateString?: string, format = "id-ID"): string {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString(format)
  } catch (error) {
    return dateString
  }
}
