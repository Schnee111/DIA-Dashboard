import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"

export default function StaffDashboardPage() {
  return (
    <DashboardLayout role="staff">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Staff</h1>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Ajukan Surat Baru
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Pengajuan" value="24" icon={FileText} />
        <StatCard title="Menunggu Persetujuan" value="8" icon={Clock} />
        <StatCard title="Disetujui" value="12" icon={CheckCircle} />
        <StatCard title="Ditolak" value="4" icon={XCircle} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Pengajuan Surat Terbaru</CardTitle>
            <CardDescription>Daftar pengajuan surat yang baru dibuat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-medium">Surat Permohonan Kerjasama #{i}</p>
                    <p className="text-sm text-gray-500">Diajukan pada 12 April 2023</p>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                      Menunggu
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Mitra Terkelola</CardTitle>
            <CardDescription>Daftar mitra yang dikelola oleh staff</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-medium">Mitra #{i}</p>
                    <p className="text-sm text-gray-500">Terakhir diperbarui 3 hari yang lalu</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Kelola
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Riwayat Aktivitas</CardTitle>
          <CardDescription>Aktivitas terbaru yang dilakukan oleh staff</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200"></div>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="relative pl-8">
                  <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="h-3 w-3 text-gray-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Mengajukan surat permohonan</p>
                    <p className="text-sm text-gray-500">12 April 2023, 14:30</p>
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
