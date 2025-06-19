"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home, // Digunakan untuk Dashboard
  FileBarChart, // Digunakan untuk Data Publik
  HardDrive, // Digunakan untuk Manajemen Data
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  role: "admin" | "guest"
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const allNavigations = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      allowedRoles: ["admin", "guest"],
    },
    {
      name: "Data Publik",
      href: "/data",
      icon: FileBarChart,
      allowedRoles: ["admin", "guest"],
    },
    {
      name: "Manajemen Data",
      href: "/admin/data",
      icon: HardDrive,
      allowedRoles: ["admin"],
    },
  ];

  const routes = allNavigations.filter(route =>
    route.allowedRoles.includes(role)
  );

  return (
    <div
      className={cn(
        "group flex flex-col shadow-lg transition-all duration-300 ease-in-out",
        "bg-sidebar", 
        collapsed ? "w-16" : "w-72",
      )}
    >
      <div className="flex h-auto items-center justify-between border-b border-white/20 px-4 pt-3 pb-2 bg-white">
        {!collapsed ? (
          <div className="flex items-center justify-between w-full">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Image src="/logo-upi.png" alt="UPI Logo" width={150} height={43} className="h-auto" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-8 w-8 rounded-full p-0"
              onClick={() => setCollapsed(true)}
            >
              <ChevronLeft className="h-4 w-4 text-black" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full pb-[0.67rem]">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full p-0"
              onClick={() => setCollapsed(false)}
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
                      // **PERBAIKAN:** Menggunakan startsWith agar parent menu tetap aktif
                      pathname.startsWith(route.href) && "bg-white/20 font-semibold",
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
        {/* Tombol Logout hanya ditampilkan untuk Admin */}
        {role === 'admin' && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                  <Link href="/login">
                    <Button
                      variant="default"
                      className={cn(
                        "w-full justify-start bg-sidebar text-white hover:bg-white/20", // **PERBAIKAN:** Efek hover lebih jelas
                        collapsed && "justify-center px-0",
                      )}
                    >
                      <LogOut className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">Logout</span>}
                    </Button>
                  </Link>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
