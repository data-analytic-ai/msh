/**
 * User Exists API Route
 *
 * Checks if a user exists by email address.
 * Used to determine if we should show login or registration form.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    // Get Payload instance
    const payload = await getPayload({ config })

    // Find user by email
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    return NextResponse.json({
      exists: users.docs.length > 0,
    })
  } catch (error) {
    console.error('Error checking user existence:', error)
    return NextResponse.json({ error: 'Failed to check user existence' }, { status: 500 })
  }
}
