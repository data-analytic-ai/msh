/**
 * Bids Management API
 *
 * Custom API route for handling contractor bids on service requests.
 * This replaces the embedded quotes system with a separate collection.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Create New Bid
 *
 * Allows contractors to submit bids for service requests.
 *
 * Request body should include:
 * - serviceRequestId: ID of the service request
 * - amount: Bid amount
 * - description: Bid details
 * - estimatedDuration?: Estimated time to complete
 * - warranty?: Warranty information
 * - materials?: List of materials needed
 */
export async function POST(request: NextRequest) {
  try {
    const bidData = await request.json()
    const {
      serviceRequestId,
      amount,
      description,
      estimatedDuration,
      warranty,
      materials,
      priceBreakdown,
      availability,
    } = bidData

    if (!serviceRequestId || !amount || !description) {
      return NextResponse.json(
        { error: 'serviceRequestId, amount, and description are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Verify service request exists
    const serviceRequest = await payload.findByID({
      collection: 'service-requests',
      id: serviceRequestId,
      depth: 1,
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }

    // Check if contractor already has a bid for this request
    const existingBids = await payload.find({
      collection: 'bids',
      where: {
        and: [
          {
            serviceRequest: {
              equals: serviceRequestId,
            },
          },
          {
            contractor: {
              equals: bidData.contractorId,
            },
          },
        ],
      },
    })

    if (existingBids.docs.length > 0) {
      return NextResponse.json(
        { error: 'Contractor has already submitted a bid for this request' },
        { status: 400 },
      )
    }

    // Create the new bid
    const newBid = await payload.create({
      collection: 'bids',
      data: {
        serviceRequest: serviceRequestId,
        contractor: bidData.contractorId,
        amount: parseFloat(amount),
        description,
        estimatedDuration,
        warranty,
        materials,
        priceBreakdown,
        availability,
        status: 'pending',
        title: 'Bid',
      },
      depth: 2,
    })

    console.log(`✅ New bid created: ${newBid.id} for service request ${serviceRequestId}`)
    return NextResponse.json(newBid)
  } catch (error: any) {
    console.error(`❌ Error creating bid:`, error)
    return NextResponse.json({ error: 'Failed to create bid' }, { status: 500 })
  }
}

/**
 * Get Bids
 *
 * Retrieves bids based on query parameters:
 * - serviceRequestId: Get all bids for a service request
 * - contractorId: Get all bids by a contractor
 * - status: Filter by bid status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceRequestId = searchParams.get('serviceRequestId')
    const contractorId = searchParams.get('contractorId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    const payload = await getPayload({ config })

    // Build where condition
    const whereConditions: any[] = []

    if (serviceRequestId) {
      whereConditions.push({
        serviceRequest: {
          equals: serviceRequestId,
        },
      })
    }

    if (contractorId) {
      whereConditions.push({
        contractor: {
          equals: contractorId,
        },
      })
    }

    if (status) {
      whereConditions.push({
        status: {
          equals: status,
        },
      })
    }

    const where: any = whereConditions.length > 0 ? { and: whereConditions } : {}

    const bids = await payload.find({
      collection: 'bids',
      where,
      depth: 2,
      limit,
      page,
      sort: '-createdAt',
    })

    return NextResponse.json(bids)
  } catch (error: any) {
    console.error(`❌ Error fetching bids:`, error)
    return NextResponse.json({ error: 'Failed to fetch bids' }, { status: 500 })
  }
}

/**
 * Update Bid
 *
 * Allows updating bid status and other fields.
 */
export async function PATCH(request: NextRequest) {
  try {
    const updateData = await request.json()
    const { bidId, status, ...otherFields } = updateData

    if (!bidId) {
      return NextResponse.json({ error: 'bidId is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Get current bid
    const currentBid = await payload.findByID({
      collection: 'bids',
      id: bidId,
      depth: 2,
    })

    if (!currentBid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 })
    }

    // Update the bid
    const updatedBid = await payload.update({
      collection: 'bids',
      id: bidId,
      data: {
        status,
        ...otherFields,
      },
      depth: 2,
    })

    console.log(`✅ Bid updated: ${bidId}`)
    return NextResponse.json(updatedBid)
  } catch (error: any) {
    console.error(`❌ Error updating bid:`, error)
    return NextResponse.json({ error: 'Failed to update bid' }, { status: 500 })
  }
}
