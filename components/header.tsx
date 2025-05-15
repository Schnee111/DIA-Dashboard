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
  role: "admin" | "staff" | "guest"
  username: string
}

export function Header({ role, username }: HeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Permintaan surat baru",
      description: "Ada permintaan surat baru yang perlu diproses",
      time: "5 menit yang lalu",
      read: false,
    },
    {
      id: 2,
      title: "Data berhasil diperbarui",
      description: "Data mitra telah berhasil diperbarui",
      time: "1 jam yang lalu",
      read: false,
    },
    {
      id: 3,
      title: "Laporan bulanan tersedia",
      description: "Laporan statistik bulanan telah tersedia",
      time: "1 hari yang lalu",
      read: true,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative rounded-full">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-upi-red"
                  variant="destructive"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b p-3">
              <h4 className="font-semibold">Notifikasi</h4>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Tandai semua dibaca
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex cursor-pointer flex-col gap-1 border-b p-3 ${notification.read ? "" : "bg-muted/50"}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">{notification.title}</h5>
                      {!notification.read && (
                        <Badge variant="secondary" className="h-2 w-2 rounded-full p-0 bg-upi-red" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada notifikasi</div>
              )}
            </div>
          </PopoverContent>
        </Popover>
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
