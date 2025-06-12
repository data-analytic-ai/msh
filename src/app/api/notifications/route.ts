/**
 * Notifications API - Main CRUD operations
 *
 * Handles creating, reading, updating, and deleting notifications.
 * Integrates with PayloadCMS for persistence.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Build query
    const where: any = {
      userId: {
        equals: userId,
      },
    }

    if (unreadOnly) {
      where.read = {
        equals: false,
      }
    }

    const notifications = await payload.find({
      collection: 'notifications',
      where,
      limit,
      page,
      sort: '-createdAt',
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const notificationData = await request.json()

    // Validate required fields
    if (!notificationData.userId || !notificationData.type || !notificationData.title) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, title' },
        { status: 400 },
      )
    }

    const notification = await payload.create({
      collection: 'notifications',
      data: {
        ...notificationData,
        createdAt: new Date().toISOString(),
        read: false,
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')
    const updateData = await request.json()

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    const notification = await payload.update({
      collection: 'notifications',
      id: notificationId,
      data: updateData,
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
