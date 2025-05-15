import * as bcrypt from "bcrypt"
import { supabase } from '@/lib/supabaseclient'

export async function authenticateUser(username: string, password: string) {
  // Debug: Log parameter yang diterima
  console.log("Attempting login with username:", username)
  
  try {
    // Cari user berdasarkan username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

      console.log("user.password (hash in DB):", user.password)
      console.log("Input password (plain):", password)
      
    if (userError || !user) {
      console.error("Error finding user:", userError)
      return null
    }

    // Debug: Log password verification attempt
    console.log("Verifying password for user:", user.username)
    
    // Verifikasi password
    const passwordMatch = await bcrypt.compare(password, user.password)
    
    // Debug: Log hasil verifikasi password
    console.log("Password match result:", passwordMatch)
    
    if (!passwordMatch) {
      console.error("Password does not match")
      return null
    }

    // Cek status user aktif jika field tersebut ada
    if (user.is_active === false) {
      console.error("User account is not active")
      return null
    }

    // Ambil user_roles untuk user ini
    const { data: userRolesData, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)

    // Debug: Log hasil user roles
    console.log("User roles:", userRolesData, userRolesError ? `Error: ${userRolesError.message}` : "No error")

    if (userRolesError) {
      console.error("Error fetching user roles:", userRolesError)
      return null
    }

    if (!userRolesData || userRolesData.length === 0) {
      console.error("User has no roles assigned")
      return null
    }

    // Ambil role details
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', userRolesData[0].role_id)
      .single()

    // Debug: Log hasil role data
    console.log("Role data:", roleData, roleError ? `Error: ${roleError.message}` : "No error")

    if (roleError || !roleData) {
      console.error("Error fetching role details:", roleError)
      return null
    }

    // Ambil permissions untuk role ini
    const { data: rolePermissions, error: permissionsError } = await supabase
      .from('role_permissions')
      .select(`
        *,
        permission:permission_id (
          name
        )
      `)
      .eq('role_id', roleData.id)

    // Debug: Log hasil permissions
    console.log("Role permissions:", rolePermissions, permissionsError ? `Error: ${permissionsError.message}` : "No error")

    if (permissionsError) {
      console.error("Error fetching role permissions:", permissionsError)
      return null
    }

    // Extract permission names, with null check
    const permissionList = rolePermissions?.map(rp => rp.permission?.name).filter(Boolean) || []

    // User berhasil login
    console.log("Authentication successful for user:", user.username)

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: roleData.name,
      permissions: permissionList,
      profilePicture: user.profile_picture,
      isActive: user.is_active !== false
    }
  } catch (error) {
    console.error("Unexpected error during authentication:", error)
    return null
  }
}

export async function registerUser(name: string, email: string, username: string, password: string) {
  try {
    // Cek apakah username sudah digunakan
    const { data: existingUserByUsername, error: usernameError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle()

    if (usernameError) {
      console.error("Error checking username:", usernameError)
      return { success: false, message: "Terjadi kesalahan saat memeriksa username" }
    }

    if (existingUserByUsername) {
      return { success: false, message: "Username sudah digunakan" }
    }

    // Cek apakah email sudah digunakan
    const { data: existingUserByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (emailError) {
      console.error("Error checking email:", emailError)
      return { success: false, message: "Terjadi kesalahan saat memeriksa email" }
    }

    if (existingUserByEmail) {
      return { success: false, message: "Email sudah digunakan" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate UUID untuk ID user
    const userId = crypto.randomUUID()

    // Buat user baru
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          name,
          email,
          username,
          password: hashedPassword,
          is_active: true
        }
      ])
      .select()

    if (insertError) {
      console.error("Error inserting user:", insertError)
      return { success: false, message: "Gagal membuat user baru" }
    }

    // Cari role guest
    const { data: guestRole, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('name', 'guest')
      .single()

    if (roleError || !guestRole) {
      console.error("Error finding guest role:", roleError)
      return { success: false, message: "Role guest tidak ditemukan" }
    }

    // Assign role guest ke user baru
    const { error: userRoleError } = await supabase
      .from('user_roles')
      .insert([
        {
          id: crypto.randomUUID(),
          user_id: userId,
          role_id: guestRole.id,
        }
      ])

    if (userRoleError) {
      console.error("Error assigning role to user:", userRoleError)
      return { success: false, message: "Gagal menetapkan role ke user" }
    }

    return { success: true, message: "Registrasi berhasil" }
  } catch (error) {
    console.error("Error registering user:", error)
    return { success: false, message: "Terjadi kesalahan saat registrasi" }
  }
}

export async function getUserPermissions(userId: string) {
  try {
    // Cek apakah user aktif
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('is_active')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error("Error fetching user status:", userError)
      return []
    }

    if (user.is_active === false) {
      console.error("User account is not active")
      return []
    }

    // Dapatkan user roles
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)

    if (userRolesError || !userRoles || userRoles.length === 0) {
      console.error("Error fetching user roles:", userRolesError)
      return []
    }

    // Kumpulkan semua role IDs
    const roleIds = userRoles.map(ur => ur.role_id)

    // Dapatkan semua permissions untuk roles tersebut
    const { data: rolePermissions, error: permissionsError } = await supabase
      .from('role_permissions')
      .select(`
        permission_id,
        permission:permission_id (
          name
        )
      `)
      .in('role_id', roleIds)

    if (permissionsError) {
      console.error("Error fetching role permissions:", permissionsError)
      return []
    }

    // Extract and deduplicate permissions
    const permissionList = rolePermissions.map(rp => rp.permission?.name).filter(Boolean)
    return [...new Set(permissionList)]
  } catch (error) {
    console.error("Error getting user permissions:", error)
    return []
  }
}