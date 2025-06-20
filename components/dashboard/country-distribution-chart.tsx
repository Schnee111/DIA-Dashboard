'use client'

import * as React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'

// Definisikan tipe untuk properti komponen agar sesuai dengan data yang dikirim
interface CountryDistributionChartProps {
  data: { name: string; value: number }[]
}

// Custom Tooltip Component for better styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-background border rounded-md shadow-md">
        <p className="font-bold">{label}</p>
        <p className="text-muted-foreground">{`Jumlah Kerjasama: ${payload[0].value}`}</p>
      </div>
    )
  }
  return null
}

export default function CountryDistributionChart({
  data,
}: CountryDistributionChartProps) {
  // Urutkan data dan ambil 10 teratas
  const topTenData = React.useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value).slice(0, 10)
  }, [data])

  const chartConfig = {
    value: {
      label: 'Jumlah Kerjasama',
      color: 'hsl(var(--chart-1))',
    },
  }

  return (
        <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={topTenData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={100} // Increased width for longer names
                fontSize={12}
              />
              <XAxis
                dataKey="value"
                type="number"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false} // Ensure integer values on axis
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
        </ChartContainer>
  )
}
