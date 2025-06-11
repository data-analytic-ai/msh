import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Stripe Connect Account Creation API
 *
 * Creates a Stripe Connect Express account for contractors and generates
 * an account link for onboarding completion.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
})

export async function POST(request: NextRequest) {
  try {
    // Get payload instance
    const payload = await getPayload({ config })

    const { contractorId, type = 'express' } = await request.json()

    if (!contractorId) {
      return NextResponse.json({ error: 'Contractor ID is required' }, { status: 400 })
    }

    // Check if contractor exists
    const contractor = await payload.findByID({
      collection: 'users',
      id: contractorId,
    })

    if (!contractor || contractor.role !== 'contractor') {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
    }

    // Check if contractor already has a Stripe account
    if (contractor.stripeAccountId) {
      // Generate new account link for existing account
      const accountLink = await stripe.accountLinks.create({
        account: contractor.stripeAccountId,
        refresh_url: `${process.env.NEXTAUTH_URL}/contractor/dashboard/profile?stripe_refresh=true`,
        return_url: `${process.env.NEXTAUTH_URL}/contractor/dashboard/profile?stripe_success=true`,
        type: 'account_onboarding',
      })

      return NextResponse.json({
        accountId: contractor.stripeAccountId,
        accountLinkUrl: accountLink.url,
      })
    }

    // Create new Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: contractor.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: {
        first_name: contractor.firstName,
        last_name: contractor.lastName,
        email: contractor.email,
        phone: contractor.phone,
      },
      business_profile: {
        name: contractor.businessName || `${contractor.firstName} ${contractor.lastName}`,
        product_description: `Professional services: ${contractor.services?.join(', ') || 'General services'}`,
        support_phone: contractor.phone,
        support_email: contractor.email,
        url: process.env.NEXTAUTH_URL,
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'weekly',
            weekly_anchor: 'friday',
          },
        },
      },
    } as Stripe.AccountCreateParams)

    // Update contractor with Stripe account ID
    await payload.update({
      collection: 'users',
      id: contractorId,
      data: {
        stripeAccountId: account.id,
      },
    })

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXTAUTH_URL}/contractor/dashboard/profile?stripe_refresh=true`,
      return_url: `${process.env.NEXTAUTH_URL}/contractor/dashboard/profile?stripe_success=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      accountId: account.id,
      accountLinkUrl: accountLink.url,
    })
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error)
    return NextResponse.json({ error: 'Failed to create Stripe account' }, { status: 500 })
  }
}
