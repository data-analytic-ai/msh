/**
 * Lead Chat API Route
 *
 * Handles chat messages between contractors and customers for premium leads.
 * Only available when contractor has purchased lead access.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceRequestId = searchParams.get('serviceRequestId')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!serviceRequestId || !userId) {
      return NextResponse.json(
        { error: 'serviceRequestId and userId are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Verify user has access to this chat
    const user = await payload.findByID({ collection: 'users', id: userId })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If contractor, verify they have lead access
    if (user.role === 'contractor') {
      const leadAccess = await payload.find({
        collection: 'leadAccess',
        where: {
          and: [
            { contractor: { equals: userId } },
            { serviceRequest: { equals: serviceRequestId } },
            { paymentStatus: { equals: 'completed' } },
            { chatEnabled: { equals: true } },
          ],
        },
        limit: 1,
      })

      if (leadAccess.docs.length === 0) {
        return NextResponse.json(
          { error: 'No premium lead access found for this service request' },
          { status: 403 },
        )
      }
    }

    // Get chat messages
    const messages = await payload.find({
      collection: 'leadChats',
      where: {
        serviceRequest: { equals: serviceRequestId },
      },
      limit,
      sort: '-createdAt',
    })

    // Mark messages as read by current user
    const unreadMessages = messages.docs.filter((msg: any) => !msg.isRead && msg.sender !== userId)

    if (unreadMessages.length > 0) {
      await Promise.all(
        unreadMessages.map((msg: any) =>
          payload.update({
            collection: 'leadChats',
            id: msg.id,
            data: {
              isRead: true,
              readAt: new Date().toISOString(),
            },
          }),
        ),
      )
    }

    return NextResponse.json({
      messages: messages.docs.reverse(), // Return in chronological order
      totalDocs: messages.totalDocs,
      hasNextPage: messages.hasNextPage,
      hasPrevPage: messages.hasPrevPage,
    })
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json({ error: 'Failed to fetch chat messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceRequestId, senderId, message, messageType = 'text', quoteInfo } = body

    if (!serviceRequestId || !senderId || !message) {
      return NextResponse.json(
        { error: 'serviceRequestId, senderId, and message are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Verify sender exists
    const sender = await payload.findByID({ collection: 'users', id: senderId })
    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 })
    }

    // Get lead access record
    let leadAccess = null
    if (sender.role === 'contractor') {
      const leadAccessResult = await payload.find({
        collection: 'leadAccess',
        where: {
          and: [
            { contractor: { equals: senderId } },
            { serviceRequest: { equals: serviceRequestId } },
            { paymentStatus: { equals: 'completed' } },
            { chatEnabled: { equals: true } },
          ],
        },
        limit: 1,
      })

      if (leadAccessResult.docs.length === 0) {
        return NextResponse.json(
          { error: 'No premium lead access found for this service request' },
          { status: 403 },
        )
      }
      leadAccess = leadAccessResult.docs[0]
    } else {
      // For customers, find any active lead access for this service request
      const leadAccessResult = await payload.find({
        collection: 'leadAccess',
        where: {
          and: [
            { serviceRequest: { equals: serviceRequestId } },
            { paymentStatus: { equals: 'completed' } },
            { chatEnabled: { equals: true } },
          ],
        },
        limit: 1,
      })

      if (leadAccessResult.docs.length === 0) {
        return NextResponse.json(
          { error: 'No active lead access found for this service request' },
          { status: 403 },
        )
      }
      leadAccess = leadAccessResult.docs[0]
    }

    // Create chat message
    const chatMessage = await payload.create({
      collection: 'leadChats',
      data: {
        serviceRequest: serviceRequestId,
        leadAccess: leadAccess?.id || '',
        sender: senderId,
        senderType: sender.role === 'contractor' ? 'contractor' : 'customer',
        message,
        messageType,
        quoteInfo: messageType === 'quote' ? quoteInfo : undefined,
        isRead: false,
      },
    })

    // Update contact attempts count if contractor is sending first message
    if (sender.role === 'contractor' && leadAccess) {
      await payload.update({
        collection: 'leadAccess',
        id: leadAccess.id,
        data: {
          contactAttempts: (leadAccess.contactAttempts || 0) + 1,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: chatMessage,
    })
  } catch (error) {
    console.error('Error sending chat message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
