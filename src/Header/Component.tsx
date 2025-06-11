import { getMeUser } from '@/utilities/getMeUser'
import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { HeaderClient } from './Component.client'
import { AuthInitializer } from './AuthInitializer'

/**
 * Header - Main header component with SSR support
 *
 * Server-side rendered header component that fetches user data
 * and initializes the client-side authentication context.
 *
 * @param {HeaderType} data - Header configuration data from CMS
 * @returns {JSX.Element} - The rendered header component
 */
interface HeaderProps {
  data: HeaderType
}

export const Header: React.FC<HeaderProps> = async ({ data }) => {
  // Fetch user data on server-side
  const { user } = await getMeUser()

  return (
    <>
      {/* Initialize auth context with SSR data */}
      <AuthInitializer user={user} />
      {/* Render client component */}
      <HeaderClient data={data} />
    </>
  )
}
