"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Download, Upload, MoreHorizontal, Edit, Trash, Eye } from "lucide-react"

export default function DataCentralPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const dataMitra = [
    {
      id: 1,
      nama: "Universitas Indonesia",
      kategori: "Pendidikan",
      tanggalMulai: "01/01/2023",
      tanggalAkhir: "31/12/2023",
      status: "Aktif",
    },
    {
      id: 2,
      nama: "PT Teknologi Maju",
      kategori: "Teknologi",
      tanggalMulai: "15/02/2023",
      tanggalAkhir: "15/02/2024",
      status: "Aktif",
    },
    {
      id: 3,
      nama: "Rumah Sakit Medika",
      kategori: "Kesehatan",
      tanggalMulai: "10/03/2023",
      tanggalAkhir: "10/03/2024",
      status: "Aktif",
    },
    {
      id: 4,
      nama: "Bank Nasional",
      kategori: "Keuangan",
      tanggalMulai: "05/04/2023",
      tanggalAkhir: "05/04/2024",
      status: "Aktif",
    },
    {
      id: 5,
      nama: "PT Konstruksi Jaya",
      kategori: "Konstruksi",
      tanggalMulai: "20/05/2023",
      tanggalAkhir: "20/05/2024",
      status: "Aktif",
    },
    {
      id: 6,
      nama: "Kementerian Pendidikan",
      kategori: "Pemerintah",
      tanggalMulai: "15/06/2023",
      tanggalAkhir: "15/06/2024",
      status: "Aktif",
    },
    {
      id: 7,
      nama: "Yayasan Sosial Peduli",
      kategori: "Sosial",
      tanggalMulai: "10/07/2023",
      tanggalAkhir: "10/07/2024",
      status: "Aktif",
    },
    {
      id: 8,
      nama: "PT Media Utama",
      kategori: "Media",
      tanggalMulai: "05/08/2023",
      tanggalAkhir: "05/08/2024",
      status: "Tidak Aktif",
    },
    {
      id: 9,
      nama: "CV Transportasi Cepat",
      kategori: "Transportasi",
      tanggalMulai: "20/09/2023",
      tanggalAkhir: "20/09/2024",
      status: "Aktif",
    },
    {
      id: 10,
      nama: "PT Energi Bersih",
      kategori: "Energi",
      tanggalMulai: "15/10/2023",
      tanggalAkhir: "15/10/2024",
      status: "Tidak Aktif",
    },
  ]

  const filteredData = dataMitra.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Kelola Data Central</h1>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="mitra">
        <TabsList>
          <TabsTrigger value="mitra">Data Mitra</TabsTrigger>
          <TabsTrigger value="pengguna">Data Pengguna</TabsTrigger>
          <TabsTrigger value="dokumen">Dokumen</TabsTrigger>
        </TabsList>

        <TabsContent value="mitra" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Mitra</CardTitle>
              <CardDescription>Kelola data mitra yang terdaftar dalam sistem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Cari mitra..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Mitra</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Tanggal Mulai</TableHead>
                        <TableHead>Tanggal Berakhir</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.nama}</TableCell>
                            <TableCell>{item.kategori}</TableCell>
                            <TableCell>{item.tanggalMulai}</TableCell>
                            <TableCell>{item.tanggalAkhir}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  item.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Lihat Detail
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Tidak ada data yang ditemukan
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Menampilkan {filteredData.length} dari {dataMitra.length} data
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Sebelumnya
                    </Button>
                    <Button variant="outline" size="sm">
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pengguna" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pengguna</CardTitle>
              <CardDescription>Kelola data pengguna yang terdaftar dalam sistem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-gray-500">Tabel Data Pengguna</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dokumen" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Dokumen</CardTitle>
              <CardDescription>Kelola dokumen yang tersimpan dalam sistem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-gray-500">Tabel Data Dokumen</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
