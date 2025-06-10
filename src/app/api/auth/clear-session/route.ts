import { NextRequest, NextResponse } from 'next/server'

/**
 * Clear Session API Route
 *
 * Aggressively clears all authentication-related cookies and state.
 * This is a nuclear option to ensure complete logout.
 */

export async function POST(request: NextRequest) {
  try {
    console.log('💥 Clear session endpoint called - nuclear option')

    // Log existing cookies
    const cookieHeader = request.headers.get('cookie')
    console.log('🍪 Existing cookies before clear:', cookieHeader)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Session completely cleared',
    })

    // Get all possible cookie names from the request
    const existingCookies =
      cookieHeader?.split(';').map((cookie) => {
        const [name] = cookie.trim().split('=')
        return name
      }) || []

    console.log('📝 Found existing cookie names:', existingCookies)

    // Add known possible cookie names
    const allPossibleCookies = [
      ...existingCookies,
      'payload-token',
      'payload-session',
      'payload-refresh-token',
      'payload-auth',
      'msh_userEmail',
      'msh_userName',
      'msh_anonymous_session',
      'msh_middleware_check',
      'auth-login',
      'auth-logout',
      'next-auth.session-token',
      'next-auth.csrf-token',
      '__session',
      'connect.sid',
    ]

    // Remove duplicates
    const uniqueCookies = [...new Set(allPossibleCookies)]

    // Multiple clear configurations to be extra sure
    const clearConfigurations = [
      { maxAge: 0, path: '/' },
      { maxAge: 0, path: '/', httpOnly: true },
      { maxAge: 0, path: '/', secure: true },
      { maxAge: 0, path: '/', httpOnly: true, secure: true },
      { maxAge: 0, path: '/', sameSite: 'lax' as const },
      { maxAge: 0, path: '/', httpOnly: true, sameSite: 'lax' as const },
      { maxAge: 0, path: '/', secure: true, sameSite: 'lax' as const },
      {
        maxAge: 0,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
      },
      { expires: new Date(0), path: '/' },
      { expires: new Date(0), path: '/', httpOnly: true },
    ]

    // Clear each cookie with each configuration
    uniqueCookies.forEach((cookieName) => {
      if (cookieName && cookieName.trim()) {
        clearConfigurations.forEach((config, index) => {
          response.cookies.set(cookieName.trim(), '', config)
        })
        console.log(`🗑️ Cleared cookie: ${cookieName}`)
      }
    })

    // Add aggressive cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"')

    console.log('💥 Nuclear session clear completed')
    return response
  } catch (error) {
    console.error('Clear session API error:', error)

    const response = NextResponse.json(
      {
        error: 'Error clearing session',
        success: false,
      },
      { status: 500 },
    )

    // Even on error, try basic clearing
    response.cookies.set('payload-token', '', { maxAge: 0, path: '/' })

    return response
  }
}
