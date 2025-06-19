"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import ThemeToggle from "./theme-toggle"

interface HeaderProps {
  role: "admin" | "guest"
  username: string
}

export function Header({ role, username }: HeaderProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = () => {
    // Hapus data user dari localStorage
    localStorage.removeItem("user")

    // Redirect ke halaman login
    router.push("/login")

    toast({
      title: "Logout berhasil",
      description: "Anda telah berhasil keluar dari sistem",
    })
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex flex-1 items-center gap-2">
        <h2 className="text-lg font-semibold">Sistem Manajemen Kerjasama DIA UPI</h2>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{username}</span>
                <span className="text-xs text-muted-foreground capitalize">{role}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem>Pengaturan</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
