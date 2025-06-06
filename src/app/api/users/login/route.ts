import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Custom Login API Route
 *
 * Handles user authentication using PayloadCMS auth functionality.
 * This route is necessary because PayloadCMS 3.0+ doesn't automatically
 * expose the login endpoint in the expected format.
 */

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        {
          errors: [{ message: 'Email and password are required' }],
        },
        { status: 400 },
      )
    }

    // Get Payload instance
    const payload = await getPayload({ config })

    try {
      // Attempt to log in the user
      const result = await payload.login({
        collection: 'users',
        data: { email, password },
        req: request as any,
      })

      if (result.user) {
        // Create response with user data
        const response = NextResponse.json({
          user: result.user,
          token: result.token,
          exp: result.exp,
        })

        // Set cookie if token exists
        if (result.token) {
          response.cookies.set('payload-token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: result.exp ? result.exp - Math.floor(Date.now() / 1000) : 86400, // Default 24 hours
            path: '/',
          })
        }

        return response
      } else {
        return NextResponse.json(
          {
            errors: [{ message: 'Invalid credentials' }],
          },
          { status: 401 },
        )
      }
    } catch (authError: any) {
      console.error('Authentication error:', authError)

      // Handle specific Payload authentication errors
      if (authError.message?.includes('Invalid login credentials')) {
        return NextResponse.json(
          {
            errors: [{ message: 'Credenciales inválidas' }],
          },
          { status: 401 },
        )
      }

      if (authError.message?.includes('User not found')) {
        return NextResponse.json(
          {
            errors: [{ message: 'Usuario no encontrado' }],
          },
          { status: 401 },
        )
      }

      // Generic authentication error
      return NextResponse.json(
        {
          errors: [{ message: 'Error de autenticación' }],
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      {
        errors: [{ message: 'Error interno del servidor' }],
      },
      { status: 500 },
    )
  }
}
