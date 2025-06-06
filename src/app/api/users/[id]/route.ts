import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Custom User Update API
 *
 * Handles user profile updates, particularly for contractors.
 * This endpoint provides proper error handling and validation
 * while working with PayloadCMS's update functionality.
 */

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updateData = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get Payload instance
    const payload = await getPayload({ config })

    // Get current user from request context (for authentication)
    let user = null
    try {
      // Try to get user from PayloadCMS auth
      const { user: authUser } = await payload.auth({
        headers: request.headers as any,
      })
      user = authUser
    } catch (error) {
      console.log('Auth error:', error)
    }

    // Check if user is authenticated and authorized
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user can update this profile (own profile or admin)
    const isAdmin = ['admin', 'superadmin'].includes(user.role as string)
    const isOwnProfile = user.id === id

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update user in PayloadCMS
    const updatedUser = await payload.update({
      collection: 'users',
      id,
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user:', error)

    // Handle PayloadCMS validation errors
    if (error && typeof error === 'object' && 'message' in error) {
      return NextResponse.json({ error: (error as any).message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get Payload instance
    const payload = await getPayload({ config })

    // Get user from PayloadCMS
    const user = await payload.findByID({
      collection: 'users',
      id,
    })

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
