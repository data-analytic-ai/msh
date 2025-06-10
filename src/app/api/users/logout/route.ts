import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Custom Logout API Route
 *
 * Handles user logout using PayloadCMS auth functionality.
 * Clears authentication cookies and invalidates the session.
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Logout endpoint called')

    // Log existing cookies
    const cookieHeader = request.headers.get('cookie')
    console.log('🍪 Existing cookies:', cookieHeader)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Clear all possible PayloadCMS and custom cookies
    const cookiesListToClear = [
      'payload-token',
      'payload-session',
      'payload-refresh-token',
      'msh_userEmail',
      'msh_userName',
      'msh_anonymous_session',
      'msh_middleware_check',
    ]

    const cookieOptions = [
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 0,
        path: '/',
      },
      {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 0,
        path: '/',
      },
      {
        maxAge: 0,
        path: '/',
      },
    ]

    // Clear all cookies with all possible configurations
    cookiesListToClear.forEach((cookieName) => {
      cookieOptions.forEach((options) => {
        response.cookies.set(cookieName, '', options)
        console.log(`🗑️ Clearing cookie: ${cookieName}`)
      })
    })

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    console.log('✅ Logout cookies cleared')
    return response
  } catch (error) {
    console.error('Logout API error:', error)

    // Even on error, try to clear the cookies
    const response = NextResponse.json(
      {
        error: 'Error during logout',
        success: false,
      },
      { status: 500 },
    )

    response.cookies.set('payload-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response
  }
}
