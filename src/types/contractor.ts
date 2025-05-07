/**
 * Contractor Types
 *
 * Types related to contractors and services in the Multi-Service Hub platform
 */

import { ServiceType } from '@/hooks/useServiceRequest'

// Type for a service offered by a contractor
export interface Service {
  id: string
  value?: string
  slug?: string
  name?: string
}

// Base contractor information from PayloadCMS
export interface Contractor {
  id: string
  name: string
  description: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  address: string
  location: {
    lat: number
    lng: number
  }
  servicesOffered: Service[] | string[]
  yearsExperience?: number
  rating: number
  reviewCount: number
  profileImage?: {
    id: string
    url: string
  }
  coverImage?: {
    id: string
    url: string
  }
  specialties?: string[]
  workingHours?: {
    monday?: string
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
  }
  verified: boolean
}

// Extended contractor information for UI with distance
export interface ContractorWithDistance extends Contractor {
  distance?: number
  responseTime?: string
}

// Type for selected contractor in context
export interface SelectedContractor {
  id: string
  name: string
  services: ServiceType[] | string[]
  phoneNumber?: string
  rating: number
}
