import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import type { User } from '../payload-types'
import { getClientSideURL } from './getURL'

export const getMeUser = async (args?: {
  nullUserRedirect?: string
  validUserRedirect?: string
}): Promise<{
  user: User | null
}> => {
  const { nullUserRedirect, validUserRedirect } = args || {}

  const meUserReq = await fetch(`${getClientSideURL()}/api/users/me`, {
    credentials: 'include', // Use cookies for authentication
  })

  const {
    user,
  }: {
    user: User
  } = await meUserReq.json()

  if (validUserRedirect && meUserReq.ok && user) {
    redirect(validUserRedirect)
  }

  if (nullUserRedirect && (!meUserReq.ok || !user)) {
    redirect(nullUserRedirect)
  }

  return {
    user,
  }
}
