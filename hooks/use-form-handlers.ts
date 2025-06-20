"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
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
} from "@/lib/dataService"
import type { MitraData, KerjasamaData, PersonelData } from "@/types/index"

export function useFormHandlers(toast: (options: any) => void, refreshData?: () => void) {
  // Form refs for uncontrolled inputs - explicitly allow null
  const mitraFormRef = useRef<HTMLFormElement | null>(null)
  const kerjasamaFormRef = useRef<HTMLFormElement | null>(null)
  const personelFormRef = useRef<HTMLFormElement | null>(null)
  const jabatanFormRef = useRef<HTMLFormElement | null>(null)

  // Only keep essential state for form control
  const [selectedMitra, setSelectedMitra] = useState<MitraData | null>(null)
  const [selectedKerjasama, setSelectedKerjasama] = useState<KerjasamaData | null>(null)
  const [selectedPersonel, setSelectedPersonel] = useState<PersonelData | null>(null)

  // Modal states
  const [isAddMitraOpen, setIsAddMitraOpen] = useState(false)
  const [isEditMitraOpen, setIsEditMitraOpen] = useState(false)
  const [isDeleteMitraOpen, setIsDeleteMitraOpen] = useState(false)
  const [isViewMitraOpen, setIsViewMitraOpen] = useState(false)

  const [isAddKerjasamaOpen, setIsAddKerjasamaOpen] = useState(false)
  const [isEditKerjasamaOpen, setIsEditKerjasamaOpen] = useState(false)
  const [isDeleteKerjasamaOpen, setIsDeleteKerjasamaOpen] = useState(false)
  const [isViewKerjasamaOpen, setIsViewKerjasamaOpen] = useState(false)

  const [isAddPersonelOpen, setIsAddPersonelOpen] = useState(false)
  const [isEditPersonelOpen, setIsEditPersonelOpen] = useState(false)
  const [isDeletePersonelOpen, setIsDeletePersonelOpen] = useState(false)
  const [isViewPersonelOpen, setIsViewPersonelOpen] = useState(false)

  const [isAddMitraModalOpen, setIsAddMitraModalOpen] = useState(false)
  const [isAddPersonelModalOpen, setIsAddPersonelModalOpen] = useState(false)
  const [isAddJabatanModalOpen, setIsAddJabatanModalOpen] = useState(false)

  // Form data states - only for edit mode to populate initial values
  const [editMitraData, setEditMitraData] = useState<Partial<MitraData>>({})
  const [editKerjasamaData, setEditKerjasamaData] = useState<Partial<KerjasamaData>>({})
  const [editPersonelData, setEditPersonelData] = useState<Partial<PersonelData>>({})

  // Get form data from form elements - with proper null checking
  const getFormData = (formRef: React.RefObject<HTMLFormElement | null>) => {
    if (!formRef.current) return {}

    const formData = new FormData(formRef.current)
    const data: { [key: string]: any } = {}

    for (const [key, value] of formData.entries()) {
      // Handle different input types
      if (value === "") {
        data[key] = null
      } else if (key.includes("_id") || key === "jumlah_pihak" || key === "tahun") {
        data[key] = value ? Number(value) : null
      } else {
        data[key] = value
      }
    }

    return data
  }

  // Set form values for edit mode - with proper null checking
  const setFormValues = (formRef: React.RefObject<HTMLFormElement | null>, data: any) => {
    if (!formRef.current) return

    const form = formRef.current
    Object.entries(data).forEach(([key, value]) => {
      const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      if (input && value !== null && value !== undefined) {
        input.value = value.toString()
      }
    })
  }

  const handleAddMitra = async () => {
    try {
      const formData = getFormData(mitraFormRef)
      const createdMitra = await createMitra(formData)
      if (refreshData) refreshData()
      setIsAddMitraOpen(false)
      mitraFormRef.current?.reset()
      toast({
        title: "✅ Berhasil Ditambahkan",
        description: `Mitra "${createdMitra.nama_mitra}" berhasil ditambahkan ke sistem`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "❌ Gagal Menambahkan",
        description: error.message || "Terjadi kesalahan saat menambahkan mitra.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleEditMitra = async () => {
    if (!selectedMitra) return
    try {
      const formData = getFormData(mitraFormRef)
      await updateMitra(selectedMitra.mitra_id, formData)
      if (refreshData) refreshData()
      setIsEditMitraOpen(false)
      setSelectedMitra(null)
      setEditMitraData({})
      toast({
        title: "✅ Berhasil Diperbarui",
        description: `Data mitra "${formData.nama_mitra}" berhasil diperbarui dalam sistem`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "❌ Gagal Memperbarui",
        description: error.message || "Terjadi kesalahan saat memperbarui data mitra.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleDeleteMitra = async () => {
    if (!selectedMitra) return
    try {
      await deleteMitra(selectedMitra.mitra_id)
      if (refreshData) refreshData()
      setIsDeleteMitraOpen(false)
      setSelectedMitra(null)
      toast({
        title: "✅ Berhasil Dihapus",
        description: `Data mitra "${selectedMitra.nama_mitra}" berhasil dihapus dari sistem`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "❌ Gagal Menghapus",
        description: error.message || "Terjadi kesalahan saat menghapus data mitra.",
        variant: "destructive",
      })
    }
  }

  const handleAddKerjasama = async () => {
    try {
      const formData = getFormData(kerjasamaFormRef)
      console.log("Submitting kerjasama data:", formData)

      const createdKerjasama = await createKerjasama(formData)
      if (refreshData) refreshData()
      setIsAddKerjasamaOpen(false)
      kerjasamaFormRef.current?.reset()
      toast({
        title: "✅ Berhasil Ditambahkan",
        description: `Kerjasama "${createdKerjasama.judul_kerjasama}" berhasil ditambahkan ke sistem`,
        variant: "default",
      })
    } catch (error: any) {
      console.error("Error in handleAddKerjasama:", error)
      toast({
        title: "❌ Gagal Menambahkan",
        description: error.message || "Terjadi kesalahan saat menambahkan data kerjasama.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleEditKerjasama = async () => {
    if (!selectedKerjasama) return
    try {
      const formData = getFormData(kerjasamaFormRef)
      await updateKerjasama(selectedKerjasama.kerjasama_id, formData)
      if (refreshData) refreshData()
      setIsEditKerjasamaOpen(false)
      setSelectedKerjasama(null)
      setEditKerjasamaData({})
      toast({
        title: "✅ Berhasil Diperbarui",
        description: `Data kerjasama "${formData.judul_kerjasama}" berhasil diperbarui`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "❌ Gagal Memperbarui",
        description: error.message || "Terjadi kesalahan saat memperbarui data kerjasama.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleDeleteKerjasama = async () => {
    if (!selectedKerjasama) return
    try {
      await deleteKerjasama(selectedKerjasama.kerjasama_id)
      if (refreshData) refreshData()
      setIsDeleteKerjasamaOpen(false)
      setSelectedKerjasama(null)
      toast({
        title: "✅ Berhasil Dihapus",
        description: `Data kerjasama "${selectedKerjasama.judul_kerjasama}" berhasil dihapus dari sistem`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "❌ Gagal Menghapus",
        description: error.message || "Terjadi kesalahan saat menghapus data kerjasama.",
        variant: "destructive",
      })
    }
  }

  const handleAddPersonel = async () => {
    try {
      const formData = getFormData(personelFormRef)
      const createdPersonel = await createPersonel(formData)
      if (refreshData) refreshData()
      setIsAddPersonelOpen(false)
      personelFormRef.current?.reset()
      toast({
        title: "✅ Berhasil Ditambahkan",
        description: `Personel "${createdPersonel.nama}" berhasil ditambahkan ke sistem`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "❌ Gagal Menambahkan",
        description: error.message || "Terjadi kesalahan saat menambahkan data personel.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleEditPersonel = async () => {
    if (!selectedPersonel) return
    try {
      const formData = getFormData(personelFormRef)
      await updatePersonel(selectedPersonel.personel_id, formData)
      if (refreshData) refreshData()
      setIsEditPersonelOpen(false)
      setSelectedPersonel(null)
      setEditPersonelData({})
      toast({
        title: "✅ Berhasil Diperbarui",
        description: `Data personel "${formData.nama}" berhasil diperbarui`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "❌ Gagal Memperbarui",
        description: error.message || "Terjadi kesalahan saat memperbarui data personel.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleDeletePersonel = async () => {
    if (!selectedPersonel) return
    try {
      await deletePersonel(selectedPersonel.personel_id)
      if (refreshData) refreshData()
      setIsDeletePersonelOpen(false)
      setSelectedPersonel(null)
      toast({
        title: "✅ Berhasil Dihapus",
        description: `Data personel "${selectedPersonel.nama}" berhasil dihapus dari sistem`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "❌ Gagal Menghapus",
        description: error.message || "Terjadi kesalahan saat menghapus data personel.",
        variant: "destructive",
      })
    }
  }

  const handleAddJabatan = async () => {
    try {
      const formData = getFormData(jabatanFormRef)
      await createJabatan(formData)
      if (refreshData) refreshData()
      setIsAddJabatanModalOpen(false)
      jabatanFormRef.current?.reset()
      toast({
        title: "✅ Berhasil Ditambahkan",
        description: `Jabatan "${formData.nama_jabatan}" berhasil ditambahkan`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "❌ Gagal Menambahkan",
        description: error.message || "Terjadi kesalahan saat menambahkan jabatan.",
        variant: "destructive",
      })
    }
  }

  const handleAddNegara = async (nama_negara: string) => {
    try {
      await createNegara({ nama_negara })
      if (refreshData) refreshData()
      toast({
        title: "✅ Berhasil Ditambahkan",
        description: `Negara "${nama_negara}" berhasil ditambahkan`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "❌ Gagal Menambahkan",
        description: error.message || "Terjadi kesalahan saat menambahkan negara.",
        variant: "destructive",
      })
    }
  }

  const handleAddJenisDokumen = async (nama_jenis: string) => {
    try {
      await createJenisDokumen({ nama_jenis })
      if (refreshData) refreshData()
      toast({
        title: "✅ Berhasil Ditambahkan",
        description: `Jenis dokumen "${nama_jenis}" berhasil ditambahkan`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "❌ Gagal Menambahkan",
        description: error.message || "Terjadi kesalahan saat menambahkan jenis dokumen.",
        variant: "destructive",
      })
    }
  }

  // Helper function to prepare edit data
  const prepareEditMitra = (item: any, mitraData: any[], negaraData: any[], jenisPartnerData: any[]) => {
    const negaraId = negaraData.find((negara) => negara.nama_negara === item.nama_negara)?.negara_id
    const jenisPartnerId = jenisPartnerData.find(
      (jenis) => jenis.nama_jenis === item.jenis_partner_nama,
    )?.jenis_partner_id

    const formData = {
      nama_mitra: item.nama_mitra || "",
      alamat: item.alamat || "",
      negara_id: negaraId || undefined,
      jenis_partner_id: jenisPartnerId || undefined,
    }

    setSelectedMitra(item)
    setEditMitraData(formData)
    setIsEditMitraOpen(true)

    // Set form values after modal opens
    setTimeout(() => setFormValues(mitraFormRef, formData), 100)
  }

  const prepareEditKerjasama = (item: any, mitraData: any[], jenisDokumenData: any[], personelData: any[]) => {
    // Find IDs by names
    const foundMitra = mitraData.find((mitra) => mitra.nama_mitra === item.nama_mitra)
    const mitraId = foundMitra ? foundMitra.mitra_id : undefined

    const foundJenisDokumen = jenisDokumenData.find((jenis) => jenis.nama_jenis === item.jenis_dokumen)
    const jenisDokId = foundJenisDokumen ? foundJenisDokumen.jenis_dok_id : undefined

    const foundPjUpi = personelData.find((personel) => personel.nama === item.nama_pj_upi)
    const pjUpiId = foundPjUpi ? foundPjUpi.personel_id : undefined

    const foundPjMitra = personelData.find((personel) => personel.nama === item.nama_pj_mitra)
    const pjMitraId = foundPjMitra ? foundPjMitra.personel_id : undefined

    const foundPenandatanganUpi = personelData.find((personel) => personel.nama === item.nama_penandatangan_upi)
    const penandatanganUpiId = foundPenandatanganUpi ? foundPenandatanganUpi.personel_id : undefined

    const foundPenandatanganMitra = personelData.find((personel) => personel.nama === item.nama_penandatangan_mitra)
    const penandatanganMitraId = foundPenandatanganMitra ? foundPenandatanganMitra.personel_id : undefined

    const formData = {
      no_dokumen: item.no_dokumen || "",
      bidang_kerjasama: item.bidang_kerjasama || "",
      judul_kerjasama: item.judul_kerjasama || "",
      tanggal_mulai: item.tanggal_mulai || "",
      tanggal_berakhir: item.tanggal_berakhir || "",
      status: item.status || "Aktif",
      catatan: item.catatan || "",
      jumlah_pihak: item.jumlah_pihak || 2,
      output_kerjasama: item.output_kerjasama || "",
      link_dokumen: item.link_dokumen || "",
      tgl_input: item.tgl_input || "",
      tgl_lapor: item.tgl_lapor || "",
      status_lapor: item.status_lapor || "Belum",
      tahun: item.tahun || new Date().getFullYear(),
      pelaksana: item.pelaksana || "",
      mitra_id: mitraId,
      jenis_dok_id: jenisDokId,
      pj_upi: pjUpiId,
      pj_mitra: pjMitraId,
      penandatangan_upi: penandatanganUpiId,
      penandatangan_mitra: penandatanganMitraId,
    }

    setSelectedKerjasama(item)
    setEditKerjasamaData(formData)
    setIsEditKerjasamaOpen(true)

    // Set form values after modal opens
    setTimeout(() => setFormValues(kerjasamaFormRef, formData), 100)
  }

  const prepareEditPersonel = (item: any, jabatanData: any[]) => {
    const jabatanId = jabatanData.find((jabatan) => jabatan.nama_jabatan === item.nama_jabatan)?.jabatan_id

    const formData = {
      nama: item.nama || "",
      email: item.email || "",
      kontak: item.kontak || "",
      pihak: item.pihak || "UPI",
      jabatan_id: jabatanId || undefined,
    }

    setSelectedPersonel(item)
    setEditPersonelData(formData)
    setIsEditPersonelOpen(true)

    // Set form values after modal opens
    setTimeout(() => setFormValues(personelFormRef, formData), 100)
  }

  return {
    // Form refs
    mitraFormRef,
    kerjasamaFormRef,
    personelFormRef,
    jabatanFormRef,

    // Edit data for initial values
    editMitraData,
    editKerjasamaData,
    editPersonelData,

    // Selected items
    selectedMitra,
    selectedKerjasama,
    selectedPersonel,

    // Modal states
    isAddMitraOpen,
    isEditMitraOpen,
    isDeleteMitraOpen,
    isViewMitraOpen,
    isAddKerjasamaOpen,
    isEditKerjasamaOpen,
    isDeleteKerjasamaOpen,
    isViewKerjasamaOpen,
    isAddPersonelOpen,
    isEditPersonelOpen,
    isDeletePersonelOpen,
    isViewPersonelOpen,
    isAddMitraModalOpen,
    isAddPersonelModalOpen,
    isAddJabatanModalOpen,

    // Setters
    setSelectedMitra,
    setSelectedKerjasama,
    setSelectedPersonel,
    setIsAddMitraOpen,
    setIsEditMitraOpen,
    setIsDeleteMitraOpen,
    setIsViewMitraOpen,
    setIsAddKerjasamaOpen,
    setIsEditKerjasamaOpen,
    setIsDeleteKerjasamaOpen,
    setIsViewKerjasamaOpen,
    setIsAddPersonelOpen,
    setIsEditPersonelOpen,
    setIsDeletePersonelOpen,
    setIsViewPersonelOpen,
    setIsAddMitraModalOpen,
    setIsAddPersonelModalOpen,
    setIsAddJabatanModalOpen,

    // Handlers
    handleAddMitra,
    handleEditMitra,
    handleDeleteMitra,
    handleAddKerjasama,
    handleEditKerjasama,
    handleDeleteKerjasama,
    handleAddPersonel,
    handleEditPersonel,
    handleDeletePersonel,
    handleAddJabatan,
    handleAddNegara,
    handleAddJenisDokumen,

    // Helper functions
    prepareEditMitra,
    prepareEditKerjasama,
    prepareEditPersonel,
  }
}
