/**
 * Mark All Notifications as Read API
 *
 * Marks all notifications for the current user as read.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getMe } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get current user
    const { user } = await getMe()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all unread notifications for this user
    const unreadNotifications = await payload.find({
      collection: 'notifications',
      where: {
        userId: {
          equals: user.id,
        },
        read: {
          equals: false,
        },
      },
      limit: 1000, // Reasonable limit for bulk operations
    })

    // Update all unread notifications to read
    const updatePromises = unreadNotifications.docs.map((notification) =>
      payload.update({
        collection: 'notifications',
        id: notification.id,
        data: { read: true },
      }),
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      updated: unreadNotifications.docs.length,
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
  }
}
