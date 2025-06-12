/**
 * Individual Notification API
 *
 * Handles operations on specific notifications by ID.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: configPromise })
    const notificationId = params.id
    const updateData = await request.json()

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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: configPromise })
    const notificationId = params.id

    await payload.delete({
      collection: 'notifications',
      id: notificationId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
  }
}
