"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

// Definisikan tipe untuk properti komponen agar sesuai dengan data yang dikirim
interface PartnerDistributionChartProps {
  data: { name: string; value: number }[]
}

// Custom Tooltip Component for better styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-background border rounded-md shadow-md max-w-[250px]">
        <p className="font-bold">{label}</p>
        <p className="text-muted-foreground">{`Jumlah Kerjasama: ${payload[0].value}`}</p>
      </div>
    )
  }
  return null
}

// Function to format partner names for better display
const formatPartnerName = (name: string): string => {
  // Remove common suffixes and abbreviations for cleaner display
  let formatted = name
    .replace(/\s+$$[^)]*$$$/g, "") // Remove parentheses at the end
    .replace(/\s+State\s+/g, " ") // Remove "State" for brevity
    .replace(/\s+University\s+of\s+/g, " Univ. ") // Shorten "University of"
    .replace(/\s+University$/g, " Univ.") // Shorten "University" at the end
    .replace(/\s+Polytechnic\s+/g, " Polytech. ") // Shorten "Polytechnic"
    .replace(/\s+Institute\s+/g, " Inst. ") // Shorten "Institute"
    .replace(/\s+Committee$/g, " Com.") // Shorten "Committee"
    .trim()

  // If still too long, truncate intelligently
  if (formatted.length > 30) {
    const words = formatted.split(" ")
    if (words.length > 3) {
      formatted = words.slice(0, 3).join(" ") + "..."
    } else {
      formatted = formatted.substring(0, 27) + "..."
    }
  }

  return formatted
}

export default function PartnerDistributionChart({ data }: PartnerDistributionChartProps) {
  // Urutkan data dan ambil 10 teratas dengan nama yang diformat
  const topTenData = React.useMemo(() => {
    return [...data]
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((item) => ({
        ...item,
        displayName: formatPartnerName(item.name),
        originalName: item.name,
      }))
  }, [data])

  const chartConfig = {
    value: {
      label: "Jumlah Kerjasama",
      color: "hsl(var(--chart-1))", // Same color as country chart
    },
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={topTenData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <YAxis
            dataKey="displayName"
            type="category"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            width={180} // Increased width for better name display
            fontSize={12}
            tick={{
              fontSize: 12,
              textAnchor: "end",
            }}
          />
          <XAxis
            dataKey="value"
            type="number"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false} // Ensure integer values on axis
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="p-2 text-sm bg-background border rounded-md shadow-md max-w-[250px]">
                    <p className="font-bold">{data.originalName}</p>
                    <p className="text-muted-foreground">{`Jumlah Kerjasama: ${payload[0].value}`}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} layout="vertical">
            <LabelList dataKey="value" position="right" offset={5} className="fill-foreground" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export { PartnerDistributionChart }
