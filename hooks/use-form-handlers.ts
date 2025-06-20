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
  const jenisDokumenFormRef = useRef<HTMLFormElement | null>(null)

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
  const [isAddJenisDokumenModalOpen, setIsAddJenisDokumenModalOpen] = useState(false)

  // Form data states - only for edit mode to populate initial values
  const [editMitraData, setEditMitraData] = useState<Partial<MitraData>>({})
  const [editKerjasamaData, setEditKerjasamaData] = useState<Partial<KerjasamaData>>({})
  const [editPersonelData, setEditPersonelData] = useState<Partial<PersonelData>>({})

  // State for tracking what should be auto-selected after adding
  const [pendingAutoSelect, setPendingAutoSelect] = useState<{
    type: "mitra" | "personel" | "jenis_dokumen" | "jabatan"
    field?: string
    value?: string | number
  } | null>(null)

  // State to trigger re-render of searchable selects
  const [searchableSelectKey, setSearchableSelectKey] = useState(0)

  // Loading states for individual operations
  const [loadingStates, setLoadingStates] = useState<{
    addMitra: boolean
    addPersonel: boolean
    addJabatan: boolean
    addJenisDokumen: boolean
    addNegara: boolean
  }>({
    addMitra: false,
    addPersonel: false,
    addJabatan: false,
    addJenisDokumen: false,
    addNegara: false,
  })

  // Helper to set loading state
  const setLoadingState = (operation: keyof typeof loadingStates, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [operation]: loading }))
  }

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

  // Auto-select newly added item with improved timing
  const autoSelectNewItem = (
    type: "mitra" | "personel" | "jenis_dokumen" | "jabatan",
    field: string,
    value: string | number,
  ) => {
    // Force re-render of searchable selects to get updated options
    setSearchableSelectKey((prev) => prev + 1)

    // Multiple attempts with increasing delays to ensure options are loaded
    const attempts = [500, 1000, 1500]
    attempts.forEach((delay, index) => {
      setTimeout(() => {
        // Try to find and update the SearchableSelect component
        const container = document.querySelector(`[data-field="${field}"]`)
        if (container) {
          const event = new CustomEvent("autoSelect", {
            detail: { value: value.toString() },
          })
          container.dispatchEvent(event)
        }

        // Also try the hidden input approach
        const formRefs = [kerjasamaFormRef, personelFormRef]
        formRefs.forEach((formRef) => {
          if (formRef.current) {
            const hiddenInput = formRef.current.querySelector(`input[name="${field}"]`) as HTMLInputElement
            if (hiddenInput) {
              hiddenInput.value = value.toString()
              hiddenInput.dispatchEvent(new Event("change", { bubbles: true }))
            }
          }
        })

        // Log for debugging
        console.log(`Auto-select attempt ${index + 1} for ${field} with value ${value}`)
      }, delay)
    })
  }

  const handleAddMitra = async () => {
    setLoadingState("addMitra", true)
    try {
      const formData = getFormData(mitraFormRef)

      // Validate required fields
      if (!formData.nama_mitra || formData.nama_mitra.trim() === "") {
        throw new Error("Nama mitra wajib diisi")
      }

      const createdMitra = await createMitra(formData)

      // Refresh data first
      if (refreshData) {
        await refreshData()
      }

      setIsAddMitraOpen(false)
      mitraFormRef.current?.reset()

      // Auto-select the newly created mitra if we're in kerjasama context
      if (pendingAutoSelect?.type === "mitra") {
        setTimeout(() => {
          autoSelectNewItem("mitra", "mitra_id", createdMitra.mitra_id)
          setPendingAutoSelect(null)
        }, 1000) // Increased delay to ensure data is refreshed
      }

      toast({
        title: "✅ Mitra Berhasil Ditambahkan",
        description: `Mitra "${createdMitra.nama_mitra}" telah berhasil ditambahkan ke sistem dan siap digunakan.`,
        variant: "default",
        duration: 4000,
      })
    } catch (error: any) {
      console.error("Error adding mitra:", error)
      toast({
        title: "❌ Gagal Menambahkan Mitra",
        description: error.message || "Terjadi kesalahan saat menambahkan mitra. Silakan coba lagi.",
        variant: "destructive",
        duration: 5000,
      })
      throw error
    } finally {
      setLoadingState("addMitra", false)
    }
  }

  const handleEditMitra = async () => {
    if (!selectedMitra) return
    setLoadingState("addMitra", true)
    try {
      const formData = getFormData(mitraFormRef)

      if (!formData.nama_mitra || formData.nama_mitra.trim() === "") {
        throw new Error("Nama mitra wajib diisi")
      }

      await updateMitra(selectedMitra.mitra_id, formData)
      if (refreshData) refreshData()
      setIsEditMitraOpen(false)
      setSelectedMitra(null)
      setEditMitraData({})

      toast({
        title: "✅ Mitra Berhasil Diperbarui",
        description: `Data mitra "${formData.nama_mitra}" telah berhasil diperbarui dalam sistem.`,
        variant: "default",
        duration: 4000,
      })
    } catch (error: any) {
      console.error("Error updating mitra:", error)
      toast({
        title: "❌ Gagal Memperbarui Mitra",
        description: error.message || "Terjadi kesalahan saat memperbarui data mitra. Silakan coba lagi.",
        variant: "destructive",
        duration: 5000,
      })
      throw error
    } finally {
      setLoadingState("addMitra", false)
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
        title: "✅ Mitra Berhasil Dihapus",
        description: `Data mitra "${selectedMitra.nama_mitra}" telah berhasil dihapus dari sistem.`,
        variant: "default",
        duration: 4000,
      })
    } catch (error: any) {
      console.error("Error deleting mitra:", error)
      toast({
        title: "❌ Gagal Menghapus Mitra",
        description:
          error.message || "Terjadi kesalahan saat menghapus data mitra. Mungkin data masih digunakan di tempat lain.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const handleAddKerjasama = async () => {
    try {
      const formData = getFormData(kerjasamaFormRef)
      console.log("Submitting kerjasama data:", formData)

      // Validate required fields
      if (!formData.judul_kerjasama || formData.judul_kerjasama.trim() === "") {
        throw new Error("Judul kerjasama wajib diisi")
      }
      if (!formData.mitra_id) {
        throw new Error("Mitra wajib dipilih")
      }

      const createdKerjasama = await createKerjasama(formData)
      if (refreshData) refreshData()
      setIsAddKerjasamaOpen(false)
      kerjasamaFormRef.current?.reset()
      setSearchableSelectKey((prev) => prev + 1) // Reset searchable selects

      toast({
        title: "✅ Kerjasama Berhasil Ditambahkan",
        description: `Kerjasama "${createdKerjasama.judul_kerjasama}" telah berhasil ditambahkan ke sistem.`,
        variant: "default",
        duration: 4000,
      })
    } catch (error: any) {
      console.error("Error in handleAddKerjasama:", error)
      toast({
        title: "❌ Gagal Menambahkan Kerjasama",
        description: error.message || "Terjadi kesalahan saat menambahkan data kerjasama. Silakan coba lagi.",
        variant: "destructive",
        duration: 5000,
      })
      throw error
    }
  }

  const handleEditKerjasama = async () => {
    if (!selectedKerjasama) return
    try {
      const formData = getFormData(kerjasamaFormRef)

      if (!formData.judul_kerjasama || formData.judul_kerjasama.trim() === "") {
        throw new Error("Judul kerjasama wajib diisi")
      }

      await updateKerjasama(selectedKerjasama.kerjasama_id, formData)
      if (refreshData) refreshData()
      setIsEditKerjasamaOpen(false)
      setSelectedKerjasama(null)
      setEditKerjasamaData({})

      toast({
        title: "✅ Kerjasama Berhasil Diperbarui",
        description: `Data kerjasama "${formData.judul_kerjasama}" telah berhasil diperbarui.`,
        variant: "default",
        duration: 4000,
      })
    } catch (error: any) {
      console.error("Error updating kerjasama:", error)
      toast({
        title: "❌ Gagal Memperbarui Kerjasama",
        description: error.message || "Terjadi kesalahan saat memperbarui data kerjasama. Silakan coba lagi.",
        variant: "destructive",
        duration: 5000,
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
        title: "✅ Kerjasama Berhasil Dihapus",
        description: `Data kerjasama "${selectedKerjasama.judul_kerjasama}" telah berhasil dihapus dari sistem.`,
        variant: "default",
        duration: 4000,
      })
    } catch (error: any) {
      console.error("Error deleting kerjasama:", error)
      toast({
        title: "❌ Gagal Menghapus Kerjasama",
        description: error.message || "Terjadi kesalahan saat menghapus data kerjasama. Silakan coba lagi.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const handleAddPersonel = async () => {
    setLoadingState("addPersonel", true)
    try {
      const formData = getFormData(personelFormRef)

      // Validate required fields
      if (!formData.nama || formData.nama.trim() === "") {
        throw new Error("Nama personel wajib diisi")
      }
      if (!formData.pihak) {
        throw new Error("Pihak wajib dipilih")
      }

      const createdPersonel = await createPersonel(formData)

      // Refresh data first
      if (refreshData) {
        await refreshData()
      }

      setIsAddPersonelOpen(false)
      personelFormRef.current?.reset()
      setSearchableSelectKey((prev) => prev + 1) // Reset searchable selects

      // Auto-select the newly created personel if we're in kerjasama context
      if (pendingAutoSelect?.type === "personel" && pendingAutoSelect.field) {
        setTimeout(() => {
          autoSelectNewItem("personel", pendingAutoSelect.field!, createdPersonel.personel_id)
          setPendingAutoSelect(null)
        }, 1000)
      }

      toast({
        title: "✅ Personel Berhasil Ditambahkan",
        description: `Personel "${createdPersonel.nama}" telah berhasil ditambahkan ke sistem dan siap digunakan.`,
        variant: "default",
        duration: 4000,
      })
    } catch (error: any) {
      console.error("Error adding personel:", error)
      toast({
        title: "❌ Gagal Menambahkan Personel",
        description: error.message || "Terjadi kesalahan saat menambahkan data personel. Silakan coba lagi.",
        variant: "destructive",
        duration: 5000,
      })
      throw error
    } finally {
      setLoadingState("addPersonel", false)
    }
  }

  const handleEditPersonel = async () => {
    if (!selectedPersonel) return
    setLoadingState("addPersonel", true)
    try {
      const formData = getFormData(personelFormRef)

      if (!formData.nama || formData.nama.trim() === "") {
        throw new Error("Nama personel wajib diisi")
      }

      await updatePersonel(selectedPersonel.personel_id, formData)
      if (refreshData) refreshData()
      setIsEditPersonelOpen(false)
      setSelectedPersonel(null)
      setEditPersonelData({})

      toast({
        title: "✅ Personel Berhasil Diperbarui",
        description: `Data personel "${formData.nama}" telah berhasil diperbarui.`,
        variant: "default",
        duration: 4000,
      })
    } catch (error: any) {
      console.error("Error updating personel:", error)
      toast({
        title: "❌ Gagal Memperbarui Personel",
        description: error.message || "Terjadi kesalahan saat memperbarui data personel. Silakan coba lagi.",
        variant: "destructive",
        duration: 5000,
      })
      throw error
    } finally {
      setLoadingState("addPersonel", false)
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
        title: "✅ Personel Berhasil Dihapus",
        description: `Data personel "${selectedPersonel.nama}" telah berhasil dihapus dari sistem.`,
        variant: "default",
        duration: 4000,
      })
    } catch (error: any) {
      console.error("Error deleting personel:", error)
      toast({
        title: "❌ Gagal Menghapus Personel",
        description:
          error.message ||
          "Terjadi kesalahan saat menghapus data personel. Mungkin data masih digunakan di tempat lain.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const handleAddJabatan = async () => {
    setLoadingState("addJabatan", true)
    try {
      const formData = getFormData(jabatanFormRef)

      // Validate required fields
      if (!formData.nama_jabatan || formData.nama_jabatan.trim() === "") {
        throw new Error("Nama jabatan wajib diisi")
      }
      if (!formData.pihak) {
        throw new Error("Pihak wajib dipilih")
      }

      const createdJabatan = await createJabatan(formData)

      // Refresh data first
      if (refreshData) {
        await refreshData()
      }

      setIsAddJabatanModalOpen(false)
      jabatanFormRef.current?.reset()

      // Auto-select the newly created jabatan if we're in personel context
      if (pendingAutoSelect?.type === "jabatan") {
        setTimeout(() => {
          autoSelectNewItem("jabatan", "jabatan_id", createdJabatan.jabatan_id)
          setPendingAutoSelect(null)
        }, 1000)
      }

      toast({
        title: "✅ Jabatan Berhasil Ditambahkan",
        description: `Jabatan "${formData.nama_jabatan}" untuk pihak ${formData.pihak} telah berhasil ditambahkan dan siap digunakan.`,
        variant: "default",
        duration: 4000,
      })
    } catch (error: any) {
      console.error("Error adding jabatan:", error)
      toast({
        title: "❌ Gagal Menambahkan Jabatan",
        description: error.message || "Terjadi kesalahan saat menambahkan jabatan. Silakan coba lagi.",
        variant: "destructive",
        duration: 5000,
      })
      throw error
    } finally {
      setLoadingState("addJabatan", false)
    }
  }

  const handleAddNegara = async (nama_negara: string) => {
    setLoadingState("addNegara", true)
    try {
      if (!nama_negara || nama_negara.trim() === "") {
        throw new Error("Nama negara wajib diisi")
      }

      await createNegara({ nama_negara: nama_negara.trim() })
      if (refreshData) refreshData()

      toast({
        title: "✅ Negara Berhasil Ditambahkan",
        description: `Negara "${nama_negara}" telah berhasil ditambahkan ke sistem dan siap digunakan.`,
        variant: "default",
        duration: 4000,
      })
    } catch (error: any) {
      console.error("Error adding negara:", error)
      toast({
        title: "❌ Gagal Menambahkan Negara",
        description: error.message || "Terjadi kesalahan saat menambahkan negara. Mungkin negara sudah ada.",
        variant: "destructive",
        duration: 5000,
      })
      throw error
    } finally {
      setLoadingState("addNegara", false)
    }
  }

  const handleAddJenisDokumen = async () => {
    setLoadingState("addJenisDokumen", true)
    try {
      const formData = getFormData(jenisDokumenFormRef)

      // Validate required fields
      if (!formData.nama_jenis || formData.nama_jenis.trim() === "") {
        throw new Error("Nama jenis dokumen wajib diisi")
      }

      const createdJenisDokumen = await createJenisDokumen({
        nama_jenis: formData.nama_jenis.trim(),
        deskripsi: formData.deskripsi?.trim() || null,
      })

      // Refresh data first
      if (refreshData) {
        await refreshData()
      }

      setIsAddJenisDokumenModalOpen(false)
      jenisDokumenFormRef.current?.reset()

      // Auto-select the newly created jenis dokumen
      setTimeout(() => {
        autoSelectNewItem("jenis_dokumen", "jenis_dok_id", createdJenisDokumen.jenis_dok_id)
      }, 1000)

      toast({
        title: "✅ Jenis Dokumen Berhasil Ditambahkan",
        description: `Jenis dokumen "${formData.nama_jenis}" telah berhasil ditambahkan dan siap digunakan.`,
        variant: "default",
        duration: 4000,
      })
    } catch (error: any) {
      console.error("Error adding jenis dokumen:", error)
      toast({
        title: "❌ Gagal Menambahkan Jenis Dokumen",
        description: error.message || "Terjadi kesalahan saat menambahkan jenis dokumen. Silakan coba lagi.",
        variant: "destructive",
        duration: 5000,
      })
      throw error
    } finally {
      setLoadingState("addJenisDokumen", false)
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

  // Functions to handle adding from kerjasama form
  const handleAddMitraFromKerjasama = () => {
    setPendingAutoSelect({ type: "mitra" })
    setIsAddMitraOpen(true)
  }

  const handleAddPersonelFromKerjasama = (field: string) => {
    setPendingAutoSelect({ type: "personel", field })
    setIsAddPersonelOpen(true)
  }

  const handleAddJenisDokumenFromKerjasama = () => {
    setPendingAutoSelect({ type: "jenis_dokumen" })
    setIsAddJenisDokumenModalOpen(true)
  }

  // Function to handle adding jabatan from personel form
  const handleAddJabatanFromPersonel = () => {
    setPendingAutoSelect({ type: "jabatan" })
    setIsAddJabatanModalOpen(true)
  }

  return {
    // Form refs
    mitraFormRef,
    kerjasamaFormRef,
    personelFormRef,
    jabatanFormRef,
    jenisDokumenFormRef,

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
    isAddJenisDokumenModalOpen,

    // Loading states
    loadingStates,

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
    setIsAddJenisDokumenModalOpen,

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

    // New functions for adding from kerjasama form
    handleAddMitraFromKerjasama,
    handleAddPersonelFromKerjasama,
    handleAddJenisDokumenFromKerjasama,

    // New function for adding jabatan from personel form
    handleAddJabatanFromPersonel,

    // Additional state
    searchableSelectKey,
  }
}
