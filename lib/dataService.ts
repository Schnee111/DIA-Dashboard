// lib/dataService.ts
import { supabase } from '@/lib/supabaseclient'; // Sesuaikan path ke klien Supabase Anda

// Define TypeScript interfaces
interface KerjasamaItem {
  id?: number;
  judul_kerjasama?: string;
  nama_mitra?: string;
  nama_negara?: string;
  jenis_dokumen?: string;
  status?: string;
  tanggal_mulai?: string;
  tanggal_berakhir?: string;
  [key: string]: any; // For any additional fields
}

interface MitraItem {
  id?: number;
  nama_mitra?: string;
  [key: string]: any;
}

interface UserItem {
  id?: string;
  email?: string;
  [key: string]: any;
}

interface SuratItem {
  id?: number;
  [key: string]: any;
}

interface ActivityItem {
  id?: number;
  deskripsi?: string;
  user_id?: string;
  created_at?: string;
  [key: string]: any;
}

interface ChartDataItem {
  name: string;
  value: number;
}

interface ChartData {
  negaraStats: ChartDataItem[];
  jenisStats: ChartDataItem[];
}

interface DashboardData {
  kerjasamaData: KerjasamaItem[];
  mitraData: MitraItem[];
  negaraStats: ChartDataItem[];
  jenisStats: ChartDataItem[];
}

/**
 * Fetch kerjasama data from Supabase
 * @returns {Promise<KerjasamaItem[]>} Array of kerjasama objects
 */
export async function fetchKerjasamaData(): Promise<KerjasamaItem[]> {
  const { data, error } = await supabase
    .from('v_semua_kerjasama')
    .select('*');
  
  if (error) {
    console.error("Error fetching kerjasama:", error);
    throw error;
  }
  
  return data || [];
}

/**
 * Fetch mitra data from Supabase
 * @returns {Promise<MitraItem[]>} Array of mitra objects
 */
export async function fetchMitraData(): Promise<MitraItem[]> {
  const { data, error } = await supabase
    .from('v_semua_mitra')
    .select('*');
  
  if (error) {
    console.error("Error fetching mitra:", error);
    throw error;
  }
  
  return data || [];
}

/**
 * Process kerjasama data for charts
 * @param {KerjasamaItem[]} kerjasamaData Array of kerjasama objects
 * @returns {ChartData} Object containing processed data for charts
 */
export function processChartData(kerjasamaData: KerjasamaItem[]): ChartData {
  // Memproses data untuk chart negara
  const negaraGrouped: Record<string, number> = {};
  kerjasamaData.forEach(item => {
    if (!item.nama_negara) return; // Skip items with null negara
    
    if (negaraGrouped[item.nama_negara]) {
      negaraGrouped[item.nama_negara]++;
    } else {
      negaraGrouped[item.nama_negara] = 1;
    }
  });
  
  const negaraData: ChartDataItem[] = Object.keys(negaraGrouped).map(key => ({
    name: key,
    value: negaraGrouped[key]
  }));
  
  // Memproses data untuk chart jenis dokumen
  const jenisGrouped: Record<string, number> = {};
  kerjasamaData.forEach(item => {
    if (!item.jenis_dokumen) return; // Skip items with null jenis_dokumen
    
    if (jenisGrouped[item.jenis_dokumen]) {
      jenisGrouped[item.jenis_dokumen]++;
    } else {
      jenisGrouped[item.jenis_dokumen] = 1;
    }
  });
  
  const jenisData: ChartDataItem[] = Object.keys(jenisGrouped).map(key => ({
    name: key,
    value: jenisGrouped[key]
  }));
  
  return {
    negaraStats: negaraData,
    jenisStats: jenisData
  };
}

/**
 * Calculate percentage from raw data
 * @param {ChartDataItem[]} chartData Array of chart data objects with name and value properties
 * @returns {ChartDataItem[]} Array of chart data objects with values converted to percentages
 */
export function calculatePercentages(chartData: ChartDataItem[]): ChartDataItem[] {
  if (!chartData || chartData.length === 0) return [];
  
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  return chartData.map(item => ({
    name: item.name,
    value: Math.round((item.value / total) * 100)
  }));
}

/**
 * Fetch all required dashboard data
 * @returns {Promise<DashboardData>} Object containing all dashboard data
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    // Fetch all data in parallel
    const [kerjasama, mitra] = await Promise.all([
      fetchKerjasamaData(),
      fetchMitraData(),
    ]);
    
    // Process data for charts
    const { negaraStats, jenisStats } = processChartData(kerjasama);
    
    // Convert to percentages for pie charts
    const negaraPercentages = calculatePercentages(negaraStats);
    const jenisPercentages = calculatePercentages(jenisStats);
    
    return {
      kerjasamaData: kerjasama,
      mitraData: mitra,
      negaraStats: negaraPercentages,
      jenisStats: jenisPercentages
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}