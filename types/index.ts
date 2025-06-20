import type React from "react"

export interface MitraData {
  mitra_id: number
  nama_mitra: string
  alamat: string
  negara_id?: number
  jenis_partner_id?: number
  nama_negara: string
  jenis_partner_nama: string
  created_at?: string
  updated_at?: string
}

export interface KerjasamaData {
  kerjasama_id: number
  no_dokumen?: string
  judul_kerjasama: string
  nama_mitra: string
  nama_negara: string
  bidang_kerjasama?: string
  pelaksana?: string
  status: string
  tanggal_mulai: string
  tanggal_berakhir: string
  jumlah_pihak?: number
  tgl_input?: string
  tgl_lapor?: string
  status_lapor?: string
  catatan?: string
  output_kerjasama?: string
  link_dokumen?: string
  mitra_id?: number
  jenis_dok_id?: number
  jenis_dokumen: string
  tahun?: number
  pj_upi?: number
  pj_mitra?: number
  penandatangan_upi?: number
  penandatangan_mitra?: number
  nama_pj_upi?: string
  nama_pj_mitra?: string
  nama_penandatangan_upi?: string
  nama_penandatangan_mitra?: string
  created_at?: string
  updated_at?: string
}

export interface PersonelData {
  personel_id: number
  nama: string
  email?: string
  kontak?: string
  jabatan_id?: number
  nama_jabatan?: string
  pihak: "UPI" | "MITRA"
  created_at: string
  updated_at: string
}

export interface JabatanData {
  jabatan_id: number
  nama_jabatan: string
  pihak: "UPI" | "MITRA"
  created_at: string
  updated_at: string
}

export interface NegaraData {
  negara_id: number
  nama_negara: string
}

export interface JenisPartnerData {
  jenis_partner_id: number
  nama_jenis: string
}

export interface JenisDokumenData {
  jenis_dok_id: number
  nama_jenis: string
}

export type Field = {
  name: string
  label: string
  type: "text" | "number" | "select" | "textarea" | "email" | "searchable-select" | "date"
  placeholder?: string
  section: string
  options?: { value: string; label: string }[]
  required?: boolean
  className?: string
}

export interface ViewField {
  key: string
  label: string
  className?: string
  render?: (value: any) => string | React.ReactElement
}

export interface MitraTabProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterYearFrom: string
  filterYearTo: string
  toast: (options: any) => void
}
