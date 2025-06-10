/**
 * User Requests API Endpoint
 *
 * Retrieves service requests associated with a user's email address.
 * Used to recover state after page refresh or when returning to the application.
 */

import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import config from '@payload-config'
import { generateRandomPassword } from '@/utilities/passwordUtils'

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
    let user = null

    // If user doesn't exist, create one automatically
    if (users.docs.length === 0) {
      console.log('Usuario no encontrado, creando uno nuevo:', email)

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
      tempPassword = generateRandomPassword(10)
      console.log(`Contraseña temporal generada para ${email}: ${tempPassword}`)

      try {
        // Ensure we have valid firstName and lastName
        const emailName = email.split('@')[0] || 'User'
        const firstName = customerInfo?.firstName?.trim() || emailName || 'User'
        const lastName = customerInfo?.lastName?.trim() || 'Customer'

        // Create a new user with customer data from the service request
        const newUser = await payload.create({
          collection: 'users',
          data: {
            email,
            password: tempPassword || 'TemporaryPassword123!',
            role: 'client',
            firstName,
            lastName,
            phone: customerInfo?.phone || '',
          },
        })

        userId = newUser.id
        user = newUser
        isNewUser = true

        // Login automatically to create a session
        try {
          const loginResult = await payload.login({
            collection: 'users',
            data: {
              email,
              password: tempPassword,
            },
          })

          userToken = loginResult.token

          console.log('Usuario autenticado correctamente:', email)
        } catch (loginError) {
          console.error('Error en autenticación después de crear usuario:', loginError)
        }

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
          console.log(
            `${serviceRequests.docs.length} solicitudes actualizadas para el usuario:`,
            email,
          )
        }
      } catch (userError) {
        console.error('Error creating user:', userError)
        return NextResponse.json(
          { error: 'Failed to create user', details: userError },
          { status: 500 },
        )
      }
    } else {
      // Usuario existente
      user = users.docs[0] || null
      userId = user?.id || null
      console.log('Usuario encontrado:', email, userId)

      // No podemos hacer login automático sin conocer la contraseña
      // Solo devolvemos los datos del usuario
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
      user: {
        email,
        id: userId,
        // No incluir datos sensibles aquí
      },
    })
  } catch (error) {
    console.error('Error fetching user requests:', error)
    return NextResponse.json({ error: 'Failed to fetch service requests' }, { status: 500 })
  }
}

/**
 * Creates or updates a service request
 *
 * This endpoint creates new service requests and links them to users if they exist.
 * If a request ID is provided, it updates the existing request instead.
 *
 * NOTA: Esta ruta está deprecada y solo se mantiene por compatibilidad.
 * Se recomienda usar la API nativa de PayloadCMS en /api/service-requests
 *
 * @param request - The incoming request with service request data
 * @returns Response with the created or updated service request data
 */
export async function POST(request: Request) {
  try {
    const requestData = await request.json()

    // Transformar los datos para que coincidan con el esquema esperado por PayloadCMS
    const transformedData = {
      ...requestData,
      location: {
        formattedAddress: requestData.location.formattedAddress,
        coordinates: {
          lat: requestData.location.latitude || 0,
          lng: requestData.location.longitude || 0,
        },
      },
    }

    // Eliminar propiedades que no existen en el schema
    if (transformedData.location) {
      delete transformedData.location.latitude
      delete transformedData.location.longitude
    }

    // Log para diagnóstico
    console.log('Redirecting to PayloadCMS API with data:', transformedData)

    // Hacer solicitud a PayloadCMS directamente
    const payload = await getPayload({ config })

    let doc = null

    // Si hay ID, actualizar; de lo contrario, crear
    if (requestData.id) {
      try {
        doc = await payload.update({
          collection: 'service-requests',
          id: requestData.id,
          data: transformedData,
        })
      } catch (updateError) {
        console.error('Error updating service request:', updateError)
        return NextResponse.json({ error: 'Failed to update service request' }, { status: 500 })
      }
    } else {
      try {
        doc = await payload.create({
          collection: 'service-requests',
          data: transformedData,
        })
      } catch (createError) {
        console.error('Error creating service request:', createError)
        return NextResponse.json({ error: 'Failed to create service request' }, { status: 500 })
      }
    }

    let user = null
    const token = null

    // Buscar usuario por correo electrónico si está presente
    if (requestData.customerInfo?.email) {
      const users = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: requestData.customerInfo.email,
          },
        },
        limit: 1,
      })

      if (users.docs.length > 0) {
        user = users.docs[0]
      }
    }

    return NextResponse.json({
      success: true,
      doc,
      user,
      token,
    })
  } catch (error) {
    console.error('Error processing service request:', error)
    return NextResponse.json({ error: 'Failed to process service request' }, { status: 500 })
  }
}
