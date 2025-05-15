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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Login state
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerUsername, setRegisterUsername] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [registerLoading, setRegisterLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setLoginError(data.message)
        setLoginLoading(false)
        return
      }

      // Simpan data user di localStorage
      localStorage.setItem("user", JSON.stringify(data.user))

      // Redirect berdasarkan role
      if (data.user.role === "admin") {
        router.push("/dashboard/admin")
      } else if (data.user.role === "staff") {
        router.push("/dashboard/staff")
      } else {
        router.push("/dashboard/guest")
      }

      toast({
        title: "Login berhasil",
        description: `Selamat datang, ${data.user.name}!`,
      })
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("Terjadi kesalahan saat login")
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterLoading(true)
    setRegisterError("")

    // Validasi password
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Password dan konfirmasi password tidak cocok")
      setRegisterLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          username: registerUsername,
          password: registerPassword,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setRegisterError(data.message)
        setRegisterLoading(false)
        return
      }

      toast({
        title: "Registrasi berhasil",
        description: "Silakan login dengan akun yang baru dibuat",
      })

      // Reset form dan pindah ke tab login
      setRegisterName("")
      setRegisterEmail("")
      setRegisterUsername("")
      setRegisterPassword("")
      setRegisterConfirmPassword("")

      // Pindah ke tab login
      document.getElementById("login-tab")?.click()
    } catch (error) {
      console.error("Registration error:", error)
      setRegisterError("Terjadi kesalahan saat registrasi")
    } finally {
      setRegisterLoading(false)
    }
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
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" id="login-tab">
                Login
              </TabsTrigger>
              <TabsTrigger value="register">Daftar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                {loginError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="login-username">Username</Label>
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
                    {loginLoading ? "Memproses..." : "Login"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                {registerError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{registerError}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="register-name">Nama Lengkap</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Masukkan email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Masukkan username"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Masukkan password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-confirm-password">Konfirmasi Password</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Konfirmasi password"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button className="w-full bg-upi-red hover:bg-upi-red/90" type="submit" disabled={registerLoading}>
                    {registerLoading ? "Memproses..." : "Daftar"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Direktorat Urusan Internasional UPI</p>
        </CardFooter>
      </Card>
    </div>
  )
}
