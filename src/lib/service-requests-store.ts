/**
 * Service Requests Store
 *
 * Almacenamiento temporal en memoria para las solicitudes de servicio.
 * En producción, esto debería ser reemplazado por una base de datos real.
 */

export interface ServiceRequest {
  id: string
  contractorId: string
  customerId: string
  amount: number
  paymentStatus: 'pending' | 'captured' | 'failed'
  paymentIntentId?: string
  status: 'created' | 'confirmed' | 'in_progress' | 'completed'
  createdAt: Date
  updatedAt?: Date
}

// Almacenamiento global en memoria
const serviceRequests = new Map<string, ServiceRequest>()

export class ServiceRequestsStore {
  /**
   * Crear una nueva solicitud de servicio
   */
  static create(data: Omit<ServiceRequest, 'createdAt'>): ServiceRequest {
    const serviceRequest: ServiceRequest = {
      ...data,
      createdAt: new Date(),
    }

    serviceRequests.set(data.id, serviceRequest)
    console.log(`✅ Solicitud de servicio creada: ${data.id}`)

    return serviceRequest
  }

  /**
   * Obtener una solicitud de servicio por ID
   */
  static get(id: string): ServiceRequest | undefined {
    return serviceRequests.get(id)
  }

  /**
   * Actualizar una solicitud de servicio
   */
  static update(
    id: string,
    updates: Partial<Omit<ServiceRequest, 'id' | 'createdAt'>>,
  ): ServiceRequest | null {
    const existing = serviceRequests.get(id)

    if (!existing) {
      console.log(`❌ Solicitud de servicio no encontrada para actualizar: ${id}`)
      return null
    }

    const updated: ServiceRequest = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    }

    serviceRequests.set(id, updated)
    console.log(`📝 Solicitud de servicio actualizada: ${id}`, updates)

    return updated
  }

  /**
   * Eliminar una solicitud de servicio
   */
  static delete(id: string): boolean {
    const deleted = serviceRequests.delete(id)
    if (deleted) {
      console.log(`🗑️ Solicitud de servicio eliminada: ${id}`)
    }
    return deleted
  }

  /**
   * Obtener todas las solicitudes de servicio
   */
  static getAll(): ServiceRequest[] {
    return Array.from(serviceRequests.values())
  }

  /**
   * Obtener todas las solicitudes como entradas [id, solicitud]
   */
  static getAllEntries(): [string, ServiceRequest][] {
    return Array.from(serviceRequests.entries())
  }

  /**
   * Obtener el número total de solicitudes
   */
  static count(): number {
    return serviceRequests.size
  }

  /**
   * Limpiar todas las solicitudes (útil para testing)
   */
  static clear(): void {
    serviceRequests.clear()
    console.log('🧹 Todas las solicitudes de servicio han sido eliminadas')
  }

  /**
   * Obtener solicitudes por estado
   */
  static getByStatus(status: ServiceRequest['status']): ServiceRequest[] {
    return Array.from(serviceRequests.values()).filter((req) => req.status === status)
  }

  /**
   * Obtener solicitudes por estado de pago
   */
  static getByPaymentStatus(paymentStatus: ServiceRequest['paymentStatus']): ServiceRequest[] {
    return Array.from(serviceRequests.values()).filter((req) => req.paymentStatus === paymentStatus)
  }
}
