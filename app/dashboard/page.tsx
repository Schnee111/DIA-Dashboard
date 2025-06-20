"use client"

import { DashboardLayout } from "@/components/dashboard-layout" 
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, Database, Download, Globe, Activity, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import DistributionChart from "@/components/dashboard/country-distribution-chart"
import { StatusDistributionChart } from "@/components/dashboard/status-distribution-chart"
import { DocumentTypeChart } from "@/components/dashboard/document-type-chart"
import {
  fetchDashboardData,
} from "@/lib/dataService"
import { useToast } from "@/hooks/use-toast"
import { TrendKerjasamaChart } from "@/components/dashboard/trend-kerjasama-chart"

// Define TypeScript interfaces
interface ChartDataItem { name: string; value: number }
interface TrendChartData { year: string; Total: number; [key: string]: any }
interface KerjasamaItem { tanggal_mulai: string; tanggal_berakhir: string; [key: string]: any }

export default function PublicDashboardPage() {
  const { toast } = useToast()

  const [loading, setLoading] = useState<boolean>(true)
  const [kerjasamaCount, setKerjasamaCount] = useState(0)
  const [mitraCount, setMitraCount] = useState(0)
  const [activeCooperationCount, setActiveCooperationCount] = useState(0)
  const [uniqueCountriesCount, setUniqueCountriesCount] = useState(0)
  const [expiringCount, setExpiringCount] = useState(0)
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
        </div>

        {expiringCount > 0 && (
          <div className="mt-4">
            <StatCard 
              title="Kerjasama Akan Berakhir" 
              value={expiringCount.toString()} 
              icon={AlertTriangle} 
              variant="warning"
              description="Berakhir dalam 3 bulan ke depan"
            />
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