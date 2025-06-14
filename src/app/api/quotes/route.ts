/**
 * Quotes Management API
 *
 * Custom API route for handling quote operations on service requests.
 * This route handles adding quotes from contractors and updating quote status
 * without interfering with PayloadCMS native endpoints.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Add Quote to Service Request
 *
 * Allows contractors to submit quotes for service requests.
 * Adds quote to the quotes array in the service request document.
 *
 * Request body should include:
 * - requestId: ID of the service request
 * - contractorId: ID of the contractor submitting the quote
 * - amount: Quoted amount
 * - description: Quote details
 * - estimatedDuration?: Estimated time to complete
 * - warranty?: Warranty information
 * - materials?: List of materials needed
 */
export async function POST(request: NextRequest) {
  try {
    const quoteData = await request.json()
    const { requestId, contractorId, amount, description, estimatedDuration, warranty, materials } =
      quoteData

    if (!requestId || !contractorId || !amount || !description) {
      return NextResponse.json(
        { error: 'requestId, contractorId, amount, and description are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // First, get the current service request
    const serviceRequest = await payload.findByID({
      collection: 'service-requests',
      id: requestId,
      depth: 1,
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }

    // Check if contractor already has a quote for this request
    const existingQuotes = serviceRequest.quotes || []
    const existingQuote = existingQuotes.find(
      (quote: any) => quote.contractor?.toString() === contractorId,
    )

    if (existingQuote) {
      return NextResponse.json(
        { error: 'Contractor has already submitted a quote for this request' },
        { status: 400 },
      )
    }

    // Create the new quote object
    const newQuote = {
      contractor: contractorId,
      amount: parseFloat(amount),
      description,
      status: 'pending' as const,
      estimatedDuration,
      warranty,
      materials,
    }

    // Add the quote to the service request
    const updatedRequest = await payload.update({
      collection: 'service-requests',
      id: requestId,
      data: {
        quotes: [...existingQuotes, newQuote],
        status: 'assigned', // Update status to indicate quotes have been received
      },
      depth: 2,
    })

    console.log(`✅ Quote added to service request ${requestId}`)
    return NextResponse.json(updatedRequest)
  } catch (error: any) {
    console.error(`❌ Error adding quote:`, error)
    return NextResponse.json({ error: 'Failed to add quote' }, { status: 500 })
  }
}

/**
 * Update Quote Status
 *
 * Allows customers to accept/reject quotes or contractors to update their quotes.
 *
 * Request body should include:
 * - requestId: ID of the service request
 * - quoteIndex: Index of the quote in the quotes array
 * - status: New status ('accepted', 'rejected', 'pending')
 * - contractorId?: ID of contractor (for verification)
 */
export async function PATCH(request: NextRequest) {
  try {
    const updateData = await request.json()
    const { requestId, quoteIndex, status, contractorId } = updateData

    if (!requestId || quoteIndex === undefined || !status) {
      return NextResponse.json(
        { error: 'requestId, quoteIndex, and status are required' },
        { status: 400 },
      )
    }

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be pending, accepted, or rejected' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Get the current service request
    const serviceRequest = await payload.findByID({
      collection: 'service-requests',
      id: requestId,
      depth: 2,
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }

    const quotes = [...(serviceRequest.quotes || [])]

    if (quoteIndex >= quotes.length) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Get the quote that will be updated for notification purposes
    const targetQuote = quotes[quoteIndex]

    // Update the specific quote
    quotes[quoteIndex] = {
      ...quotes[quoteIndex],
      status,
    }

    // If accepting a quote, reject all others and assign contractor
    let updatePayload: any = { quotes }

    if (status === 'accepted') {
      // Reject all other quotes
      quotes.forEach((quote, index) => {
        if (index !== quoteIndex) {
          quotes[index] = { ...quote, status: 'rejected' }
        }
      })

      // Assign the contractor and update service request status
      updatePayload = {
        ...updatePayload,
        assignedContractor: quotes[quoteIndex].contractor,
        status: 'assigned', // Change to 'assigned' instead of 'in-progress'
      }
    }

    // Update the service request
    const updatedRequest = await payload.update({
      collection: 'service-requests',
      id: requestId,
      data: updatePayload,
      depth: 2,
    })

    // 📧 SEND NOTIFICATIONS
    try {
      if (status === 'accepted' && targetQuote) {
        // Get contractor information
        const contractorId =
          typeof targetQuote.contractor === 'string'
            ? targetQuote.contractor
            : targetQuote.contractor?.id

        if (contractorId) {
          const contractor = await payload.findByID({
            collection: 'users',
            id: contractorId,
            depth: 1,
          })

          // Get customer information
          const customer = serviceRequest.customer
          const customerName = customer
            ? typeof customer === 'string'
              ? 'Cliente' // Fallback if customer is just an ID
              : `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Cliente'
            : serviceRequest.customerInfo
              ? `${serviceRequest.customerInfo.firstName} ${serviceRequest.customerInfo.lastName}`.trim()
              : 'Cliente'

          // Create notification for the contractor
          await payload.create({
            collection: 'notifications',
            data: {
              id: `quote-accepted-${requestId}-${contractorId}-${Date.now()}`,
              type: 'quote_accepted',
              title: '¡Tu cotización fue aceptada!',
              message: `${customerName} aceptó tu cotización de $${targetQuote.amount.toLocaleString()} para "${serviceRequest.requestTitle}".`,
              priority: 'high',
              channels: ['in_app', 'web_push', 'email'],
              userId: contractorId,
              read: false,
              data: {
                requestId: requestId,
                amount: targetQuote.amount,
                customerName: customerName,
                actionUrl: `/contractor/dashboard`,
              },
              actionLabel: 'Ver trabajo',
            },
          })

          console.log(`📧 Quote acceptance notification sent to contractor ${contractorId}`)
        }
      } else if (status === 'rejected' && targetQuote) {
        // Optional: Notify contractor of rejection
        const contractorId =
          typeof targetQuote.contractor === 'string'
            ? targetQuote.contractor
            : targetQuote.contractor?.id

        if (contractorId) {
          await payload.create({
            collection: 'notifications',
            data: {
              id: `quote-rejected-${requestId}-${contractorId}-${Date.now()}`,
              type: 'quote_rejected',
              title: 'Cotización no seleccionada',
              message: `Tu cotización de $${targetQuote.amount.toLocaleString()} para "${serviceRequest.requestTitle}" no fue seleccionada.`,
              priority: 'normal',
              channels: ['in_app', 'email'],
              userId: contractorId,
              read: false,
              data: {
                requestId: requestId,
                amount: targetQuote.amount,
                actionUrl: `/contractor/dashboard/explore`,
              },
              actionLabel: 'Ver más solicitudes',
            },
          })

          console.log(`📧 Quote rejection notification sent to contractor ${contractorId}`)
        }
      }
    } catch (notificationError) {
      console.error('❌ Error sending notification:', notificationError)
      // Don't fail the quote update if notification fails
    }

    console.log(`✅ Quote status updated for service request ${requestId}`)
    return NextResponse.json(updatedRequest)
  } catch (error: any) {
    console.error(`❌ Error updating quote:`, error)
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
  }
}
