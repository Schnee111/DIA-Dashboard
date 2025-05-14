import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart3, PieChart, LineChart, Download } from "lucide-react"

export default function GuestDashboardPage() {
  return (
    <DashboardLayout role="guest">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Statistik</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Unduh Laporan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Mitra</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-gray-500">
              <span className="text-green-500">+12%</span> dari tahun lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mitra Aktif</CardTitle>
            <PieChart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-gray-500">
              <span className="text-green-500">+8%</span> dari tahun lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mitra Baru</CardTitle>
            <LineChart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-gray-500">
              <span className="text-green-500">+24%</span> dari tahun lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Kerjasama</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-gray-500">
              <span className="text-green-500">+15%</span> dari tahun lalu
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="distribusi">
          <TabsList>
            <TabsTrigger value="distribusi">Distribusi Mitra</TabsTrigger>
            <TabsTrigger value="tren">Tren Kerjasama</TabsTrigger>
            <TabsTrigger value="kategori">Kategori Mitra</TabsTrigger>
          </TabsList>
          <TabsContent value="distribusi" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Geografis Mitra</CardTitle>
                <CardDescription>Persebaran mitra berdasarkan wilayah</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-md">
                  <p className="text-gray-500">Peta Distribusi Mitra</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tren" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tren Kerjasama Tahunan</CardTitle>
                <CardDescription>Perkembangan jumlah kerjasama dalam 5 tahun terakhir</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-md">
                  <p className="text-gray-500">Grafik Tren Kerjasama</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="kategori" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Kategori Mitra</CardTitle>
                <CardDescription>Distribusi mitra berdasarkan kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-md">
                  <p className="text-gray-500">Grafik Kategori Mitra</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Daftar Kerjasama Terbaru</CardTitle>
          <CardDescription>Daftar kerjasama yang baru ditambahkan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-5 border-b bg-gray-50 p-3 font-medium">
              <div>Nama Mitra</div>
              <div>Kategori</div>
              <div>Tanggal Mulai</div>
              <div>Tanggal Berakhir</div>
              <div>Status</div>
            </div>
            <div className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-5 p-3">
                  <div>Mitra #{i}</div>
                  <div>Pendidikan</div>
                  <div>01/01/2023</div>
                  <div>31/12/2023</div>
                  <div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                      Aktif
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
