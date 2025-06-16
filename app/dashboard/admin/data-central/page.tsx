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
  fetchUsers,
  fetchNegara,
  fetchJenisPartner,
  fetchJenisDokumen,
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

// Define TypeScript interfaces based on database schema
interface MitraData {
  mitra_id: number
  nama_mitra: string
  nama_negara: string
  alamat: string
  jenis_partner_nama: string
  negara_id?: number
  jenis_partner_id?: number
}

interface KerjasamaData {
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
  mitra_id?: number
  jenis_dok_id?: number
}

interface UserData {
  id: string
  name: string
  email: string
  username: string
  password?: string
  profile_picture?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface NegaraData {
  negara_id: number
  nama_negara: string
}

interface JenisPartnerData {
  jenis_partner_id: number
  nama_jenis: string
}

interface JenisDokumenData {
  jenis_dok_id: number
  nama_jenis: string
}

export default function DataCentralPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterJenisPartner, setFilterJenisPartner] = useState("all")
  const [filterNegara, setFilterNegara] = useState("all")
  const [filterJenisDokumen, setFilterJenisDokumen] = useState("all")

  // Year range filters
  const [filterYearFrom, setFilterYearFrom] = useState("all")
  const [filterYearTo, setFilterYearTo] = useState("all")

  // Data states
  const [mitraData, setMitraData] = useState<MitraData[]>([])
  const [kerjasamaData, setKerjasamaData] = useState<KerjasamaData[]>([])
  const [userData, setUserData] = useState<UserData[]>([])
  const [negaraData, setNegaraData] = useState<NegaraData[]>([])
  const [jenisPartnerData, setJenisPartnerData] = useState<JenisPartnerData[]>([])
  const [jenisDokumenData, setJenisDokumenData] = useState<JenisDokumenData[]>([])
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
    alamat: "",
    negara_id: undefined,
    jenis_partner_id: undefined,
  })

  const [newKerjasama, setNewKerjasama] = useState<Partial<KerjasamaData>>({
    judul_kerjasama: "",
    mitra_id: undefined,
    jenis_dok_id: undefined,
    bidang_kerjasama: "",
    tanggal_mulai: "",
    tanggal_berakhir: "",
    status: "Aktif",
    pelaksana: "",
  })

  const [newUser, setNewUser] = useState<Partial<UserData>>({
    name: "",
    email: "",
    username: "",
    password: "",
    is_active: true,
    profile_picture: "",
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Unique values for filters
  const [uniqueJenisPartner, setUniqueJenisPartner] = useState<string[]>([])
  const [uniqueNegara, setUniqueNegara] = useState<string[]>([])
  const [uniqueJenisDokumen, setUniqueJenisDokumen] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [
          mitraResponse,
          kerjasamaResponse,
          userResponse,
          negaraResponse,
          jenisPartnerResponse,
          jenisDokumenResponse,
        ] = await Promise.all([
          fetchMitraData(),
          fetchKerjasamaData(),
          fetchUsers(),
          fetchNegara(),
          fetchJenisPartner(),
          fetchJenisDokumen(),
        ])

        setMitraData(mitraResponse as MitraData[])
        setKerjasamaData(kerjasamaResponse as KerjasamaData[])
        setUserData(userResponse as UserData[])
        setNegaraData(negaraResponse)
        setJenisPartnerData(jenisPartnerResponse)
        setJenisDokumenData(jenisDokumenResponse)

        // Extract unique values for filters
        const jenisPartnerSet = new Set(mitraResponse.map((item) => item.jenis_partner_nama).filter(Boolean))
        const negaraSet = new Set([
          ...mitraResponse.map((item) => item.nama_negara).filter(Boolean),
          ...kerjasamaResponse.map((item) => item.nama_negara).filter(Boolean),
        ])
        const jenisDokumenSet = new Set(kerjasamaResponse.map((item) => item.jenis_dokumen).filter(Boolean))

        setUniqueJenisPartner(Array.from(jenisPartnerSet))
        setUniqueNegara(Array.from(negaraSet))
        setUniqueJenisDokumen(Array.from(jenisDokumenSet))

        // Extract years from dates
        const allDates = [
          ...kerjasamaResponse.map((item) => item.tanggal_mulai).filter(Boolean),
          ...kerjasamaResponse.map((item) => item.tanggal_berakhir).filter(Boolean),
          ...userResponse.map((item) => item.created_at).filter(Boolean),
        ]

        const years = extractYearsFromDates(allDates)
        setAvailableYears(years)
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
      (item.alamat?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesJenisPartner = filterJenisPartner === "all" || item.jenis_partner_nama === filterJenisPartner
    const matchesNegara = filterNegara === "all" || item.nama_negara === filterNegara

    return matchesSearch && matchesJenisPartner && matchesNegara
  })

  // Filter kerjasama data
  const filteredKerjasama = kerjasamaData.filter((item) => {
    const matchesSearch =
      (item.judul_kerjasama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.nama_mitra?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.bidang_kerjasama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.pelaksana?.toLowerCase() || "").includes(searchTerm.toLowerCase())

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
      (item.username?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesYearRange = isSingleDateInYearRange(item.created_at, filterYearFrom, filterYearTo)

    return matchesSearch && matchesYearRange
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
  }, [searchTerm, filterStatus, filterJenisPartner, filterNegara, filterJenisDokumen, filterYearFrom, filterYearTo])

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
      setNewMitra((prev) => ({ ...prev, [name]: value === "" ? undefined : Number(value) }))
    } else if (formType === "kerjasama") {
      setNewKerjasama((prev) => ({ ...prev, [name]: value === "" ? undefined : Number(value) }))
    } else if (formType === "user") {
      setNewUser((prev) => ({ ...prev, [name]: value === "true" ? true : value === "false" ? false : value }))
    }
  }

  // CRUD Operations for Mitra
  const handleAddMitra = async () => {
    try {
      const createdMitra = await createMitra(newMitra)
      // Reload data to get updated view
      const mitraResponse = await fetchMitraData()
      setMitraData(mitraResponse as MitraData[])
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
      await updateMitra(selectedMitra.mitra_id, newMitra)
      // Reload data to get updated view
      const mitraResponse = await fetchMitraData()
      setMitraData(mitraResponse as MitraData[])
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
      await deleteMitra(selectedMitra.mitra_id)
      setMitraData((prev) => prev.filter((item) => item.mitra_id !== selectedMitra.mitra_id))
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
      // Reload data to get updated view
      const kerjasamaResponse = await fetchKerjasamaData()
      setKerjasamaData(kerjasamaResponse as KerjasamaData[])
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
      // Reload data to get updated view
      const kerjasamaResponse = await fetchKerjasamaData()
      setKerjasamaData(kerjasamaResponse as KerjasamaData[])
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
      alamat: "",
      negara_id: undefined,
      jenis_partner_id: undefined,
    })
  }

  const resetKerjasamaForm = () => {
    setNewKerjasama({
      judul_kerjasama: "",
      mitra_id: undefined,
      jenis_dok_id: undefined,
      bidang_kerjasama: "",
      tanggal_mulai: "",
      tanggal_berakhir: "",
      status: "Aktif",
      pelaksana: "",
    })
  }

  const resetUserForm = () => {
    setNewUser({
      name: "",
      email: "",
      username: "",
      password: "",
      is_active: true,
      profile_picture: "",
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
                          <Label htmlFor="negara_id">Negara</Label>
                          <Select
                            name="negara_id"
                            value={newMitra.negara_id?.toString() || ""}
                            onValueChange={(value) => handleSelectChange("negara_id", value, "mitra")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih negara" />
                            </SelectTrigger>
                            <SelectContent>
                              {negaraData.map((negara) => (
                                <SelectItem key={negara.negara_id} value={negara.negara_id.toString()}>
                                  {negara.nama_negara}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="jenis_partner_id">Jenis Partner</Label>
                          <Select
                            name="jenis_partner_id"
                            value={newMitra.jenis_partner_id?.toString() || ""}
                            onValueChange={(value) => handleSelectChange("jenis_partner_id", value, "mitra")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis partner" />
                            </SelectTrigger>
                            <SelectContent>
                              {jenisPartnerData.map((jenis) => (
                                <SelectItem key={jenis.jenis_partner_id} value={jenis.jenis_partner_id.toString()}>
                                  {jenis.nama_jenis}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                    <Select value={filterJenisPartner} onValueChange={setFilterJenisPartner}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Jenis</SelectItem>
                        {uniqueJenisPartner.map((jenis) => (
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
                        <TableHead>Negara</TableHead>
                        <TableHead>Jenis Partner</TableHead>
                        <TableHead>Alamat</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                              <span className="mt-2">Loading...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : currentMitra.length > 0 ? (
                        currentMitra.map((item) => (
                          <TableRow key={item.mitra_id}>
                            <TableCell className="font-medium">{item.nama_mitra}</TableCell>
                            <TableCell>{item.nama_negara}</TableCell>
                            <TableCell>{item.jenis_partner_nama}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.alamat}</TableCell>
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
                                      setNewMitra({
                                        nama_mitra: item.nama_mitra,
                                        alamat: item.alamat,
                                        negara_id: item.negara_id,
                                        jenis_partner_id: item.jenis_partner_id,
                                      })
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
                          <TableCell colSpan={5} className="text-center py-10">
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
                      <h3 className="text-sm font-medium text-gray-500">Negara</h3>
                      <p className="mt-1">{selectedMitra.nama_negara}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Jenis Partner</h3>
                      <p className="mt-1">{selectedMitra.jenis_partner_nama}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Alamat</h3>
                      <p className="mt-1">{selectedMitra.alamat}</p>
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
                    <Label htmlFor="edit_negara_id">Negara</Label>
                    <Select
                      name="negara_id"
                      value={newMitra.negara_id?.toString() || ""}
                      onValueChange={(value) => handleSelectChange("negara_id", value, "mitra")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih negara" />
                      </SelectTrigger>
                      <SelectContent>
                        {negaraData.map((negara) => (
                          <SelectItem key={negara.negara_id} value={negara.negara_id.toString()}>
                            {negara.nama_negara}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_jenis_partner_id">Jenis Partner</Label>
                    <Select
                      name="jenis_partner_id"
                      value={newMitra.jenis_partner_id?.toString() || ""}
                      onValueChange={(value) => handleSelectChange("jenis_partner_id", value, "mitra")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis partner" />
                      </SelectTrigger>
                      <SelectContent>
                        {jenisPartnerData.map((jenis) => (
                          <SelectItem key={jenis.jenis_partner_id} value={jenis.jenis_partner_id.toString()}>
                            {jenis.nama_jenis}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
          </AlertDialog>
        </TabsContent>

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
                          <Label htmlFor="mitra_id">Mitra</Label>
                          <Select
                            name="mitra_id"
                            value={newKerjasama.mitra_id?.toString() || ""}
                            onValueChange={(value) => handleSelectChange("mitra_id", value, "kerjasama")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih mitra" />
                            </SelectTrigger>
                            <SelectContent>
                              {mitraData.map((mitra) => (
                                <SelectItem key={mitra.mitra_id} value={mitra.mitra_id.toString()}>
                                  {mitra.nama_mitra}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="jenis_dok_id">Jenis Dokumen</Label>
                          <Select
                            name="jenis_dok_id"
                            value={newKerjasama.jenis_dok_id?.toString() || ""}
                            onValueChange={(value) => handleSelectChange("jenis_dok_id", value, "kerjasama")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis dokumen" />
                            </SelectTrigger>
                            <SelectContent>
                              {jenisDokumenData.map((jenis) => (
                                <SelectItem key={jenis.jenis_dok_id} value={jenis.jenis_dok_id.toString()}>
                                  {jenis.nama_jenis}
                                </SelectItem>
                              ))}
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
                          <Label htmlFor="pelaksana">Pelaksana</Label>
                          <Input
                            id="pelaksana"
                            name="pelaksana"
                            value={newKerjasama.pelaksana || ""}
                            onChange={(e) => handleInputChange(e, "kerjasama")}
                            placeholder="Masukkan pelaksana"
                          />
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
                              <SelectItem value="Draft">Draft</SelectItem>
                              <SelectItem value="Berakhir">Berakhir</SelectItem>
                            </SelectContent>
                          </Select>
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
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Berakhir">Berakhir</SelectItem>
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

                    <Select value={filterJenisDokumen} onValueChange={setFilterJenisDokumen}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Jenis</SelectItem>
                        {uniqueJenisDokumen.map((jenis) => (
                          <SelectItem key={jenis} value={jenis}>
                            {jenis}
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
                        <TableHead>Negara</TableHead>
                        <TableHead>Jenis Dokumen</TableHead>
                        <TableHead>Bidang</TableHead>
                        <TableHead>Tanggal Mulai</TableHead>
                        <TableHead>Tanggal Berakhir</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                              <span className="mt-2">Loading...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : currentKerjasama.length > 0 ? (
                        currentKerjasama.map((item) => (
                          <TableRow key={item.kerjasama_id}>
                            <TableCell className="font-medium max-w-xs truncate">{item.judul_kerjasama}</TableCell>
                            <TableCell>{item.nama_mitra}</TableCell>
                            <TableCell>{item.nama_negara}</TableCell>
                            <TableCell>{item.jenis_dokumen}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.bidang_kerjasama}</TableCell>
                            <TableCell>{formatDate(item.tanggal_mulai)}</TableCell>
                            <TableCell>{formatDate(item.tanggal_berakhir)}</TableCell>
                            <TableCell>
                              <Badge
                                className={`${
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
                                      setNewKerjasama({
                                        judul_kerjasama: item.judul_kerjasama,
                                        mitra_id: item.mitra_id,
                                        jenis_dok_id: item.jenis_dok_id,
                                        bidang_kerjasama: item.bidang_kerjasama,
                                        tanggal_mulai: item.tanggal_mulai,
                                        tanggal_berakhir: item.tanggal_berakhir,
                                        status: item.status,
                                        pelaksana: item.pelaksana,
                                      })
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
                          <TableCell colSpan={9} className="text-center py-10">
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
                      <h3 className="text-sm font-medium text-gray-500">Pelaksana</h3>
                      <p className="mt-1">{selectedKerjasama.pelaksana || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <Badge
                        className={`mt-1 ${
                          selectedKerjasama.status === "Aktif"
                            ? "bg-green-100 text-green-800"
                            : selectedKerjasama.status === "Draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : selectedKerjasama.status === "Berakhir"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedKerjasama.status}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tanggal Mulai</h3>
                      <p className="mt-1">{formatDate(selectedKerjasama.tanggal_mulai)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tanggal Berakhir</h3>
                      <p className="mt-1">{formatDate(selectedKerjasama.tanggal_berakhir)}</p>
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
                    <Label htmlFor="edit_mitra_id">Mitra</Label>
                    <Select
                      name="mitra_id"
                      value={newKerjasama.mitra_id?.toString() || ""}
                      onValueChange={(value) => handleSelectChange("mitra_id", value, "kerjasama")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih mitra" />
                      </SelectTrigger>
                      <SelectContent>
                        {mitraData.map((mitra) => (
                          <SelectItem key={mitra.mitra_id} value={mitra.mitra_id.toString()}>
                            {mitra.nama_mitra}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_jenis_dok_id">Jenis Dokumen</Label>
                    <Select
                      name="jenis_dok_id"
                      value={newKerjasama.jenis_dok_id?.toString() || ""}
                      onValueChange={(value) => handleSelectChange("jenis_dok_id", value, "kerjasama")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis dokumen" />
                      </SelectTrigger>
                      <SelectContent>
                        {jenisDokumenData.map((jenis) => (
                          <SelectItem key={jenis.jenis_dok_id} value={jenis.jenis_dok_id.toString()}>
                            {jenis.nama_jenis}
                          </SelectItem>
                        ))}
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
                    <Label htmlFor="edit_pelaksana">Pelaksana</Label>
                    <Input
                      id="edit_pelaksana"
                      name="pelaksana"
                      value={newKerjasama.pelaksana || ""}
                      onChange={(e) => handleInputChange(e, "kerjasama")}
                      placeholder="Masukkan pelaksana"
                    />
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
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Berakhir">Berakhir</SelectItem>
                      </SelectContent>
                    </Select>
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
                  Apakah Anda yakin ingin menghapus kerjasama "{selectedKerjasama?.judul_kerjasama}"? Tindakan ini tidak
                  dapat dibatalkan.
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
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={newUser.password || ""}
                            onChange={(e) => handleInputChange(e, "user")}
                            placeholder="Masukkan password"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="is_active">Status</Label>
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
                        <div className="grid gap-2">
                          <Label htmlFor="profile_picture">URL Foto Profil</Label>
                          <Input
                            id="profile_picture"
                            name="profile_picture"
                            value={newUser.profile_picture || ""}
                            onChange={(e) => handleInputChange(e, "user")}
                            placeholder="Masukkan URL foto profil"
                          />
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
                        <TableHead>Email</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Tanggal Dibuat</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
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
                            <TableCell>{item.email}</TableCell>
                            <TableCell>{item.username}</TableCell>
                            <TableCell>{formatDate(item.created_at)}</TableCell>
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
                                      setNewUser({
                                        name: item.name,
                                        email: item.email,
                                        username: item.username,
                                        is_active: item.is_active,
                                        profile_picture: item.profile_picture,
                                        password: "", // Don't pre-fill password
                                      })
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
                          <TableCell colSpan={6} className="text-center py-10">
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
                      <h3 className="text-sm font-medium text-gray-500">Terakhir Diperbarui</h3>
                      <p className="mt-1">{formatDate(selectedUser.updated_at)}</p>
                    </div>
                    {selectedUser.profile_picture && (
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-gray-500">Foto Profil</h3>
                        <p className="mt-1 text-sm text-blue-600 break-all">{selectedUser.profile_picture}</p>
                      </div>
                    )}
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
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="edit_password">Password Baru (kosongkan jika tidak ingin mengubah)</Label>
                    <Input
                      id="edit_password"
                      name="password"
                      type="password"
                      value={newUser.password || ""}
                      onChange={(e) => handleInputChange(e, "user")}
                      placeholder="Masukkan password baru"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_is_active">Status</Label>
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
                  <div className="grid gap-2">
                    <Label htmlFor="edit_profile_picture">URL Foto Profil</Label>
                    <Input
                      id="edit_profile_picture"
                      name="profile_picture"
                      value={newUser.profile_picture || ""}
                      onChange={(e) => handleInputChange(e, "user")}
                      placeholder="Masukkan URL foto profil"
                    />
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
