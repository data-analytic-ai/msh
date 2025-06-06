import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Custom Logout API Route
 *
 * Handles user logout using PayloadCMS auth functionality.
 * Clears authentication cookies and invalidates session.
 */

export async function POST(request: NextRequest) {
  try {
    // Get Payload instance
    const payload = await getPayload({ config })

    try {
      // Attempt to log out the user
      await payload.logout({
        collection: 'users',
        req: request as any,
      })

      // Create response
      const response = NextResponse.json({
        success: true,
        message: 'Logged out successfully',
      })

      // Clear the authentication cookie
      response.cookies.set('payload-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        path: '/',
      })

      return response
    } catch (logoutError: any) {
      console.error('Logout error:', logoutError)

      // Even if logout fails, clear the cookie
      const response = NextResponse.json({
        success: true,
        message: 'Logged out successfully',
      })

      response.cookies.set('payload-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      })

      return response
    }
  } catch (error) {
    console.error('Logout API error:', error)

    // Even if there's an error, try to clear the cookie
    const response = NextResponse.json(
      {
        errors: [{ message: 'Error during logout' }],
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
