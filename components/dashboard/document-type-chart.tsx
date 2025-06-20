"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts"

interface DocumentTypeChartProps {
  data: { name: string; value: number }[]
}

// Custom Tooltip Component for better styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-background border rounded-md shadow-md">
        <p className="font-bold">{label}</p>
        <p className="text-muted-foreground">{`Jumlah: ${payload[0].value}`}</p>
      </div>
    )
  }
  return null
}

export function DocumentTypeChart({ data }: DocumentTypeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        Tidak ada data untuk ditampilkan
      </div>
    )
  }

  // Sort data in descending order (highest to lowest)
  const sortedData = [...data].sort((a, b) => b.value - a.value)

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            width={120}
            fontSize={12}
          />
          <XAxis
            dataKey="value"
            type="number"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tickFormatter={value => `${value}`}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<CustomTooltip />}
          />
          <Bar
            dataKey="value"
            fill="hsl(var(--primary))"
            radius={[0, 4, 4, 0]}
            layout="vertical"
          >
            <LabelList
              dataKey="value"
              position="right"
              offset={5}
              className="fill-foreground"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
