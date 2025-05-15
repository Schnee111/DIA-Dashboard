import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  description?: string
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
}

export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="border-upi-red/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-upi-red" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-gray-500">
            <span className={trend.positive ? "text-green-500" : "text-red-500"}>
              {trend.positive ? "+" : "-"}
              {trend.value}
            </span>{" "}
            dari periode sebelumnya
          </p>
        )}
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}
