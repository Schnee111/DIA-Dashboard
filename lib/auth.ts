import * as bcrypt from "bcrypt"
import { supabase } from '@/lib/supabaseClient'
import {
  User,
  Role,
  UserRole,
  RolePermission,
  Permission,
  AuthenticatedUser
} from '@/lib/types'

interface RegistrationResult {
  success: boolean;
  message: string;
  user?: AuthenticatedUser;
}

interface AuthResult {
  success: boolean;
  message: string;
  user: AuthenticatedUser | null;
}

/**
 * Authenticates a user with username and password
 */
export async function authenticateUser(
  username: string, 
  password: string
): Promise<AuthResult> {
  try {
    // Find user by username
    const { data: user, error: userError } = await supabase
      .from<User>('users')
      .select('*')
      .eq('username', username)
      .single()

    if (userError || !user) {
      return { 
        success: false, 
        message: "Invalid username or password", 
        user: null 
      }
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    
    if (!passwordMatch) {
      return { 
        success: false, 
        message: "Invalid username or password", 
        user: null 
      }
    }

    if (user.is_active === false) {
      return { 
        success: false, 
        message: "Account is inactive", 
        user: null 
      }
    }

    // Get user roles
    const { data: userRolesData, error: userRolesError } = await supabase
      .from<UserRole>('user_roles')
      .select('*')
      .eq('user_id', user.id)

    if (userRolesError || !userRolesData || userRolesData.length === 0) {
      return { 
        success: false, 
        message: "No roles assigned to user", 
        user: null 
      }
    }

    // Get role details
    const { data: roleData, error: roleError } = await supabase
      .from<Role>('roles')
      .select('*')
      .eq('id', userRolesData[0].role_id)
      .single()

    if (roleError || !roleData) {
      return { 
        success: false, 
        message: "Role information not found", 
        user: null 
      }
    }

    // Get permissions for this role
    const { data: rolePermissions, error: permissionsError } = await supabase
      .from('role_permissions')
      .select(`
        *,
        permission:permission_id (
          name
        )
      `)
      .eq('role_id', roleData.id)

    if (permissionsError) {
      return { 
        success: false, 
        message: "Error fetching permissions", 
        user: null 
      }
    }

    // Extract permission names
    const permissionList = (rolePermissions || [])
      .map(rp => rp.permission?.name)
      .filter((name): name is string => !!name)

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: roleData.name,
      permissions: permissionList,
      profilePicture: user.profile_picture,
      isActive: user.is_active !== false
    }

    return {
      success: true,
      message: "Authentication successful",
      user: authenticatedUser
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return { 
      success: false, 
      message: `Authentication error: ${errorMessage}`, 
      user: null 
    }
  }
}

/**
 * Registers a new user with default guest role
 */
export async function registerUser(
  name: string, 
  email: string, 
  username: string, 
  password: string
): Promise<RegistrationResult> {
  try {
    // Validate inputs
    if (!name || !email || !username || !password) {
      return { success: false, message: "All fields are required" }
    }
    
    if (password.length < 8) {
      return { success: false, message: "Password must be at least 8 characters" }
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      return { success: false, message: "Invalid email format" }
    }

    // Check if username exists
    const { data: existingUserByUsername, error: usernameError } = await supabase
      .from<User>('users')
      .select('*')
      .eq('username', username)
      .maybeSingle()

    if (usernameError) {
      return { success: false, message: "Error checking username" }
    }

    if (existingUserByUsername) {
      return { success: false, message: "Username already exists" }
    }

    // Check if email exists
    const { data: existingUserByEmail, error: emailError } = await supabase
      .from<User>('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (emailError) {
      return { success: false, message: "Error checking email" }
    }

    if (existingUserByEmail) {
      return { success: false, message: "Email already exists" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = crypto.randomUUID()

    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from<User>('users')
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

    if (insertError || !newUser) {
      return { success: false, message: "Failed to create user" }
    }

    // Find guest role
    const { data: guestRole, error: roleError } = await supabase
      .from<Role>('roles')
      .select('*')
      .eq('name', 'guest')
      .single()

    if (roleError || !guestRole) {
      return { success: false, message: "Guest role not found" }
    }

    // Assign guest role to new user
    const { error: userRoleError } = await supabase
      .from<UserRole>('user_roles')
      .insert([
        {
          id: crypto.randomUUID(),
          user_id: userId,
          role_id: guestRole.id,
        }
      ])

    if (userRoleError) {
      return { success: false, message: "Failed to assign role to user" }
    }

    // Get the user's permissions
    const permissions = await getUserPermissions(userId)
    
    const newAuthUser: AuthenticatedUser = {
      id: userId,
      name,
      email,
      username,
      role: 'guest',
      permissions,
      isActive: true
    }

    return { 
      success: true, 
      message: "Registration successful",
      user: newAuthUser
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return { success: false, message: `Registration error: ${errorMessage}` }
  }
}

/**
 * Gets all permissions for a specific user
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    // Check if user is active
    const { data: user, error: userError } = await supabase
      .from<Pick<User, 'is_active'>>('users')
      .select('is_active')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return []
    }

    if (user.is_active === false) {
      return []
    }

    // Get user roles
    const { data: userRoles, error: userRolesError } = await supabase
      .from<Pick<UserRole, 'role_id'>>('user_roles')
      .select('role_id')
      .eq('user_id', userId)

    if (userRolesError || !userRoles || userRoles.length === 0) {
      return []
    }

    // Collect all role IDs
    const roleIds = userRoles.map(ur => ur.role_id)

    // Get all permissions for these roles
    const { data: rolePermissions, error: permissionsError } = await supabase
      .from('role_permissions')
      .select(`
        permission_id,
        permission:permission_id (
          name
        )
      `)
      .in('role_id', roleIds)

    if (permissionsError || !rolePermissions) {
      return []
    }

    // Extract and deduplicate permission names
    const permissionList = rolePermissions
      .map(rp => rp.permission?.name)
      .filter((name): name is string => !!name)

    return [...new Set(permissionList)]
  } catch (error) {
    return []
  }
}

/**
 * Validates if a user has a specific permission
 */
export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissions.includes(permissionName)
}

/**
 * Validates if a user has one of the required permissions
 */
export async function hasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissionNames.some(perm => permissions.includes(perm))
}