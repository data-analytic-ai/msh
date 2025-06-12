/**
 * Contractor Quotes API
 *
 * Custom endpoint for contractors to submit and update quotes.
 * This avoids conflicts with PayloadCMS collection validation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Submit or Update Quote
 *
 * Handles quote submission from contractors to service requests
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const quoteData = await request.json()

    const { requestId, contractorId, amount, description } = quoteData

    // Validate required fields
    if (!requestId || !contractorId || !amount || !description) {
      return NextResponse.json(
        { error: 'requestId, contractorId, amount, and description are required' },
        { status: 400 },
      )
    }

    console.log('💰 Processing quote submission:', { requestId, contractorId, amount })

    // Get the current service request
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
    const existingQuoteIndex = existingQuotes.findIndex(
      (quote: any) => quote.contractor?.toString() === contractorId,
    )

    // Prepare the new quote object
    const newQuote = {
      contractor: contractorId,
      amount: parseFloat(amount.toString()),
      description,
      status: 'pending' as const,
    }

    let updatedQuotes
    if (existingQuoteIndex >= 0) {
      // Update existing quote
      updatedQuotes = [...existingQuotes]
      updatedQuotes[existingQuoteIndex] = newQuote
      console.log('🔄 Updating existing quote')
    } else {
      // Add new quote
      updatedQuotes = [...existingQuotes, newQuote]
      console.log('✨ Adding new quote')
    }

    // Update the service request with only the fields we need to change
    const updatedRequest = await payload.update({
      collection: 'service-requests',
      id: requestId,
      data: {
        quotes: updatedQuotes,
      },
      depth: 2,
    })

    console.log('✅ Quote successfully processed for request:', requestId)

    return NextResponse.json({
      success: true,
      message:
        existingQuoteIndex >= 0 ? 'Quote updated successfully' : 'Quote submitted successfully',
      quote: newQuote,
      serviceRequest: updatedRequest,
    })
  } catch (error: any) {
    console.error('❌ Error processing quote:', error)

    // Handle specific PayloadCMS validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.data || error.message,
          message: 'Please check the provided data and try again',
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to process quote',
        message: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 },
    )
  }
}

/**
 * Get Quotes for Contractor
 *
 * Retrieves all quotes submitted by a specific contractor
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get('contractorId')

    if (!contractorId) {
      return NextResponse.json({ error: 'contractorId parameter is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Find all service requests that have quotes from this contractor
    const serviceRequests = await payload.find({
      collection: 'service-requests',
      where: {
        'quotes.contractor': {
          equals: contractorId,
        },
      },
      depth: 2,
      sort: '-createdAt',
    })

    // Extract and format the quotes
    const contractorQuotes = serviceRequests.docs
      .map((request: any) => {
        const contractorQuote = request.quotes?.find(
          (quote: any) => quote.contractor?.toString() === contractorId,
        )

        return {
          requestId: request.id,
          requestTitle: request.requestTitle,
          serviceType: request.serviceType,
          quote: contractorQuote,
          requestStatus: request.status,
          submittedAt: request.createdAt,
        }
      })
      .filter((item) => item.quote) // Only include requests where contractor has a quote

    return NextResponse.json({
      success: true,
      quotes: contractorQuotes,
      total: contractorQuotes.length,
    })
  } catch (error: any) {
    console.error('❌ Error fetching contractor quotes:', error)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}
