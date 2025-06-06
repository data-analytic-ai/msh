/**
 * useStripeIntegration - Stripe integration hook for contractors
 *
 * Manages Stripe Connect account creation, verification, and payment setup
 * for contractors to receive payments through the platform.
 *
 * @returns {Object} Stripe integration functions and state
 */
import { useState, useCallback } from 'react'

interface StripeAccount {
  id: string
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted: boolean
  requirements: {
    currently_due: string[]
    eventually_due: string[]
    past_due: string[]
  }
  verification?: {
    disabled_reason?: string
    due_by?: number
  }
}

interface UseStripeIntegrationReturn {
  isConnecting: boolean
  isLoading: boolean
  error: string | null
  stripeAccount: StripeAccount | null
  connectStripeAccount: (contractorId: string) => Promise<string | null>
  getStripeAccountStatus: (accountId: string) => Promise<StripeAccount | null>
  createStripeLoginLink: (accountId: string) => Promise<string | null>
  refreshStripeAccount: (accountId: string) => Promise<void>
}

export const useStripeIntegration = (): UseStripeIntegrationReturn => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stripeAccount, setStripeAccount] = useState<StripeAccount | null>(null)

  // Connect contractor to Stripe
  const connectStripeAccount = useCallback(async (contractorId: string): Promise<string | null> => {
    try {
      setIsConnecting(true)
      setError(null)

      const response = await fetch('/api/stripe/connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          contractorId,
          type: 'express', // Use Stripe Express for easier onboarding
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create Stripe Connect account')
      }

      const data = await response.json()

      // Return the account link URL for onboarding
      return data.accountLinkUrl || null
    } catch (err) {
      console.error('Error connecting Stripe account:', err)
      setError('Error al conectar con Stripe')
      return null
    } finally {
      setIsConnecting(false)
    }
  }, [])

  // Get Stripe account status
  const getStripeAccountStatus = useCallback(
    async (accountId: string): Promise<StripeAccount | null> => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/stripe/account-status?accountId=${accountId}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to get Stripe account status')
        }

        const account = await response.json()
        setStripeAccount(account)
        return account
      } catch (err) {
        console.error('Error getting Stripe account status:', err)
        setError('Error al obtener el estado de la cuenta de Stripe')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  // Create Stripe dashboard login link
  const createStripeLoginLink = useCallback(async (accountId: string): Promise<string | null> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/stripe/login-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ accountId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create Stripe login link')
      }

      const data = await response.json()
      return data.url || null
    } catch (err) {
      console.error('Error creating Stripe login link:', err)
      setError('Error al crear enlace de acceso a Stripe')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh Stripe account information
  const refreshStripeAccount = useCallback(
    async (accountId: string): Promise<void> => {
      await getStripeAccountStatus(accountId)
    },
    [getStripeAccountStatus],
  )

  return {
    isConnecting,
    isLoading,
    error,
    stripeAccount,
    connectStripeAccount,
    getStripeAccountStatus,
    createStripeLoginLink,
    refreshStripeAccount,
  }
}
