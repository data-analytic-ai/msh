/**
 * User Details Me API
 *
 * Endpoint cliente para obtener información del usuario actual autenticado.
 * Utiliza cookies para obtener el token JWT y consultar la información del usuario.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    // Get payload instance
    const payload = await getPayload({ config })

    // Obtener el token de la cookie (await required)
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No authentication token found' }, { status: 401 })
    }

    // Buscar usuario por token de sesión activa
    try {
      // Usar el endpoint nativo de Payload para verificar autenticación
      const authResult = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!authResult.ok) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
      }

      const userData = await authResult.json()

      // Devolver solo información necesaria
      return NextResponse.json({
        user: {
          id: userData.user?.id,
          email: userData.user?.email,
          firstName: userData.user?.firstName,
          lastName: userData.user?.lastName,
          role: userData.user?.role,
        },
        token,
      })
    } catch (tokenError) {
      return NextResponse.json({ error: 'Failed to verify token' }, { status: 401 })
    }
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 })
  }
}
