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
import { SearchableSelect } from "@/components/searchable-select"
import { QuickAddInput } from "@/components/quick-add-input"
import {
  fetchKerjasamaData,
  fetchMitraData,
  fetchPersonel,
  fetchJabatan,
  fetchNegara,
  fetchJenisPartner,
  fetchJenisDokumen,
  createMitra,
  updateMitra,
  deleteMitra,
  createKerjasama,
  updateKerjasama,
  deleteKerjasama,
  createPersonel,
  updatePersonel,
  deletePersonel,
  createJabatan,
  createNegara,
  createJenisDokumen,
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
  no_dokumen?: string
  bidang_kerjasama?: string
  judul_kerjasama: string
  tanggal_mulai: string
  tanggal_berakhir: string
  status: string
  catatan?: string
  jumlah_pihak?: number
  output_kerjasama?: string
  tgl_input?: string
  tgl_lapor?: string
  status_lapor?: string
  tahun?: number
  pelaksana?: string
  nama_mitra: string
  nama_negara: string
  jenis_dokumen: string
  nama_pj_upi?: string
  nama_pj_mitra?: string
  nama_penandatangan_upi?: string
  nama_penandatangan_mitra?: string
  // Foreign key IDs for form handling
  mitra_id?: number
  jenis_dok_id?: number
  pj_upi?: number
  pj_mitra?: number
  penandatangan_upi?: number
  penandatangan_mitra?: number
}

interface PersonelData {
  personel_id: number
  nama: string
  email?: string
  kontak?: string
  jabatan_id?: number
  pihak: "UPI" | "MITRA"
  nama_jabatan?: string
  created_at: string
  updated_at: string
}

interface JabatanData {
  jabatan_id: number
  nama_jabatan: string
  pihak: "UPI" | "MITRA"
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
  const [filterPihak, setFilterPihak] = useState("all")

  // Year range filters
  const [filterYearFrom, setFilterYearFrom] = useState("all")
  const [filterYearTo, setFilterYearTo] = useState("all")

  // Data states
  const [mitraData, setMitraData] = useState<MitraData[]>([])
  const [kerjasamaData, setKerjasamaData] = useState<KerjasamaData[]>([])
  const [personelData, setPersonelData] = useState<PersonelData[]>([])
  const [jabatanData, setJabatanData] = useState<JabatanData[]>([])
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

  // Dialog states for Personel
  const [isAddPersonelOpen, setIsAddPersonelOpen] = useState(false)
  const [isEditPersonelOpen, setIsEditPersonelOpen] = useState(false)
  const [isDeletePersonelOpen, setIsDeletePersonelOpen] = useState(false)
  const [isViewPersonelOpen, setIsViewPersonelOpen] = useState(false)
  const [selectedPersonel, setSelectedPersonel] = useState<PersonelData | null>(null)

  // Modal states for adding new related data from cooperation form
  const [isAddMitraModalOpen, setIsAddMitraModalOpen] = useState(false)
  const [isAddPersonelModalOpen, setIsAddPersonelModalOpen] = useState(false)
  const [isAddJabatanModalOpen, setIsAddJabatanModalOpen] = useState(false)

  // Form states
  const [newMitra, setNewMitra] = useState<Partial<MitraData>>({
    nama_mitra: "",
    alamat: "",
    negara_id: undefined,
    jenis_partner_id: undefined,
  })

  const [newKerjasama, setNewKerjasama] = useState<Partial<KerjasamaData>>({
    no_dokumen: "",
    bidang_kerjasama: "",
    judul_kerjasama: "",
    tanggal_mulai: "",
    tanggal_berakhir: "",
    status: "Aktif",
    catatan: "",
    jumlah_pihak: 2,
    output_kerjasama: "",
    tgl_input: new Date().toISOString().split("T")[0],
    tgl_lapor: "",
    status_lapor: "Belum Lapor",
    tahun: new Date().getFullYear(),
    pelaksana: "",
    mitra_id: undefined,
    jenis_dok_id: undefined,
    pj_upi: undefined,
    pj_mitra: undefined,
    penandatangan_upi: undefined,
    penandatangan_mitra: undefined,
  })

  const [newPersonel, setNewPersonel] = useState<Partial<PersonelData>>({
    nama: "",
    email: "",
    kontak: "",
    jabatan_id: undefined,
    pihak: "UPI",
  })

  const [newJabatan, setNewJabatan] = useState<Partial<JabatanData>>({
    nama_jabatan: "",
    pihak: "UPI",
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
          personelResponse,
          jabatanResponse,
          negaraResponse,
          jenisPartnerResponse,
          jenisDokumenResponse,
        ] = await Promise.all([
          fetchMitraData(),
          fetchKerjasamaData(),
          fetchPersonel(),
          fetchJabatan(),
          fetchNegara(),
          fetchJenisPartner(),
          fetchJenisDokumen(),
        ])

        setMitraData(mitraResponse as MitraData[])
        setKerjasamaData(kerjasamaResponse as KerjasamaData[])
        setPersonelData(personelResponse as PersonelData[])
        setJabatanData(jabatanResponse)
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
          ...personelResponse.map((item) => item.created_at).filter(Boolean),
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

  // Helper functions to create options for SearchableSelect
  const getMitraOptions = () =>
    mitraData.map((mitra) => ({
      value: mitra.mitra_id,
      label: `${mitra.nama_mitra} (${mitra.nama_negara})`,
    }))

  const getPersonelOptions = (pihak?: "UPI" | "MITRA") =>
    personelData
      .filter((personel) => !pihak || personel.pihak === pihak)
      .map((personel) => ({
        value: personel.personel_id,
        label: `${personel.nama} ${personel.nama_jabatan ? `- ${personel.nama_jabatan}` : ""} (${personel.pihak})`,
      }))

  const getJabatanOptions = (pihak?: "UPI" | "MITRA") =>
    jabatanData
      .filter((jabatan) => !pihak || jabatan.pihak === pihak)
      .map((jabatan) => ({
        value: jabatan.jabatan_id,
        label: `${jabatan.nama_jabatan} (${jabatan.pihak})`,
      }))

  const getNegaraOptions = () =>
    negaraData.map((negara) => ({
      value: negara.negara_id,
      label: negara.nama_negara,
    }))

  const getJenisDokumenOptions = () =>
    jenisDokumenData.map((jenis) => ({
      value: jenis.jenis_dok_id,
      label: jenis.nama_jenis,
    }))

  const getJenisPartnerOptions = () =>
    jenisPartnerData.map((jenis) => ({
      value: jenis.jenis_partner_id,
      label: jenis.nama_jenis,
    }))

  // Quick add handlers
  const handleQuickAddNegara = async (namaNegaraData: string) => {
    try {
      const newNegaraItem = await createNegara(namaNegaraData)
      setNegaraData((prev) => [...prev, newNegaraItem])
      toast({
        title: "Berhasil",
        description: "Negara berhasil ditambahkan",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan negara",
        variant: "destructive",
      })
    }
  }

  const handleQuickAddJenisDokumen = async (namaJenisData: string) => {
    try {
      const newJenisItem = await createJenisDokumen(namaJenisData)
      setJenisDokumenData((prev) => [...prev, newJenisItem])
      toast({
        title: "Berhasil",
        description: "Jenis dokumen berhasil ditambahkan",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan jenis dokumen",
        variant: "destructive",
      })
    }
  }

  // Filter functions
  const filteredMitra = mitraData.filter((item) => {
    const matchesSearch =
      (item.nama_mitra?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.alamat?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesJenisPartner = filterJenisPartner === "all" || item.jenis_partner_nama === filterJenisPartner
    const matchesNegara = filterNegara === "all" || item.nama_negara === filterNegara

    return matchesSearch && matchesJenisPartner && matchesNegara
  })

  const filteredKerjasama = kerjasamaData.filter((item) => {
    const matchesSearch =
      (item.judul_kerjasama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.nama_mitra?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.bidang_kerjasama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.pelaksana?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.no_dokumen?.toLowerCase() || "").includes(searchTerm.toLowerCase())

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

  const filteredPersonel = personelData.filter((item) => {
    const matchesSearch =
      (item.nama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.kontak?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.nama_jabatan?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesPihak = filterPihak === "all" || item.pihak === filterPihak
    const matchesYearRange = isSingleDateInYearRange(item.created_at, filterYearFrom, filterYearTo)

    return matchesSearch && matchesPihak && matchesYearRange
  })

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentMitra = filteredMitra.slice(indexOfFirstItem, indexOfLastItem)
  const currentKerjasama = filteredKerjasama.slice(indexOfFirstItem, indexOfLastItem)
  const currentPersonel = filteredPersonel.slice(indexOfFirstItem, indexOfLastItem)

  const totalMitraPages = Math.ceil(filteredMitra.length / itemsPerPage)
  const totalKerjasamaPages = Math.ceil(filteredKerjasama.length / itemsPerPage)
  const totalPersonelPages = Math.ceil(filteredPersonel.length / itemsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [
    searchTerm,
    filterStatus,
    filterJenisPartner,
    filterNegara,
    filterJenisDokumen,
    filterPihak,
    filterYearFrom,
    filterYearTo,
  ])

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    formType: "mitra" | "kerjasama" | "personel" | "jabatan",
  ) => {
    const { name, value } = e.target
    if (formType === "mitra") {
      setNewMitra((prev) => ({ ...prev, [name]: value }))
    } else if (formType === "kerjasama") {
      setNewKerjasama((prev) => ({ ...prev, [name]: value }))
    } else if (formType === "personel") {
      setNewPersonel((prev) => ({ ...prev, [name]: value }))
    } else if (formType === "jabatan") {
      setNewJabatan((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Handle select changes
  const handleSelectChange = (
    name: string,
    value: string,
    formType: "mitra" | "kerjasama" | "personel" | "jabatan",
  ) => {
    if (formType === "mitra") {
      setNewMitra((prev) => ({ ...prev, [name]: value === "" ? undefined : Number(value) }))
    } else if (formType === "kerjasama") {
      if (name === "jumlah_pihak" || name === "tahun") {
        setNewKerjasama((prev) => ({ ...prev, [name]: value === "" ? undefined : Number(value) }))
      } else {
        setNewKerjasama((prev) => ({ ...prev, [name]: value === "" ? undefined : Number(value) }))
      }
    } else if (formType === "personel") {
      if (name === "jabatan_id") {
        setNewPersonel((prev) => ({ ...prev, [name]: value === "" ? undefined : Number(value) }))
      } else {
        setNewPersonel((prev) => ({ ...prev, [name]: value }))
      }
    } else if (formType === "jabatan") {
      setNewJabatan((prev) => ({ ...prev, [name]: value }))
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

  // CRUD Operations for Personel
  const handleAddPersonel = async () => {
    try {
      const createdPersonel = await createPersonel(newPersonel)
      // Reload data to get updated view
      const personelResponse = await fetchPersonel()
      setPersonelData(personelResponse as PersonelData[])
      setIsAddPersonelOpen(false)
      resetPersonelForm()

      toast({
        title: "Berhasil",
        description: "Personel berhasil ditambahkan",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan personel",
        variant: "destructive",
      })
    }
  }

  const handleEditPersonel = async () => {
    if (!selectedPersonel) return

    try {
      await updatePersonel(selectedPersonel.personel_id, newPersonel)
      // Reload data to get updated view
      const personelResponse = await fetchPersonel()
      setPersonelData(personelResponse as PersonelData[])
      setIsEditPersonelOpen(false)
      setSelectedPersonel(null)

      toast({
        title: "Berhasil",
        description: "Personel berhasil diperbarui",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui personel",
        variant: "destructive",
      })
    }
  }

  const handleDeletePersonel = async () => {
    if (!selectedPersonel) return

    try {
      await deletePersonel(selectedPersonel.personel_id)
      setPersonelData((prev) => prev.filter((item) => item.personel_id !== selectedPersonel.personel_id))
      setIsDeletePersonelOpen(false)
      setSelectedPersonel(null)

      toast({
        title: "Berhasil",
        description: "Personel berhasil dihapus",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus personel",
        variant: "destructive",
      })
    }
  }

  // Add new related data handlers (from cooperation form modals)
  const handleAddNewMitra = async () => {
    try {
      const createdMitra = await createMitra(newMitra)
      // Reload data to get updated view
      const mitraResponse = await fetchMitraData()
      setMitraData(mitraResponse as MitraData[])
      setIsAddMitraModalOpen(false)
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

  const handleAddNewPersonelFromModal = async () => {
    try {
      const createdPersonel = await createPersonel(newPersonel)
      // Reload data to get updated view
      const personelResponse = await fetchPersonel()
      setPersonelData(personelResponse as PersonelData[])
      setIsAddPersonelModalOpen(false)
      resetPersonelForm()

      toast({
        title: "Berhasil",
        description: "Personel berhasil ditambahkan",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan personel",
        variant: "destructive",
      })
    }
  }

  const handleAddNewJabatan = async () => {
    try {
      const createdJabatan = await createJabatan(newJabatan)
      setJabatanData((prev) => [...prev, createdJabatan])
      setIsAddJabatanModalOpen(false)
      resetJabatanForm()

      toast({
        title: "Berhasil",
        description: "Jabatan berhasil ditambahkan",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan jabatan",
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
      no_dokumen: "",
      bidang_kerjasama: "",
      judul_kerjasama: "",
      tanggal_mulai: "",
      tanggal_berakhir: "",
      status: "Aktif",
      catatan: "",
      jumlah_pihak: 2,
      output_kerjasama: "",
      tgl_input: new Date().toISOString().split("T")[0],
      tgl_lapor: "",
      status_lapor: "Belum Lapor",
      tahun: new Date().getFullYear(),
      pelaksana: "",
      mitra_id: undefined,
      jenis_dok_id: undefined,
      pj_upi: undefined,
      pj_mitra: undefined,
      penandatangan_upi: undefined,
      penandatangan_mitra: undefined,
    })
  }

  const resetPersonelForm = () => {
    setNewPersonel({
      nama: "",
      email: "",
      kontak: "",
      jabatan_id: undefined,
      pihak: "UPI",
    })
  }

  const resetJabatanForm = () => {
    setNewJabatan({
      nama_jabatan: "",
      pihak: "UPI",
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
        <h1 className="text-3xl font-bold tracking-tight">Kelola Data</h1>
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
          <TabsTrigger value="personel">Data Personel</TabsTrigger>
        </TabsList>

        {/* DATA MITRA TAB - Keep existing implementation */}
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

        {/* DATA KERJASAMA TAB - Enhanced with improved form layout */}
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
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tambah Kerjasama Baru</DialogTitle>
                      <DialogDescription>
                        Isi form berikut untuk menambahkan kerjasama baru ke dalam sistem
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-8 py-6">
                      {/* Basic Information Section */}
                      <div className="space-y-4">
                        <div className="border-b pb-2">
                          <h3 className="text-lg font-semibold text-gray-900">Informasi Dasar</h3>
                          <p className="text-sm text-gray-600">Informasi umum tentang kerjasama</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="no_dokumen">Nomor Dokumen</Label>
                            <Input
                              id="no_dokumen"
                              name="no_dokumen"
                              value={newKerjasama.no_dokumen || ""}
                              onChange={(e) => handleInputChange(e, "kerjasama")}
                              placeholder="Masukkan nomor dokumen"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tahun">Tahun</Label>
                            <Input
                              id="tahun"
                              name="tahun"
                              type="number"
                              value={newKerjasama.tahun || ""}
                              onChange={(e) => handleInputChange(e, "kerjasama")}
                              placeholder="Masukkan tahun"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
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
                        </div>
                      </div>

                      {/* Partner and Document Information Section */}
                      <div className="space-y-4">
                        <div className="border-b pb-2">
                          <h3 className="text-lg font-semibold text-gray-900">Informasi Mitra & Dokumen</h3>
                          <p className="text-sm text-gray-600">Detail mengenai mitra kerjasama dan jenis dokumen</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="mitra_id">Mitra</Label>
                            <SearchableSelect
                              options={getMitraOptions()}
                              value={newKerjasama.mitra_id}
                              onValueChange={(value) => handleSelectChange("mitra_id", value.toString(), "kerjasama")}
                              placeholder="Pilih mitra"
                              searchPlaceholder="Cari mitra..."
                              emptyText="Mitra tidak ditemukan"
                              onAddNew={() => setIsAddMitraModalOpen(true)}
                              addNewText="Tambah Mitra Baru"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="jenis_dok_id">Jenis Dokumen</Label>
                            <div className="flex gap-2">
                              <SearchableSelect
                                options={getJenisDokumenOptions()}
                                value={newKerjasama.jenis_dok_id}
                                onValueChange={(value) =>
                                  handleSelectChange("jenis_dok_id", value.toString(), "kerjasama")
                                }
                                placeholder="Pilih jenis dokumen"
                                searchPlaceholder="Cari jenis dokumen..."
                                emptyText="Jenis dokumen tidak ditemukan"
                                className="flex-1"
                              />
                              <QuickAddInput
                                onAdd={handleQuickAddJenisDokumen}
                                placeholder="Nama jenis dokumen"
                                addText="Tambah"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="jumlah_pihak">Jumlah Pihak</Label>
                            <Input
                              id="jumlah_pihak"
                              name="jumlah_pihak"
                              type="number"
                              value={newKerjasama.jumlah_pihak || ""}
                              onChange={(e) => handleInputChange(e, "kerjasama")}
                              placeholder="Masukkan jumlah pihak"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dates Section */}
                      <div className="space-y-4">
                        <div className="border-b pb-2">
                          <h3 className="text-lg font-semibold text-gray-900">Tanggal</h3>
                          <p className="text-sm text-gray-600">Informasi periode kerjasama</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
                            <Input
                              id="tanggal_mulai"
                              name="tanggal_mulai"
                              type="date"
                              value={newKerjasama.tanggal_mulai || ""}
                              onChange={(e) => handleInputChange(e, "kerjasama")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tanggal_berakhir">Tanggal Berakhir</Label>
                            <Input
                              id="tanggal_berakhir"
                              name="tanggal_berakhir"
                              type="date"
                              value={newKerjasama.tanggal_berakhir || ""}
                              onChange={(e) => handleInputChange(e, "kerjasama")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tgl_input">Tanggal Input</Label>
                            <Input
                              id="tgl_input"
                              name="tgl_input"
                              type="date"
                              value={newKerjasama.tgl_input || ""}
                              onChange={(e) => handleInputChange(e, "kerjasama")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tgl_lapor">Tanggal Lapor</Label>
                            <Input
                              id="tgl_lapor"
                              name="tgl_lapor"
                              type="date"
                              value={newKerjasama.tgl_lapor || ""}
                              onChange={(e) => handleInputChange(e, "kerjasama")}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Personnel Section */}
                      <div className="space-y-4">
                        <div className="border-b pb-2">
                          <h3 className="text-lg font-semibold text-gray-900">Penanggung Jawab & Penandatangan</h3>
                          <p className="text-sm text-gray-600">Informasi personel yang bertanggung jawab</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="pj_upi">PJ UPI</Label>
                            <SearchableSelect
                              options={getPersonelOptions("UPI")}
                              value={newKerjasama.pj_upi}
                              onValueChange={(value) => handleSelectChange("pj_upi", value.toString(), "kerjasama")}
                              placeholder="Pilih PJ UPI"
                              searchPlaceholder="Cari personel UPI..."
                              emptyText="Personel UPI tidak ditemukan"
                              onAddNew={() => {
                                setNewPersonel({ pihak: "UPI" })
                                setIsAddPersonelModalOpen(true)
                              }}
                              addNewText="Tambah Personel UPI Baru"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pj_mitra">PJ Mitra</Label>
                            <SearchableSelect
                              options={getPersonelOptions("MITRA")}
                              value={newKerjasama.pj_mitra}
                              onValueChange={(value) => handleSelectChange("pj_mitra", value.toString(), "kerjasama")}
                              placeholder="Pilih PJ Mitra"
                              searchPlaceholder="Cari personel Mitra..."
                              emptyText="Personel Mitra tidak ditemukan"
                              onAddNew={() => {
                                setNewPersonel({ pihak: "MITRA" })
                                setIsAddPersonelModalOpen(true)
                              }}
                              addNewText="Tambah Personel Mitra Baru"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="penandatangan_upi">Penandatangan UPI</Label>
                            <SearchableSelect
                              options={getPersonelOptions("UPI")}
                              value={newKerjasama.penandatangan_upi}
                              onValueChange={(value) =>
                                handleSelectChange("penandatangan_upi", value.toString(), "kerjasama")
                              }
                              placeholder="Pilih Penandatangan UPI"
                              searchPlaceholder="Cari personel UPI..."
                              emptyText="Personel UPI tidak ditemukan"
                              onAddNew={() => {
                                setNewPersonel({ pihak: "UPI" })
                                setIsAddPersonelModalOpen(true)
                              }}
                              addNewText="Tambah Personel UPI Baru"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="penandatangan_mitra">Penandatangan Mitra</Label>
                            <SearchableSelect
                              options={getPersonelOptions("MITRA")}
                              value={newKerjasama.penandatangan_mitra}
                              onValueChange={(value) =>
                                handleSelectChange("penandatangan_mitra", value.toString(), "kerjasama")
                              }
                              placeholder="Pilih Penandatangan Mitra"
                              searchPlaceholder="Cari personel Mitra..."
                              emptyText="Personel Mitra tidak ditemukan"
                              onAddNew={() => {
                                setNewPersonel({ pihak: "MITRA" })
                                setIsAddPersonelModalOpen(true)
                              }}
                              addNewText="Tambah Personel Mitra Baru"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Additional Information Section */}
                      <div className="space-y-4">
                        <div className="border-b pb-2">
                          <h3 className="text-lg font-semibold text-gray-900">Informasi Tambahan</h3>
                          <p className="text-sm text-gray-600">Informasi tambahan mengenai kerjasama</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="output_kerjasama">Output Kerjasama</Label>
                            <Textarea
                              id="output_kerjasama"
                              name="output_kerjasama"
                              value={newKerjasama.output_kerjasama || ""}
                              onChange={(e) => handleInputChange(e, "kerjasama")}
                              placeholder="Masukkan output kerjasama"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="catatan">Catatan</Label>
                            <Textarea
                              id="catatan"
                              name="catatan"
                              value={newKerjasama.catatan || ""}
                              onChange={(e) => handleInputChange(e, "kerjasama")}
                              placeholder="Masukkan catatan tambahan"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status_lapor">Status Lapor</Label>
                            <Select
                              name="status_lapor"
                              value={newKerjasama.status_lapor || "Belum Lapor"}
                              onValueChange={(value) => handleSelectChange("status_lapor", value, "kerjasama")}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status lapor" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Sudah Lapor">Sudah Lapor</SelectItem>
                                <SelectItem value="Belum Lapor">Belum Lapor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
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
                                        no_dokumen: item.no_dokumen,
                                        bidang_kerjasama: item.bidang_kerjasama,
                                        judul_kerjasama: item.judul_kerjasama,
                                        tanggal_mulai: item.tanggal_mulai,
                                        tanggal_berakhir: item.tanggal_berakhir,
                                        status: item.status,
                                        catatan: item.catatan,
                                        jumlah_pihak: item.jumlah_pihak,
                                        output_kerjasama: item.output_kerjasama,
                                        tgl_input: item.tgl_input,
                                        tgl_lapor: item.tgl_lapor,
                                        status_lapor: item.status_lapor,
                                        tahun: item.tahun,
                                        pelaksana: item.pelaksana,
                                        mitra_id: item.mitra_id,
                                        jenis_dok_id: item.jenis_dok_id,
                                        pj_upi: item.pj_upi,
                                        pj_mitra: item.pj_mitra,
                                        penandatangan_upi: item.penandatangan_upi,
                                        penandatangan_mitra: item.penandatangan_mitra,
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
            <DialogContent className="max-w-4xl">
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
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Jumlah Pihak</h3>
                      <p className="mt-1">{selectedKerjasama.jumlah_pihak}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nomor Dokumen</h3>
                      <p className="mt-1">{selectedKerjasama.no_dokumen}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tanggal Input</h3>
                      <p className="mt-1">{formatDate(selectedKerjasama.tgl_input)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tanggal Lapor</h3>
                      <p className="mt-1">{formatDate(selectedKerjasama.tgl_lapor)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status Lapor</h3>
                      <p className="mt-1">{selectedKerjasama.status_lapor}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Catatan</h3>
                      <p className="mt-1">{selectedKerjasama.catatan}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Output Kerjasama</h3>
                      <p className="mt-1">{selectedKerjasama.output_kerjasama}</p>
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
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Kerjasama</DialogTitle>
                <DialogDescription>Edit informasi kerjasama dalam sistem</DialogDescription>
              </DialogHeader>
              <div className="grid gap-8 py-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Informasi Dasar</h3>
                    <p className="text-sm text-gray-600">Informasi umum tentang kerjasama</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_no_dokumen">Nomor Dokumen</Label>
                      <Input
                        id="edit_no_dokumen"
                        name="no_dokumen"
                        value={newKerjasama.no_dokumen || ""}
                        onChange={(e) => handleInputChange(e, "kerjasama")}
                        placeholder="Masukkan nomor dokumen"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_tahun">Tahun</Label>
                      <Input
                        id="edit_tahun"
                        name="tahun"
                        type="number"
                        value={newKerjasama.tahun || ""}
                        onChange={(e) => handleInputChange(e, "kerjasama")}
                        placeholder="Masukkan tahun"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_status">Status</Label>
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
                  </div>
                </div>

                {/* Partner and Document Information Section */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Informasi Mitra & Dokumen</h3>
                    <p className="text-sm text-gray-600">Detail mengenai mitra kerjasama dan jenis dokumen</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_mitra_id">Mitra</Label>
                      <SearchableSelect
                        options={getMitraOptions()}
                        value={newKerjasama.mitra_id}
                        onValueChange={(value) => handleSelectChange("mitra_id", value.toString(), "kerjasama")}
                        placeholder="Pilih mitra"
                        searchPlaceholder="Cari mitra..."
                        emptyText="Mitra tidak ditemukan"
                        onAddNew={() => setIsAddMitraModalOpen(true)}
                        addNewText="Tambah Mitra Baru"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_jenis_dok_id">Jenis Dokumen</Label>
                      <div className="flex gap-2">
                        <SearchableSelect
                          options={getJenisDokumenOptions()}
                          value={newKerjasama.jenis_dok_id}
                          onValueChange={(value) => handleSelectChange("jenis_dok_id", value.toString(), "kerjasama")}
                          placeholder="Pilih jenis dokumen"
                          searchPlaceholder="Cari jenis dokumen..."
                          emptyText="Jenis dokumen tidak ditemukan"
                          className="flex-1"
                        />
                        <QuickAddInput
                          onAdd={handleQuickAddJenisDokumen}
                          placeholder="Nama jenis dokumen"
                          addText="Tambah"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_jumlah_pihak">Jumlah Pihak</Label>
                      <Input
                        id="edit_jumlah_pihak"
                        name="jumlah_pihak"
                        type="number"
                        value={newKerjasama.jumlah_pihak || ""}
                        onChange={(e) => handleInputChange(e, "kerjasama")}
                        placeholder="Masukkan jumlah pihak"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Tanggal</h3>
                    <p className="text-sm text-gray-600">Informasi periode kerjasama</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_tanggal_mulai">Tanggal Mulai</Label>
                      <Input
                        id="edit_tanggal_mulai"
                        name="tanggal_mulai"
                        type="date"
                        value={newKerjasama.tanggal_mulai || ""}
                        onChange={(e) => handleInputChange(e, "kerjasama")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_tanggal_berakhir">Tanggal Berakhir</Label>
                      <Input
                        id="edit_tanggal_berakhir"
                        name="tanggal_berakhir"
                        type="date"
                        value={newKerjasama.tanggal_berakhir || ""}
                        onChange={(e) => handleInputChange(e, "kerjasama")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_tgl_input">Tanggal Input</Label>
                      <Input
                        id="edit_tgl_input"
                        name="tgl_input"
                        type="date"
                        value={newKerjasama.tgl_input || ""}
                        onChange={(e) => handleInputChange(e, "kerjasama")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_tgl_lapor">Tanggal Lapor</Label>
                      <Input
                        id="edit_tgl_lapor"
                        name="tgl_lapor"
                        type="date"
                        value={newKerjasama.tgl_lapor || ""}
                        onChange={(e) => handleInputChange(e, "kerjasama")}
                      />
                    </div>
                  </div>
                </div>

                {/* Personnel Section */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Penanggung Jawab & Penandatangan</h3>
                    <p className="text-sm text-gray-600">Informasi personel yang bertanggung jawab</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_pj_upi">PJ UPI</Label>
                      <SearchableSelect
                        options={getPersonelOptions("UPI")}
                        value={newKerjasama.pj_upi}
                        onValueChange={(value) => handleSelectChange("pj_upi", value.toString(), "kerjasama")}
                        placeholder="Pilih PJ UPI"
                        searchPlaceholder="Cari personel UPI..."
                        emptyText="Personel UPI tidak ditemukan"
                        onAddNew={() => {
                          setNewPersonel({ pihak: "UPI" })
                          setIsAddPersonelModalOpen(true)
                        }}
                        addNewText="Tambah Personel UPI Baru"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_pj_mitra">PJ Mitra</Label>
                      <SearchableSelect
                        options={getPersonelOptions("MITRA")}
                        value={newKerjasama.pj_mitra}
                        onValueChange={(value) => handleSelectChange("pj_mitra", value.toString(), "kerjasama")}
                        placeholder="Pilih PJ Mitra"
                        searchPlaceholder="Cari personel Mitra..."
                        emptyText="Personel Mitra tidak ditemukan"
                        onAddNew={() => {
                          setNewPersonel({ pihak: "MITRA" })
                          setIsAddPersonelModalOpen(true)
                        }}
                        addNewText="Tambah Personel Mitra Baru"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_penandatangan_upi">Penandatangan UPI</Label>
                      <SearchableSelect
                        options={getPersonelOptions("UPI")}
                        value={newKerjasama.penandatangan_upi}
                        onValueChange={(value) =>
                          handleSelectChange("penandatangan_upi", value.toString(), "kerjasama")
                        }
                        placeholder="Pilih Penandatangan UPI"
                        searchPlaceholder="Cari personel UPI..."
                        emptyText="Personel UPI tidak ditemukan"
                        onAddNew={() => {
                          setNewPersonel({ pihak: "UPI" })
                          setIsAddPersonelModalOpen(true)
                        }}
                        addNewText="Tambah Personel UPI Baru"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_penandatangan_mitra">Penandatangan Mitra</Label>
                      <SearchableSelect
                        options={getPersonelOptions("MITRA")}
                        value={newKerjasama.penandatangan_mitra}
                        onValueChange={(value) =>
                          handleSelectChange("penandatangan_mitra", value.toString(), "kerjasama")
                        }
                        placeholder="Pilih Penandatangan Mitra"
                        searchPlaceholder="Cari personel Mitra..."
                        emptyText="Personel Mitra tidak ditemukan"
                        onAddNew={() => {
                          setNewPersonel({ pihak: "MITRA" })
                          setIsAddPersonelModalOpen(true)
                        }}
                        addNewText="Tambah Personel Mitra Baru"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Informasi Tambahan</h3>
                    <p className="text-sm text-gray-600">Informasi tambahan mengenai kerjasama</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_output_kerjasama">Output Kerjasama</Label>
                      <Textarea
                        id="edit_output_kerjasama"
                        name="output_kerjasama"
                        value={newKerjasama.output_kerjasama || ""}
                        onChange={(e) => handleInputChange(e, "kerjasama")}
                        placeholder="Masukkan output kerjasama"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_catatan">Catatan</Label>
                      <Textarea
                        id="edit_catatan"
                        name="catatan"
                        value={newKerjasama.catatan || ""}
                        onChange={(e) => handleInputChange(e, "kerjasama")}
                        placeholder="Masukkan catatan tambahan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_status_lapor">Status Lapor</Label>
                      <Select
                        name="status_lapor"
                        value={newKerjasama.status_lapor || "Belum Lapor"}
                        onValueChange={(value) => handleSelectChange("status_lapor", value, "kerjasama")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status lapor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sudah Lapor">Sudah Lapor</SelectItem>
                          <SelectItem value="Belum Lapor">Belum Lapor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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

        {/* DATA PERSONEL TAB */}
        <TabsContent value="personel" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Daftar Personel</CardTitle>
                  <CardDescription>Kelola data personel yang terdaftar dalam sistem</CardDescription>
                </div>
                <Dialog open={isAddPersonelOpen} onOpenChange={setIsAddPersonelOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Personel
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tambah Personel Baru</DialogTitle>
                      <DialogDescription>
                        Isi form berikut untuk menambahkan personel baru ke dalam sistem
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="nama">Nama Lengkap</Label>
                          <Input
                            id="nama"
                            name="nama"
                            value={newPersonel.nama || ""}
                            onChange={(e) => handleInputChange(e, "personel")}
                            placeholder="Masukkan nama lengkap"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="pihak">Pihak</Label>
                          <Select
                            name="pihak"
                            value={newPersonel.pihak || "UPI"}
                            onValueChange={(value) => handleSelectChange("pihak", value, "personel")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih pihak" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UPI">UPI</SelectItem>
                              <SelectItem value="Mitra">Mitra</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={newPersonel.email || ""}
                            onChange={(e) => handleInputChange(e, "personel")}
                            placeholder="Masukkan email"
                          />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="kontak">Kontak</Label>
                          <Input
                            id="kontak"
                            name="kontak"
                            value={newPersonel.kontak || ""}
                            onChange={(e) => handleInputChange(e, "personel")}
                            placeholder="Masukkan kontak"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="jabatan_id">Jabatan</Label>
                          <SearchableSelect
                            options={getJabatanOptions(newPersonel.pihak as "UPI" | "MITRA")}
                            value={newPersonel.jabatan_id}
                            onValueChange={(value) => handleSelectChange("jabatan_id", value.toString(), "personel")}
                            placeholder="Pilih jabatan"
                            searchPlaceholder="Cari jabatan..."
                            emptyText="Jabatan tidak ditemukan"
                            onAddNew={() => setIsAddJabatanModalOpen(true)}
                            addNewText="Tambah Jabatan Baru"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddPersonelOpen(false)}>
                        Batal
                      </Button>
                      <Button onClick={handleAddPersonel}>Simpan</Button>
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
                      placeholder="Cari personel..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={filterPihak} onValueChange={setFilterPihak}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Pihak" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Pihak</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Mitra">Mitra</SelectItem>
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
                      onClick={() => handleExportToCSV(filteredPersonel, "personel_data")}
                      disabled={filteredPersonel.length === 0}
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
                        <TableHead>Kontak</TableHead>
                        <TableHead>Jabatan</TableHead>
                        <TableHead>Pihak</TableHead>
                        <TableHead>Tanggal Dibuat</TableHead>
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
                      ) : currentPersonel.length > 0 ? (
                        currentPersonel.map((item) => (
                          <TableRow key={item.personel_id}>
                            <TableCell className="font-medium">{item.nama}</TableCell>
                            <TableCell>{item.email}</TableCell>
                            <TableCell>{item.kontak}</TableCell>
                            <TableCell>{item.nama_jabatan}</TableCell>
                            <TableCell>{item.pihak}</TableCell>
                            <TableCell>{formatDate(item.created_at)}</TableCell>
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
                                      setSelectedPersonel(item)
                                      setIsViewPersonelOpen(true)
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Lihat Detail
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedPersonel(item)
                                      setNewPersonel({
                                        nama: item.nama,
                                        email: item.email,
                                        kontak: item.kontak,
                                        jabatan_id: item.jabatan_id,
                                        pihak: item.pihak,
                                      })
                                      setIsEditPersonelOpen(true)
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedPersonel(item)
                                      setIsDeletePersonelOpen(true)
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

                {/* Pagination for Personel */}
                {filteredPersonel.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPersonel.length)} dari{" "}
                      {filteredPersonel.length} data
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
                        {Array.from({ length: Math.min(5, totalPersonelPages) }, (_, i) => {
                          let pageNumber
                          if (totalPersonelPages <= 5) {
                            pageNumber = i + 1
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1
                          } else if (currentPage >= totalPersonelPages - 2) {
                            pageNumber = totalPersonelPages - 4 + i
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
                        disabled={currentPage === totalPersonelPages}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* View Personel Dialog */}
          <Dialog open={isViewPersonelOpen} onOpenChange={setIsViewPersonelOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detail Personel</DialogTitle>
              </DialogHeader>
              {selectedPersonel && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nama Lengkap</h3>
                      <p className="mt-1 font-medium">{selectedPersonel.nama}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Pihak</h3>
                      <p className="mt-1">{selectedPersonel.pihak}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1">{selectedPersonel.email}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Kontak</h3>
                      <p className="mt-1">{selectedPersonel.kontak}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Jabatan</h3>
                      <p className="mt-1">{selectedPersonel.nama_jabatan}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tanggal Dibuat</h3>
                      <p className="mt-1">{formatDate(selectedPersonel.created_at)}</p>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setIsViewPersonelOpen(false)}>Tutup</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Personel Dialog */}
          <Dialog open={isEditPersonelOpen} onOpenChange={setIsEditPersonelOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Personel</DialogTitle>
                <DialogDescription>Edit informasi personel dalam sistem</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit_nama">Nama Lengkap</Label>
                    <Input
                      id="edit_nama"
                      name="nama"
                      value={newPersonel.nama || ""}
                      onChange={(e) => handleInputChange(e, "personel")}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_pihak">Pihak</Label>
                    <Select
                      name="pihak"
                      value={newPersonel.pihak || "UPI"}
                      onValueChange={(value) => handleSelectChange("pihak", value, "personel")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pihak" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Mitra">Mitra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="edit_email">Email</Label>
                    <Input
                      id="edit_email"
                      name="email"
                      type="email"
                      value={newPersonel.email || ""}
                      onChange={(e) => handleInputChange(e, "personel")}
                      placeholder="Masukkan email"
                    />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="edit_kontak">Kontak</Label>
                    <Input
                      id="edit_kontak"
                      name="kontak"
                      value={newPersonel.kontak || ""}
                      onChange={(e) => handleInputChange(e, "personel")}
                      placeholder="Masukkan kontak"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_jabatan_id">Jabatan</Label>
                    <SearchableSelect
                      options={getJabatanOptions(newPersonel.pihak as "UPI" | "MITRA")}
                      value={newPersonel.jabatan_id}
                      onValueChange={(value) => handleSelectChange("jabatan_id", value.toString(), "personel")}
                      placeholder="Pilih jabatan"
                      searchPlaceholder="Cari jabatan..."
                      emptyText="Jabatan tidak ditemukan"
                      onAddNew={() => setIsAddJabatanModalOpen(true)}
                      addNewText="Tambah Jabatan Baru"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditPersonelOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleEditPersonel}>Simpan Perubahan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Personel Dialog */}
          <AlertDialog open={isDeletePersonelOpen} onOpenChange={setIsDeletePersonelOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus personel "{selectedPersonel?.nama}"? Tindakan ini tidak dapat
                  dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePersonel} className="bg-red-600 hover:bg-red-700">
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>

      {/* Add New Mitra Modal */}
      <Dialog open={isAddMitraModalOpen} onOpenChange={setIsAddMitraModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Mitra Baru</DialogTitle>
            <DialogDescription>Isi form berikut untuk menambahkan mitra baru ke dalam sistem</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="modal_nama_mitra">Nama Mitra</Label>
                <Input
                  id="modal_nama_mitra"
                  name="nama_mitra"
                  value={newMitra.nama_mitra || ""}
                  onChange={(e) => handleInputChange(e, "mitra")}
                  placeholder="Masukkan nama mitra"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="modal_negara_id">Negara</Label>
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
                <Label htmlFor="modal_jenis_partner_id">Jenis Partner</Label>
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
                <Label htmlFor="modal_alamat">Alamat</Label>
                <Textarea
                  id="modal_alamat"
                  name="alamat"
                  value={newMitra.alamat || ""}
                  onChange={(e) => handleInputChange(e, "mitra")}
                  placeholder="Masukkan alamat lengkap"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMitraModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddNewMitra}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Personel Modal */}
      <Dialog open={isAddPersonelModalOpen} onOpenChange={setIsAddPersonelModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Personel Baru</DialogTitle>
            <DialogDescription>Isi form berikut untuk menambahkan personel baru ke dalam sistem</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="modal_nama">Nama Lengkap</Label>
                <Input
                  id="modal_nama"
                  name="nama"
                  value={newPersonel.nama || ""}
                  onChange={(e) => handleInputChange(e, "personel")}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="modal_pihak">Pihak</Label>
                <Select
                  name="pihak"
                  value={newPersonel.pihak || "UPI"}
                  onValueChange={(value) => handleSelectChange("pihak", value, "personel")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pihak" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Mitra">Mitra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="modal_email">Email</Label>
                <Input
                  id="modal_email"
                  name="email"
                  type="email"
                  value={newPersonel.email || ""}
                  onChange={(e) => handleInputChange(e, "personel")}
                  placeholder="Masukkan email"
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="modal_kontak">Kontak</Label>
                <Input
                  id="modal_kontak"
                  name="kontak"
                  value={newPersonel.kontak || ""}
                  onChange={(e) => handleInputChange(e, "personel")}
                  placeholder="Masukkan kontak"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="modal_jabatan_id">Jabatan</Label>
                <SearchableSelect
                  options={getJabatanOptions(newPersonel.pihak as "UPI" | "MITRA")}
                  value={newPersonel.jabatan_id}
                  onValueChange={(value) => handleSelectChange("jabatan_id", value.toString(), "personel")}
                  placeholder="Pilih jabatan"
                  searchPlaceholder="Cari jabatan..."
                  emptyText="Jabatan tidak ditemukan"
                  onAddNew={() => setIsAddJabatanModalOpen(true)}
                  addNewText="Tambah Jabatan Baru"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPersonelModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddNewPersonelFromModal}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Jabatan Modal */}
      <Dialog open={isAddJabatanModalOpen} onOpenChange={setIsAddJabatanModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Jabatan Baru</DialogTitle>
            <DialogDescription>Isi form berikut untuk menambahkan jabatan baru ke dalam sistem</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="modal_nama_jabatan">Nama Jabatan</Label>
              <Input
                id="modal_nama_jabatan"
                name="nama_jabatan"
                value={newJabatan.nama_jabatan || ""}
                onChange={(e) => handleInputChange(e, "jabatan")}
                placeholder="Masukkan nama jabatan"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="modal_pihak">Pihak</Label>
              <Select
                name="pihak"
                value={newJabatan.pihak || "UPI"}
                onValueChange={(value) => handleSelectChange("pihak", value, "jabatan")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pihak" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Mitra">Mitra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddJabatanModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddNewJabatan}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
