"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  FileText,
  Home,
  Users,
  Database,
  UserCog,
  LogOut,
  FileBarChart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "next-themes"

interface SidebarProps {
  role: "admin" | "staff" | "guest"
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { theme } = useTheme()

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
    <div
      className={cn(
        "group flex flex-col shadow-lg transition-all duration-300 ease-in-out",
        "bg-sidebar",
        collapsed ? "w-16" : "w-72",
      )}
    >
      <div className="flex h-auto items-center justify-between border-b border-white/20 px-4 py-3 bg-white">
        {!collapsed ? (
          <div className="flex items-center justify-between w-full">
            <Link href={`/dashboard/${role}`} className="flex items-center gap-2 font-semibold">
              <Image src="/logo-upi.png" alt="UPI Logo" width={150} height={43} className="h-auto" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-8 w-8 rounded-full p-0"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className="h-4 w-4 text-black" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full p-0"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronRight className="h-4 w-4 text-black" />
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 overflow-auto py-2">
        <TooltipProvider delayDuration={0}>
          <nav className="grid items-start px-2 text-sm font-medium">
            {routes.map((route) => (
              <Tooltip key={route.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-all hover:bg-white/10",
                      pathname === route.href && "bg-white/20 font-semibold",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    {!collapsed && <span>{route.name}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{route.name}</TooltipContent>}
              </Tooltip>
            ))}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      <div className="mt-auto p-4">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                className={cn(
                  "w-full justify-start bg-sidebar text-white hover:bg-sidebar/80",
                  collapsed && "justify-center px-0",
                )}
                asChild
              >
                <Link href="/login">
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span className="ml-2">Logout</span>}
                </Link>
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
