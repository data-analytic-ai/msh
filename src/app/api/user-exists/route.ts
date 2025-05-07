/**
 * User Exists API Route
 *
 * Esta API verifica si un usuario existe en la base de datos basado en su email.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    // Obtener el email de la consulta
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    // Verificar que el email exista
    if (!email) {
      return NextResponse.json({ message: 'Email is required', exists: false }, { status: 400 })
    }

    // Inicializar Payload correctamente
    const payload = await getPayload({ config })

    // Buscar usuario por email
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    // Verificar si el usuario existe
    const exists = users.totalDocs > 0

    return NextResponse.json({ exists })
  } catch (error) {
    console.error('Error checking if user exists:', error)
    return NextResponse.json(
      { message: 'Error checking if user exists', exists: false },
      { status: 500 },
    )
  }
}
