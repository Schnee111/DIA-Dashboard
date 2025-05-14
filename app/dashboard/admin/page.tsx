"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, Users, Database, Download, Search, Filter } from "lucide-react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DistributionChart } from "@/components/country-distribution-chart"
import { fetchDashboardData } from "@/lib/dataService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

// Define TypeScript interfaces
interface KerjasamaItem {
  id?: number;
  judul_kerjasama?: string;
  nama_mitra?: string;
  jenis_dokumen?: string;
  status?: string;
  tanggal_mulai?: string;
  tanggal_berakhir?: string;
  [key: string]: any;
}

interface MitraItem {
  id?: number;
  nama_mitra?: string;
  [key: string]: any;
}

interface ActivityItem {
  id?: number;
  deskripsi?: string;
  user_id?: string;
  created_at?: String;
  [key: string]: any;
}

interface ChartDataItem {
  name: string;
  value: number;
}

export default function AdminDashboardPage() {
  // State for storing data
  const [kerjasamaData, setKerjasamaData] = useState<KerjasamaItem[]>([]);
  const [mitraData, setMitraData] = useState<MitraItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  // State untuk paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Jumlah data per halaman
  
  // For charts
  const [negaraStats, setNegaraStats] = useState<ChartDataItem[]>([]);
  const [jenisStats, setJenisStats] = useState<ChartDataItem[]>([]);
  const [aktivitasTerbaru, setAktivitasTerbaru] = useState<ActivityItem[]>([]);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Menggunakan service untuk mendapatkan semua data dashboard
        const data = await fetchDashboardData();
        
        // Update state dengan data yang diterima
        setKerjasamaData(data.kerjasamaData);
        setMitraData(data.mitraData);
        setNegaraStats(data.negaraStats);
        setJenisStats(data.jenisStats);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  // Function to export data to CSV
  const exportToCSV = () => {
    if (kerjasamaData.length === 0) return
    
    const headers = Object.keys(kerjasamaData[0]).join(',')
    const rows = kerjasamaData.map(item => Object.values(item).join(','))
    const csvContent = [headers, ...rows].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'kerjasama_data.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Format date strings for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };
  
  // Filter mitra data based on search and filter status
  const filteredKerjasama = kerjasamaData.filter(item => {
    const matchesSearch = 
      (item.judul_kerjasama?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (item.nama_mitra?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Kalkulasi untuk pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredKerjasama.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredKerjasama.length / itemsPerPage);

  // Reset halaman saat filter atau search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <DashboardLayout role="admin">
      {/* Main content container with proper width management */}
      <div className="flex-1 w-full pr-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
          <Button onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Ekspor Data
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Mitra" 
            value={mitraData.length.toString()} 
            icon={Users} 
            trend={{ value: "12%", positive: true }} 
          />
          <StatCard 
            title="Surat Diproses" 
            value="37"
            // value={suratData.filter(s => s.status === "diproses").length.toString()} 
            icon={FileText} 
            trend={{ value: "5%", positive: true }} 
          />
          <StatCard 
            title="Total Pengguna" 
            // value={userData.length.toString()} 
            value="69"
            icon={Users} 
            trend={{ value: "8%", positive: true }} 
          />
          <StatCard 
            title="Total Kerjasama" 
            value={kerjasamaData.length.toString()} 
            icon={Database} 
            trend={{ value: "15%", positive: true }} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mt-6">
          <Card className="lg:col-span-4 row-span-5">
            <CardHeader>
              <CardTitle>Statistik Mitra</CardTitle>
              <CardDescription>Distribusi kerjasama berdasarkan negara</CardDescription>
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
                ) : (
                  aktivitasTerbaru.length > 0 ? (
                    aktivitasTerbaru.map((activity, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{activity.deskripsi}</p>
                          <p className="text-xs text-gray-500">
                            {activity.created_at}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    Array(5).fill(0).map((_, i) => (
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
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Tabs defaultValue="mitra" className="w-full">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="mitra">Data Kerjasama</TabsTrigger>
              <TabsTrigger value="pengguna">Data Pengguna</TabsTrigger>
              <TabsTrigger value="surat">Pengajuan Surat</TabsTrigger>
            </TabsList>
            <TabsContent value="mitra" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Kerjasama</CardTitle>
                  <CardDescription>Daftar semua kerjasama yang terdaftar dalam sistem</CardDescription>
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
                        <SelectItem value="dalam_proses">Dalam Proses</SelectItem>
                        <SelectItem value="NULL">Tidak Diketahui</SelectItem>
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
                              <TableHead>Tanggal Mulai</TableHead>
                              <TableHead>Tanggal Berakhir</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentItems.length > 0 ? (
                              currentItems.map((item) => (
                                <TableRow key={item.kerjasama_id}>
                                  <TableCell className="font-medium">{item.judul_kerjasama}</TableCell>
                                  <TableCell>{item.nama_mitra}</TableCell>
                                  <TableCell>{item.nama_negara}</TableCell>
                                  <TableCell>{item.jenis_dokumen}</TableCell>
                                  <TableCell>{formatDate(item.tanggal_mulai)}</TableCell>
                                  <TableCell>{formatDate(item.tanggal_berakhir)}</TableCell>
                                  <TableCell>
                                    <span 
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        item.status === 'Aktif' 
                                          ? 'bg-green-100 text-green-800' 
                                          : item.status === 'dalam_proses' 
                                            ? 'bg-yellow-100 text-yellow-800' 
                                            : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {item.status === 'Aktif' 
                                        ? 'Aktif' 
                                        : item.status === 'dalam_proses' 
                                          ? 'Dalam Proses' 
                                          : 'Kedaluwarsa'}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">
                                  Tidak ada data yang sesuai
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                          Menampilkan {currentItems.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredKerjasama.length)} dari {filteredKerjasama.length} data
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
                            )).slice(
                              Math.max(0, currentPage - 3),
                              Math.min(totalPages, currentPage + 2)
                            )}
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
            <TabsContent value="pengguna" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Pengguna</CardTitle>
                  <CardDescription>Daftar semua pengguna yang terdaftar dalam sistem</CardDescription>
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
                            <TableHead>Nama</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tanggal Daftar</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* {userData.length > 0 ? (
                            userData.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name || user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                  <span 
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      user.status === 'active' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                  </span>
                                </TableCell>
                                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4">
                                Tidak ada data pengguna
                              </TableCell>
                            </TableRow>
                          )} */}

                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4">
                                Tidak ada data pengguna
                              </TableCell>
                            </TableRow>
                        </TableBody>
                      </Table>
                    </div>
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
                          {/* {suratData.length > 0 ? (
                            suratData.map((surat) => (
                              <TableRow key={surat.id}>
                                <TableCell className="font-medium">{surat.nomor_surat || '-'}</TableCell>
                                <TableCell>{surat.jenis_surat}</TableCell>
                                <TableCell>{surat.nama_pengaju}</TableCell>
                                <TableCell>{new Date(surat.tanggal_pengajuan).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <span 
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      surat.status === 'disetujui' 
                                        ? 'bg-green-100 text-green-800' 
                                        : surat.status === 'diproses' 
                                          ? 'bg-yellow-100 text-yellow-800' 
                                          : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {surat.status === 'disetujui' 
                                      ? 'Disetujui' 
                                      : surat.status === 'diproses' 
                                        ? 'Diproses' 
                                        : 'Ditolak'}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4">
                                Tidak ada data pengajuan surat
                              </TableCell>
                            </TableRow>
                          )} */}

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