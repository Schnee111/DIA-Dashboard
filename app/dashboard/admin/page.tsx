import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, Users, Database, Download } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <DashboardLayout role="admin">
      {/* Main content container with proper width management */}
      <div className="flex-1 w-full pr-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Ekspor Data
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Mitra" value="156" icon={Users} trend={{ value: "12%", positive: true }} />
          <StatCard title="Surat Diproses" value="28" icon={FileText} trend={{ value: "5%", positive: true }} />
          <StatCard title="Total Pengguna" value="1,234" icon={Users} trend={{ value: "8%", positive: true }} />
          <StatCard title="Total Data" value="45,678" icon={Database} trend={{ value: "15%", positive: true }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mt-6">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Statistik Mitra</CardTitle>
              <CardDescription>Distribusi mitra berdasarkan kategori</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-gray-500">Grafik Statistik Mitra</p>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>Aktivitas sistem dalam 24 jam terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Penambahan data mitra baru</p>
                      <p className="text-xs text-gray-500">2 jam yang lalu</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Tabs defaultValue="mitra" className="w-full">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="mitra">Data Mitra</TabsTrigger>
              <TabsTrigger value="pengguna">Data Pengguna</TabsTrigger>
              <TabsTrigger value="surat">Pengajuan Surat</TabsTrigger>
            </TabsList>
            <TabsContent value="mitra" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Mitra</CardTitle>
                  <CardDescription>Daftar semua mitra yang terdaftar dalam sistem</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
                    <p className="text-gray-500">Tabel Data Mitra</p>
                  </div>
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
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
                    <p className="text-gray-500">Tabel Data Pengguna</p>
                  </div>
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
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
                    <p className="text-gray-500">Tabel Pengajuan Surat</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}