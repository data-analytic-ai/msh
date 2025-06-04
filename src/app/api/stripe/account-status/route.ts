import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

/**
 * Stripe Account Status API
 *
 * Retrieves the current status of a Stripe Connect account,
 * including verification status, requirements, and capabilities.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    // Retrieve account information from Stripe
    const account = await stripe.accounts.retrieve(accountId)

    // Format response with relevant information
    const accountStatus = {
      id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: {
        currently_due: account.requirements?.currently_due || [],
        eventually_due: account.requirements?.eventually_due || [],
        past_due: account.requirements?.past_due || [],
        pending_verification: account.requirements?.pending_verification || [],
      },
      verification: {
        disabled_reason: account.requirements?.disabled_reason,
      },
      capabilities: {
        card_payments: account.capabilities?.card_payments,
        transfers: account.capabilities?.transfers,
      },
      country: account.country,
      default_currency: account.default_currency,
      business_profile: {
        name: account.business_profile?.name,
        support_email: account.business_profile?.support_email,
        support_phone: account.business_profile?.support_phone,
        url: account.business_profile?.url,
      },
      settings: {
        payouts: {
          schedule: account.settings?.payouts?.schedule,
        },
      },
    }

    return NextResponse.json(accountStatus)
  } catch (error) {
    console.error('Error retrieving Stripe account status:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: `Stripe error: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to retrieve account status' }, { status: 500 })
  }
}
