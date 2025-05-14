import * as bcrypt from "bcrypt"
import { db, roles, userRoles, users } from "@/db"
import { eq } from "drizzle-orm"

export async function authenticateUser(username: string, password: string) {
  // Cari user berdasarkan username
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
    with: {
      userRoles: {
        with: {
          role: {
            with: {
              rolePermissions: {
                with: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    return null
  }

  // Verifikasi password
  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    return null
  }

  // Ambil role pertama (untuk sederhananya, kita asumsikan satu user hanya memiliki satu role)
  const role = user.userRoles[0]?.role

  if (!role) {
    return null
  }

  // Ambil semua permission dari role
  const permissionList = role.rolePermissions.map((rp) => rp.permission.name)

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: role.name,
    permissions: permissionList,
  }
}

export async function registerUser(name: string, email: string, username: string, password: string) {
  try {
    // Cek apakah username atau email sudah digunakan
    const existingUserByUsername = await db.query.users.findFirst({
      where: eq(users.username, username),
    })

    if (existingUserByUsername) {
      return { success: false, message: "Username sudah digunakan" }
    }

    const existingUserByEmail = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingUserByEmail) {
      return { success: false, message: "Email sudah digunakan" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Buat user baru
    await db.insert(users).values({
      name,
      email,
      username,
      password: hashedPassword,
    })

    // Ambil ID user yang baru dimasukkan dengan query berdasarkan username (atau email)
    const newUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    })

    if (!newUser) {
      return { success: false, message: "Gagal mendapatkan pengguna yang baru dibuat" }
    }

    const newUserId = newUser.id // ID pengguna yang baru dimasukkan

    // Cari role guest
    const guestRole = await db.query.roles.findFirst({
      where: eq(roles.name, "guest"),
    })

    if (!guestRole) {
      return { success: false, message: "Role guest tidak ditemukan" }
    }

    // Assign role guest ke user baru
    await db.insert(userRoles).values({
      userId: newUserId,  // Menggunakan ID user yang baru
      roleId: guestRole.id,
    })

    return { success: true, message: "Registrasi berhasil" }
  } catch (error) {
    console.error("Error registering user:", error)
    return { success: false, message: "Terjadi kesalahan saat registrasi" }
  }
}

export async function getUserPermissions(userId: string) {
  const userWithRoles = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      userRoles: {
        with: {
          role: {
            with: {
              rolePermissions: {
                with: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!userWithRoles) {
    return []
  }

  // Flatten permissions from all roles
  const permissionList = userWithRoles.userRoles.flatMap((userRole) =>
    userRole.role.rolePermissions.map((rolePermission) => rolePermission.permission.name),
  )

  // Remove duplicates
  return [...new Set(permissionList)]
}
