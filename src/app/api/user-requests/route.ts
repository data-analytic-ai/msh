/**
 * User Requests API Endpoint
 *
 * Retrieves service requests associated with a user's email address.
 * Used to recover state after page refresh or when returning to the application.
 */

import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config })

    // Find user by email first to check if they exist
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    let userId = null
    let userToken = null
    let isNewUser = false
    let tempPassword = null

    // If user doesn't exist, create one automatically
    if (users.docs.length === 0) {
      // First, find the most recent service request for this email to get user details
      const serviceRequests = await payload.find({
        collection: 'service-requests',
        where: {
          'customerInfo.email': {
            equals: email,
          },
        },
        sort: '-createdAt',
        limit: 1,
      })

      const customerInfo = serviceRequests.docs[0]?.customerInfo || null

      // Generate a random password that will be replaced on first login
      tempPassword = Math.random().toString(36).slice(-8)

      try {
        // Create a new user with customer data from the service request
        const newUser = await payload.create({
          collection: 'users',
          data: {
            email,
            password: tempPassword,
            role: 'client',
            name: customerInfo?.fullName?.split(' ')[0] || 'Temporary',
            lastName: customerInfo?.fullName?.split(' ').slice(1).join(' ') || 'User',
            phoneNumber: customerInfo?.phone || '0000000000',
          },
        })

        userId = newUser.id
        isNewUser = true

        // Login automatically to create a session
        const loginResult = await payload.login({
          collection: 'users',
          data: {
            email,
            password: tempPassword,
          },
        })

        userToken = loginResult.token

        // Update service requests to link to this user
        if (serviceRequests.docs.length > 0) {
          await Promise.all(
            serviceRequests.docs.map((request) =>
              payload.update({
                collection: 'service-requests',
                id: request.id,
                data: {
                  customer: newUser.id,
                },
              }),
            ),
          )
        }
      } catch (userError) {
        console.error('Error creating user:', userError)
      }
    } else {
      userId = users.docs[0]?.id || null

      // Login the existing user
      try {
        // Note: We can't auto-login here without knowing password
        // In a real app, you'd implement a passwordless login or token-based auth
        // For now just return the user ID
      } catch (loginError) {
        console.error('Error logging in:', loginError)
      }
    }

    // Find the service requests for this email
    const serviceRequests = await payload.find({
      collection: 'service-requests',
      where: {
        'customerInfo.email': {
          equals: email,
        },
      },
      sort: '-createdAt', // Most recent first
      limit: 5,
    })

    return NextResponse.json({
      success: true,
      requests: serviceRequests.docs || [],
      userId,
      userToken, // Return the token for client-side authentication
      isNewUser, // Indicar si es un usuario nuevo
      tempPassword: isNewUser ? tempPassword : null, // Devolver la contraseña temporal solo si es un usuario nuevo
    })
  } catch (error) {
    console.error('Error fetching user requests:', error)
    return NextResponse.json({ error: 'Failed to fetch service requests' }, { status: 500 })
  }
}
