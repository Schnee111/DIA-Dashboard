"use client"

import { DashboardLayout } from "@/components/dashboard-layout" 
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, Database, Download, Globe, Activity, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect } from "react"
import DistributionChart from "@/components/dashboard/country-distribution-chart"
import { StatusDistributionChart } from "@/components/dashboard/status-distribution-chart"
import { DocumentTypeChart } from "@/components/dashboard/document-type-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  fetchDashboardData,
} from "@/lib/dataService"
import { useToast } from "@/hooks/use-toast"
import { TrendKerjasamaChart } from "@/components/dashboard/trend-kerjasama-chart"

// Define TypeScript interfaces
interface ChartDataItem { name: string; value: number }
interface TrendChartData { year: string; Total: number; [key: string]: any }
interface KerjasamaItem { tanggal_mulai: string; tanggal_berakhir: string; [key: string]: any }

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric"
  })
}

export default function PublicDashboardPage() {
  const { toast } = useToast()

  const [loading, setLoading] = useState<boolean>(true)
  const [kerjasamaCount, setKerjasamaCount] = useState(0)
  const [mitraCount, setMitraCount] = useState(0)
  const [activeCooperationCount, setActiveCooperationCount] = useState(0)
  const [uniqueCountriesCount, setUniqueCountriesCount] = useState(0)
  const [expiringCount, setExpiringCount] = useState(0)
  const [expiringCooperations, setExpiringCooperations] = useState<KerjasamaItem[]>([])
  const [showExpiringTable, setShowExpiringTable] = useState(false)
  const [expiringTablePage, setExpiringTablePage] = useState(1)
  const [negaraStats, setNegaraStats] = useState<ChartDataItem[]>([])
  const [jenisStats, setJenisStats] = useState<ChartDataItem[]>([])  
  const [statusStats, setStatusStats] = useState<ChartDataItem[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<{ month: string, value: number }[]>([])
  const [kerjasamaTrend, setKerjasamaTrend] = useState<TrendChartData[]>([])
    useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        const data = await fetchDashboardData("all", "all")
        setKerjasamaCount(data.kerjasamaData.length)
        setMitraCount(data.mitraData.length)
        setActiveCooperationCount(data.activeCooperationCount)
        setUniqueCountriesCount(data.uniqueCountriesCount)
        setExpiringCount(data.expiringCooperation.length)
        setExpiringCooperations(data.expiringCooperation)
        setNegaraStats(data.negaraStats)
        setJenisStats(data.jenisStats)
        setStatusStats(data.statusStats)
        setKerjasamaTrend(data.kerjasamaTrend)

      } catch (error) {
        toast({ title: "Error", description: "Gagal memuat data dashboard", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()  }, [toast])
  
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>

  return (
    <DashboardLayout>
      <div className="flex-1 w-full p-4 md:p-6">        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Kerjasama</h1>
        </div>        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Mitra" value={mitraCount.toString()} icon={Users} />
          <StatCard title="Total Kerjasama" value={kerjasamaCount.toString()} icon={Database} />
          <StatCard 
            title="Kerjasama Aktif" 
            value={activeCooperationCount.toString()} 
            icon={Activity} 
            variant="success"
            description="Kerjasama yang sedang berjalan"
          />
          <StatCard 
            title="Negara Bekerjasama" 
            value={uniqueCountriesCount.toString()} 
            icon={Globe} 
            description="Jumlah negara yang terlibat"
          />
        </div>        {expiringCount > 0 && (
          <div className="mt-4">            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <CardTitle className="text-sm font-medium text-foreground">Kerjasama Akan Berakhir</CardTitle>
                    <div className="text-2xl font-bold text-foreground mt-1">{expiringCount.toString()}</div>
                    <CardDescription className="text-xs text-muted-foreground mt-1">Berakhir dalam 3 bulan ke depan</CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExpiringTable(!showExpiringTable)}
                  className="flex items-center gap-2"
                >
                  {showExpiringTable ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Sembunyikan
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Detail
                    </>
                  )}
                </Button>
              </CardHeader>
            </Card>
            
            {/* Collapsible Table for Expiring Cooperations */}
            {showExpiringTable && (
              <Card className="mt-2">
                <CardHeader>
                  <CardTitle className="text-lg">Daftar Kerjasama Akan Berakhir</CardTitle>
                  <CardDescription>Kerjasama yang akan berakhir dalam 3 bulan ke depan</CardDescription>
                </CardHeader>
                <CardContent>
                    {(() => {
                      const itemsPerPage = 5;
                      const totalPages = Math.ceil(expiringCooperations.length / itemsPerPage);
                      const startIndex = (expiringTablePage - 1) * itemsPerPage;
                      const endIndex = startIndex + itemsPerPage;
                      const currentPageData = expiringCooperations.slice(startIndex, endIndex);

                      return (
                        <>
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Judul Kerjasama</TableHead>
                                  <TableHead>Mitra</TableHead>
                                  <TableHead>Negara</TableHead>
                                  <TableHead>Tanggal Berakhir</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {currentPageData.length > 0 ? currentPageData.map((item) => (
                                  <TableRow key={item.kerjasama_id}>
                                    <TableCell className="font-medium">{item.judul_kerjasama}</TableCell>
                                    <TableCell>{item.nama_mitra}</TableCell>
                                    <TableCell>{item.nama_negara}</TableCell>
                                    <TableCell>{formatDate(item.tanggal_berakhir)}</TableCell>
                                  </TableRow>
                                )) : (
                                  <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4">
                                      Tidak ada data kerjasama yang akan berakhir
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                          
                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between space-x-2 py-4">
                              <div className="text-sm text-muted-foreground">
                                Menampilkan {startIndex + 1} - {Math.min(endIndex, expiringCooperations.length)} dari {expiringCooperations.length} data
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setExpiringTablePage(prev => Math.max(prev - 1, 1))}
                                  disabled={expiringTablePage === 1}
                                >
                                  Sebelumnya
                                </Button>
                                <span className="text-sm">
                                  Halaman {expiringTablePage} dari {totalPages}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setExpiringTablePage(prev => Math.min(prev + 1, totalPages))}
                                  disabled={expiringTablePage === totalPages}
                                >
                                  Berikutnya
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      );                    })()}
                </CardContent>
              </Card>
            )}
          </div>
        )}
        <div className="mt-6"><TrendKerjasamaChart data={kerjasamaTrend} title="Tren Kerjasama per Tahun" description="Menampilkan jumlah kerjasama baru berdasarkan tahun" /></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>            
            <CardHeader>
              <CardTitle>Distribusi Status Kerjasama</CardTitle>
              <CardDescription>Pembagian kerjasama berdasarkan status</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {loading ? <div className="h-64 flex items-center justify-center"><p>Memuat chart...</p></div> : <StatusDistributionChart data={statusStats} />}
            </CardContent>
          </Card>

          <Card>            
            <CardHeader>
              <CardTitle>Distribusi Jenis Dokumen</CardTitle>
              <CardDescription>Pembagian kerjasama berdasarkan jenis dokumen</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {loading ? <div className="h-64 flex items-center justify-center"><p>Memuat chart...</p></div> : <DocumentTypeChart data={jenisStats} />}
            </CardContent>
          </Card>
        </div>        <div className="mt-6">
          <Card>            <CardHeader>
                <CardTitle>Statistik Mitra</CardTitle>
                <CardDescription>Distribusi kerjasama berdasarkan negara</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                {loading ? <div className="h-64 flex items-center justify-center"><p>Memuat chart...</p></div> : <DistributionChart data={negaraStats} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}