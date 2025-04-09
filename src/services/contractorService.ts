/**
 * ContractorService - Service for handling operations related to contractors
 *
 * This service provides methods to fetch, filter and manage contractor data
 * from the Contractors collection.
 */

import { Contractor } from '@/types/contractor'

/**
 * Fetch contractors that match specific services and are near a given location
 *
 * @param {string[]} services - Array of service IDs to filter by
 * @param {object} location - User's location coordinates
 * @param {number} location.lat - Latitude
 * @param {number} location.lng - Longitude
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Contractor[]>} Array of contractors sorted by distance
 */
export async function fetchNearbyContractors(
  services: string[],
  location: { lat: number; lng: number },
  limit: number = 5,
): Promise<Contractor[]> {
  try {
    // Create search parameters for API call
    const searchParams = new URLSearchParams({
      services: JSON.stringify(services),
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      limit: limit.toString(),
    })

    const response = await fetch(`/api/contractors?${searchParams.toString()}`)
    if (!response.ok) {
      throw new Error('Failed to fetch contractors')
    }

    const data = await response.json()
    return data.contractors
  } catch (error) {
    console.error('Error fetching contractors:', error)
    return []
  }
}

/**
 * Get a contractor by ID
 *
 * @param {string} id - Contractor ID
 * @returns {Promise<Contractor|null>} Contractor data or null if not found
 */
export async function getContractorById(id: string): Promise<Contractor | null> {
  try {
    const response = await fetch(`/api/contractors/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch contractor')
    }

    const data = await response.json()
    return data.contractor
  } catch (error) {
    console.error('Error fetching contractor:', error)
    return null
  }
}
