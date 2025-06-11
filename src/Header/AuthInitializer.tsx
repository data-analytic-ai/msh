'use client'

import { useAuth } from '@/providers/AuthProvider'
import { User } from '@/payload-types'
import { useEffect } from 'react'

/**
 * AuthInitializer - Synchronizes SSR user data with client-side auth context
 *
 * This component receives user data from SSR and initializes the client-side
 * authentication context to prevent hydration mismatches and ensure
 * consistent authentication state across server and client.
 *
 * @param {Object} props - Component props
 * @param {User | null} props.user - User data from SSR
 * @returns {null} - This component renders nothing
 */
interface AuthInitializerProps {
  user: User | null
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ user }) => {
  const { initializeFromSSR, isAuthenticated, user: contextUser } = useAuth()

  // Initialize from SSR on mount
  useEffect(() => {
    console.log('🚀 AuthInitializer: Syncing SSR user data')
    initializeFromSSR(user)
  }, [user, initializeFromSSR])

  // Monitor auth context changes and keep local state in sync
  useEffect(() => {
    if (contextUser !== user) {
      console.log(
        '🔄 AuthInitializer: Auth context changed, user updated:',
        contextUser ? `${contextUser.email}` : 'No user',
      )
      // The context user has changed (due to login/logout), the Header components
      // that use useAuth will automatically re-render with the new data
    }
  }, [contextUser, user, isAuthenticated])

  // This component doesn't render anything, it just initializes the auth state
  return null
}
