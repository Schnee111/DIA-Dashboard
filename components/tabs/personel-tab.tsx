"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/crud/data-table"
import { AddEditDialog } from "@/components/crud/add-edit-dialog"
import { ViewDialog } from "@/components/crud/view-dialog"
import { FilterBar } from "@/components/crud/filterbar"
import { DeleteConfirmationDialog } from "@/components/crud/delete-confirmation-dialog"
import { useDataFetch } from "@/hooks/use-data-fetch"
import { useFormHandlers } from "@/hooks/use-form-handlers"
import type { Field } from "@/types"
import { exportToCSV } from "@/lib/dataService"

interface PersonelTabProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterYearFrom: string
  filterYearTo: string
  toast: (options: any) => void
}

export function PersonelTab({ searchTerm, setSearchTerm, filterYearFrom, filterYearTo, toast }: PersonelTabProps) {
  const { personelData, jabatanData, loading, refreshData } = useDataFetch()
  const formHandlers = useFormHandlers(toast, refreshData)

  const [filterPihak, setFilterPihak] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Helper functions for options
  const getJabatanOptions = useMemo(
    () => (pihak?: "UPI" | "MITRA") =>
      jabatanData
        .filter((jabatan) => !pihak || jabatan.pihak === pihak)
        .map((jabatan) => ({
          value: jabatan.jabatan_id.toString(),
          label: `${jabatan.nama_jabatan} (${jabatan.pihak})`,
        })),
    [jabatanData],
  )

  // Filter data with year range
  const filteredData = personelData.filter((item) => {
    const matchesSearch =
      (item.nama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.kontak?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.nama_jabatan?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesPihak = filterPihak === "all" || item.pihak === filterPihak

    return matchesSearch && matchesPihak
  })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterPihak, filterYearFrom, filterYearTo])

  // Define form fields
  const personelFields: Field[] = useMemo(
    () => [
      {
        name: "nama",
        label: "Nama Lengkap",
        type: "text",
        placeholder: "Masukkan nama lengkap",
        section: "Informasi Dasar",
        required: true,
      },
      {
        name: "pihak",
        label: "Pihak",
        type: "select",
        placeholder: "Pilih pihak",
        section: "Informasi Dasar",
        options: [
          { value: "UPI", label: "UPI" },
          { value: "MITRA", label: "MITRA" },
        ],
        required: true,
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "Masukkan email",
        section: "Informasi Kontak",
        className: "md:col-span-2",
      },
      {
        name: "kontak",
        label: "Kontak",
        type: "text",
        placeholder: "Masukkan kontak",
        section: "Informasi Kontak",
        className: "md:col-span-2",
      },
      {
        name: "jabatan_id",
        label: "Jabatan",
        type: "searchable-select",
        placeholder: "Pilih jabatan",
        section: "Informasi Jabatan",
        options: getJabatanOptions(),
        required: true,
      },
    ],
    [getJabatanOptions],
  )

  // Define table columns
  const columns = [
    { key: "nama", label: "Nama", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "kontak", label: "Kontak", sortable: false },
    { key: "nama_jabatan", label: "Jabatan", sortable: true },
    { key: "pihak", label: "Pihak", sortable: true },
    {
      key: "created_at",
      label: "Tanggal Dibuat",
      sortable: true,
      render: (value: string) => (value ? new Date(value).toLocaleDateString("id-ID") : "-"),
    },
  ]

  // Define view fields
  const viewFields = [
    { key: "nama", label: "Nama Lengkap" },
    { key: "pihak", label: "Pihak" },
    { key: "email", label: "Email", fullWidth: true },
    { key: "kontak", label: "Kontak", fullWidth: true },
    { key: "nama_jabatan", label: "Jabatan" },
    {
      key: "created_at",
      label: "Tanggal Dibuat",
      render: (value: string) => (value ? new Date(value).toLocaleDateString("id-ID") : "-"),
    },
  ]

  const handleEdit = (item: any) => {
    console.log("🔍 Edit Personel Data:", item) // Debug log
    formHandlers.prepareEditPersonel(item, jabatanData)
  }

  const handleView = (item: any) => {
    formHandlers.setSelectedPersonel(item)
    formHandlers.setIsViewPersonelOpen(true)
  }

  const handleDelete = (item: any) => {
    formHandlers.setSelectedPersonel(item)
    formHandlers.setIsDeletePersonelOpen(true)
  }

  const handleExport = () => {
    const result = exportToCSV(filteredData, "personel_data")
    toast({
      title: result.success ? "✅ Berhasil" : "❌ Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
  }

  const filters = [
    {
      value: filterPihak,
      onChange: setFilterPihak,
      options: [
        { value: "all", label: "Semua Pihak" },
        { value: "UPI", label: "UPI" },
        { value: "MITRA", label: "MITRA" },
      ],
      label: "Filter Pihak",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Daftar Personel</CardTitle>
            <CardDescription>Kelola data personel yang terdaftar dalam sistem</CardDescription>
          </div>
          <Button onClick={() => formHandlers.setIsAddPersonelOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Personel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filters={filters}
            onExport={handleExport}
            exportDisabled={filteredData.length === 0}
          />

          <DataTable
            data={currentData}
            columns={columns}
            loading={loading}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            emptyMessage="Tidak ada data personel yang ditemukan"
          />

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} dari{" "}
                {filteredData.length} data
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </Button>
                <div className="flex items-center">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                    } else {
                      pageNumber = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        className="mx-1 w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Add Dialog */}
      <AddEditDialog
        title="Tambah Personel Baru"
        description="Isi form berikut untuk menambahkan personel baru ke dalam sistem"
        fields={personelFields}
        editData={{}} // Empty for add mode
        onSubmit={formHandlers.handleAddPersonel}
        open={formHandlers.isAddPersonelOpen}
        onOpenChange={formHandlers.setIsAddPersonelOpen}
        formType="personel"
        formRef={formHandlers.personelFormRef}
      />

      {/* Edit Dialog */}
      <AddEditDialog
        title="Edit Personel"
        description="Edit informasi personel dalam sistem"
        fields={personelFields}
        editData={formHandlers.editPersonelData} // Pre-filled data for edit mode
        onSubmit={formHandlers.handleEditPersonel}
        open={formHandlers.isEditPersonelOpen}
        onOpenChange={formHandlers.setIsEditPersonelOpen}
        formType="personel"
        formRef={formHandlers.personelFormRef}
      />

      {/* View Dialog */}
      <ViewDialog
        title="Detail Personel"
        data={formHandlers.selectedPersonel}
        fields={viewFields}
        open={formHandlers.isViewPersonelOpen}
        onOpenChange={formHandlers.setIsViewPersonelOpen}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={formHandlers.isDeletePersonelOpen}
        onOpenChange={formHandlers.setIsDeletePersonelOpen}
        onConfirm={formHandlers.handleDeletePersonel}
        title="Hapus Personel"
        description="Apakah Anda yakin ingin menghapus personel ini? Semua data terkait akan ikut terhapus."
        itemName={formHandlers.selectedPersonel?.nama}
      />
    </Card>
  )
}
