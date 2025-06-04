/**
 * Purchase Lead API Route
 *
 * Handles the purchase of premium lead access using Stripe payments.
 * Creates payment intent and processes the transaction.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractorId, serviceRequestId, leadType = 'basic', paymentMethodId } = body

    if (!contractorId || !serviceRequestId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'contractorId, serviceRequestId, and paymentMethodId are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Check if access already exists
    const existingAccess = await payload.find({
      collection: 'leadAccess',
      where: {
        and: [
          { contractor: { equals: contractorId } },
          { serviceRequest: { equals: serviceRequestId } },
          { paymentStatus: { in: ['completed', 'pending'] } },
        ],
      },
      limit: 1,
    })

    if (existingAccess.docs.length > 0) {
      return NextResponse.json(
        { error: 'Lead access already exists or is pending for this contractor' },
        { status: 409 },
      )
    }

    // Get contractor and service request details
    const [contractor, serviceRequest] = await Promise.all([
      payload.findByID({ collection: 'users', id: contractorId }),
      payload.findByID({ collection: 'service-requests', id: serviceRequestId }),
    ])

    if (!contractor || contractor.role !== 'contractor') {
      return NextResponse.json({ error: 'Invalid contractor' }, { status: 400 })
    }

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }

    // Determine lead price based on type and service urgency
    const getLeadPrice = (type: string, urgency: string) => {
      const basePrices = {
        basic: 15,
        premium: 25,
        specialized: 35,
      }

      let price = basePrices[type as keyof typeof basePrices] || 15

      // Add urgency multiplier
      if (urgency === 'emergency') {
        price *= 1.5
      } else if (urgency === 'high') {
        price *= 1.2
      }

      return Math.round(price)
    }

    const leadPrice = getLeadPrice(leadType, serviceRequest.urgencyLevel)

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: leadPrice * 100, // Stripe expects cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/contractor/dashboard/explore`,
      metadata: {
        contractorId,
        serviceRequestId,
        leadType,
        leadPrice: leadPrice.toString(),
      },
    })

    if (paymentIntent.status === 'succeeded') {
      // Create lead access record
      const leadAccess = await payload.create({
        collection: 'leadAccess',
        data: {
          contractor: contractorId,
          serviceRequest: serviceRequestId,
          hasAccessToContactInfo: true,
          leadPrice,
          paymentStatus: 'completed',
          paymentIntentId: paymentIntent.id,
          leadType,
          chatEnabled: true,
          purchasedAt: new Date().toISOString(),
        },
      })

      // Create system message in chat
      await payload.create({
        collection: 'leadChats',
        data: {
          serviceRequest: serviceRequestId,
          leadAccess: leadAccess.id,
          sender: contractorId,
          senderType: 'system',
          message: `${contractor.firstName} ${contractor.lastName} has gained premium access to this request and can now contact you directly.`,
          messageType: 'system',
        },
      })

      return NextResponse.json({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
        },
        leadAccess,
        leadPrice,
        message: 'Lead purchased successfully!',
      })
    } else {
      // Create pending lead access record
      const leadAccess = await payload.create({
        collection: 'leadAccess',
        data: {
          contractor: contractorId,
          serviceRequest: serviceRequestId,
          hasAccessToContactInfo: false,
          leadPrice,
          paymentStatus: 'pending',
          paymentIntentId: paymentIntent.id,
          leadType,
          chatEnabled: false,
          purchasedAt: new Date().toISOString(),
        },
      })

      return NextResponse.json({
        success: false,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret,
        },
        leadAccess,
        message: 'Payment requires additional confirmation',
      })
    }
  } catch (error) {
    console.error('Error purchasing lead:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: `Payment failed: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to purchase lead' }, { status: 500 })
  }
}
