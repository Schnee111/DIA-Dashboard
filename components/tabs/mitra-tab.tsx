"use client"

import { useState, useEffect } from "react"
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

interface MitraTabProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterYearFrom: string
  filterYearTo: string
  toast: (options: any) => void
}

export function MitraTab({ searchTerm, setSearchTerm, filterYearFrom, filterYearTo, toast }: MitraTabProps) {
  const { mitraData, negaraData, jenisPartnerData, loading, refreshData } = useDataFetch()
  const formHandlers = useFormHandlers(toast, refreshData)

  const [filterJenisPartner, setFilterJenisPartner] = useState("all")
  const [filterNegara, setFilterNegara] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Get unique values for filters
  const uniqueJenisPartner = Array.from(new Set(mitraData.map((item) => item.jenis_partner_nama).filter(Boolean)))
  const uniqueNegara = Array.from(new Set(mitraData.map((item) => item.nama_negara).filter(Boolean)))

  // Filter data
  const filteredData = mitraData.filter((item) => {
    const matchesSearch =
      (item.nama_mitra?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.alamat?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesJenisPartner = filterJenisPartner === "all" || item.jenis_partner_nama === filterJenisPartner
    const matchesNegara = filterNegara === "all" || item.nama_negara === filterNegara

    return matchesSearch && matchesJenisPartner && matchesNegara
  })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterJenisPartner, filterNegara])

  // Define form fields
  const mitraFields: Field[] = [
    {
      name: "nama_mitra",
      label: "Nama Mitra",
      type: "text",
      placeholder: "Masukkan nama mitra",
      section: "Informasi Dasar",
      required: true,
    },
    {
      name: "negara_id",
      label: "Negara",
      type: "select",
      placeholder: "Pilih negara",
      section: "Informasi Dasar",
      options: negaraData.map((negara) => ({
        value: negara.negara_id.toString(),
        label: negara.nama_negara,
      })),
      required: true,
    },
    {
      name: "jenis_partner_id",
      label: "Jenis Partner",
      type: "select",
      placeholder: "Pilih jenis partner",
      section: "Informasi Dasar",
      options: jenisPartnerData.map((jenis) => ({
        value: jenis.jenis_partner_id.toString(),
        label: jenis.nama_jenis,
      })),
      required: true,
    },
    {
      name: "alamat",
      label: "Alamat",
      type: "textarea",
      placeholder: "Masukkan alamat lengkap",
      section: "Informasi Dasar",
      className: "md:col-span-2",
    },
  ]

  // Define table columns
  const columns = [
    { key: "nama_mitra", label: "Nama Mitra", sortable: true },
    { key: "nama_negara", label: "Negara", sortable: true },
    { key: "jenis_partner_nama", label: "Jenis Partner", sortable: true },
    { key: "alamat", label: "Alamat", sortable: false, truncate: true },
  ]

  // Define view fields
  const viewFields = [
    { key: "nama_mitra", label: "Nama Mitra" },
    { key: "nama_negara", label: "Negara" },
    { key: "jenis_partner_nama", label: "Jenis Partner" },
    { key: "alamat", label: "Alamat", fullWidth: true },
  ]

  const handleEdit = (item: any) => {

    // MAPPING: Cari ID berdasarkan nama
    const negaraId = negaraData.find((negara) => negara.nama_negara === item.nama_negara)?.negara_id
    const jenisPartnerId = jenisPartnerData.find(
      (jenis) => jenis.nama_jenis === item.jenis_partner_nama,
    )?.jenis_partner_id

    console.log("🔍 ID Mapping:", {
      nama_negara: item.nama_negara,
      found_negara_id: negaraId,
      jenis_partner_nama: item.jenis_partner_nama,
      found_jenis_partner_id: jenisPartnerId,
    })

    formHandlers.setSelectedMitra(item)

    // PENTING: Untuk form state, kita tetap pakai string (karena form input expect string)
    // Tapi untuk type compatibility, kita buat object yang match MitraData
    const formData = {
      nama_mitra: item.nama_mitra || "",
      alamat: item.alamat || "",
      // Convert ke number untuk type compatibility, tapi form akan handle sebagai string
      negara_id: negaraId || undefined,
      jenis_partner_id: jenisPartnerId || undefined,
    }

    formHandlers.setNewMitra(formData)
    formHandlers.setIsEditMitraOpen(true)
  }

  const handleView = (item: any) => {
    formHandlers.setSelectedMitra(item)
    formHandlers.setIsViewMitraOpen(true)
  }

  const handleDelete = (item: any) => {
    formHandlers.setSelectedMitra(item)
    formHandlers.setIsDeleteMitraOpen(true)
  }

  const handleExport = () => {
    const result = exportToCSV(filteredData, "mitra_data")
    toast({
      title: result.success ? "✅ Berhasil" : "❌ Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Daftar Mitra</CardTitle>
            <CardDescription>Kelola data mitra yang terdaftar dalam sistem</CardDescription>
          </div>
          <Button onClick={() => formHandlers.setIsAddMitraOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Mitra
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filters={[
              {
                value: filterJenisPartner,
                onChange: setFilterJenisPartner,
                options: [
                  { value: "all", label: "Semua Jenis" },
                  ...uniqueJenisPartner.map((jenis) => ({ value: jenis, label: jenis })),
                ],
                label: "Filter Jenis",
              },
              {
                value: filterNegara,
                onChange: setFilterNegara,
                options: [
                  { value: "all", label: "Semua Negara" },
                  ...uniqueNegara.map((negara) => ({ value: negara, label: negara })),
                ],
                label: "Filter Negara",
              },
            ]}
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
            emptyMessage="Tidak ada data mitra yang ditemukan"
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
        title="Tambah Mitra Baru"
        description="Isi form berikut untuk menambahkan mitra baru ke dalam sistem"
        fields={mitraFields}
        values={formHandlers.newMitra}
        onChange={formHandlers.handleInputChange}
        onSelectChange={formHandlers.handleSelectChange}
        onSubmit={formHandlers.handleAddMitra}
        open={formHandlers.isAddMitraOpen}
        onOpenChange={formHandlers.setIsAddMitraOpen}
        formType="mitra"
      />

      {/* Edit Dialog */}
      <AddEditDialog
        title="Edit Mitra"
        description="Edit informasi mitra dalam sistem"
        fields={mitraFields}
        values={formHandlers.newMitra}
        onChange={formHandlers.handleInputChange}
        onSelectChange={formHandlers.handleSelectChange}
        onSubmit={formHandlers.handleEditMitra}
        open={formHandlers.isEditMitraOpen}
        onOpenChange={formHandlers.setIsEditMitraOpen}
        formType="mitra"
      />

      {/* View Dialog */}
      <ViewDialog
        title="Detail Mitra"
        data={formHandlers.selectedMitra}
        fields={viewFields}
        open={formHandlers.isViewMitraOpen}
        onOpenChange={formHandlers.setIsViewMitraOpen}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={formHandlers.isDeleteMitraOpen}
        onOpenChange={formHandlers.setIsDeleteMitraOpen}
        onConfirm={formHandlers.handleDeleteMitra}
        title="Hapus Mitra"
        description="Apakah Anda yakin ingin menghapus mitra ini? Semua data terkait akan ikut terhapus."
        itemName={formHandlers.selectedMitra?.nama_mitra}
      />
    </Card>
  )
}
