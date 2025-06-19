"use client"

import type React from "react"

import { useState } from "react"
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
import type { MitraData, KerjasamaData, PersonelData, JabatanData } from "@/types/index"

export function useFormHandlers(toast: (options: any) => void, refreshData?: () => void) {
  const [newMitra, setNewMitra] = useState<Partial<MitraData>>({})
  const [newKerjasama, setNewKerjasama] = useState<Partial<KerjasamaData>>({
    status: "Aktif",
    tgl_input: new Date().toISOString().split("T")[0],
    status_lapor: "Belum",
    tahun: new Date().getFullYear(),
    jumlah_pihak: 2,
  })
  const [newPersonel, setNewPersonel] = useState<Partial<PersonelData>>({ pihak: "UPI" })
  const [newJabatan, setNewJabatan] = useState<Partial<JabatanData>>({ pihak: "UPI" })

  const [selectedMitra, setSelectedMitra] = useState<MitraData | null>(null)
  const [selectedKerjasama, setSelectedKerjasama] = useState<KerjasamaData | null>(null)
  const [selectedPersonel, setSelectedPersonel] = useState<PersonelData | null>(null)

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

  // Legacy handlers - masih dibutuhkan untuk komponen lain
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    formType?: "mitra" | "kerjasama" | "personel" | "jabatan",
  ) => {
    const { name, value } = e.target
    const actualFormType = formType || "mitra"

    if (actualFormType === "mitra") {
      setNewMitra((prev: any) => ({ ...prev, [name]: value }))
    } else if (actualFormType === "kerjasama") {
      setNewKerjasama((prev: any) => ({ ...prev, [name]: value }))
    } else if (actualFormType === "personel") {
      setNewPersonel((prev: any) => ({ ...prev, [name]: value }))
    } else if (actualFormType === "jabatan") {
      setNewJabatan((prev: any) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (
    name: string,
    value: string,
    formType?: "mitra" | "kerjasama" | "personel" | "jabatan",
  ) => {
    const actualFormType = formType || "mitra"

    if (actualFormType === "mitra") {
      setNewMitra((prev: any) => ({ ...prev, [name]: value === "" ? undefined : Number(value) }))
    } else if (actualFormType === "kerjasama") {
      if (
        name === "jumlah_pihak" ||
        name === "tahun" ||
        name === "mitra_id" ||
        name === "jenis_dok_id" ||
        name === "pj_upi" ||
        name === "pj_mitra" ||
        name === "penandatangan_upi" ||
        name === "penandatangan_mitra"
      ) {
        setNewKerjasama((prev: any) => ({ ...prev, [name]: value === "" ? undefined : Number(value) }))
      } else {
        setNewKerjasama((prev: any) => ({ ...prev, [name]: value }))
      }
    } else if (actualFormType === "personel") {
      if (name === "jabatan_id") {
        setNewPersonel((prev: any) => ({ ...prev, [name]: value === "" ? undefined : Number(value) }))
      } else {
        setNewPersonel((prev: any) => ({ ...prev, [name]: value }))
      }
    } else if (actualFormType === "jabatan") {
      setNewJabatan((prev: any) => ({ ...prev, [name]: value }))
    }
  }

  const handleAddMitra = async (formData?: { [key: string]: any }) => {
    try {
      const dataToSubmit = formData || newMitra
      const createdMitra = await createMitra(dataToSubmit)
      if (refreshData) refreshData()
      setIsAddMitraOpen(false)
      resetMitraForm()
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
      throw error // Re-throw untuk handling di dialog
    }
  }

  const handleEditMitra = async (formData?: { [key: string]: any }) => {
    if (!selectedMitra) return
    try {
      const dataToSubmit = formData || newMitra
      await updateMitra(selectedMitra.mitra_id, dataToSubmit)
      if (refreshData) refreshData()
      setIsEditMitraOpen(false)
      setSelectedMitra(null)
      resetMitraForm()
      toast({
        title: "✅ Berhasil Diperbarui",
        description: `Data mitra "${dataToSubmit.nama_mitra}" berhasil diperbarui dalam sistem`,
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

  const handleAddKerjasama = async (formData?: { [key: string]: any }) => {
    try {
      const dataToSubmit = formData || newKerjasama
      console.log("Submitting kerjasama data:", dataToSubmit)

      const createdKerjasama = await createKerjasama(dataToSubmit)
      if (refreshData) refreshData()
      setIsAddKerjasamaOpen(false)
      resetKerjasamaForm()
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
      throw error // Re-throw untuk handling di dialog
    }
  }

  const handleEditKerjasama = async (formData?: { [key: string]: any }) => {
    if (!selectedKerjasama) return
    try {
      const dataToSubmit = formData || newKerjasama
      await updateKerjasama(selectedKerjasama.kerjasama_id, dataToSubmit)
      if (refreshData) refreshData()
      setIsEditKerjasamaOpen(false)
      setSelectedKerjasama(null)
      resetKerjasamaForm()
      toast({
        title: "✅ Berhasil Diperbarui",
        description: `Data kerjasama "${dataToSubmit.judul_kerjasama}" berhasil diperbarui`,
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

  const handleAddPersonel = async (formData?: { [key: string]: any }) => {
    try {
      const dataToSubmit = formData || newPersonel
      const createdPersonel = await createPersonel(dataToSubmit)
      if (refreshData) refreshData()
      setIsAddPersonelOpen(false)
      resetPersonelForm()
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

  const handleEditPersonel = async (formData?: { [key: string]: any }) => {
    if (!selectedPersonel) return
    try {
      const dataToSubmit = formData || newPersonel
      await updatePersonel(selectedPersonel.personel_id, dataToSubmit)
      if (refreshData) refreshData()
      setIsEditPersonelOpen(false)
      setSelectedPersonel(null)
      resetPersonelForm()
      toast({
        title: "✅ Berhasil Diperbarui",
        description: `Data personel "${dataToSubmit.nama}" berhasil diperbarui`,
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
      await createJabatan(newJabatan)
      if (refreshData) refreshData()
      setIsAddJabatanModalOpen(false)
      setNewJabatan({ pihak: "UPI" })
      toast({
        title: "✅ Berhasil Ditambahkan",
        description: `Jabatan "${newJabatan.nama_jabatan}" berhasil ditambahkan`,
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

  const resetMitraForm = () => {
    setNewMitra({})
  }

  const resetKerjasamaForm = () => {
    setNewKerjasama({
      status: "Aktif",
      tgl_input: new Date().toISOString().split("T")[0],
      status_lapor: "Belum",
      tahun: new Date().getFullYear(),
      jumlah_pihak: 2,
    })
  }

  const resetPersonelForm = () => {
    setNewPersonel({ pihak: "UPI" })
  }

  return {
    newMitra,
    newKerjasama,
    newPersonel,
    newJabatan,
    selectedMitra,
    selectedKerjasama,
    selectedPersonel,
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
    setNewMitra,
    setNewKerjasama,
    setNewPersonel,
    setNewJabatan,
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
    handleInputChange,
    handleSelectChange,
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
    resetMitraForm,
    resetKerjasamaForm,
    resetPersonelForm,
  }
}
