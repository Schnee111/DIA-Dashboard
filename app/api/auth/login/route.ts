import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, registerUser } from '@/lib/auth'

/**
 * POST /api/auth/login
 * Handles user login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      )
    }
    
    const result = await authenticateUser(username, password)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      )
    }
    
    // Create a sanitized user response (don't include sensitive data)
    const { user } = result
    
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user
    }, { status: 200 })
  } catch (error) {
    console.error("Error in auth API route:", error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/auth/register
 * Handles user registration
 */
export async function register(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, username, password } = body
    
    if (!name || !email || !username || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }
    
    const result = await registerUser(name, email, username, password)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: result.message,
      user: result.user
    }, { status: 201 })
  } catch (error) {
    console.error("Error in register API route:", error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Middleware to check user authentication
 */
export async function withAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    // Get token from request headers or cookies
    const token = req.headers.get('Authorization')?.replace('Bearer ', '') || 
                  req.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Here you would verify the token and get the user
    // This is just a placeholder - replace with actual token verification
    // const user = await verifyToken(token)
    
    // For now, we'll just return unauthorized
    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    )
    
    // If token is valid, proceed with the handler
    // return handler(req)
  }
}