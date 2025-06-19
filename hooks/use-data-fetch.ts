"use client"

import { useState, useEffect, useCallback } from "react"
import {
  fetchMitraData,
  fetchKerjasamaData,
  fetchPersonel,
  fetchJabatan,
  fetchNegara,
  fetchJenisPartner,
  fetchJenisDokumen,
  extractYearsFromDates,
} from "@/lib/dataService"
import { useToast } from "@/hooks/use-toast"
import type {
  MitraData,
  KerjasamaData,
  PersonelData,
  JabatanData,
  NegaraData,
  JenisPartnerData,
  JenisDokumenData,
} from "@/types"

export function useDataFetch() {
  const { toast } = useToast()
  const [mitraData, setMitraData] = useState<MitraData[]>([])
  const [kerjasamaData, setKerjasamaData] = useState<KerjasamaData[]>([])
  const [personelData, setPersonelData] = useState<PersonelData[]>([])
  const [jabatanData, setJabatanData] = useState<JabatanData[]>([])
  const [negaraData, setNegaraData] = useState<NegaraData[]>([])
  const [jenisPartnerData, setJenisPartnerData] = useState<JenisPartnerData[]>([])
  const [jenisDokumenData, setJenisDokumenData] = useState<JenisDokumenData[]>([])
  const [uniqueJenisPartner, setUniqueJenisPartner] = useState<string[]>([])
  const [uniqueNegara, setUniqueNegara] = useState<string[]>([])
  const [uniqueJenisDokumen, setUniqueJenisDokumen] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
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

      const jenisPartnerSet = new Set(mitraResponse.map((item) => item.jenis_partner_nama).filter(Boolean))
      const negaraSet = new Set([
        ...mitraResponse.map((item) => item.nama_negara).filter(Boolean),
        ...kerjasamaResponse.map((item) => item.nama_negara).filter(Boolean),
      ])
      const jenisDokumenSet = new Set(kerjasamaResponse.map((item) => item.jenis_dokumen).filter(Boolean))

      setUniqueJenisPartner(Array.from(jenisPartnerSet))
      setUniqueNegara(Array.from(negaraSet))
      setUniqueJenisDokumen(Array.from(jenisDokumenSet))

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
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const refreshData = useCallback(() => {
    loadData()
  }, [loadData])

  return {
    mitraData,
    kerjasamaData,
    personelData,
    jabatanData,
    negaraData,
    jenisPartnerData,
    jenisDokumenData,
    uniqueJenisPartner,
    uniqueNegara,
    uniqueJenisDokumen,
    availableYears,
    loading,
    setMitraData,
    setKerjasamaData,
    setPersonelData,
    setJabatanData,
    setNegaraData,
    setJenisPartnerData,
    setJenisDokumenData,
    refreshData,
  }
}