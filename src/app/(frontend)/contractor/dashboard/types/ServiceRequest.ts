/**
 * ServiceRequest type
 *
 * Defines the structure of a service request object as returned by the API.
 */
export interface ServiceRequest {
  id: string
  requestId: string
  requestTitle: string
  serviceType: string[]
  description: string
  status: 'pending' | 'assigned' | 'accepted' | 'in-progress' | 'completed' | 'cancelled'
  urgencyLevel: string
  assignedContractor?: string | null
  customerInfo: {
    firstName: string
    lastName: string
    phone: string
    email: string
  }
  preferredDateTime?: string
  location: {
    formattedAddress: string
  }
  createdAt: string
  quotes?: Array<{
    contractor: string
    amount: number
    description: string
    status: string
  }>
}
