/**
 * Contractor Interface
 *
 * Defines the structure for contractor data throughout the application
 */

export interface Contractor {
  id: string
  name: string
  description: string
  contactEmail: string
  contactPhone: string
  website?: string
  address: string
  location: {
    lat: number
    lng: number
  }
  servicesOffered: string[]
  yearsExperience: number
  rating: number
  reviewCount: number
  profileImage?: string
  coverImage?: string
  specialties?: string[]
  certifications?: string[]
  workingHours?: {
    monday?: string
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
  }
  socialMedia?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  verified: boolean
}
