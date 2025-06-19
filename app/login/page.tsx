"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  // State untuk form login admin
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError("")

    try {
      // Logika ini tetap sama, menghubungi API Anda untuk verifikasi.
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setLoginError(data.message)
        return // Hentikan proses jika login gagal
      }

      // Pastikan role yang diterima adalah admin
      if (data.user && data.user.role === "admin") {
        // Simpan data user admin di localStorage
        localStorage.setItem("user", JSON.stringify(data.user))

        toast({
          title: "Login berhasil",
          description: `Selamat datang, ${data.user.name}!`,
        })

        // **PERUBAHAN UTAMA:** Arahkan admin ke dashboard publik
        router.push("/dashboard")
      } else {
        // Jika API sukses tapi role bukan admin, tampilkan error.
        setLoginError("Akun ini tidak memiliki akses sebagai admin.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("Terjadi kesalahan saat mencoba login.")
    } finally {
      setLoginLoading(false)
    }
  }
  
  const handleGuestLogin = () => {
    // Pastikan tidak ada sesi admin yang tersisa saat lanjut sebagai guest
    localStorage.removeItem("user");
    // Arahkan guest ke dashboard publik
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image src="/logo-upi.png" alt="UPI Logo" width={200} height={57} className="h-auto" />
          </div>
          <CardTitle className="text-2xl text-center">Sistem Manajemen Kerjasama</CardTitle>
          <CardDescription className="text-center">Direktorat Urusan Internasional</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Form Login untuk Admin */}
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="login-username">Username Admin</Label>
              <Input
                id="login-username"
                type="text"
                placeholder="Masukkan username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Masukkan password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full bg-upi-red hover:bg-upi-red/90" type="submit" disabled={loginLoading}>
              {loginLoading ? "Memproses..." : "Login sebagai Admin"}
            </Button>
          </form>

          {/* Separator */}
          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 flex-shrink text-xs text-gray-500">ATAU</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Tombol untuk Guest */}
          <Button variant="secondary" className="w-full" onClick={handleGuestLogin}>
            Lanjutkan sebagai Tamu
          </Button>

        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Direktorat Urusan Internasional UPI</p>
        </CardFooter>
      </Card>
    </div>
  )
}
