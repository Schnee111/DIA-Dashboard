import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    // Debug: Log informasi login
    console.log("Login attempt with username:", username)

    if (!username || !password) {
      console.log("Missing username or password")
      return NextResponse.json({ success: false, message: "Username dan password diperlukan" }, { status: 400 })
    }

    const user = await authenticateUser(username, password)
    
    // Debug: Log hasil autentikasi
    console.log("Authentication result:", user ? "Success" : "Failed")

    if (!user) {
      return NextResponse.json({ success: false, message: "Username atau password salah" }, { status: 401 })
    }

    // Debug: Log informasi user yang berhasil login
    console.log("User successfully authenticated:", user.username, "with role:", user.role)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan saat login" }, { status: 500 })
  }
}