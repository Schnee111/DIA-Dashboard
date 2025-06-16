"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, MoreHorizontal, Edit, Trash, Eye, FileDown, AlertCircle, Calendar } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import {
  fetchKerjasamaData,
  fetchMitraData,
  createMitra,
  updateMitra,
  deleteMitra,
  createKerjasama,
  updateKerjasama,
  deleteKerjasama,
  createUser,
  updateUser,
  deleteUser,
  extractYearsFromDates,
  isCooperationPeriodInYearRange,
  isSingleDateInYearRange,
  exportToCSV,
} from "@/lib/dataService"

// Define TypeScript interfaces
interface MitraData {
  id: number
  nama_mitra: string
  kategori: string
  nama_negara: string
  alamat: string
  tanggal_mulai: string
  tanggal_berakhir: string
  status: string
  pic_nama?: string
  pic_kontak?: string
  pic_email?: string
  deskripsi?: string
}

interface KerjasamaData {
  kerjasama_id: number
  judul_kerjasama: string
  nama_mitra: string
  nama_negara: string
  jenis_dokumen: string
  tanggal_mulai: string
  tanggal_berakhir: string
  status: string
  deskripsi?: string
  file_path?: string
  bidang_kerjasama?: string
  nilai_kontrak?: number
  mata_uang?: string
}

interface UserData {
  id: string
  name: string
  email: string
  username: string
  role: string
  is_active: boolean
  created_at?: string
  last_login?: string
  phone?: string
  department?: string
}

export default function DataCentralPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterKategori, setFilterKategori] = useState("all")
  const [filterNegara, setFilterNegara] = useState("all")
  const [filterRole, setFilterRole] = useState("all")
  const [filterJenisDokumen, setFilterJenisDokumen] = useState("all")

  // Year range filters
  const [filterYearFrom, setFilterYearFrom] = useState("all")
  const [filterYearTo, setFilterYearTo] = useState("all")

  // Data states
  const [mitraData, setMitraData] = useState<MitraData[]>([])
  const [kerjasamaData, setKerjasamaData] = useState<KerjasamaData[]>([])
  const [userData, setUserData] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states for Mitra
  const [isAddMitraOpen, setIsAddMitraOpen] = useState(false)
  const [isEditMitraOpen, setIsEditMitraOpen] = useState(false)
  const [isDeleteMitraOpen, setIsDeleteMitraOpen] = useState(false)
  const [isViewMitraOpen, setIsViewMitraOpen] = useState(false)
  const [selectedMitra, setSelectedMitra] = useState<MitraData | null>(null)

  // Dialog states for Kerjasama
  const [isAddKerjasamaOpen, setIsAddKerjasamaOpen] = useState(false)
  const [isEditKerjasamaOpen, setIsEditKerjasamaOpen] = useState(false)
  const [isDeleteKerjasamaOpen, setIsDeleteKerjasamaOpen] = useState(false)
  const [isViewKerjasamaOpen, setIsViewKerjasamaOpen] = useState(false)
  const [selectedKerjasama, setSelectedKerjasama] = useState<KerjasamaData | null>(null)

  // Dialog states for User
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false)
  const [isViewUserOpen, setIsViewUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

  // Form states
  const [newMitra, setNewMitra] = useState<Partial<MitraData>>({
    nama_mitra: "",
    kategori: "",
    nama_negara: "",
    alamat: "",
    tanggal_mulai: "",
    tanggal_berakhir: "",
    status: "Aktif",
    pic_nama: "",
    pic_kontak: "",
    pic_email: "",
    deskripsi: "",
  })

  const [newKerjasama, setNewKerjasama] = useState<Partial<KerjasamaData>>({
    judul_kerjasama: "",
    nama_mitra: "",
    nama_negara: "",
    jenis_dokumen: "",
    tanggal_mulai: "",
    tanggal_berakhir: "",
    status: "Aktif",
    deskripsi: "",
    bidang_kerjasama: "",
    nilai_kontrak: 0,
    mata_uang: "IDR",
  })

  const [newUser, setNewUser] = useState<Partial<UserData>>({
    name: "",
    email: "",
    username: "",
    role: "guest",
    is_active: true,
    phone: "",
    department: "",
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Unique values for filters
  const [uniqueKategori, setUniqueKategori] = useState<string[]>([])
  const [uniqueNegara, setUniqueNegara] = useState<string[]>([])
  const [uniqueJenisDokumen, setUniqueJenisDokumen] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const mitraResponse = await fetchMitraData()
        const kerjasamaResponse = await fetchKerjasamaData()

        setMitraData(mitraResponse as MitraData[])
        setKerjasamaData(kerjasamaResponse as KerjasamaData[])

        // Extract unique values for filters
        const kategoriSet = new Set(mitraResponse.map((item) => item.kategori).filter(Boolean))
        const negaraSet = new Set([
          ...mitraResponse.map((item) => item.nama_negara).filter(Boolean),
          ...kerjasamaResponse.map((item) => item.nama_negara).filter(Boolean),
        ])
        const jenisDokumenSet = new Set(kerjasamaResponse.map((item) => item.jenis_dokumen).filter(Boolean))

        setUniqueKategori(Array.from(kategoriSet) as string[])
        setUniqueNegara(Array.from(negaraSet) as string[])
        setUniqueJenisDokumen(Array.from(jenisDokumenSet) as string[])

        // Extract years from dates using the utility function
        const allDates = [
          ...mitraResponse.map((item) => item.tanggal_mulai).filter(Boolean),
          ...mitraResponse.map((item) => item.tanggal_berakhir).filter(Boolean),
          ...kerjasamaResponse.map((item) => item.tanggal_mulai).filter(Boolean),
          ...kerjasamaResponse.map((item) => item.tanggal_berakhir).filter(Boolean),
        ]

        const years = extractYearsFromDates(allDates)
        setAvailableYears(years)

        // Simulate user data
        setUserData([
          {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            username: "admin",
            role: "admin",
            is_active: true,
            created_at: "2023-01-15",
            last_login: "2024-01-15",
            phone: "+62812345678",
            department: "IT",
          },
          {
            id: "2",
            name: "Staff User",
            email: "staff@example.com",
            username: "staff",
            role: "staff",
            is_active: true,
            created_at: "2023-02-20",
            last_login: "2024-01-14",
            phone: "+62812345679",
            department: "Kerjasama",
          },
          {
            id: "3",
            name: "Guest User",
            email: "guest@example.com",
            username: "guest",
            role: "guest",
            is_active: true,
            created_at: "2023-03-10",
            last_login: "2024-01-13",
            phone: "+62812345680",
            department: "Umum",
          },
          {
            id: "4",
            name: "Inactive User",
            email: "inactive@example.com",
            username: "inactive",
            role: "guest",
            is_active: false,
            created_at: "2023-04-05",
            last_login: "2023-12-01",
            phone: "+62812345681",
            department: "Umum",
          },
        ])
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Filter mitra data
  const filteredMitra = mitraData.filter((item) => {
    const matchesSearch =
      (item.nama_mitra?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.alamat?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.pic_nama?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    const matchesKategori = filterKategori === "all" || item.kategori === filterKategori
    const matchesNegara = filterNegara === "all" || item.nama_negara === filterNegara
    const matchesYearRange = isCooperationPeriodInYearRange(
      item.tanggal_mulai,
      item.tanggal_berakhir,
      filterYearFrom,
      filterYearTo,
    )

    return matchesSearch && matchesStatus && matchesKategori && matchesNegara && matchesYearRange
  })

  // Filter kerjasama data
  const filteredKerjasama = kerjasamaData.filter((item) => {
    const matchesSearch =
      (item.judul_kerjasama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.nama_mitra?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.bidang_kerjasama?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    const matchesNegara = filterNegara === "all" || item.nama_negara === filterNegara
    const matchesJenisDokumen = filterJenisDokumen === "all" || item.jenis_dokumen === filterJenisDokumen
    const matchesYearRange = isCooperationPeriodInYearRange(
      item.tanggal_mulai,
      item.tanggal_berakhir,
      filterYearFrom,
      filterYearTo,
    )

    return matchesSearch && matchesStatus && matchesNegara && matchesJenisDokumen && matchesYearRange
  })

  // Filter user data
  const filteredUsers = userData.filter((item) => {
    const matchesSearch =
      (item.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.department?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === "all" || item.role === filterRole
    const matchesYearRange = isSingleDateInYearRange(item.created_at, filterYearFrom, filterYearTo)

    return matchesSearch && matchesRole && matchesYearRange
  })

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentMitra = filteredMitra.slice(indexOfFirstItem, indexOfLastItem)
  const currentKerjasama = filteredKerjasama.slice(indexOfFirstItem, indexOfLastItem)
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)

  const totalMitraPages = Math.ceil(filteredMitra.length / itemsPerPage)
  const totalKerjasamaPages = Math.ceil(filteredKerjasama.length / itemsPerPage)
  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [
    searchTerm,
    filterStatus,
    filterKategori,
    filterNegara,
    filterRole,
    filterJenisDokumen,
    filterYearFrom,
    filterYearTo,
  ])

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    formType: "mitra" | "kerjasama" | "user",
  ) => {
    const { name, value } = e.target
    if (formType === "mitra") {
      setNewMitra((prev) => ({ ...prev, [name]: value }))
    } else if (formType === "kerjasama") {
      setNewKerjasama((prev) => ({ ...prev, [name]: value }))
    } else if (formType === "user") {
      setNewUser((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string, formType: "mitra" | "kerjasama" | "user") => {
    if (formType === "mitra") {
      setNewMitra((prev) => ({ ...prev, [name]: value }))
    } else if (formType === "kerjasama") {
      setNewKerjasama((prev) => ({ ...prev, [name]: value }))
    } else if (formType === "user") {
      setNewUser((prev) => ({ ...prev, [name]: value === "true" ? true : value === "false" ? false : value }))
    }
  }

  // CRUD Operations for Mitra
  const handleAddMitra = async () => {
    try {
      const createdMitra = await createMitra(newMitra)
      setMitraData((prev) => [...prev, createdMitra as MitraData])
      setIsAddMitraOpen(false)
      resetMitraForm()

      toast({
        title: "Berhasil",
        description: "Mitra berhasil ditambahkan",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan mitra",
        variant: "destructive",
      })
    }
  }

  const handleEditMitra = async () => {
    if (!selectedMitra) return

    try {
      await updateMitra(selectedMitra.id, newMitra)
      setMitraData((prev) => prev.map((item) => (item.id === selectedMitra.id ? { ...item, ...newMitra } : item)))
      setIsEditMitraOpen(false)
      setSelectedMitra(null)

      toast({
        title: "Berhasil",
        description: "Mitra berhasil diperbarui",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui mitra",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMitra = async () => {
    if (!selectedMitra) return

    try {
      await deleteMitra(selectedMitra.id)
      setMitraData((prev) => prev.filter((item) => item.id !== selectedMitra.id))
      setIsDeleteMitraOpen(false)
      setSelectedMitra(null)

      toast({
        title: "Berhasil",
        description: "Mitra berhasil dihapus",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus mitra",
        variant: "destructive",
      })
    }
  }

  // CRUD Operations for Kerjasama
  const handleAddKerjasama = async () => {
    try {
      const createdKerjasama = await createKerjasama(newKerjasama)
      setKerjasamaData((prev) => [...prev, createdKerjasama as KerjasamaData])
      setIsAddKerjasamaOpen(false)
      resetKerjasamaForm()

      toast({
        title: "Berhasil",
        description: "Kerjasama berhasil ditambahkan",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan kerjasama",
        variant: "destructive",
      })
    }
  }

  const handleEditKerjasama = async () => {
    if (!selectedKerjasama) return

    try {
      await updateKerjasama(selectedKerjasama.kerjasama_id, newKerjasama)
      setKerjasamaData((prev) =>
        prev.map((item) =>
          item.kerjasama_id === selectedKerjasama.kerjasama_id ? { ...item, ...newKerjasama } : item,
        ),
      )
      setIsEditKerjasamaOpen(false)
      setSelectedKerjasama(null)

      toast({
        title: "Berhasil",
        description: "Kerjasama berhasil diperbarui",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui kerjasama",
        variant: "destructive",
      })
    }
  }

  const handleDeleteKerjasama = async () => {
    if (!selectedKerjasama) return

    try {
      await deleteKerjasama(selectedKerjasama.kerjasama_id)
      setKerjasamaData((prev) => prev.filter((item) => item.kerjasama_id !== selectedKerjasama.kerjasama_id))
      setIsDeleteKerjasamaOpen(false)
      setSelectedKerjasama(null)

      toast({
        title: "Berhasil",
        description: "Kerjasama berhasil dihapus",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus kerjasama",
        variant: "destructive",
      })
    }
  }

  // CRUD Operations for User
  const handleAddUser = async () => {
    try {
      const createdUser = await createUser(newUser)
      setUserData((prev) => [...prev, createdUser as UserData])
      setIsAddUserOpen(false)
      resetUserForm()

      toast({
        title: "Berhasil",
        description: "Pengguna berhasil ditambahkan",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan pengguna",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      await updateUser(selectedUser.id, newUser)
      setUserData((prev) => prev.map((item) => (item.id === selectedUser.id ? { ...item, ...newUser } : item)))
      setIsEditUserOpen(false)
      setSelectedUser(null)

      toast({
        title: "Berhasil",
        description: "Pengguna berhasil diperbarui",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui pengguna",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      await deleteUser(selectedUser.id)
      setUserData((prev) => prev.filter((item) => item.id !== selectedUser.id))
      setIsDeleteUserOpen(false)
      setSelectedUser(null)

      toast({
        title: "Berhasil",
        description: "Pengguna berhasil dihapus",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus pengguna",
        variant: "destructive",
      })
    }
  }

  // Reset form functions
  const resetMitraForm = () => {
    setNewMitra({
      nama_mitra: "",
      kategori: "",
      nama_negara: "",
      alamat: "",
      tanggal_mulai: "",
      tanggal_berakhir: "",
      status: "Aktif",
      pic_nama: "",
      pic_kontak: "",
      pic_email: "",
      deskripsi: "",
    })
  }

  const resetKerjasamaForm = () => {
    setNewKerjasama({
      judul_kerjasama: "",
      nama_mitra: "",
      nama_negara: "",
      jenis_dokumen: "",
      tanggal_mulai: "",
      tanggal_berakhir: "",
      status: "Aktif",
      deskripsi: "",
      bidang_kerjasama: "",
      nilai_kontrak: 0,
      mata_uang: "IDR",
    })
  }

  const resetUserForm = () => {
    setNewUser({
      name: "",
      email: "",
      username: "",
      role: "guest",
      is_active: true,
      phone: "",
      department: "",
    })
  }

  // Export filtered data to CSV
  const handleExportToCSV = (data: any[], filename: string) => {
    const result = exportToCSV(data, filename)

    toast({
      title: result.success ? "Berhasil" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID")
  }

  // Format currency
  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return "-"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency || "IDR",
    }).format(amount)
  }

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

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Kelola Data Central</h1>
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

      <Tabs defaultValue="mitra">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="mitra">Data Mitra</TabsTrigger>
          <TabsTrigger value="kerjasama">Data Kerjasama</TabsTrigger>
          <TabsTrigger value="pengguna">Data Pengguna</TabsTrigger>
        </TabsList>

        {/* DATA MITRA TAB */}
        <TabsContent value="mitra" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Daftar Mitra</CardTitle>
                  <CardDescription>Kelola data mitra yang terdaftar dalam sistem</CardDescription>
                </div>
                <Dialog open={isAddMitraOpen} onOpenChange={setIsAddMitraOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Mitra
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tambah Mitra Baru</DialogTitle>
                      <DialogDescription>
                        Isi form berikut untuk menambahkan mitra baru ke dalam sistem
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="nama_mitra">Nama Mitra</Label>
                          <Input
                            id="nama_mitra"
                            name="nama_mitra"
                            value={newMitra.nama_mitra || ""}
                            onChange={(e) => handleInputChange(e, "mitra")}
                            placeholder="Masukkan nama mitra"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="kategori">Kategori</Label>
                          <Select
                            name="kategori"
                            value={newMitra.kategori || ""}
                            onValueChange={(value) => handleSelectChange("kategori", value, "mitra")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                              <SelectItem value="Teknologi">Teknologi</SelectItem>
                              <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                              <SelectItem value="Keuangan">Keuangan</SelectItem>
                              <SelectItem value="Pemerintah">Pemerintah</SelectItem>
                              <SelectItem value="Sosial">Sosial</SelectItem>
                              <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="nama_negara">Negara</Label>
                          <Input
                            id="nama_negara"
                            name="nama_negara"
                            value={newMitra.nama_negara || ""}
                            onChange={(e) => handleInputChange(e, "mitra")}
                            placeholder="Masukkan negara"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            name="status"
                            value={newMitra.status || "Aktif"}
                            onValueChange={(value) => handleSelectChange("status", value, "mitra")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Aktif">Aktif</SelectItem>
                              <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
                          <Input
                            id="tanggal_mulai"
                            name="tanggal_mulai"
                            type="date"
                            value={newMitra.tanggal_mulai || ""}
                            onChange={(e) => handleInputChange(e, "mitra")}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="tanggal_berakhir">Tanggal Berakhir</Label>
                          <Input
                            id="tanggal_berakhir"
                            name="tanggal_berakhir"
                            type="date"
                            value={newMitra.tanggal_berakhir || ""}
                            onChange={(e) => handleInputChange(e, "mitra")}
                          />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="alamat">Alamat</Label>
                          <Textarea
                            id="alamat"
                            name="alamat"
                            value={newMitra.alamat || ""}
                            onChange={(e) => handleInputChange(e, "mitra")}
                            placeholder="Masukkan alamat lengkap"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="pic_nama">Nama PIC</Label>
                          <Input
                            id="pic_nama"
                            name="pic_nama"
                            value={newMitra.pic_nama || ""}
                            onChange={(e) => handleInputChange(e, "mitra")}
                            placeholder="Masukkan nama PIC"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="pic_kontak">Kontak PIC</Label>
                          <Input
                            id="pic_kontak"
                            name="pic_kontak"
                            value={newMitra.pic_kontak || ""}
                            onChange={(e) => handleInputChange(e, "mitra")}
                            placeholder="Masukkan kontak PIC"
                          />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="pic_email">Email PIC</Label>
                          <Input
                            id="pic_email"
                            name="pic_email"
                            type="email"
                            value={newMitra.pic_email || ""}
                            onChange={(e) => handleInputChange(e, "mitra")}
                            placeholder="Masukkan email PIC"
                          />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="deskripsi">Deskripsi</Label>
                          <Textarea
                            id="deskripsi"
                            name="deskripsi"
                            value={newMitra.deskripsi || ""}
                            onChange={(e) => handleInputChange(e, "mitra")}
                            placeholder="Masukkan deskripsi mitra"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddMitraOpen(false)}>
                        Batal
                      </Button>
                      <Button onClick={handleAddMitra}>Simpan</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
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
                  <div className="flex flex-wrap gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterKategori} onValueChange={setFilterKategori}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {uniqueKategori.map((kategori) => (
                          <SelectItem key={kategori} value={kategori}>
                            {kategori}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filterNegara} onValueChange={setFilterNegara}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Negara" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Negara</SelectItem>
                        {uniqueNegara.map((negara) => (
                          <SelectItem key={negara} value={negara}>
                            {negara}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

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

                    <Button
                      variant="outline"
                      onClick={() => handleExportToCSV(filteredMitra, "mitra_data")}
                      disabled={filteredMitra.length === 0}
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Mitra</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Negara</TableHead>
                        <TableHead>Tanggal Mulai</TableHead>
                        <TableHead>Tanggal Berakhir</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                              <span className="mt-2">Loading...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : currentMitra.length > 0 ? (
                        currentMitra.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.nama_mitra}</TableCell>
                            <TableCell>{item.kategori}</TableCell>
                            <TableCell>{item.nama_negara}</TableCell>
                            <TableCell>{formatDate(item.tanggal_mulai)}</TableCell>
                            <TableCell>{formatDate(item.tanggal_berakhir)}</TableCell>
                            <TableCell>
                              <Badge
                                className={`${
                                  item.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedMitra(item)
                                      setIsViewMitraOpen(true)
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Lihat Detail
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedMitra(item)
                                      setNewMitra(item)
                                      setIsEditMitraOpen(true)
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedMitra(item)
                                      setIsDeleteMitraOpen(true)
                                    }}
                                  >
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
                          <TableCell colSpan={7} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <AlertCircle className="h-8 w-8 text-gray-400" />
                              <span className="mt-2">Tidak ada data yang ditemukan</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredMitra.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredMitra.length)} dari{" "}
                      {filteredMitra.length} data
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Sebelumnya
                      </Button>
                      <div className="flex items-center">
                        {Array.from({ length: Math.min(5, totalMitraPages) }, (_, i) => {
                          let pageNumber
                          if (totalMitraPages <= 5) {
                            pageNumber = i + 1
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1
                          } else if (currentPage >= totalMitraPages - 2) {
                            pageNumber = totalMitraPages - 4 + i
                          } else {
                            pageNumber = currentPage - 2 + i
                          }
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              className="mx-1 w-8 h-8 p-0"
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalMitraPages}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* View Mitra Dialog */}
          <Dialog open={isViewMitraOpen} onOpenChange={setIsViewMitraOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detail Mitra</DialogTitle>
              </DialogHeader>
              {selectedMitra && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nama Mitra</h3>
                      <p className="mt-1">{selectedMitra.nama_mitra}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Kategori</h3>
                      <p className="mt-1">{selectedMitra.kategori}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Negara</h3>
                      <p className="mt-1">{selectedMitra.nama_negara}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <Badge
                        className={`mt-1 ${
                          selectedMitra.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedMitra.status}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tanggal Mulai</h3>
                      <p className="mt-1">{formatDate(selectedMitra.tanggal_mulai)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tanggal Berakhir</h3>
                      <p className="mt-1">{formatDate(selectedMitra.tanggal_berakhir)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Alamat</h3>
                      <p className="mt-1">{selectedMitra.alamat}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nama PIC</h3>
                      <p className="mt-1">{selectedMitra.pic_nama || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Kontak PIC</h3>
                      <p className="mt-1">{selectedMitra.pic_kontak || "-"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Email PIC</h3>
                      <p className="mt-1">{selectedMitra.pic_email || "-"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Deskripsi</h3>
                      <p className="mt-1">{selectedMitra.deskripsi || "-"}</p>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setIsViewMitraOpen(false)}>Tutup</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Mitra Dialog */}
          <Dialog open={isEditMitraOpen} onOpenChange={setIsEditMitraOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Mitra</DialogTitle>
                <DialogDescription>Edit informasi mitra dalam sistem</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit_nama_mitra">Nama Mitra</Label>
                    <Input
                      id="edit_nama_mitra"
                      name="nama_mitra"
                      value={newMitra.nama_mitra || ""}
                      onChange={(e) => handleInputChange(e, "mitra")}
                      placeholder="Masukkan nama mitra"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_kategori">Kategori</Label>
                    <Select
                      name="kategori"
                      value={newMitra.kategori || ""}
                      onValueChange={(value) => handleSelectChange("kategori", value, "mitra")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                        <SelectItem value="Teknologi">Teknologi</SelectItem>
                        <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                        <SelectItem value="Keuangan">Keuangan</SelectItem>
                        <SelectItem value="Pemerintah">Pemerintah</SelectItem>
                        <SelectItem value="Sosial">Sosial</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_nama_negara">Negara</Label>
                    <Input
                      id="edit_nama_negara"
                      name="nama_negara"
                      value={newMitra.nama_negara || ""}
                      onChange={(e) => handleInputChange(e, "mitra")}
                      placeholder="Masukkan negara"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_status">Status</Label>
                    <Select
                      name="status"
                      value={newMitra.status || "Aktif"}
                      onValueChange={(value) => handleSelectChange("status", value, "mitra")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_tanggal_mulai">Tanggal Mulai</Label>
                    <Input
                      id="edit_tanggal_mulai"
                      name="tanggal_mulai"
                      type="date"
                      value={newMitra.tanggal_mulai || ""}
                      onChange={(e) => handleInputChange(e, "mitra")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_tanggal_berakhir">Tanggal Berakhir</Label>
                    <Input
                      id="edit_tanggal_berakhir"
                      name="tanggal_berakhir"
                      type="date"
                      value={newMitra.tanggal_berakhir || ""}
                      onChange={(e) => handleInputChange(e, "mitra")}
                    />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="edit_alamat">Alamat</Label>
                    <Textarea
                      id="edit_alamat"
                      name="alamat"
                      value={newMitra.alamat || ""}
                      onChange={(e) => handleInputChange(e, "mitra")}
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_pic_nama">Nama PIC</Label>
                    <Input
                      id="edit_pic_nama"
                      name="pic_nama"
                      value={newMitra.pic_nama || ""}
                      onChange={(e) => handleInputChange(e, "mitra")}
                      placeholder="Masukkan nama PIC"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_pic_kontak">Kontak PIC</Label>
                    <Input
                      id="edit_pic_kontak"
                      name="pic_kontak"
                      value={newMitra.pic_kontak || ""}
                      onChange={(e) => handleInputChange(e, "mitra")}
                      placeholder="Masukkan kontak PIC"
                    />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="edit_pic_email">Email PIC</Label>
                    <Input
                      id="edit_pic_email"
                      name="pic_email"
                      type="email"
                      value={newMitra.pic_email || ""}
                      onChange={(e) => handleInputChange(e, "mitra")}
                      placeholder="Masukkan email PIC"
                    />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="edit_deskripsi">Deskripsi</Label>
                    <Textarea
                      id="edit_deskripsi"
                      name="deskripsi"
                      value={newMitra.deskripsi || ""}
                      onChange={(e) => handleInputChange(e, "mitra")}
                      placeholder="Masukkan deskripsi mitra"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditMitraOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleEditMitra}>Simpan Perubahan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Mitra Dialog */}
          <AlertDialog open={isDeleteMitraOpen} onOpenChange={setIsDeleteMitraOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus mitra "{selectedMitra?.nama_mitra}"? Tindakan ini tidak dapat
                  dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteMitra} className="bg-red-600 hover:bg-red-700">
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>        </TabsContent>

        {/* DATA KERJASAMA TAB */}
        <TabsContent value="kerjasama" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Daftar Kerjasama</CardTitle>
                  <CardDescription>Kelola data kerjasama yang terdaftar dalam sistem</CardDescription>
                </div>
                <Dialog open={isAddKerjasamaOpen} onOpenChange={setIsAddKerjasamaOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Kerjasama
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tambah Kerjasama Baru</DialogTitle>
                      <DialogDescription>
                        Isi form berikut untuk menambahkan kerjasama baru ke dalam sistem
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="judul_kerjasama">Judul Kerjasama</Label>
                          <Input
                            id="judul_kerjasama"
                            name="judul_kerjasama"
                            value={newKerjasama.judul_kerjasama || ""}
                            onChange={(e) => handleInputChange(e, "kerjasama")}
                            placeholder="Masukkan judul kerjasama"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="nama_mitra_kerjasama">Nama Mitra</Label>
                          <Input
                            id="nama_mitra_kerjasama"
                            name="nama_mitra"
                            value={newKerjasama.nama_mitra || ""}
                            onChange={(e) => handleInputChange(e, "kerjasama")}
                            placeholder="Masukkan nama mitra"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="nama_negara_kerjasama">Negara</Label>
                          <Input
                            id="nama_negara_kerjasama"
                            name="nama_negara"
                            value={newKerjasama.nama_negara || ""}
                            onChange={(e) => handleInputChange(e, "kerjasama")}
                            placeholder="Masukkan negara"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="jenis_dokumen">Jenis Dokumen</Label>
                          <Select
                            name="jenis_dokumen"
                            value={newKerjasama.jenis_dokumen || ""}
                            onValueChange={(value) => handleSelectChange("jenis_dokumen", value, "kerjasama")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis dokumen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MoU">MoU</SelectItem>
                              <SelectItem value="MoA">MoA</SelectItem>
                              <SelectItem value="IA">IA</SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Agreement">Agreement</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="bidang_kerjasama">Bidang Kerjasama</Label>
                          <Input
                            id="bidang_kerjasama"
                            name="bidang_kerjasama"
                            value={newKerjasama.bidang_kerjasama || ""}
                            onChange={(e) => handleInputChange(e, "kerjasama")}
                            placeholder="Masukkan bidang kerjasama"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="tanggal_mulai_kerjasama">Tanggal Mulai</Label>
                          <Input
                            id="tanggal_mulai_kerjasama"
                            name="tanggal_mulai"
                            type="date"
                            value={newKerjasama.tanggal_mulai || ""}
                            onChange={(e) => handleInputChange(e, "kerjasama")}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="tanggal_berakhir_kerjasama">Tanggal Berakhir</Label>
                          <Input
                            id="tanggal_berakhir_kerjasama"
                            name="tanggal_berakhir"
                            type="date"
                            value={newKerjasama.tanggal_berakhir || ""}
                            onChange={(e) => handleInputChange(e, "kerjasama")}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="nilai_kontrak">Nilai Kontrak</Label>
                          <Input
                            id="nilai_kontrak"
                            name="nilai_kontrak"
                            type="number"
                            value={newKerjasama.nilai_kontrak || ""}
                            onChange={(e) => handleInputChange(e, "kerjasama")}
                            placeholder="Masukkan nilai kontrak"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="mata_uang">Mata Uang</Label>
                          <Select
                            name="mata_uang"
                            value={newKerjasama.mata_uang || "IDR"}
                            onValueChange={(value) => handleSelectChange("mata_uang", value, "kerjasama")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih mata uang" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="IDR">IDR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="SGD">SGD</SelectItem>
                              <SelectItem value="MYR">MYR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="status_kerjasama">Status</Label>
                          <Select
                            name="status"
                            value={newKerjasama.status || "Aktif"}
                            onValueChange={(value) => handleSelectChange("status", value, "kerjasama")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Aktif">Aktif</SelectItem>
                              <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="deskripsi_kerjasama">Deskripsi</Label>
                          <Textarea
                            id="deskripsi_kerjasama"
                            name="deskripsi"
                            value={newKerjasama.deskripsi || ""}
                            onChange={(e) => handleInputChange(e, "kerjasama")}
                            placeholder="Masukkan deskripsi kerjasama"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddKerjasamaOpen(false)}>
                        Batal
                      </Button>
                      <Button onClick={handleAddKerjasama}>Simpan</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Cari kerjasama..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterJenisDokumen} onValueChange={setFilterJenisDokumen}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Dokumen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Dokumen</SelectItem>
                        {uniqueJenisDokumen.map((jenis) => (
                          <SelectItem key={jenis} value={jenis}>
                            {jenis}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filterNegara} onValueChange={setFilterNegara}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Negara" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Negara</SelectItem>
                        {uniqueNegara.map((negara) => (
                          <SelectItem key={negara} value={negara}>
                            {negara}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

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

                    <Button
                      variant="outline"
                      onClick={() => handleExportToCSV(filteredKerjasama, "kerjasama_data")}
                      disabled={filteredKerjasama.length === 0}
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Judul Kerjasama</TableHead>
                        <TableHead>Mitra</TableHead>
                        <TableHead>Jenis Dokumen</TableHead>
                        <TableHead>Tanggal Mulai</TableHead>
                        <TableHead>Tanggal Berakhir</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                              <span className="mt-2">Loading...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : currentKerjasama.length > 0 ? (
                        currentKerjasama.map((item) => (
                          <TableRow key={item.kerjasama_id}>
                            <TableCell className="font-medium">{item.judul_kerjasama}</TableCell>
                            <TableCell>{item.nama_mitra}</TableCell>
                            <TableCell>{item.jenis_dokumen}</TableCell>
                            <TableCell>{formatDate(item.tanggal_mulai)}</TableCell>
                            <TableCell>{formatDate(item.tanggal_berakhir)}</TableCell>
                            <TableCell>
                              <Badge
                                className={`${
                                  item.status === "Aktif" 
                                    ? "bg-green-100 text-green-800" 
                                    : item.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedKerjasama(item)
                                      setIsViewKerjasamaOpen(true)
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Lihat Detail
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedKerjasama(item)
                                      setNewKerjasama(item)
                                      setIsEditKerjasamaOpen(true)
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedKerjasama(item)
                                      setIsDeleteKerjasamaOpen(true)
                                    }}
                                  >
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
                          <TableCell colSpan={7} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <AlertCircle className="h-8 w-8 text-gray-400" />
                              <span className="mt-2">Tidak ada data yang ditemukan</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination for Kerjasama */}
                {filteredKerjasama.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredKerjasama.length)} dari{" "}
                      {filteredKerjasama.length} data
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Sebelumnya
                      </Button>
                      <div className="flex items-center">
                        {Array.from({ length: Math.min(5, totalKerjasamaPages) }, (_, i) => {
                          let pageNumber
                          if (totalKerjasamaPages <= 5) {
                            pageNumber = i + 1
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1
                          } else if (currentPage >= totalKerjasamaPages - 2) {
                            pageNumber = totalKerjasamaPages - 4 + i
                          } else {
                            pageNumber = currentPage - 2 + i
                          }
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              className="mx-1 w-8 h-8 p-0"
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalKerjasamaPages}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* View Kerjasama Dialog */}
          <Dialog open={isViewKerjasamaOpen} onOpenChange={setIsViewKerjasamaOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detail Kerjasama</DialogTitle>
              </DialogHeader>
              {selectedKerjasama && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Judul Kerjasama</h3>
                      <p className="mt-1 font-medium">{selectedKerjasama.judul_kerjasama}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nama Mitra</h3>
                      <p className="mt-1">{selectedKerjasama.nama_mitra}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Negara</h3>
                      <p className="mt-1">{selectedKerjasama.nama_negara}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Jenis Dokumen</h3>
                      <p className="mt-1">{selectedKerjasama.jenis_dokumen}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Bidang Kerjasama</h3>
                      <p className="mt-1">{selectedKerjasama.bidang_kerjasama || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tanggal Mulai</h3>
                      <p className="mt-1">{formatDate(selectedKerjasama.tanggal_mulai)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tanggal Berakhir</h3>
                      <p className="mt-1">{formatDate(selectedKerjasama.tanggal_berakhir)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nilai Kontrak</h3>
                      <p className="mt-1 font-medium">{formatCurrency(selectedKerjasama.nilai_kontrak, selectedKerjasama.mata_uang)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <Badge
                        className={`mt-1 ${
                          selectedKerjasama.status === "Aktif" 
                            ? "bg-green-100 text-green-800" 
                            : selectedKerjasama.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedKerjasama.status}
                      </Badge>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Deskripsi</h3>
                      <p className="mt-1">{selectedKerjasama.deskripsi || "-"}</p>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setIsViewKerjasamaOpen(false)}>Tutup</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Kerjasama Dialog */}
          <Dialog open={isEditKerjasamaOpen} onOpenChange={setIsEditKerjasamaOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Kerjasama</DialogTitle>
                <DialogDescription>Edit informasi kerjasama dalam sistem</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="edit_judul_kerjasama">Judul Kerjasama</Label>
                    <Input
                      id="edit_judul_kerjasama"
                      name="judul_kerjasama"
                      value={newKerjasama.judul_kerjasama || ""}
                      onChange={(e) => handleInputChange(e, "kerjasama")}
                      placeholder="Masukkan judul kerjasama"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_nama_mitra_kerjasama">Nama Mitra</Label>
                    <Input
                      id="edit_nama_mitra_kerjasama"
                      name="nama_mitra"
                      value={newKerjasama.nama_mitra || ""}
                      onChange={(e) => handleInputChange(e, "kerjasama")}
                      placeholder="Masukkan nama mitra"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_nama_negara_kerjasama">Negara</Label>
                    <Input
                      id="edit_nama_negara_kerjasama"
                      name="nama_negara"
                      value={newKerjasama.nama_negara || ""}
                      onChange={(e) => handleInputChange(e, "kerjasama")}
                      placeholder="Masukkan negara"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_jenis_dokumen">Jenis Dokumen</Label>
                    <Select
                      name="jenis_dokumen"
                      value={newKerjasama.jenis_dokumen || ""}
                      onValueChange={(value) => handleSelectChange("jenis_dokumen", value, "kerjasama")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis dokumen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MoU">MoU</SelectItem>
                        <SelectItem value="MoA">MoA</SelectItem>
                        <SelectItem value="IA">IA</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Agreement">Agreement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_bidang_kerjasama">Bidang Kerjasama</Label>
                    <Input
                      id="edit_bidang_kerjasama"
                      name="bidang_kerjasama"
                      value={newKerjasama.bidang_kerjasama || ""}
                      onChange={(e) => handleInputChange(e, "kerjasama")}
                      placeholder="Masukkan bidang kerjasama"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_tanggal_mulai_kerjasama">Tanggal Mulai</Label>
                    <Input
                      id="edit_tanggal_mulai_kerjasama"
                      name="tanggal_mulai"
                      type="date"
                      value={newKerjasama.tanggal_mulai || ""}
                      onChange={(e) => handleInputChange(e, "kerjasama")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_tanggal_berakhir_kerjasama">Tanggal Berakhir</Label>
                    <Input
                      id="edit_tanggal_berakhir_kerjasama"
                      name="tanggal_berakhir"
                      type="date"
                      value={newKerjasama.tanggal_berakhir || ""}
                      onChange={(e) => handleInputChange(e, "kerjasama")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_nilai_kontrak">Nilai Kontrak</Label>
                    <Input
                      id="edit_nilai_kontrak"
                      name="nilai_kontrak"
                      type="number"
                      value={newKerjasama.nilai_kontrak || ""}
                      onChange={(e) => handleInputChange(e, "kerjasama")}
                      placeholder="Masukkan nilai kontrak"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_mata_uang">Mata Uang</Label>
                    <Select
                      name="mata_uang"
                      value={newKerjasama.mata_uang || "IDR"}
                      onValueChange={(value) => handleSelectChange("mata_uang", value, "kerjasama")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih mata uang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IDR">IDR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="SGD">SGD</SelectItem>
                        <SelectItem value="MYR">MYR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_status_kerjasama">Status</Label>
                    <Select
                      name="status"
                      value={newKerjasama.status || "Aktif"}
                      onValueChange={(value) => handleSelectChange("status", value, "kerjasama")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="edit_deskripsi_kerjasama">Deskripsi</Label>
                    <Textarea
                      id="edit_deskripsi_kerjasama"
                      name="deskripsi"
                      value={newKerjasama.deskripsi || ""}
                      onChange={(e) => handleInputChange(e, "kerjasama")}
                      placeholder="Masukkan deskripsi kerjasama"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditKerjasamaOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleEditKerjasama}>Simpan Perubahan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Kerjasama Dialog */}
          <AlertDialog open={isDeleteKerjasamaOpen} onOpenChange={setIsDeleteKerjasamaOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus kerjasama "{selectedKerjasama?.judul_kerjasama}"? Tindakan ini tidak dapat
                  dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteKerjasama} className="bg-red-600 hover:bg-red-700">
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        {/* DATA PENGGUNA TAB */}
        <TabsContent value="pengguna" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Daftar Pengguna</CardTitle>
                  <CardDescription>Kelola data pengguna yang terdaftar dalam sistem</CardDescription>
                </div>
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Pengguna
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                      <DialogDescription>
                        Isi form berikut untuk menambahkan pengguna baru ke dalam sistem
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Nama Lengkap</Label>
                          <Input
                            id="name"
                            name="name"
                            value={newUser.name || ""}
                            onChange={(e) => handleInputChange(e, "user")}
                            placeholder="Masukkan nama lengkap"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            name="username"
                            value={newUser.username || ""}
                            onChange={(e) => handleInputChange(e, "user")}
                            placeholder="Masukkan username"
                          />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={newUser.email || ""}
                            onChange={(e) => handleInputChange(e, "user")}
                            placeholder="Masukkan email"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Nomor Telepon</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={newUser.phone || ""}
                            onChange={(e) => handleInputChange(e, "user")}
                            placeholder="Masukkan nomor telepon"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="department">Departemen</Label>
                          <Input
                            id="department"
                            name="department"
                            value={newUser.department || ""}
                            onChange={(e) => handleInputChange(e, "user")}
                            placeholder="Masukkan departemen"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            name="role"
                            value={newUser.role || "guest"}
                            onValueChange={(value) => handleSelectChange("role", value, "user")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="guest">Guest</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="is_active">Status Aktif</Label>
                          <Select
                            name="is_active"
                            value={newUser.is_active ? "true" : "false"}
                            onValueChange={(value) => handleSelectChange("is_active", value, "user")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Aktif</SelectItem>
                              <SelectItem value="false">Tidak Aktif</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                        Batal
                      </Button>
                      <Button onClick={handleAddUser}>Simpan</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Cari pengguna..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Role</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>

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

                    <Button
                      variant="outline"
                      onClick={() => handleExportToCSV(filteredUsers, "users_data")}
                      disabled={filteredUsers.length === 0}
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Departemen</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                              <span className="mt-2">Loading...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : currentUsers.length > 0 ? (
                        currentUsers.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.username}</TableCell>
                            <TableCell>{item.email}</TableCell>
                            <TableCell>
                              <Badge
                                className={`${
                                  item.role === "admin" 
                                    ? "bg-purple-100 text-purple-800" 
                                    : item.role === "staff"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {item.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.department || "-"}</TableCell>
                            <TableCell>
                              <Badge
                                className={`${
                                  item.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.is_active ? "Aktif" : "Tidak Aktif"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(item)
                                      setIsViewUserOpen(true)
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Lihat Detail
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(item)
                                      setNewUser(item)
                                      setIsEditUserOpen(true)
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedUser(item)
                                      setIsDeleteUserOpen(true)
                                    }}
                                  >
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
                          <TableCell colSpan={7} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <AlertCircle className="h-8 w-8 text-gray-400" />
                              <span className="mt-2">Tidak ada data yang ditemukan</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination for Users */}
                {filteredUsers.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} dari{" "}
                      {filteredUsers.length} data
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Sebelumnya
                      </Button>
                      <div className="flex items-center">
                        {Array.from({ length: Math.min(5, totalUserPages) }, (_, i) => {
                          let pageNumber
                          if (totalUserPages <= 5) {
                            pageNumber = i + 1
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1
                          } else if (currentPage >= totalUserPages - 2) {
                            pageNumber = totalUserPages - 4 + i
                          } else {
                            pageNumber = currentPage - 2 + i
                          }
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              className="mx-1 w-8 h-8 p-0"
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalUserPages}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* View User Dialog */}
          <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detail Pengguna</DialogTitle>
              </DialogHeader>
              {selectedUser && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nama Lengkap</h3>
                      <p className="mt-1 font-medium">{selectedUser.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Username</h3>
                      <p className="mt-1">{selectedUser.username}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1">{selectedUser.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nomor Telepon</h3>
                      <p className="mt-1">{selectedUser.phone || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Departemen</h3>
                      <p className="mt-1">{selectedUser.department || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Role</h3>
                      <Badge
                        className={`mt-1 ${
                          selectedUser.role === "admin" 
                            ? "bg-purple-100 text-purple-800" 
                            : selectedUser.role === "staff"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedUser.role}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <Badge
                        className={`mt-1 ${
                          selectedUser.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedUser.is_active ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tanggal Dibuat</h3>
                      <p className="mt-1">{formatDate(selectedUser.created_at)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Login Terakhir</h3>
                      <p className="mt-1">{formatDate(selectedUser.last_login)}</p>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setIsViewUserOpen(false)}>Tutup</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Pengguna</DialogTitle>
                <DialogDescription>Edit informasi pengguna dalam sistem</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit_name">Nama Lengkap</Label>
                    <Input
                      id="edit_name"
                      name="name"
                      value={newUser.name || ""}
                      onChange={(e) => handleInputChange(e, "user")}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_username">Username</Label>
                    <Input
                      id="edit_username"
                      name="username"
                      value={newUser.username || ""}
                      onChange={(e) => handleInputChange(e, "user")}
                      placeholder="Masukkan username"
                    />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="edit_email">Email</Label>
                    <Input
                      id="edit_email"
                      name="email"
                      type="email"
                      value={newUser.email || ""}
                      onChange={(e) => handleInputChange(e, "user")}
                      placeholder="Masukkan email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_phone">Nomor Telepon</Label>
                    <Input
                      id="edit_phone"
                      name="phone"
                      value={newUser.phone || ""}
                      onChange={(e) => handleInputChange(e, "user")}
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_department">Departemen</Label>
                    <Input
                      id="edit_department"
                      name="department"
                      value={newUser.department || ""}
                      onChange={(e) => handleInputChange(e, "user")}
                      placeholder="Masukkan departemen"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_role">Role</Label>
                    <Select
                      name="role"
                      value={newUser.role || "guest"}
                      onValueChange={(value) => handleSelectChange("role", value, "user")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_is_active">Status Aktif</Label>
                    <Select
                      name="is_active"
                      value={newUser.is_active ? "true" : "false"}
                      onValueChange={(value) => handleSelectChange("is_active", value, "user")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Aktif</SelectItem>
                        <SelectItem value="false">Tidak Aktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleEditUser}>Simpan Perubahan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete User Dialog */}
          <AlertDialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus pengguna "{selectedUser?.name}"? Tindakan ini tidak dapat
                  dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
