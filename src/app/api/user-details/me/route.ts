/**
 * User Details Me API
 *
 * Endpoint cliente para obtener información del usuario actual autenticado.
 * Utiliza cookies para obtener el token JWT y consultar la información del usuario.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import payload from 'payload'

export async function GET() {
  try {
    // Obtener el token de la cookie
    const cookieStore = cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No authentication token found' }, { status: 401 })
    }

    // Obtener información del usuario usando el token
    const userResponse = await payload.find({
      collection: 'users',
      token,
      depth: 0,
    })

    if (!userResponse) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Devolver solo información necesaria para evitar filtrar datos sensibles
    return NextResponse.json({
      user: {
        id: userResponse.id,
        email: userResponse.email,
        name: userResponse.name,
        role: userResponse.role,
      },
      token,
    })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 })
  }
}
