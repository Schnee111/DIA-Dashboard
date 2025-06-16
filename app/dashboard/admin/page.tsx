"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, Users, Database, Download, Search, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DistributionChart } from "@/components/country-distribution-chart"
import {
  fetchDashboardData,
  extractYearsFromDates,
  isCooperationPeriodInYearRange,
  exportToCSV,
} from "@/lib/dataService"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Define TypeScript interfaces based on database schema
interface KerjasamaItem {
  kerjasama_id: number
  judul_kerjasama: string
  nama_mitra: string
  nama_negara: string
  jenis_dokumen: string
  bidang_kerjasama?: string
  tanggal_mulai: string
  tanggal_berakhir: string
  status: string
  pelaksana?: string
  [key: string]: any
}

interface MitraItem {
  mitra_id: number
  nama_mitra: string
  nama_negara: string
  alamat: string
  jenis_partner_nama: string
  [key: string]: any
}

interface ActivityItem {
  id?: number
  deskripsi?: string
  user_id?: string
  created_at?: string
  [key: string]: any
}

interface ChartDataItem {
  name: string
  value: number
}

export default function AdminDashboardPage() {
  const { toast } = useToast()

  // State for storing data
  const [kerjasamaData, setKerjasamaData] = useState<KerjasamaItem[]>([])
  const [mitraData, setMitraData] = useState<MitraItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Year range filters
  const [filterYearFrom, setFilterYearFrom] = useState("all")
  const [filterYearTo, setFilterYearTo] = useState("all")
  const [availableYears, setAvailableYears] = useState<number[]>([])

  // State untuk paginasi
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10) // Jumlah data per halaman

  // For charts
  const [negaraStats, setNegaraStats] = useState<ChartDataItem[]>([])
  const [jenisStats, setJenisStats] = useState<ChartDataItem[]>([])
  const [aktivitasTerbaru, setAktivitasTerbaru] = useState<ActivityItem[]>([])

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        // Load data with year filtering
        const data = await fetchDashboardData(filterYearFrom, filterYearTo)

        // Update state dengan data yang diterima
        setKerjasamaData(data.kerjasamaData)
        setMitraData(data.mitraData)
        setNegaraStats(data.negaraStats)
        setJenisStats(data.jenisStats)

        // Extract years for filter options
        const allDates = [
          ...data.kerjasamaData.map((item) => item.tanggal_mulai).filter(Boolean),
          ...data.kerjasamaData.map((item) => item.tanggal_berakhir).filter(Boolean),
        ]

        const years = extractYearsFromDates(allDates)
        setAvailableYears(years)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
        toast({
          title: "Error",
          description: "Gagal memuat data dashboard",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [filterYearFrom, filterYearTo, toast])

  // Function to export data to CSV
  const handleExportToCSV = () => {
    const result = exportToCSV(filteredKerjasama, "dashboard_kerjasama_data")

    toast({
      title: result.success ? "Berhasil" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
  }

  // Format date strings for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID")
  }

  // Filter mitra data based on search and filter status
  const filteredKerjasama = kerjasamaData.filter((item) => {
    const matchesSearch =
      (item.judul_kerjasama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.nama_mitra?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.bidang_kerjasama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.pelaksana?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    const matchesYearRange = isCooperationPeriodInYearRange(
      item.tanggal_mulai,
      item.tanggal_berakhir,
      filterYearFrom,
      filterYearTo,
    )
    return matchesSearch && matchesStatus && matchesYearRange
  })

  const filteredMitra = mitraData.filter((item) => {
    return true // No date filtering for mitra in dashboard view
  })

  // Kalkulasi untuk pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const kerjasamapagination = filteredKerjasama.slice(indexOfFirstItem, indexOfLastItem)
  const mitrapagination = filteredMitra.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredKerjasama.length / itemsPerPage)
  const mitratotalPages = Math.ceil(filteredMitra.length / itemsPerPage)

  // Reset halaman saat filter atau search berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, filterYearFrom, filterYearTo])

  // Get year range description
  const getYearRangeDescription = () => {
    if (filterYearFrom === "all" && filterYearTo === "all") {
      return "Semua periode kerjasama"
    } else if (filterYearFrom !== "all" && filterYearTo === "all") {
      return `Kerjasama yang berlangsung dari tahun ${filterYearFrom} ke atas`
    } else if (filterYearFrom === "all" && filterYearTo !== "all") {
      return `Kerjasama yang berlangsung sampai tahun ${filterYearTo}`
    } else if (filterYearFrom === filterYearTo) {
      return `Kerjasama yang berlangsung pada tahun ${filterYearFrom}`
    } else {
      return `Kerjasama yang berlangsung antara tahun ${filterYearFrom} - ${filterYearTo}`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <DashboardLayout role="admin">
      {/* Main content container with proper width management */}
      <div className="flex-1 w-full pr-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            {/* Year Range Filter */}
            <div className="flex items-center gap-1">
              <Select value={filterYearFrom} onValueChange={setFilterYearFrom}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Dari Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500 px-1">s/d</span>
              <Select value={filterYearTo} onValueChange={setFilterYearTo}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sampai Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Ekspor Data
            </Button>
          </div>
        </div>

        {/* Year Range Filter Info */}
        {(filterYearFrom !== "all" || filterYearTo !== "all") && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              <strong>Filter Aktif:</strong> {getYearRangeDescription()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterYearFrom("all")
                setFilterYearTo("all")
              }}
              className="ml-auto text-blue-600 hover:text-blue-800"
            >
              Reset Filter
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Mitra"
            value={filteredMitra.length.toString()}
            icon={Users}
            trend={{ value: "12%", positive: true }}
          />
          <StatCard title="Surat Diproses" value="37" icon={FileText} trend={{ value: "5%", positive: true }} />
          <StatCard title="Total Pengguna" value="69" icon={Users} trend={{ value: "8%", positive: true }} />
          <StatCard
            title="Total Kerjasama"
            value={filteredKerjasama.length.toString()}
            icon={Database}
            trend={{ value: "15%", positive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mt-6">
          <Card className="lg:col-span-4 row-span-5">
            <CardHeader>
              <CardTitle>Statistik Mitra</CardTitle>
              <CardDescription>
                Distribusi kerjasama berdasarkan negara
                {(filterYearFrom !== "all" || filterYearTo !== "all") && (
                  <span className="text-blue-600 ml-2">({getYearRangeDescription()})</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">Loading data...</p>
                </div>
              ) : (
                <DistributionChart data={negaraStats} />
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>Aktivitas sistem dalam 24 jam terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-gray-500">Loading data...</p>
                ) : aktivitasTerbaru.length > 0 ? (
                  aktivitasTerbaru.map((activity, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{activity.deskripsi}</p>
                        <p className="text-xs text-gray-500">{activity.created_at}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Penambahan data mitra baru</p>
                          <p className="text-xs text-gray-500">2 jam yang lalu</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Tabs defaultValue="kerjasama" className="w-full">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="kerjasama">Data Kerjasama</TabsTrigger>
              <TabsTrigger value="mitra">Data Mitra</TabsTrigger>
              <TabsTrigger value="surat">Pengajuan Surat</TabsTrigger>
            </TabsList>
            <TabsContent value="kerjasama" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Kerjasama</CardTitle>
                  <CardDescription>
                    Daftar semua kerjasama yang terdaftar dalam sistem
                    {(filterYearFrom !== "all" || filterYearTo !== "all") && (
                      <span className="text-blue-600 ml-2">({getYearRangeDescription()})</span>
                    )}
                  </CardDescription>
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Cari kerjasama atau mitra..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Berakhir">Berakhir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500">Loading data...</p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Judul Kerjasama</TableHead>
                              <TableHead>Mitra</TableHead>
                              <TableHead>Negara</TableHead>
                              <TableHead>Jenis Dokumen</TableHead>
                              <TableHead>Bidang</TableHead>
                              <TableHead>Tanggal Mulai</TableHead>
                              <TableHead>Tanggal Berakhir</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {kerjasamapagination.length > 0 ? (
                              kerjasamapagination.map((item) => (
                                <TableRow key={item.kerjasama_id}>
                                  <TableCell className="font-medium max-w-xs truncate">
                                    {item.judul_kerjasama}
                                  </TableCell>
                                  <TableCell>{item.nama_mitra}</TableCell>
                                  <TableCell>{item.nama_negara}</TableCell>
                                  <TableCell>{item.jenis_dokumen}</TableCell>
                                  <TableCell className="max-w-xs truncate">{item.bidang_kerjasama}</TableCell>
                                  <TableCell>{formatDate(item.tanggal_mulai)}</TableCell>
                                  <TableCell>{formatDate(item.tanggal_berakhir)}</TableCell>
                                  <TableCell>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        item.status === "Aktif"
                                          ? "bg-green-100 text-green-800"
                                          : item.status === "Draft"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : item.status === "Berakhir"
                                              ? "bg-gray-100 text-gray-800"
                                              : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {item.status}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={8} className="text-center py-4">
                                  Tidak ada data yang sesuai dengan filter
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                          Menampilkan {kerjasamapagination.length > 0 ? indexOfFirstItem + 1 : 0} -{" "}
                          {Math.min(indexOfLastItem, filteredKerjasama.length)} dari {filteredKerjasama.length} data
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Sebelumnya
                          </Button>
                          <div className="flex items-center">
                            {Array.from({ length: totalPages }, (_, i) => (
                              <Button
                                key={i + 1}
                                variant={currentPage === i + 1 ? "default" : "outline"}
                                size="sm"
                                className="mx-1 w-8 h-8 p-0"
                                onClick={() => setCurrentPage(i + 1)}
                              >
                                {i + 1}
                              </Button>
                            )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                          >
                            Berikutnya
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mitra" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Mitra</CardTitle>
                  <CardDescription>Daftar semua Mitra yang terdaftar dalam sistem</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500">Loading data...</p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nama</TableHead>
                              <TableHead>Negara</TableHead>
                              <TableHead>Jenis Partner</TableHead>
                              <TableHead>Alamat</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mitrapagination.length > 0 ? (
                              mitrapagination.map((mitra) => (
                                <TableRow key={mitra.mitra_id}>
                                  <TableCell className="font-medium">{mitra.nama_mitra}</TableCell>
                                  <TableCell>{mitra.nama_negara}</TableCell>
                                  <TableCell>{mitra.jenis_partner_nama}</TableCell>
                                  <TableCell className="max-w-xs truncate">{mitra.alamat}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-4">
                                  Tidak ada data mitra yang sesuai dengan filter
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                          Menampilkan {mitrapagination.length > 0 ? indexOfFirstItem + 1 : 0} -{" "}
                          {Math.min(indexOfLastItem, filteredMitra.length)} dari {filteredMitra.length} data
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Sebelumnya
                          </Button>
                          <div className="flex items-center">
                            {Array.from({ length: mitratotalPages }, (_, i) => (
                              <Button
                                key={i + 1}
                                variant={currentPage === i + 1 ? "default" : "outline"}
                                size="sm"
                                className="mx-1 w-8 h-8 p-0"
                                onClick={() => setCurrentPage(i + 1)}
                              >
                                {i + 1}
                              </Button>
                            )).slice(Math.max(0, currentPage - 3), Math.min(mitratotalPages, currentPage + 2))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === mitratotalPages || mitratotalPages === 0}
                          >
                            Berikutnya
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="surat" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Pengajuan Surat</CardTitle>
                  <CardDescription>Daftar semua pengajuan surat dalam sistem</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500">Loading data...</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nomor Surat</TableHead>
                            <TableHead>Jenis Surat</TableHead>
                            <TableHead>Pengaju</TableHead>
                            <TableHead>Tanggal Pengajuan</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              Tidak ada data pengajuan surat
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}