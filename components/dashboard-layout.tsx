"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

// Catatan: Layout ini sekarang bersifat universal untuk Admin dan Guest.
// Logika di dalamnya akan menentukan peran pengguna dan menampilkannya di sidebar.

interface LayoutProps {
  children: React.ReactNode
}

interface User {
  id: string
  name: string
  username: string
  email: string
  role: "admin"
}

// Definisikan tipe untuk sesi pengguna, bisa admin atau guest.
type UserSession = {
  name: string;
  role: "admin" | "guest";
}

export function DashboardLayout({ children }: LayoutProps) {
  const router = useRouter()
  const [session, setSession] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cek apakah ada data user admin di localStorage
    const storedUser = localStorage.getItem("user")

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User
        // Verifikasi bahwa pengguna yang tersimpan adalah admin
        if (parsedUser && parsedUser.role === "admin") {
          setSession({ name: parsedUser.name, role: "admin" })
        } else {
          // Jika ada data tapi bukan admin, anggap sebagai guest
          setSession({ name: "Tamu", role: "guest" })
        }
      } catch (error) {
        console.error("Gagal memproses data user, menganggap sebagai guest:", error)
        setSession({ name: "Tamu", role: "guest" })
      }
    } else {
      // Jika tidak ada data sama sekali, pengguna adalah guest
      setSession({ name: "Tamu", role: "guest" })
    }

    setIsLoading(false)
  }, [])

  // Selama pengecekan, tampilkan loading state
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Memuat Sesi...</div>
  }
  
  // Jika karena suatu hal sesi gagal dibuat, render fallback.
  if (!session) {
      return null;
  }

  // Render layout dengan peran yang sesuai
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar sekarang akan menerima 'admin' or 'guest' dan akan 
          menampilkan/menyembunyikan menu berdasarkan peran tersebut. */}
      <Sidebar role={session.role} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header role={session.role} username={session.name} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
