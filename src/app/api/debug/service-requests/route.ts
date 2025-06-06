/**
 * API de debugging para ver las solicitudes de servicio
 *
 * Solo para desarrollo - permite inspeccionar el estado del almacén en memoria
 */

import { NextRequest, NextResponse } from 'next/server'
import { ServiceRequestsStore } from '@/lib/service-requests-store'

export async function GET(request: NextRequest) {
  try {
    const allRequests = ServiceRequestsStore.getAll()
    const count = ServiceRequestsStore.count()

    return NextResponse.json({
      count,
      requests: allRequests,
      message: `Se encontraron ${count} solicitudes de servicio en memoria`,
    })
  } catch (error: any) {
    console.error('Error al obtener solicitudes de servicio:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener solicitudes' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    ServiceRequestsStore.clear()

    return NextResponse.json({
      message: 'Todas las solicitudes de servicio han sido eliminadas',
    })
  } catch (error: any) {
    console.error('Error al limpiar solicitudes de servicio:', error)
    return NextResponse.json(
      { error: error.message || 'Error al limpiar solicitudes' },
      { status: 500 },
    )
  }
}
