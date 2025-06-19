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
  variant?: "default" | "warning" | "success" | "destructive"
}

export function StatCard({ title, value, description, icon: Icon, trend, variant = "default" }: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "success":
        return "border-green-200 bg-green-50"
      case "destructive":
        return "border-red-200 bg-red-50"
      default:
        return "border-upi-red/20"
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case "warning":
        return "text-yellow-600"
      case "success":
        return "text-green-600"
      case "destructive":
        return "text-red-600"
      default:
        return "text-upi-red"
    }
  }

  return (
    <Card className={getVariantStyles()}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${getIconColor()}`} />
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
