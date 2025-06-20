"use client"

import { CommandEmpty } from "@/components/ui/command"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Eye, ArrowUpDown, Check, ChevronsUpDown, X, Search, Download } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandList, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { fetchDashboardData, exportToCSV } from "@/lib/dataService"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Define TypeScript interfaces
interface KerjasamaItem {
  kerjasama_id: number
  judul_kerjasama: string
  nama_mitra: string
  nama_negara: string
  jenis_dokumen: string
  tanggal_mulai: string
  tanggal_berakhir: string
  status: string
  link_dokumen?: string
  [key: string]: any
}
interface MitraItem {
  mitra_id: number
  nama_mitra: string
  nama_negara: string
  alamat: string
  jenis_partner_nama: string
  jumlah_kerjasama?: number
  [key: string]: any
}
type SortDirection = "ascending" | "descending"

// Helper functions
const formatLabel = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
const formatValue = (key: string, value: any) => {
  if (!value) return "-"
  if (key.includes("tanggal"))
    return new Date(value).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
  if (key === "link_dokumen" && value) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
        {value}
      </a>
    )
  }
  return value.toString()
}
const formatDate = (dateString?: string) =>
  !dateString
    ? "-"
    : new Date(dateString).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })

export default function DataPublikPage() {
  const { toast } = useToast()

  const [kerjasamaData, setKerjasamaData] = useState<KerjasamaItem[]>([])
  const [mitraData, setMitraData] = useState<MitraItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedItem, setSelectedItem] = useState<KerjasamaItem | MitraItem | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [mitraSearchTerm, setMitraSearchTerm] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterNegara, setFilterNegara] = useState<string>("all")
  const [filterJenisDokumen, setFilterJenisDokumen] = useState<string>("all")
  const [filterMitra, setFilterMitra] = useState<string>("all")
  const [filterMitraNegara, setFilterMitraNegara] = useState<string>("all")
  const [filterJenisPartner, setFilterJenisPartner] = useState<string>("all")
  const [sortConfig, setSortConfig] = useState<{ key: keyof KerjasamaItem; direction: SortDirection } | null>({
    key: "tanggal_mulai",
    direction: "descending",
  })
  const [mitraSortConfig, setMitraSortConfig] = useState<{ key: keyof MitraItem; direction: SortDirection } | null>({
    key: "nama_mitra",
    direction: "ascending",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [mitraCurrentPage, setMitraCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await fetchDashboardData()
        setKerjasamaData(data.kerjasamaData)
        setMitraData(data.mitraData)
      } catch (error) {
        toast({ title: "Error", description: "Gagal memuat data", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [toast])

  const uniqueNegara = useMemo(
    () => [...new Set(kerjasamaData.map((item) => item.nama_negara))].sort(),
    [kerjasamaData],
  )
  const uniqueJenisDokumen = useMemo(
    () => [...new Set(kerjasamaData.map((item) => item.jenis_dokumen))].sort(),
    [kerjasamaData],
  )
  const uniqueMitra = useMemo(() => [...new Set(kerjasamaData.map((item) => item.nama_mitra))].sort(), [kerjasamaData])
  const uniqueMitraNegara = useMemo(() => [...new Set(mitraData.map((item) => item.nama_negara))].sort(), [mitraData])
  const uniqueJenisPartner = useMemo(
    () => [...new Set(mitraData.map((item) => item.jenis_partner_nama))].sort(),
    [mitraData],
  )

  const filteredAndSortedKerjasama = useMemo(() => {
    const items = kerjasamaData.filter(
      (item) =>
        (item.judul_kerjasama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nama_mitra?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === "all" || item.status === filterStatus) &&
        (filterNegara === "all" || item.nama_negara === filterNegara) &&
        (filterJenisDokumen === "all" || item.jenis_dokumen === filterJenisDokumen) &&
        (filterMitra === "all" || item.nama_mitra === filterMitra),
    )
    if (sortConfig) {
      items.sort((a, b) => {
        const valA = a[sortConfig.key] ?? ""
        const valB = b[sortConfig.key] ?? ""
        if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1
        if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1
        return 0
      })
    }
    return items
  }, [kerjasamaData, searchTerm, filterStatus, filterNegara, filterJenisDokumen, filterMitra, sortConfig])

  const filteredAndSortedMitra = useMemo(() => {
    const items = mitraData.filter(
      (item) =>
        item.nama_mitra?.toLowerCase().includes(mitraSearchTerm.toLowerCase()) &&
        (filterMitraNegara === "all" || item.nama_negara === filterMitraNegara) &&
        (filterJenisPartner === "all" || item.jenis_partner_nama === filterJenisPartner),
    )
    if (mitraSortConfig) {
      items.sort((a, b) => {
        const valA = a[mitraSortConfig.key] ?? 0
        const valB = b[mitraSortConfig.key] ?? 0
        if (valA < valB) return mitraSortConfig.direction === "ascending" ? -1 : 1
        if (valA > valB) return mitraSortConfig.direction === "ascending" ? 1 : -1
        return 0
      })
    }
    return items
  }, [mitraData, mitraSearchTerm, filterMitraNegara, filterJenisPartner, mitraSortConfig])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, filterNegara, filterJenisDokumen, filterMitra])
  useEffect(() => {
    setMitraCurrentPage(1)
  }, [mitraSearchTerm, filterMitraNegara, filterJenisPartner])

  const kerjasamapagination = filteredAndSortedKerjasama.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )
  const totalPages = Math.ceil(filteredAndSortedKerjasama.length / itemsPerPage)

  const mitrapagination = filteredAndSortedMitra.slice(
    (mitraCurrentPage - 1) * itemsPerPage,
    mitraCurrentPage * itemsPerPage,
  )
  const mitratotalPages = Math.ceil(filteredAndSortedMitra.length / itemsPerPage)

  const handleOpenDetailModal = (item: KerjasamaItem | MitraItem, title: string) => {
    setSelectedItem(item)
    setModalTitle(title)
    setIsDetailModalOpen(true)
  }
  const requestSort = (key: keyof KerjasamaItem) =>
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }))
  const requestMitraSort = (key: keyof MitraItem) =>
    setMitraSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }))
  const handleExportKerjasama = () => {
    const result = exportToCSV(filteredAndSortedKerjasama, "data_publik_kerjasama")
    toast({
      title: result.success ? "Berhasil" : "Gagal",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
  }
  const handleResetKerjasamaFilters = () => {
    setSearchTerm("")
    setFilterMitra("all")
    setFilterNegara("all")
    setFilterJenisDokumen("all")
    setFilterStatus("all")
  }
  const handleResetMitraFilters = () => {
    setMitraSearchTerm("")
    setFilterMitraNegara("all")
    setFilterJenisPartner("all")
  }

  const SortableHeader = ({
    children,
    sortKey,
    requestSortFn,
    config,
    style,
  }: { children: React.ReactNode; sortKey: any; requestSortFn: any; config: any; style?: React.CSSProperties }) => (
    <TableHead style={style}>
      <Button variant="ghost" onClick={() => requestSortFn(sortKey)}>
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  )

  const SearchableSelect = ({
    options,
    value,
    onChange,
    placeholder,
    widthClass = "w-full sm:w-[150px]",
  }: {
    options: string[]
    value: string
    onChange: (val: string) => void
    placeholder: string
    widthClass?: string
  }) => {
    const [open, setOpen] = useState(false)
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className={cn("justify-between text-xs h-9", widthClass)}>
            {value !== "all" ? value : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("p-0", widthClass)}>
          <Command>
            <CommandInput placeholder="Cari..." />
            <CommandList>
              <CommandEmpty>Tidak ditemukan.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-y-auto">
                <CommandItem
                  onSelect={() => {
                    onChange("all")
                    setOpen(false)
                  }}
                >
                  Semua
                </CommandItem>
                {options.map((o) => (
                  <CommandItem
                    key={o}
                    value={o}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? value : currentValue)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === o ? "opacity-100" : "opacity-0")} />
                    {o}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )

  return (
    <DashboardLayout>
      <div className="flex-1 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Data Publik</h1>
          {/* Tombol export akan muncul kondisional berdasarkan tab yang aktif */}
        </div>
        <Tabs defaultValue="kerjasama" className="w-full">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="kerjasama">Data Kerjasama</TabsTrigger>
            <TabsTrigger value="mitra">Data Mitra</TabsTrigger>
          </TabsList>
          <TabsContent value="kerjasama" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Kerjasama</CardTitle>
                <CardDescription>Cari dan lihat semua data kerjasama dalam sistem.</CardDescription>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari kerjasama..."
                      className="pl-8 h-9 text-xs"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <SearchableSelect
                    options={uniqueMitra}
                    value={filterMitra}
                    onChange={setFilterMitra}
                    placeholder="Filter Mitra"
                    widthClass="w-full sm:w-[150px]"
                  />
                  <SearchableSelect
                    options={uniqueNegara}
                    value={filterNegara}
                    onChange={setFilterNegara}
                    placeholder="Filter Negara"
                    widthClass="w-full sm:w-[130px]"
                  />
                  <Select value={filterJenisDokumen} onValueChange={setFilterJenisDokumen}>
                    <SelectTrigger className="w-full sm:w-[120px] h-9 text-xs">
                      <SelectValue placeholder="Jenis Dokumen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenis</SelectItem>
                      {uniqueJenisDokumen.map((j) => (
                        <SelectItem key={j} value={j}>
                          {j}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[120px] h-9 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Berakhir">Berakhir</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleResetKerjasamaFilters}>
                    <X className="mr-2 h-4 w-4" /> Reset
                  </Button>
                  <Button onClick={handleExportKerjasama} size="sm" className="ml-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Ekspor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table className="table-fixed w-full">
                    <TableHeader>
                      <TableRow>
                        <SortableHeader sortKey="judul_kerjasama" config={sortConfig} requestSortFn={requestSort}>
                          Judul
                        </SortableHeader>
                        <SortableHeader
                          sortKey="nama_mitra"
                          config={sortConfig}
                          requestSortFn={requestSort}
                          style={{ width: "18%" }}
                        >
                          Mitra
                        </SortableHeader>
                        <SortableHeader
                          sortKey="nama_negara"
                          config={sortConfig}
                          requestSortFn={requestSort}
                          style={{ width: "10%" }}
                        >
                          Negara
                        </SortableHeader>
                        <SortableHeader
                          sortKey="jenis_dokumen"
                          config={sortConfig}
                          requestSortFn={requestSort}
                          style={{ width: "10%" }}
                        >
                          Jenis
                        </SortableHeader>
                        <SortableHeader
                          sortKey="tanggal_mulai"
                          config={sortConfig}
                          requestSortFn={requestSort}
                          style={{ width: "10%" }}
                        >
                          Mulai
                        </SortableHeader>
                        <SortableHeader
                          sortKey="tanggal_berakhir"
                          config={sortConfig}
                          requestSortFn={requestSort}
                          style={{ width: "10%" }}
                        >
                          Berakhir
                        </SortableHeader>
                        <SortableHeader
                          sortKey="status"
                          config={sortConfig}
                          requestSortFn={requestSort}
                          style={{ width: "7%" }}
                        >
                          Status
                        </SortableHeader>
                        <SortableHeader
                          sortKey="link_dokumen"
                          config={sortConfig}
                          requestSortFn={requestSort}
                          style={{ width: "10%" }}
                        >
                          Link
                        </SortableHeader>
                        <TableHead style={{ width: "5%" }}>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kerjasamapagination.length > 0 ? (
                        kerjasamapagination.map((item) => (
                          <TableRow key={item.kerjasama_id}>
                            <TableCell className="font-medium truncate">{item.judul_kerjasama}</TableCell>
                            <TableCell className="truncate">{item.nama_mitra}</TableCell>
                            <TableCell>{item.nama_negara}</TableCell>
                            <TableCell>{item.jenis_dokumen}</TableCell>
                            <TableCell>{formatDate(item.tanggal_mulai)}</TableCell>
                            <TableCell>{formatDate(item.tanggal_berakhir)}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                              >
                                {item.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {item.link_dokumen ? (
                                <a
                                  href={item.link_dokumen}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-xs"
                                >
                                  Lihat Dokumen
                                </a>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenDetailModal(item, "Detail Kerjasama")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-4">
                            Tidak ada data.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {kerjasamapagination.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedKerjasama.length)} dari{" "}
                    {filteredAndSortedKerjasama.length} data
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="mitra" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Mitra</CardTitle>
                <CardDescription>Cari dan lihat semua data mitra.</CardDescription>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari mitra..."
                      className="pl-8 h-9 text-xs"
                      value={mitraSearchTerm}
                      onChange={(e) => setMitraSearchTerm(e.target.value)}
                    />
                  </div>
                  <SearchableSelect
                    options={uniqueMitraNegara}
                    value={filterMitraNegara}
                    onChange={setFilterMitraNegara}
                    placeholder="Filter Negara"
                    widthClass="w-full sm:w-[150px]"
                  />
                  <Select value={filterJenisPartner} onValueChange={setFilterJenisPartner}>
                    <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs">
                      <SelectValue placeholder="Jenis Partner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenis</SelectItem>
                      {uniqueJenisPartner.map((j) => (
                        <SelectItem key={j} value={j}>
                          {j}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleResetMitraFilters}>
                    <X className="mr-2 h-4 w-4" /> Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table className="table-fixed w-full">
                    <TableHeader>
                      <TableRow>
                        <SortableHeader sortKey="nama_mitra" config={mitraSortConfig} requestSortFn={requestMitraSort}>
                          Nama
                        </SortableHeader>
                        <SortableHeader
                          sortKey="nama_negara"
                          config={mitraSortConfig}
                          requestSortFn={requestMitraSort}
                          style={{ width: "15%" }}
                        >
                          Negara
                        </SortableHeader>
                        <SortableHeader
                          sortKey="jenis_partner_nama"
                          config={mitraSortConfig}
                          requestSortFn={requestMitraSort}
                          style={{ width: "15%" }}
                        >
                          Jenis Partner
                        </SortableHeader>
                        <SortableHeader
                          sortKey="jumlah_kerjasama"
                          config={mitraSortConfig}
                          requestSortFn={requestMitraSort}
                          style={{ width: "15%" }}
                        >
                          Jml Kerjasama
                        </SortableHeader>
                        <SortableHeader
                          sortKey="alamat"
                          config={mitraSortConfig}
                          requestSortFn={requestMitraSort}
                          style={{ width: "20%" }}
                        >
                          Alamat
                        </SortableHeader>
                        <TableHead style={{ width: "5%" }}>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mitrapagination.length > 0 ? (
                        mitrapagination.map((mitra) => (
                          <TableRow key={mitra.mitra_id}>
                            <TableCell className="font-medium truncate">{mitra.nama_mitra}</TableCell>
                            <TableCell>{mitra.nama_negara}</TableCell>
                            <TableCell>{mitra.jenis_partner_nama}</TableCell>
                            <TableCell>{mitra.jumlah_kerjasama}</TableCell>
                            <TableCell className="truncate">{mitra.alamat}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenDetailModal(mitra, "Detail Mitra")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Tidak ada data.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {mitrapagination.length > 0 ? (mitraCurrentPage - 1) * itemsPerPage + 1 : 0} -{" "}
                    {Math.min(mitraCurrentPage * itemsPerPage, filteredAndSortedMitra.length)} dari{" "}
                    {filteredAndSortedMitra.length} data
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMitraCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={mitraCurrentPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMitraCurrentPage((prev) => Math.min(prev + 1, mitratotalPages))}
                      disabled={mitraCurrentPage === mitratotalPages || mitratotalPages === 0}
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>Rincian lengkap item.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto pr-4">
            {selectedItem &&
              Object.entries(selectedItem).map(
                ([key, value]) =>
                  ![
                    "kerjasama_id",
                    "mitra_id",
                    "key",
                    "negara_id",
                    "jenis_partner_id",
                    "jenis_dok_id",
                    "pj_upi",
                    "pj_mitra",
                    "penandatangan_upi",
                    "penandatangan_mitra",
                  ].some((k) => key.includes(k)) && (
                    <div key={key} className="grid grid-cols-3 items-start gap-4 border-b pb-3">
                      <span className="text-sm font-semibold text-gray-600 col-span-1">{formatLabel(key)}</span>
                      <span className="text-sm text-gray-800 col-span-2 break-words">{formatValue(key, value)}</span>
                    </div>
                  ),
              )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
