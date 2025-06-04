import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

/**
 * Stripe Login Link API
 *
 * Creates a login link for contractors to access their Stripe Express dashboard
 * where they can manage their account settings, view payouts, and update information.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json()

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    // Create login link for the Stripe Express account
    const loginLink = await stripe.accounts.createLoginLink(accountId)

    return NextResponse.json({
      url: loginLink.url,
    })
  } catch (error) {
    console.error('Error creating Stripe login link:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: `Stripe error: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create login link' }, { status: 500 })
  }
}
