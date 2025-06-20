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

export function StatCard({ title, value, description, icon: Icon, trend, variant = "default" }: StatCardProps) {  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30"
      case "success":
        return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
      case "destructive":
        return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30"
      default:
        return "border-upi-red/20 dark:border-upi-red/30"
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case "warning":
        return "text-yellow-600 dark:text-yellow-400"
      case "success":
        return "text-green-600 dark:text-green-400"
      case "destructive":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-upi-red dark:text-upi-red"
    }
  }

  return (    <Card className={getVariantStyles()}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${getIconColor()}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            <span className={trend.positive ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
              {trend.positive ? "+" : "-"}
              {trend.value}
            </span>{" "}
            dari periode sebelumnya
          </p>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}
