"use client"

import { DashboardLayout } from "@/components/dashboard-layout" 
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, Database, Download, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import DistributionChart from "@/components/country-distribution-chart"
import {
  fetchDashboardData,
  extractYearsFromDates,
} from "@/lib/dataService"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { TrendKerjasamaChart } from "@/components/trend-kerjasama-chart"

// Define TypeScript interfaces
interface ChartDataItem { name: string; value: number }
interface TrendChartData { year: string; Total: number; [key: string]: any }
interface KerjasamaItem { tanggal_mulai: string; tanggal_berakhir: string; [key: string]: any }

export default function PublicDashboardPage() {
  const { toast } = useToast()

  const [loading, setLoading] = useState<boolean>(true)
  const [kerjasamaCount, setKerjasamaCount] = useState(0)
  const [mitraCount, setMitraCount] = useState(0)
  const [negaraStats, setNegaraStats] = useState<ChartDataItem[]>([])
  const [kerjasamaTrend, setKerjasamaTrend] = useState<TrendChartData[]>([])
  const [filterYearFrom, setFilterYearFrom] = useState("all")
  const [filterYearTo, setFilterYearTo] = useState("all")
  const [availableYears, setAvailableYears] = useState<number[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        const data = await fetchDashboardData(filterYearFrom, filterYearTo)
        setKerjasamaCount(data.kerjasamaData.length)
        setMitraCount(data.mitraData.length)
        setNegaraStats(data.negaraStats)
        setKerjasamaTrend(data.kerjasamaTrend)

        if (filterYearFrom === 'all' && filterYearTo === 'all') {
            const allDates = [...data.kerjasamaData.map(i => i.tanggal_mulai), ...data.kerjasamaData.map(i => i.tanggal_berakhir)].filter(Boolean)
            setAvailableYears(extractYearsFromDates(allDates))
        }

      } catch (error) {
        toast({ title: "Error", description: "Gagal memuat data dashboard", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [filterYearFrom, filterYearTo, toast])
  
  const getYearRangeDescription = () => {
    if (filterYearFrom === "all" && filterYearTo === "all") return "Menampilkan data dari semua periode";
    if (filterYearFrom !== "all" && filterYearTo === "all") return `Data dari tahun ${filterYearFrom} ke atas`;
    if (filterYearFrom === "all" && filterYearTo !== "all") return `Data sampai tahun ${filterYearTo}`;
    if (filterYearFrom === filterYearTo) return `Data pada tahun ${filterYearFrom}`;
    return `Data antara tahun ${filterYearFrom} - ${filterYearTo}`;
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>

  return (
    <DashboardLayout>
      <div className="flex-1 w-full p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Kerjasama</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Select value={filterYearFrom} onValueChange={setFilterYearFrom}><SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Dari Tahun" /></SelectTrigger><SelectContent><SelectItem value="all">Semua</SelectItem>{availableYears.map((year) => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}</SelectContent></Select>
              <span className="text-sm text-gray-500 px-1">s/d</span>
              <Select value={filterYearTo} onValueChange={setFilterYearTo}><SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Sampai" /></SelectTrigger><SelectContent><SelectItem value="all">Semua</SelectItem>{availableYears.map((year) => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </div>

        {(filterYearFrom !== "all" || filterYearTo !== "all") && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" /><span className="text-sm text-blue-800"><strong>Filter Aktif:</strong> {getYearRangeDescription()}</span>
            <Button variant="ghost" size="sm" onClick={() => { setFilterYearFrom("all"); setFilterYearTo("all"); }} className="ml-auto text-blue-600 hover:text-blue-800 h-7">Reset Filter</Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Mitra" value={mitraCount.toString()} icon={Users} />
          <StatCard title="Total Kerjasama" value={kerjasamaCount.toString()} icon={Database} />
          <StatCard title="Surat Diproses" value="-" icon={FileText} description="Data tidak tersedia" />
          <StatCard title="Total Pengguna" value="-" icon={Users} description="Data tidak tersedia" />
        </div>

        <div className="mt-6"><TrendKerjasamaChart data={kerjasamaTrend} title="Tren Kerjasama per Tahun" description="Menampilkan jumlah kerjasama baru berdasarkan tahun" /></div>
        
        <div className="mt-6">
          <Card>
            <CardHeader>
                <CardTitle>Statistik Mitra</CardTitle>
                <CardDescription>Distribusi kerjasama berdasarkan negara {(filterYearFrom !== "all" || filterYearTo !== "all") && <span className="text-blue-600 ml-2">({getYearRangeDescription()})</span>}</CardDescription>
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