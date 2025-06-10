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
    // Log the raw request body to debug JSON parsing issues
    const bodyText = await request.text()
    console.log('Raw request body:', bodyText)

    let parsedBody
    try {
      parsedBody = JSON.parse(bodyText)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Body text causing error:', bodyText)
      return NextResponse.json(
        {
          errors: [{ message: 'Invalid JSON format in request body' }],
        },
        { status: 400 },
      )
    }

    const { email, password } = parsedBody

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
      // First, let's check if the user exists and has valid data
      const existingUser = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: email,
          },
        },
        limit: 1,
      })

      if (existingUser.docs.length === 0) {
        return NextResponse.json(
          {
            errors: [{ message: 'Usuario no encontrado' }],
          },
          { status: 401 },
        )
      }

      const user = existingUser.docs[0]
      if (!user) {
        return NextResponse.json(
          {
            errors: [{ message: 'Usuario no encontrado' }],
          },
          { status: 401 },
        )
      }

      console.log('Login attempt for user:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        hasFirstName: !!user.firstName,
        hasLastName: !!user.lastName,
      })

      // Check if user has valid firstName and lastName, fix if needed
      let needsUpdate = false
      const updateData: any = {}

      if (!user.firstName || user.firstName.trim().length === 0) {
        updateData.firstName = user.email.split('@')[0] || 'User'
        needsUpdate = true
        console.log('Fixing missing firstName for user:', user.email)
      }

      if (!user.lastName || user.lastName.trim().length === 0) {
        updateData.lastName = 'Customer'
        needsUpdate = true
        console.log('Fixing missing lastName for user:', user.email)
      }

      // Update user if needed
      if (needsUpdate) {
        try {
          await payload.update({
            collection: 'users',
            id: user.id,
            data: updateData,
          })
          console.log('User data fixed successfully')
        } catch (updateError) {
          console.error('Error fixing user data:', updateError)
        }
      }

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
