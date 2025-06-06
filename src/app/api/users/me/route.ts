import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * User Me API Route
 *
 * Retrieves the currently authenticated user's information.
 * Uses PayloadCMS authentication from cookies.
 */

export async function GET(request: NextRequest) {
  try {
    // Get Payload instance
    const payload = await getPayload({ config })

    try {
      // Get user from PayloadCMS authentication
      const { user } = await payload.auth({
        headers: request.headers as any,
      })

      if (!user) {
        return NextResponse.json(
          {
            errors: [{ message: 'Not authenticated' }],
          },
          { status: 401 },
        )
      }

      return NextResponse.json({
        user,
      })
    } catch (authError) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        {
          errors: [{ message: 'Authentication failed' }],
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error('Me API error:', error)
    return NextResponse.json(
      {
        errors: [{ message: 'Internal server error' }],
      },
      { status: 500 },
    )
  }
}
