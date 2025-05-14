import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, username, password } = await request.json()

    if (!name || !email || !username || !password) {
      return NextResponse.json({ success: false, message: "Semua field diperlukan" }, { status: 400 })
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Format email tidak valid" }, { status: 400 })
    }

    // Validasi password
    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "Password minimal 6 karakter" }, { status: 400 })
    }

    const result = await registerUser(name, email, username, password)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan saat registrasi" }, { status: 500 })
  }
}
