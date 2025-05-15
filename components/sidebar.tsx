"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, FileText, Home, Users, Database, UserCog, LogOut, FileBarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  role: "admin" | "staff" | "guest"
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const adminRoutes = [
    {
      name: "Dashboard",
      href: "/dashboard/admin",
      icon: Home,
    },
    {
      name: "Kelola Data Central",
      href: "/dashboard/admin/data-central",
      icon: Database,
    },
    {
      name: "Kelola Mitra",
      href: "/dashboard/admin/mitra",
      icon: Users,
    },
    {
      name: "Kelola Hak Akses",
      href: "/dashboard/admin/hak-akses",
      icon: UserCog,
    },
    {
      name: "Kelola Dashboard Statistik",
      href: "/dashboard/admin/statistik",
      icon: BarChart3,
    },
  ]

  const staffRoutes = [
    {
      name: "Dashboard",
      href: "/dashboard/staff",
      icon: Home,
    },
    {
      name: "Ajukan Surat",
      href: "/dashboard/staff/ajukan-surat",
      icon: FileText,
    },
    {
      name: "Kelola Data Mitra Tertentu",
      href: "/dashboard/staff/kelola-mitra",
      icon: Users,
    },
  ]

  const guestRoutes = [
    {
      name: "Dashboard",
      href: "/dashboard/guest",
      icon: Home,
    },
    {
      name: "Lihat Dashboard Statistik",
      href: "/dashboard/guest/statistik",
      icon: BarChart3,
    },
    {
      name: "Lihat Data Kerja Sama",
      href: "/dashboard/guest/data-kerjasama",
      icon: FileBarChart,
    },
  ]

  const routes = role === "admin" ? adminRoutes : role === "staff" ? staffRoutes : guestRoutes

  return (
    <div className="group flex w-72 flex-col bg-upi-red shadow-lg">
      <div className="flex h-auto items-center border-b border-white/20 px-4 py-3">
        <Link href={`/dashboard/${role}`} className="flex items-center gap-2 font-semibold text-white">
          <Image src="/logo-upi.png" alt="UPI Logo" width={150} height={43} className="h-auto" />
        </Link>
      </div>
      <ScrollArea className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-all hover:bg-white/10",
                pathname === route.href && "bg-white/20 font-semibold",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.name}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto p-4">
        <Button
          variant="outline"
          className="w-full justify-start text-white border-white hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link href="/login">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Link>
        </Button>
      </div>
    </div>
  )
}
