// lib/dataService.ts
import { supabase } from "@/lib/supabaseClient"
import type {
  MitraData,
  KerjasamaData,
  PersonelData,
  JabatanData,
  NegaraData,
  JenisPartnerData,
  JenisDokumenData,
} from "@/types"

// Use the types from types/index.ts instead of defining new ones
type PersonelItem = PersonelData
type JabatanItem = JabatanData
type KerjasamaItem = KerjasamaData
type MitraItem = MitraData
type NegaraItem = NegaraData
type JenisPartnerItem = JenisPartnerData
type JenisDokumenItem = JenisDokumenData

interface UserItem {
  id: string
  name: string
  email: string
  username: string
  password?: string
  profile_picture?: string
  is_active: boolean
  created_at: string
  updated_at: string
  [key: string]: any
}

interface RoleItem {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

interface PermissionItem {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

interface UserRoleItem {
  id: string
  user_id: string
  role_id: string
  created_at: string
  updated_at: string
}

interface RolePermissionItem {
  id: string
  role_id: string
  permission_id: string
  created_at: string
  updated_at: string
}

interface ChartDataItem {
  name: string
  value: number
}

interface ChartData {
  negaraStats: ChartDataItem[]
  jenisStats: ChartDataItem[]
}

// Interface untuk data tren
interface TrendChartData {
  year: string
  Total: number
  [key: string]: any
}

interface DashboardData {
  kerjasamaData: KerjasamaItem[]
  mitraData: MitraItem[]
  negaraStats: ChartDataItem[]
  jenisStats: ChartDataItem[]
  kerjasamaTrend: TrendChartData[]
}

// ============= BASIC DATA FETCHING =============

export async function fetchRoles(): Promise<RoleItem[]> {
  const { data, error } = await supabase.from("roles").select("*")

  if (error) {
    console.error("Error fetching roles:", error)
    throw error
  }

  return data || []
}

export async function fetchPermissions(): Promise<PermissionItem[]> {
  const { data, error } = await supabase.from("permissions").select("*")

  if (error) {
    console.error("Error fetching permissions:", error)
    throw error
  }

  return data || []
}

export async function fetchUsers(): Promise<UserItem[]> {
  const { data, error } = await supabase.from("users").select("*")

  if (error) {
    console.error("Error fetching users:", error)
    throw error
  }

  return data || []
}

export async function fetchUserRoles(): Promise<UserRoleItem[]> {
  const { data, error } = await supabase.from("user_roles").select("*")

  if (error) {
    console.error("Error fetching user_roles:", error)
    throw error
  }

  return data || []
}

export async function fetchNegara(): Promise<NegaraItem[]> {
  const { data, error } = await supabase.from("negara").select("*")

  if (error) {
    console.error("Error fetching negara:", error)
    throw error
  }

  return data || []
}

export async function fetchJenisPartner(): Promise<JenisPartnerItem[]> {
  const { data, error } = await supabase.from("jenis_partner").select("*")

  if (error) {
    console.error("Error fetching jenis_partner:", error)
    throw error
  }

  return data || []
}

export async function fetchJenisDokumen(): Promise<JenisDokumenItem[]> {
  const { data, error } = await supabase.from("jenis_dokumen").select("*")

  if (error) {
    console.error("Error fetching jenis_dokumen:", error)
    throw error
  }

  return data || []
}

// Add new fetch functions
export async function fetchPersonel(): Promise<PersonelItem[]> {
  const { data, error } = await supabase.from("personel").select(`
      *,
      jabatan:jabatan_id (
        nama_jabatan
      )
    `)

  if (error) {
    console.error("Error fetching personel:", error)
    throw error
  }

  return (
    data?.map((item) => ({
      ...item,
      nama_jabatan: item.jabatan?.nama_jabatan,
    })) || []
  )
}

export async function fetchJabatan(): Promise<JabatanItem[]> {
  const { data, error } = await supabase.from("jabatan").select("*")

  if (error) {
    console.error("Error fetching jabatan:", error)
    throw error
  }

  return data || []
}

/**
 * Fetch kerjasama data from Supabase using view
 * @returns {Promise<KerjasamaItem[]>} Array of kerjasama objects
 */
export async function fetchKerjasamaData(): Promise<KerjasamaItem[]> {
  const { data, error } = await supabase.from("v_semua_kerjasama").select("*")

  if (error) {
    console.error("Error fetching kerjasama:", error)
    throw error
  }

  return data || []
}

/**
 * Fetch active kerjasama data from Supabase using view
 * @returns {Promise<KerjasamaItem[]>} Array of active kerjasama objects
 */
export async function fetchKerjasamaAktif(): Promise<KerjasamaItem[]> {
  const { data, error } = await supabase.from("v_kerjasama_aktif").select("*")

  if (error) {
    console.error("Error fetching kerjasama aktif:", error)
    throw error
  }

  return data || []
}

/**
 * Fetch kerjasama that will end soon from Supabase using view
 * @returns {Promise<KerjasamaItem[]>} Array of kerjasama ending soon
 */
export async function fetchKerjasamaAkanBerakhir(): Promise<KerjasamaItem[]> {
  const { data, error } = await supabase.from("v_kerjasama_akan_berakhir").select("*")

  if (error) {
    console.error("Error fetching kerjasama akan berakhir:", error)
    throw error
  }

  return data || []
}

/**
 * Fetch mitra data from Supabase using view
 * @returns {Promise<MitraItem[]>} Array of mitra objects
 */
export async function fetchMitraData(): Promise<MitraItem[]> {
  const { data, error } = await supabase.from("v_semua_mitra").select("*")

  if (error) {
    console.error("Error fetching mitra:", error)
    throw error
  }

  return data || []
}

/**
 * Fetch country statistics from Supabase using view
 * @returns {Promise<ChartDataItem[]>} Array of country statistics
 */
export async function fetchStatistikNegara(): Promise<ChartDataItem[]> {
  const { data, error } = await supabase.from("v_statistik_negara").select("*")

  if (error) {
    console.error("Error fetching statistik negara:", error)
    throw error
  }

  return (
    data?.map((item) => ({
      name: item.nama_negara,
      value: item.jumlah_kerjasama,
    })) || []
  )
}

// ============= MITRA CRUD OPERATIONS =============

/**
 * Create new mitra
 */
export async function createMitra(mitraData: Partial<MitraItem>): Promise<MitraItem> {
  try {
    const { data, error } = await supabase
      .from("mitra")
      .insert([
        {
          nama_mitra: mitraData.nama_mitra,
          alamat: mitraData.alamat,
          negara_id: mitraData.negara_id,
          jenis_partner_id: mitraData.jenis_partner_id,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return data as MitraItem
  } catch (error) {
    console.error("Error creating mitra:", error)
    throw error
  }
}

/**
 * Update existing mitra
 */
export async function updateMitra(id: number, mitraData: Partial<MitraItem>): Promise<MitraItem> {
  try {
    const { data, error } = await supabase
      .from("mitra")
      .update({
        nama_mitra: mitraData.nama_mitra,
        alamat: mitraData.alamat,
        negara_id: mitraData.negara_id,
        jenis_partner_id: mitraData.jenis_partner_id,
      })
      .eq("mitra_id", id)
      .select()
      .single()

    if (error) throw error

    return data as MitraItem
  } catch (error) {
    console.error("Error updating mitra:", error)
    throw error
  }
}

/**
 * Delete mitra
 */
export async function deleteMitra(id: number): Promise<boolean> {
  try {
    const { error } = await supabase.from("mitra").delete().eq("mitra_id", id)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error deleting mitra:", error)
    throw error
  }
}

// ============= KERJASAMA CRUD OPERATIONS =============

/**
 * Create new kerjasama
 */
export async function createKerjasama(kerjasamaData: Partial<KerjasamaItem>): Promise<KerjasamaItem> {
  try {
    console.log("Creating kerjasama with data:", kerjasamaData)

    // Validate required fields
    if (!kerjasamaData.judul_kerjasama) {
      throw new Error("Judul kerjasama is required")
    }
    if (!kerjasamaData.mitra_id) {
      throw new Error("Mitra is required")
    }
    if (!kerjasamaData.tanggal_mulai) {
      throw new Error("Tanggal mulai is required")
    }
    if (!kerjasamaData.tanggal_berakhir) {
      throw new Error("Tanggal berakhir is required")
    }

    // Prepare data for insertion - explicitly exclude kerjasama_id to let database auto-generate
    const insertData = {
      no_dokumen: kerjasamaData.no_dokumen || null,
      bidang_kerjasama: kerjasamaData.bidang_kerjasama || null,
      judul_kerjasama: kerjasamaData.judul_kerjasama,
      tanggal_mulai: kerjasamaData.tanggal_mulai,
      tanggal_berakhir: kerjasamaData.tanggal_berakhir,
      status: kerjasamaData.status || "Draft",
      catatan: kerjasamaData.catatan || null,
      jumlah_pihak: kerjasamaData.jumlah_pihak || 2,
      output_kerjasama: kerjasamaData.output_kerjasama || null,
      tgl_input: kerjasamaData.tgl_input || new Date().toISOString().split("T")[0],
      tgl_lapor: kerjasamaData.tgl_lapor || null,
      status_lapor: kerjasamaData.status_lapor || "Belum",
      tahun: kerjasamaData.tahun || new Date().getFullYear(),
      pelaksana: kerjasamaData.pelaksana || null,
      mitra_id: kerjasamaData.mitra_id,
      jenis_dok_id: kerjasamaData.jenis_dok_id || null,
      pj_upi: kerjasamaData.pj_upi || null,
      pj_mitra: kerjasamaData.pj_mitra || null,
      penandatangan_upi: kerjasamaData.penandatangan_upi || null,
      penandatangan_mitra: kerjasamaData.penandatangan_mitra || null,
    }

    console.log("Insert data:", insertData)

    const { data, error } = await supabase.from("kerjasama").insert([insertData]).select().single()

    if (error) {
      console.error("Supabase error:", error)

      // Handle specific error cases
      if (error.code === "23505") {
        throw new Error("Terjadi konflik data. Silakan coba lagi atau hubungi administrator.")
      }

      throw error
    }

    console.log("Created kerjasama:", data)
    return data as KerjasamaItem
  } catch (error) {
    console.error("Error creating kerjasama:", error)
    throw error
  }
}

/**
 * Update existing kerjasama
 */
export async function updateKerjasama(id: number, kerjasamaData: Partial<KerjasamaItem>): Promise<KerjasamaItem> {
  try {
    console.log("Updating kerjasama with ID:", id, "Data:", kerjasamaData)

    // Prepare data for update - only include fields that exist in the database
    const updateData = {
      no_dokumen: kerjasamaData.no_dokumen || null,
      bidang_kerjasama: kerjasamaData.bidang_kerjasama || null,
      judul_kerjasama: kerjasamaData.judul_kerjasama,
      tanggal_mulai: kerjasamaData.tanggal_mulai,
      tanggal_berakhir: kerjasamaData.tanggal_berakhir,
      status: kerjasamaData.status,
      catatan: kerjasamaData.catatan || null,
      jumlah_pihak: kerjasamaData.jumlah_pihak,
      output_kerjasama: kerjasamaData.output_kerjasama || null,
      tgl_input: kerjasamaData.tgl_input || null,
      tgl_lapor: kerjasamaData.tgl_lapor || null,
      status_lapor: kerjasamaData.status_lapor,
      tahun: kerjasamaData.tahun,
      pelaksana: kerjasamaData.pelaksana || null,
      mitra_id: kerjasamaData.mitra_id,
      jenis_dok_id: kerjasamaData.jenis_dok_id || null,
      pj_upi: kerjasamaData.pj_upi || null,
      pj_mitra: kerjasamaData.pj_mitra || null,
      penandatangan_upi: kerjasamaData.penandatangan_mitra || null,
      penandatangan_mitra: kerjasamaData.penandatangan_mitra || null,
    }

    console.log("Update data:", updateData)

    const { data, error } = await supabase.from("kerjasama").update(updateData).eq("kerjasama_id", id).select().single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    console.log("Updated kerjasama:", data)
    return data as KerjasamaItem
  } catch (error) {
    console.error("Error updating kerjasama:", error)
    throw error
  }
}

/**
 * Delete kerjasama
 */
export async function deleteKerjasama(id: number): Promise<boolean> {
  try {
    const { error } = await supabase.from("kerjasama").delete().eq("kerjasama_id", id)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error deleting kerjasama:", error)
    throw error
  }
}

// ============= USER CRUD OPERATIONS =============

/**
 * Create new user
 */
export async function createUser(userData: Partial<UserItem>): Promise<UserItem> {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name: userData.name,
          email: userData.email,
          username: userData.username,
          password: userData.password, // In real app, hash this
          profile_picture: userData.profile_picture,
          is_active: userData.is_active ?? true,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return data as UserItem
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

/**
 * Update existing user
 */
export async function updateUser(id: string, userData: Partial<UserItem>): Promise<UserItem> {
  try {
    const updateData: any = {
      name: userData.name,
      email: userData.email,
      username: userData.username,
      profile_picture: userData.profile_picture,
      is_active: userData.is_active,
    }

    // Only include password if provided
    if (userData.password) {
      updateData.password = userData.password // In real app, hash this
    }

    const { data, error } = await supabase.from("users").update(updateData).eq("id", id).select().single()

    if (error) throw error

    return data as UserItem
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

// Add CRUD operations for personel
export async function createPersonel(personelData: Partial<PersonelItem>): Promise<PersonelItem> {
  try {
    const { data, error } = await supabase
      .from("personel")
      .insert([
        {
          nama: personelData.nama,
          email: personelData.email,
          kontak: personelData.kontak,
          jabatan_id: personelData.jabatan_id,
          pihak: personelData.pihak,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return data as PersonelItem
  } catch (error) {
    console.error("Error creating personel:", error)
    throw error
  }
}

export async function updatePersonel(id: number, personelData: Partial<PersonelItem>): Promise<PersonelItem> {
  try {
    const { data, error } = await supabase
      .from("personel")
      .update({
        nama: personelData.nama,
        email: personelData.email,
        kontak: personelData.kontak,
        jabatan_id: personelData.jabatan_id,
        pihak: personelData.pihak,
      })
      .eq("personel_id", id)
      .select()
      .single()

    if (error) throw error

    return data as PersonelItem
  } catch (error) {
    console.error("Error updating personel:", error)
    throw error
  }
}

export async function deletePersonel(id: number): Promise<boolean> {
  try {
    const { error } = await supabase.from("personel").delete().eq("personel_id", id)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error deleting personel:", error)
    throw error
  }
}

// Add CRUD operations for jabatan
export async function createJabatan(jabatanData: Partial<JabatanItem>): Promise<JabatanItem> {
  try {
    const { data, error } = await supabase
      .from("jabatan")
      .insert([
        {
          nama_jabatan: jabatanData.nama_jabatan,
          pihak: jabatanData.pihak,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return data as JabatanItem
  } catch (error) {
    console.error("Error creating jabatan:", error)
    throw error
  }
}

// Add quick create functions for reference tables
export async function createNegara(negaraData: { nama_negara: string }): Promise<NegaraItem> {
  try {
    const { data, error } = await supabase
      .from("negara")
      .insert([{ nama_negara: negaraData.nama_negara }])
      .select()
      .single()

    if (error) throw error

    return data as NegaraItem
  } catch (error) {
    console.error("Error creating negara:", error)
    throw error
  }
}

export async function createJenisDokumen(jenisDokumenData: { nama_jenis: string }): Promise<JenisDokumenItem> {
  try {
    const { data, error } = await supabase
      .from("jenis_dokumen")
      .insert([{ nama_jenis: jenisDokumenData.nama_jenis }])
      .select()
      .single()

    if (error) throw error

    return data as JenisDokumenItem
  } catch (error) {
    console.error("Error creating jenis dokumen:", error)
    throw error
  }
}

// ============= FILTERING UTILITIES =============

/**
 * Check if a cooperation period overlaps with the filtered year range
 */
export function isCooperationPeriodInYearRange(
  startDate?: string,
  endDate?: string,
  fromYear?: string,
  toYear?: string,
): boolean {
  if (fromYear === "all" && toYear === "all") return true
  if (!startDate && !endDate) return true

  const cooperationStart = startDate ? new Date(startDate) : null
  const cooperationEnd = endDate ? new Date(endDate) : null

  if (startDate && cooperationStart && isNaN(cooperationStart.getTime())) return true
  if (endDate && cooperationEnd && isNaN(cooperationEnd.getTime())) return true

  const filterStartYear = fromYear === "all" ? 1900 : Number.parseInt(fromYear ?? "1900")
  const filterEndYear = toYear === "all" ? 2100 : Number.parseInt(toYear ?? "2100")

  const filterStart = new Date(filterStartYear, 0, 1)
  const filterEnd = new Date(filterEndYear, 11, 31, 23, 59, 59)

  if (cooperationStart && !cooperationEnd) {
    return cooperationStart >= filterStart && cooperationStart <= filterEnd
  }

  if (!cooperationStart && cooperationEnd) {
    return cooperationEnd >= filterStart && cooperationEnd <= filterEnd
  }

  if (cooperationStart && cooperationEnd) {
    return cooperationStart <= filterEnd && cooperationEnd >= filterStart
  }

  return true
}

/**
 * Check if a single date falls within year range
 */
export function isSingleDateInYearRange(dateString?: string, fromYear?: string, toYear?: string): boolean {
  if (!dateString) return true
  if (fromYear === "all" && toYear === "all") return true

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return true

  const year = date.getFullYear()
  const fromYearNum = fromYear === "all" ? Number.NEGATIVE_INFINITY : Number.parseInt(fromYear ?? "1900")
  const toYearNum = toYear === "all" ? Number.POSITIVE_INFINITY : Number.parseInt(toYear ?? "2100")

  return year >= fromYearNum && year <= toYearNum
}

/**
 * Extract unique years from date arrays
 */
export function extractYearsFromDates(dates: (string | undefined)[]): number[] {
  const yearsSet = new Set<number>()

  dates.forEach((dateString) => {
    if (dateString) {
      const year = new Date(dateString).getFullYear()
      if (!isNaN(year) && year > 1900 && year < 2100) {
        yearsSet.add(year)
      }
    }
  })

  return Array.from(yearsSet).sort((a, b) => a - b)
}

/**
 * Filter cooperation data by year range
 */
export function filterKerjasamaByYearRange(data: KerjasamaItem[], fromYear?: string, toYear?: string): KerjasamaItem[] {
  if (fromYear === "all" && toYear === "all") return data

  return data.filter((item) => {
    return isCooperationPeriodInYearRange(item.tanggal_mulai, item.tanggal_berakhir, fromYear, toYear)
  })
}

/**
 * Filter mitra data by year range
 */
export function filterMitraByYearRange(data: MitraItem[], fromYear?: string, toYear?: string): MitraItem[] {
  // For mitra, we don't have date fields in the view, so return all data
  // In a real scenario, you might want to filter based on when the partnership started
  return data
}

/**
 * Filter user data by year range based on creation date
 */
export function filterUsersByYearRange(data: UserItem[], fromYear?: string, toYear?: string): UserItem[] {
  if (fromYear === "all" && toYear === "all") return data

  return data.filter((item) => {
    return isSingleDateInYearRange(item.created_at, fromYear, toYear)
  })
}

// ============= CHART DATA PROCESSING =============

/**
 * Process kerjasama data for charts
 */
export function processChartData(kerjasamaData: KerjasamaItem[]): ChartData {
  // Process data for country chart
  const negaraGrouped: Record<string, number> = {}
  kerjasamaData.forEach((item) => {
    if (!item.nama_negara) return

    if (negaraGrouped[item.nama_negara]) {
      negaraGrouped[item.nama_negara]++
    } else {
      negaraGrouped[item.nama_negara] = 1
    }
  })

  const negaraData: ChartDataItem[] = Object.keys(negaraGrouped).map((key) => ({
    name: key,
    value: negaraGrouped[key],
  }))

  // Process data for document type chart
  const jenisGrouped: Record<string, number> = {}
  kerjasamaData.forEach((item) => {
    if (!item.jenis_dokumen) return

    if (jenisGrouped[item.jenis_dokumen]) {
      jenisGrouped[item.jenis_dokumen]++
    } else {
      jenisGrouped[item.jenis_dokumen] = 1
    }
  })

  const jenisData: ChartDataItem[] = Object.keys(jenisGrouped).map((key) => ({
    name: key,
    value: jenisGrouped[key],
  }))

  return {
    negaraStats: negaraData,
    jenisStats: jenisData,
  }
}

/**
 * Process kerjasama data for trend chart
 * Menghitung jumlah kerjasama per tahun berdasarkan jenis dokumen
 */
export function processKerjasamaTrend(kerjasamaData: KerjasamaItem[]): TrendChartData[] {
  if (!kerjasamaData || kerjasamaData.length === 0) {
    return []
  }

  const yearlyData: { [year: string]: { [docType: string]: number; Total: number } } = {}

  // Inisialisasi jenis dokumen yang ada
  const docTypes = [...new Set(kerjasamaData.map((item) => item.jenis_dokumen))]

  kerjasamaData.forEach((item) => {
    // Gunakan tanggal mulai untuk menentukan tahun kerjasama
    if (item.tanggal_mulai) {
      const year = new Date(item.tanggal_mulai).getFullYear().toString()

      if (!yearlyData[year]) {
        // Inisialisasi tahun jika belum ada
        yearlyData[year] = { Total: 0 }
        docTypes.forEach((type) => {
          yearlyData[year][type] = 0
        })
      }

      // Tambah hitungan
      yearlyData[year].Total++
      if (item.jenis_dokumen) {
        yearlyData[year][item.jenis_dokumen]++
      }
    }
  })

  // Ubah format data menjadi array yang bisa digunakan oleh Recharts
  const trendData = Object.keys(yearlyData)
    .map((year) => ({
      year: year,
      ...yearlyData[year],
    }))
    .sort((a, b) => Number.parseInt(a.year) - Number.parseInt(b.year)) // Urutkan berdasarkan tahun

  return trendData
}

/**
 * Calculate percentage from raw data
 */
export function calculatePercentages(chartData: ChartDataItem[]): ChartDataItem[] {
  if (!chartData || chartData.length === 0) return []

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return chartData.map((item) => ({
    name: item.name,
    value: Math.round((item.value / total) * 100),
  }))
}

/**
 * Fetch all required dashboard data with optional year filtering
 */
export async function fetchDashboardData(fromYear?: string, toYear?: string): Promise<DashboardData> {
  try {
    // Fetch all data in parallel
    const [kerjasama, mitra] = await Promise.all([fetchKerjasamaData(), fetchMitraData()])

    // Apply year filtering if specified
    let filteredKerjasama = kerjasama
    let filteredMitra = mitra

    if (fromYear !== "all" || toYear !== "all") {
      filteredKerjasama = filterKerjasamaByYearRange(kerjasama, fromYear, toYear)
      filteredMitra = filterMitraByYearRange(mitra, fromYear, toYear)
    }

    // Process data for charts
    const { negaraStats, jenisStats } = processChartData(filteredKerjasama)
    const kerjasamaTrend = processKerjasamaTrend(filteredKerjasama) // Proses data tren

    // Convert to percentages for pie charts
    const negaraPercentages = calculatePercentages(negaraStats)
    const jenisPercentages = calculatePercentages(jenisStats)

    return {
      kerjasamaData: filteredKerjasama,
      mitraData: filteredMitra,
      negaraStats: negaraPercentages,
      jenisStats: jenisPercentages,
      kerjasamaTrend: kerjasamaTrend,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    throw error
  }
}

// ============= EXPORT UTILITIES =============

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string): { success: boolean; message: string } {
  try {
    if (data.length === 0) {
      return {
        success: false,
        message: "Tidak ada data untuk diekspor",
      }
    }

    const headers = Object.keys(data[0]).join(",")
    const rows = data.map((item) =>
      Object.values(item)
        .map((val) => `"${val || ""}"`)
        .join(","),
    )
    const csvContent = [headers, ...rows].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return {
      success: true,
      message: `Data berhasil diekspor ke ${filename}.csv`,
    }
  } catch (error) {
    console.error("Error exporting to CSV:", error)
    return {
      success: false,
      message: "Gagal mengekspor data",
    }
  }
}
