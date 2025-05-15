"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "admin" | "staff" | "guest"
}

interface User {
  id: string
  name: string
  username: string
  email: string
  role: string
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Cek apakah user sudah login
    const storedUser = localStorage.getItem("user")

    if (!storedUser) {
      // Redirect ke halaman login jika belum login
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(storedUser) as User
    setUser(parsedUser)

    // Cek apakah role sesuai
    if (parsedUser.role !== role) {
      // Redirect ke dashboard yang sesuai dengan role
      router.push(`/dashboard/${parsedUser.role}`)
    }
  }, [router, role])

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header role={role} username={user.name} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
