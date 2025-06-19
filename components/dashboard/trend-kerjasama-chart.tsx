"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Definisikan tipe untuk data yang akan ditampilkan di chart
interface TrendChartData {
  year: string
  Total: number
  [key: string]: any // Memungkinkan properti dinamis untuk jenis dokumen lain
}

interface TrendKerjasamaChartProps {
  data: TrendChartData[]
  title: string
  description: string
}

// Warna yang akan digunakan untuk setiap garis pada chart
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"]

export function TrendKerjasamaChart({ data, title, description }: TrendKerjasamaChartProps) {
  const [selectedView, setSelectedView] = useState<string>("Total")

  // Jika tidak ada data, tampilkan pesan
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-gray-500">Tidak ada data tren untuk ditampilkan.</p>
        </CardContent>
      </Card>
    )
  }

  // Dapatkan semua kunci (jenis dokumen + 'Total') dari item data pertama
  const dataKeys = Object.keys(data[0] || {}).filter((key) => key !== "year")

  // Dapatkan jenis dokumen unik untuk filter dropdown
  const documentTypes = ["Total", ...dataKeys.filter((key) => key !== "Total")]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Select value={selectedView} onValueChange={setSelectedView}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih Tampilan" />
          </SelectTrigger>
          <SelectContent>
            {documentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "Total" ? "Semua Jenis" : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />
            <Legend />
            {selectedView === "Total" ? (
              // Tampilkan semua garis jika 'Total' dipilih
              dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                />
              ))
            ) : (
              // Tampilkan hanya garis yang dipilih
              <Line
                type="monotone"
                dataKey={selectedView}
                stroke={COLORS[0]}
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
