/**
 * Lead Access API Route
 *
 * Handles verification and management of premium lead access for contractors.
 * Checks if a contractor has purchased access to a specific service request.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractorId')
    const serviceRequestId = searchParams.get('serviceRequestId')

    if (!contractorId || !serviceRequestId) {
      return NextResponse.json(
        { error: 'contractorId and serviceRequestId are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Find lead access record
    const leadAccess = await payload.find({
      collection: 'leadAccess',
      where: {
        and: [
          { contractor: { equals: contractorId } },
          { serviceRequest: { equals: serviceRequestId } },
          { paymentStatus: { equals: 'completed' } },
        ],
      },
      limit: 1,
    })

    const hasAccess = leadAccess.docs.length > 0
    const accessRecord = hasAccess ? leadAccess.docs[0] : null

    return NextResponse.json({
      hasAccess,
      accessRecord,
      leadType: accessRecord?.leadType || null,
      chatEnabled: accessRecord?.chatEnabled || false,
      purchasedAt: accessRecord?.purchasedAt || null,
    })
  } catch (error) {
    console.error('Error checking lead access:', error)
    return NextResponse.json({ error: 'Failed to check lead access' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractorId, serviceRequestId, paymentIntentId, leadType = 'basic' } = body

    if (!contractorId || !serviceRequestId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'contractorId, serviceRequestId, and paymentIntentId are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Determine lead price based on type
    const leadPrices = {
      basic: 15,
      premium: 25,
      specialized: 35,
    }
    const leadPrice = leadPrices[leadType as keyof typeof leadPrices] || 15

    // Check if access already exists
    const existingAccess = await payload.find({
      collection: 'leadAccess',
      where: {
        and: [
          { contractor: { equals: contractorId } },
          { serviceRequest: { equals: serviceRequestId } },
        ],
      },
      limit: 1,
    })

    if (existingAccess.docs.length > 0) {
      return NextResponse.json(
        { error: 'Lead access already exists for this contractor and service request' },
        { status: 409 },
      )
    }

    // Create lead access record
    const leadAccess = await payload.create({
      collection: 'leadAccess',
      data: {
        contractor: contractorId,
        serviceRequest: serviceRequestId,
        hasAccessToContactInfo: true,
        leadPrice,
        paymentStatus: 'pending', // Changed to valid status
        paymentIntentId,
        leadType,
        chatEnabled: true,
        purchasedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      leadAccess,
      message: 'Lead access granted successfully',
    })
  } catch (error) {
    console.error('Error creating lead access:', error)
    return NextResponse.json({ error: 'Failed to create lead access' }, { status: 500 })
  }
}
