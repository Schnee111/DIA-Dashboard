"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, AlertCircle, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { fetchKerjasamaData } from "@/lib/dataService"
import { ExportDataButton } from "@/components/export-data-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/exportUtils"

interface KerjasamaData {
  kerjasama_id: number
  judul_kerjasama: string
  nama_mitra: string
  nama_negara: string
  jenis_dokumen: string
  tanggal_mulai: string
  tanggal_berakhir: string
  status: string
  deskripsi?: string
  file_path?: string
}

export default function DataKerjasamaPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterNegara, setFilterNegara] = useState("all")
  const [kerjasamaData, setKerjasamaData] = useState<KerjasamaData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [uniqueNegara, setUniqueNegara] = useState<string[]>([])
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedKerjasama, setSelectedKerjasama] = useState<KerjasamaData | null>(null)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const response = await fetchKerjasamaData()
        setKerjasamaData(response as KerjasamaData[])

        // Extract unique values for filters
        const negaraSet = new Set(response.map((item) => item.nama_negara).filter(Boolean))
        setUniqueNegara(Array.from(negaraSet as Set<string>))
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Filter data
  const filteredData = kerjasamaData.filter((item) => {
    const matchesSearch =
      (item.judul_kerjasama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.nama_mitra?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    const matchesNegara = filterNegara === "all" || item.nama_negara === filterNegara

    return matchesSearch && matchesStatus && matchesNegara
  })

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, filterNegara])

  return (
    <DashboardLayout role="guest">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Data Kerjasama</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kerjasama</CardTitle>
          <CardDescription>Lihat data kerjasama yang tersedia dalam sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Cari kerjasama..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterNegara} onValueChange={setFilterNegara}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter Negara" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Negara</SelectItem>
                    {uniqueNegara.map((negara) => (
                      <SelectItem key={negara} value={negara}>
                        {negara}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <ExportDataButton data={filteredData} filename="kerjasama_data" label="Export Data" />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul Kerjasama</TableHead>
                    <TableHead>Mitra</TableHead>
                    <TableHead>Negara</TableHead>
                    <TableHead>Jenis Dokumen</TableHead>
                    <TableHead>Tanggal Mulai</TableHead>
                    <TableHead>Tanggal Berakhir</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                          <span className="mt-2">Loading...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <TableRow key={item.kerjasama_id}>
                        <TableCell className="font-medium">{item.judul_kerjasama}</TableCell>
                        <TableCell>{item.nama_mitra}</TableCell>
                        <TableCell>{item.nama_negara}</TableCell>
                        <TableCell>{item.jenis_dokumen}</TableCell>
                        <TableCell>{formatDate(item.tanggal_mulai)}</TableCell>
                        <TableCell>{formatDate(item.tanggal_berakhir)}</TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              item.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedKerjasama(item)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <AlertCircle className="h-8 w-8 text-gray-400" />
                          <span className="mt-2">Tidak ada data yang ditemukan</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

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
      </Card>

      {/* View Kerjasama Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Kerjasama</DialogTitle>
            <DialogDescription>Informasi lengkap tentang kerjasama</DialogDescription>
          </DialogHeader>
          {selectedKerjasama && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Judul Kerjasama</h3>
                  <p className="mt-1">{selectedKerjasama.judul_kerjasama}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nama Mitra</h3>
                  <p className="mt-1">{selectedKerjasama.nama_mitra}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Negara</h3>
                  <p className="mt-1">{selectedKerjasama.nama_negara}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Jenis Dokumen</h3>
                  <p className="mt-1">{selectedKerjasama.jenis_dokumen}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tanggal Mulai</h3>
                  <p className="mt-1">{formatDate(selectedKerjasama.tanggal_mulai)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tanggal Berakhir</h3>
                  <p className="mt-1">{formatDate(selectedKerjasama.tanggal_berakhir)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Badge
                    className={`mt-1 ${
                      selectedKerjasama.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedKerjasama.status}
                  </Badge>
                </div>
                {selectedKerjasama.deskripsi && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Deskripsi</h3>
                    <p className="mt-1">{selectedKerjasama.deskripsi}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
