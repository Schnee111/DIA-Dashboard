"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/crud/data-table"
import { AddEditDialog } from "@/components/crud/add-edit-dialog"
import { ViewDialog } from "@/components/crud/view-dialog"
import { FilterBar } from "@/components/crud/filterbar"
import { useDataFetch } from "@/hooks/use-data-fetch"
import { useFormHandlers } from "@/hooks/use-form-handlers"
import type { Field } from "@/types"
import { exportToCSV } from "@/lib/dataService"
import { DeleteConfirmationDialog } from "@/components/crud/delete-confirmation-dialog"

interface KerjasamaTabProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterYearFrom: string
  filterYearTo: string
  toast: (options: any) => void
}

export function KerjasamaTab({ searchTerm, setSearchTerm, filterYearFrom, filterYearTo, toast }: KerjasamaTabProps) {
  const { kerjasamaData, mitraData, jenisDokumenData, personelData, loading, refreshData } = useDataFetch()
  const formHandlers = useFormHandlers(toast, refreshData)

  const [filterStatus, setFilterStatus] = useState("all")
  const [filterNegara, setFilterNegara] = useState("all")
  const [filterJenisDokumen, setFilterJenisDokumen] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Memoize unique values for filters to prevent recalculation
  const { uniqueNegara, uniqueJenisDokumen } = useMemo(() => {
    const negaraSet = new Set(kerjasamaData.map((item) => item.nama_negara).filter(Boolean))
    const jenisDokumenSet = new Set(kerjasamaData.map((item) => item.jenis_dokumen).filter(Boolean))

    return {
      uniqueNegara: Array.from(negaraSet),
      uniqueJenisDokumen: Array.from(jenisDokumenSet),
    }
  }, [kerjasamaData])

  // Memoize options to prevent recreation on every render
  const optionsData = useMemo(() => {
    const mitraOptions = mitraData.map((mitra) => ({
      value: mitra.mitra_id.toString(),
      label: `${mitra.nama_mitra} (${mitra.nama_negara})`,
    }))

    const jenisDokumenOptions = jenisDokumenData.map((jenis) => ({
      value: jenis.jenis_dok_id.toString(),
      label: jenis.nama_jenis,
    }))

    const personelUpiOptions = personelData
      .filter((personel) => personel.pihak === "UPI")
      .map((personel) => ({
        value: personel.personel_id.toString(),
        label: `${personel.nama} ${personel.nama_jabatan ? `- ${personel.nama_jabatan}` : ""} (${personel.pihak})`,
      }))

    const personelMitraOptions = personelData
      .filter((personel) => personel.pihak === "MITRA")
      .map((personel) => ({
        value: personel.personel_id.toString(),
        label: `${personel.nama} ${personel.nama_jabatan ? `- ${personel.nama_jabatan}` : ""} (${personel.pihak})`,
      }))

    return {
      mitraOptions,
      jenisDokumenOptions,
      personelUpiOptions,
      personelMitraOptions,
    }
  }, [mitraData, jenisDokumenData, personelData])

  // Memoize filtered data to prevent recalculation on every render
  const filteredData = useMemo(() => {
    return kerjasamaData.filter((item) => {
      const matchesSearch =
        (item.judul_kerjasama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.nama_mitra?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.bidang_kerjasama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.pelaksana?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.no_dokumen?.toLowerCase() || "").includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === "all" || item.status === filterStatus
      const matchesNegara = filterNegara === "all" || item.nama_negara === filterNegara
      const matchesJenisDokumen = filterJenisDokumen === "all" || item.jenis_dokumen === filterJenisDokumen

      return matchesSearch && matchesStatus && matchesNegara && matchesJenisDokumen
    })
  }, [kerjasamaData, searchTerm, filterStatus, filterNegara, filterJenisDokumen])

  // Memoize pagination data
  const paginationData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)

    return { currentData, totalPages, indexOfFirstItem, indexOfLastItem }
  }, [filteredData, currentPage, itemsPerPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, filterNegara, filterJenisDokumen, filterYearFrom, filterYearTo])

  // Memoize form fields to prevent recreation
  const kerjasamaFields: Field[] = useMemo(
    () => [
      // Basic Information Section
      {
        name: "no_dokumen",
        label: "Nomor Dokumen",
        type: "text",
        placeholder: "Masukkan nomor dokumen",
        section: "Informasi Dasar",
      },
      {
        name: "judul_kerjasama",
        label: "Judul Kerjasama",
        type: "text",
        placeholder: "Masukkan judul kerjasama",
        section: "Informasi Dasar",
        required: true,
        className: "md:col-span-2",
      },
      {
        name: "bidang_kerjasama",
        label: "Bidang Kerjasama",
        type: "text",
        placeholder: "Masukkan bidang kerjasama",
        section: "Informasi Dasar",
      },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        placeholder: "Masukkan tahun",
        section: "Informasi Dasar",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        placeholder: "Pilih status",
        section: "Informasi Dasar",
        options: [
          { value: "Aktif", label: "Aktif" },
          { value: "Tidak Aktif", label: "Tidak Aktif" },
          { value: "Draft", label: "Draft" },
          { value: "Berakhir", label: "Berakhir" },
        ],
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        placeholder: "Masukkan pelaksana",
        section: "Informasi Dasar",
      },

      // Partner and Document Information Section
      {
        name: "mitra_id",
        label: "Mitra",
        type: "searchable-select",
        placeholder: "Pilih mitra",
        section: "Informasi Mitra & Dokumen",
        options: optionsData.mitraOptions,
        required: true,
      },
      {
        name: "jenis_dok_id",
        label: "Jenis Dokumen",
        type: "searchable-select",
        placeholder: "Pilih jenis dokumen",
        section: "Informasi Mitra & Dokumen",
        options: optionsData.jenisDokumenOptions,
        required: true,
      },
      {
        name: "jumlah_pihak",
        label: "Jumlah Pihak",
        type: "number",
        placeholder: "Masukkan jumlah pihak",
        section: "Informasi Mitra & Dokumen",
      },

      // Dates Section
      {
        name: "tanggal_mulai",
        label: "Tanggal Mulai",
        type: "date",
        section: "Tanggal",
        required: true,
      },
      {
        name: "tanggal_berakhir",
        label: "Tanggal Berakhir",
        type: "date",
        section: "Tanggal",
        required: true,
      },
      {
        name: "tgl_input",
        label: "Tanggal Input",
        type: "date",
        section: "Tanggal",
      },
      {
        name: "tgl_lapor",
        label: "Tanggal Lapor",
        type: "date",
        section: "Tanggal",
      },

      // Personnel Section
      {
        name: "pj_upi",
        label: "PJ UPI",
        type: "searchable-select",
        placeholder: "Pilih PJ UPI",
        section: "Penanggung Jawab & Penandatangan",
        options: optionsData.personelUpiOptions,
      },
      {
        name: "pj_mitra",
        label: "PJ Mitra",
        type: "searchable-select",
        placeholder: "Pilih PJ Mitra",
        section: "Penanggung Jawab & Penandatangan",
        options: optionsData.personelMitraOptions,
      },
      {
        name: "penandatangan_upi",
        label: "Penandatangan UPI",
        type: "searchable-select",
        placeholder: "Pilih Penandatangan UPI",
        section: "Penanggung Jawab & Penandatangan",
        options: optionsData.personelUpiOptions,
      },
      {
        name: "penandatangan_mitra",
        label: "Penandatangan Mitra",
        type: "searchable-select",
        placeholder: "Pilih Penandatangan Mitra",
        section: "Penanggung Jawab & Penandatangan",
        options: optionsData.personelMitraOptions,
      },

      // Additional Information Section
      {
        name: "link_dokumen",
        label: "Link Dokumen",
        type: "text",
        placeholder: "Masukkan link dokumen (URL)",
        section: "Informasi Tambahan",
        className: "md:col-span-2",
      },
      {
        name: "output_kerjasama",
        label: "Output Kerjasama",
        type: "textarea",
        placeholder: "Masukkan output kerjasama",
        section: "Informasi Tambahan",
        className: "md:col-span-2",
      },
      {
        name: "catatan",
        label: "Catatan",
        type: "textarea",
        placeholder: "Masukkan catatan tambahan",
        section: "Informasi Tambahan",
        className: "md:col-span-2",
      },
      {
        name: "status_lapor",
        label: "Status Lapor",
        type: "select",
        placeholder: "Pilih status lapor",
        section: "Informasi Tambahan",
        options: [
          { value: "Sudah", label: "Sudah Lapor" },
          { value: "Belum", label: "Belum Lapor" },
        ],
      },
    ],
    [optionsData],
  )

  // Memoize table columns
  const columns = useMemo(
    () => [
      { key: "judul_kerjasama", label: "Judul Kerjasama", sortable: true, truncate: true },
      { key: "nama_mitra", label: "Mitra", sortable: true },
      { key: "nama_negara", label: "Negara", sortable: true },
      { key: "jenis_dokumen", label: "Jenis Dokumen", sortable: true },
      { key: "bidang_kerjasama", label: "Bidang", sortable: false, truncate: true },
      {
        key: "tanggal_mulai",
        label: "Tanggal Mulai",
        sortable: true,
        render: (value: string) => (value ? new Date(value).toLocaleDateString("id-ID") : "-"),
      },
      {
        key: "tanggal_berakhir",
        label: "Tanggal Berakhir",
        sortable: true,
        render: (value: string) => (value ? new Date(value).toLocaleDateString("id-ID") : "-"),
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (value: string) => (
          <Badge
            className={`${
              value === "Aktif"
                ? "bg-green-100 text-green-800"
                : value === "Draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : value === "Berakhir"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-red-100 text-red-800"
            }`}
          >
            {value}
          </Badge>
        ),
      },
    ],
    [],
  )

  // Memoize view fields
  const viewFields = useMemo(
    () => [
      { key: "judul_kerjasama", label: "Judul Kerjasama", fullWidth: true },
      { key: "nama_mitra", label: "Nama Mitra" },
      { key: "nama_negara", label: "Negara" },
      { key: "jenis_dokumen", label: "Jenis Dokumen" },
      { key: "bidang_kerjasama", label: "Bidang Kerjasama" },
      { key: "pelaksana", label: "Pelaksana" },
      {
        key: "status",
        label: "Status",
        render: (value: string) => (
          <Badge
            className={`${
              value === "Aktif"
                ? "bg-green-100 text-green-800"
                : value === "Draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : value === "Berakhir"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-red-100 text-red-800"
            }`}
          >
            {value}
          </Badge>
        ),
      },
      {
        key: "tanggal_mulai",
        label: "Tanggal Mulai",
        render: (value: string) => (value ? new Date(value).toLocaleDateString("id-ID") : "-"),
      },
      {
        key: "tanggal_berakhir",
        label: "Tanggal Berakhir",
        render: (value: string) => (value ? new Date(value).toLocaleDateString("id-ID") : "-"),
      },
      { key: "jumlah_pihak", label: "Jumlah Pihak" },
      { key: "no_dokumen", label: "Nomor Dokumen" },
      {
        key: "tgl_input",
        label: "Tanggal Input",
        render: (value: string) => (value ? new Date(value).toLocaleDateString("id-ID") : "-"),
      },
      {
        key: "tgl_lapor",
        label: "Tanggal Lapor",
        render: (value: string) => (value ? new Date(value).toLocaleDateString("id-ID") : "-"),
      },
      { key: "status_lapor", label: "Status Lapor" },
      {
        key: "link_dokumen",
        label: "Link Dokumen",
        fullWidth: true,
        render: (value: string) =>
          value ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {value}
            </a>
          ) : (
            "-"
          ),
      },
      { key: "catatan", label: "Catatan", fullWidth: true },
      { key: "output_kerjasama", label: "Output Kerjasama", fullWidth: true },
    ],
    [],
  )

  // Memoize event handlers
  const handleEdit = useCallback(
    (item: any) => {
      formHandlers.prepareEditKerjasama(item, mitraData, jenisDokumenData, personelData)
    },
    [formHandlers, mitraData, jenisDokumenData, personelData],
  )

  const handleView = useCallback(
    (item: any) => {
      formHandlers.setSelectedKerjasama(item)
      formHandlers.setIsViewKerjasamaOpen(true)
    },
    [formHandlers],
  )

  const handleDelete = useCallback(
    (item: any) => {
      formHandlers.setSelectedKerjasama(item)
      formHandlers.setIsDeleteKerjasamaOpen(true)
    },
    [formHandlers],
  )

  const handleExport = useCallback(() => {
    const result = exportToCSV(filteredData, "kerjasama_data")
    toast({
      title: result.success ? "✅ Berhasil" : "❌ Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
  }, [filteredData, toast])

  // Memoize filters
  const filters = useMemo(
    () => [
      {
        value: filterStatus,
        onChange: setFilterStatus,
        options: [
          { value: "all", label: "Semua Status" },
          { value: "Aktif", label: "Aktif" },
          { value: "Tidak Aktif", label: "Tidak Aktif" },
          { value: "Draft", label: "Draft" },
          { value: "Berakhir", label: "Berakhir" },
        ],
        label: "Filter Status",
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
      {
        value: filterJenisDokumen,
        onChange: setFilterJenisDokumen,
        options: [
          { value: "all", label: "Semua Jenis" },
          ...uniqueJenisDokumen.map((jenis) => ({ value: jenis, label: jenis })),
        ],
        label: "Filter Jenis",
      },
    ],
    [filterStatus, filterNegara, filterJenisDokumen, uniqueNegara, uniqueJenisDokumen],
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Daftar Kerjasama</CardTitle>
            <CardDescription>Kelola data kerjasama yang terdaftar dalam sistem</CardDescription>
          </div>
          <Button onClick={() => formHandlers.setIsAddKerjasamaOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kerjasama
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
            data={paginationData.currentData}
            columns={columns}
            loading={loading}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            emptyMessage="Tidak ada data kerjasama yang ditemukan"
          />

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Menampilkan {paginationData.indexOfFirstItem + 1}-
                {Math.min(paginationData.indexOfLastItem, filteredData.length)} dari {filteredData.length} data
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
                  {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                    let pageNumber
                    if (paginationData.totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= paginationData.totalPages - 2) {
                      pageNumber = paginationData.totalPages - 4 + i
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
                  disabled={currentPage === paginationData.totalPages}
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
        title="Tambah Kerjasama Baru"
        description="Isi form berikut untuk menambahkan kerjasama baru ke dalam sistem"
        fields={kerjasamaFields}
        onSubmit={formHandlers.handleAddKerjasama}
        open={formHandlers.isAddKerjasamaOpen}
        onOpenChange={formHandlers.setIsAddKerjasamaOpen}
        formType="kerjasama"
        formRef={formHandlers.kerjasamaFormRef}
      />

      {/* Edit Dialog */}
      <AddEditDialog
        title="Edit Kerjasama"
        description="Edit informasi kerjasama dalam sistem"
        fields={kerjasamaFields}
        editData={formHandlers.editKerjasamaData}
        onSubmit={formHandlers.handleEditKerjasama}
        open={formHandlers.isEditKerjasamaOpen}
        onOpenChange={formHandlers.setIsEditKerjasamaOpen}
        formType="kerjasama"
        formRef={formHandlers.kerjasamaFormRef}
      />

      {/* View Dialog */}
      <ViewDialog
        title="Detail Kerjasama"
        data={formHandlers.selectedKerjasama}
        fields={viewFields}
        open={formHandlers.isViewKerjasamaOpen}
        onOpenChange={formHandlers.setIsViewKerjasamaOpen}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={formHandlers.isDeleteKerjasamaOpen}
        onOpenChange={formHandlers.setIsDeleteKerjasamaOpen}
        onConfirm={formHandlers.handleDeleteKerjasama}
        title="Hapus Kerjasama"
        description="Apakah Anda yakin ingin menghapus kerjasama ini? Semua data terkait akan ikut terhapus."
        itemName={formHandlers.selectedKerjasama?.judul_kerjasama}
      />
    </Card>
  )
}
