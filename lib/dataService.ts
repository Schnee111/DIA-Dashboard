// lib/dataService.ts
import { supabase } from "@/lib/supabaseClient" // Sesuaikan path ke klien Supabase Anda

// Define TypeScript interfaces
interface KerjasamaItem {
  id?: number
  kerjasama_id?: number
  judul_kerjasama?: string
  nama_mitra?: string
  nama_negara?: string
  jenis_dokumen?: string
  status?: string
  tanggal_mulai?: string
  tanggal_berakhir?: string
  deskripsi?: string
  bidang_kerjasama?: string
  nilai_kontrak?: number
  mata_uang?: string
  file_path?: string
  [key: string]: any // For any additional fields
}

interface MitraItem {
  id?: number
  nama_mitra?: string
  kategori?: string
  nama_negara?: string
  alamat?: string
  tanggal_mulai?: string
  tanggal_berakhir?: string
  status?: string
  pic_nama?: string
  pic_kontak?: string
  pic_email?: string
  deskripsi?: string
  [key: string]: any
}

interface UserItem {
  id?: string
  name?: string
  email?: string
  username?: string
  role?: string
  is_active?: boolean
  created_at?: string
  last_login?: string
  phone?: string
  department?: string
  [key: string]: any
}

interface rolesItem {
  id?: string
  [key: string]: any
}

interface SuratItem {
  id?: number
  [key: string]: any
}

interface ChartDataItem {
  name: string
  value: number
}

interface ChartData {
  negaraStats: ChartDataItem[]
  jenisStats: ChartDataItem[]
}

interface DashboardData {
  kerjasamaData: KerjasamaItem[]
  mitraData: MitraItem[]
  negaraStats: ChartDataItem[]
  jenisStats: ChartDataItem[]
}

// ============= BASIC DATA FETCHING =============

export async function roles(): Promise<rolesItem[]> {
  const { data, error } = await supabase.from("roles").select("*")

  if (error) {
    console.error("Error fetching roles:", error)
    throw error
  }

  return data || []
}

export async function users(): Promise<UserItem[]> {
  const { data, error } = await supabase
    .from("users") // Corrected: Changed from 'user' to 'users'
    .select("*")

  if (error) {
    console.error("Error fetching users:", error)
    throw error
  }

  return data || []
}

export async function userRoles(): Promise<KerjasamaItem[]> {
  const { data, error } = await supabase.from("user_roles").select("*")

  if (error) {
    console.error("Error fetching user_roles:", error)
    throw error
  }

  return data || []
}

/**
 * Fetch kerjasama data from Supabase
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
 * Fetch mitra data from Supabase
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

// ============= MITRA CRUD OPERATIONS =============

/**
 * Create new mitra
 */
export async function createMitra(mitraData: Partial<MitraItem>): Promise<MitraItem> {
  try {
    // In a real application, you would insert to database
    // const { data, error } = await supabase
    //   .from('mitra')
    //   .insert([mitraData])
    //   .select()
    //   .single();

    // For now, simulate the creation
    const newMitra = {
      id: Date.now(), // Temporary ID generation
      ...mitraData,
      status: mitraData.status || "Aktif",
    } as MitraItem

    return newMitra
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
    // In a real application, you would update in database
    // const { data, error } = await supabase
    //   .from('mitra')
    //   .update(mitraData)
    //   .eq('id', id)
    //   .select()
    //   .single();

    // For now, simulate the update
    const updatedMitra = {
      id,
      ...mitraData,
    } as MitraItem

    return updatedMitra
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
    // In a real application, you would delete from database
    // const { error } = await supabase
    //   .from('mitra')
    //   .delete()
    //   .eq('id', id);

    // For now, simulate the deletion
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
    // In a real application, you would insert to database
    // const { data, error } = await supabase
    //   .from('kerjasama')
    //   .insert([kerjasamaData])
    //   .select()
    //   .single();

    // For now, simulate the creation
    const newKerjasama = {
      kerjasama_id: Date.now(), // Temporary ID generation
      ...kerjasamaData,
      status: kerjasamaData.status || "Aktif",
    } as KerjasamaItem

    return newKerjasama
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
    // In a real application, you would update in database
    // const { data, error } = await supabase
    //   .from('kerjasama')
    //   .update(kerjasamaData)
    //   .eq('kerjasama_id', id)
    //   .select()
    //   .single();

    // For now, simulate the update
    const updatedKerjasama = {
      kerjasama_id: id,
      ...kerjasamaData,
    } as KerjasamaItem

    return updatedKerjasama
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
    // In a real application, you would delete from database
    // const { error } = await supabase
    //   .from('kerjasama')
    //   .delete()
    //   .eq('kerjasama_id', id);

    // For now, simulate the deletion
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
    // In a real application, you would insert to database
    // const { data, error } = await supabase
    //   .from('users')
    //   .insert([userData])
    //   .select()
    //   .single();

    // For now, simulate the creation
    const newUser = {
      id: Date.now().toString(), // Temporary ID generation
      ...userData,
      is_active: userData.is_active ?? true,
      created_at: new Date().toISOString().split("T")[0],
    } as UserItem

    return newUser
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
    // In a real application, you would update in database
    // const { data, error } = await supabase
    //   .from('users')
    //   .update(userData)
    //   .eq('id', id)
    //   .select()
    //   .single();

    // For now, simulate the update
    const updatedUser = {
      id,
      ...userData,
    } as UserItem

    return updatedUser
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
    // In a real application, you would delete from database
    // const { error } = await supabase
    //   .from('users')
    //   .delete()
    //   .eq('id', id);

    // For now, simulate the deletion
    return true
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

// ============= FILTERING UTILITIES =============

/**
 * Check if a date falls within a year range
 * @param dateString - Date string to check
 * @param fromYear - Start year of the range (or "all")
 * @param toYear - End year of the range (or "all")
 * @returns boolean indicating if date is within range
 */
export function isDateInYearRange(dateString?: string, fromYear?: string, toYear?: string): boolean {
  if (!dateString) return true
  if (fromYear === "all" && toYear === "all") return true

  const year = new Date(dateString).getFullYear()
  if (isNaN(year)) return true // If date is invalid, include it

  const fromYearNum = fromYear === "all" ? Number.NEGATIVE_INFINITY : Number.parseInt(fromYear ?? "")
  const toYearNum = toYear === "all" ? Number.POSITIVE_INFINITY : Number.parseInt(toYear ?? "")

  return year >= fromYearNum && year <= toYearNum
}

/**
 * Check if a cooperation period overlaps with the filtered year range
 * @param startDate - Start date of cooperation
 * @param endDate - End date of cooperation
 * @param fromYear - Start year of filter range (or "all")
 * @param toYear - End year of filter range (or "all")
 * @returns boolean indicating if cooperation period overlaps with filter range
 */
export function isCooperationPeriodInYearRange(
  startDate?: string,
  endDate?: string,
  fromYear?: string,
  toYear?: string,
): boolean {
  // If no year filter is applied, include all data
  if (fromYear === "all" && toYear === "all") return true

  // If no dates are provided, include the item (assume it's valid)
  if (!startDate && !endDate) return true

  // Parse cooperation dates
  const cooperationStart = startDate ? new Date(startDate) : null
  const cooperationEnd = endDate ? new Date(endDate) : null

  // If dates are invalid, include the item
  if (startDate && cooperationStart && isNaN(cooperationStart.getTime())) return true
  if (endDate && cooperationEnd && isNaN(cooperationEnd.getTime())) return true

  // Create filter period boundaries
  const filterStartYear = fromYear === "all" ? 1900 : Number.parseInt(fromYear ?? "")
  const filterEndYear = toYear === "all" ? 2100 : Number.parseInt(toYear ?? "")

  // Create Date objects for filter period (start of year to end of year)
  const filterStart = new Date(filterStartYear, 0, 1) // January 1st of start year
  const filterEnd = new Date(filterEndYear, 11, 31, 23, 59, 59) // December 31st of end year

  // Handle cases where only one date is provided
  if (cooperationStart && !cooperationEnd) {
    // If only start date exists, check if it falls within filter range
    return cooperationStart >= filterStart && cooperationStart <= filterEnd
  }

  if (!cooperationStart && cooperationEnd) {
    // If only end date exists, check if it falls within filter range
    return cooperationEnd >= filterStart && cooperationEnd <= filterEnd
  }

  if (cooperationStart && cooperationEnd) {
    // Both dates exist - check for overlap
    // Cooperation period overlaps with filter period if:
    // 1. Cooperation starts before filter ends AND cooperation ends after filter starts
    return cooperationStart <= filterEnd && cooperationEnd >= filterStart
  }

  // If we reach here, include the item by default
  return true
}

/**
 * Check if a single date (like user creation date) falls within year range
 * @param dateString - Date string to check
 * @param fromYear - Start year of filter range (or "all")
 * @param toYear - End year of filter range (or "all")
 * @returns boolean indicating if date is within range
 */
export function isSingleDateInYearRange(dateString?: string, fromYear?: string, toYear?: string): boolean {
  if (!dateString) return true
  if (fromYear === "all" && toYear === "all") return true

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return true

  const year = date.getFullYear()
  const fromYearNum = fromYear === "all" ? Number.NEGATIVE_INFINITY : Number.parseInt(fromYear ?? "")
  const toYearNum = toYear === "all" ? Number.POSITIVE_INFINITY : Number.parseInt(toYear ?? "")

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
        // Reasonable year range
        yearsSet.add(year)
      }
    }
  })

  return Array.from(yearsSet).sort((a, b) => a - b)
}

/**
 * Filter cooperation data by year range based on cooperation period overlap
 */
export function filterKerjasamaByYearRange(data: KerjasamaItem[], fromYear?: string, toYear?: string): KerjasamaItem[] {
  if (fromYear === "all" && toYear === "all") return data

  return data.filter((item) => {
    return isCooperationPeriodInYearRange(item.tanggal_mulai, item.tanggal_berakhir, fromYear, toYear)
  })
}

/**
 * Filter mitra data by year range based on cooperation period overlap
 */
export function filterMitraByYearRange(data: MitraItem[], fromYear?: string, toYear?: string): MitraItem[] {
  if (fromYear === "all" && toYear === "all") return data

  return data.filter((item) => {
    return isCooperationPeriodInYearRange(item.tanggal_mulai, item.tanggal_berakhir, fromYear, toYear)
  })
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

/**
 * Filter data by year range (generic function)
 */
export function filterDataByYearRange<T extends Record<string, any>>(
  data: T[],
  dateFields: string[],
  fromYear?: string,
  toYear?: string,
): T[] {
  if (fromYear === "all" && toYear === "all") return data

  return data.filter((item) => {
    // For cooperation-like data with start and end dates
    if (dateFields.includes("tanggal_mulai") && dateFields.includes("tanggal_berakhir")) {
      return isCooperationPeriodInYearRange(item.tanggal_mulai, item.tanggal_berakhir, fromYear, toYear)
    }

    // For single date fields
    return dateFields.some((field) => isSingleDateInYearRange(item[field], fromYear, toYear))
  })
}

// ============= CHART DATA PROCESSING =============

/**
 * Process kerjasama data for charts
 * @param {KerjasamaItem[]} kerjasamaData Array of kerjasama objects
 * @returns {ChartData} Object containing processed data for charts
 */
export function processChartData(kerjasamaData: KerjasamaItem[]): ChartData {
  // Memproses data untuk chart negara
  const negaraGrouped: Record<string, number> = {}
  kerjasamaData.forEach((item) => {
    if (!item.nama_negara) return // Skip items with null negara

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

  // Memproses data untuk chart jenis dokumen
  const jenisGrouped: Record<string, number> = {}
  kerjasamaData.forEach((item) => {
    if (!item.jenis_dokumen) return // Skip items with null jenis_dokumen

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
 * Calculate percentage from raw data
 * @param {ChartDataItem[]} chartData Array of chart data objects with name and value properties
 * @returns {ChartDataItem[]} Array of chart data objects with values converted to percentages
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
 * @returns {Promise<DashboardData>} Object containing all dashboard data
 */
export async function fetchDashboardData(fromYear?: string, toYear?: string): Promise<DashboardData> {
  try {
    // Fetch all data in parallel
    const [kerjasama, mitra] = await Promise.all([fetchKerjasamaData(), fetchMitraData()])

    // Apply year filtering if specified using the new filtering logic
    let filteredKerjasama = kerjasama
    let filteredMitra = mitra

    if (fromYear !== "all" || toYear !== "all") {
      filteredKerjasama = filterKerjasamaByYearRange(kerjasama, fromYear, toYear)
      filteredMitra = filterMitraByYearRange(mitra, fromYear, toYear)
    }

    // Process data for charts
    const { negaraStats, jenisStats } = processChartData(filteredKerjasama)

    // Convert to percentages for pie charts
    const negaraPercentages = calculatePercentages(negaraStats)
    const jenisPercentages = calculatePercentages(jenisStats)

    return {
      kerjasamaData: filteredKerjasama,
      mitraData: filteredMitra,
      negaraStats: negaraPercentages,
      jenisStats: jenisPercentages,
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
