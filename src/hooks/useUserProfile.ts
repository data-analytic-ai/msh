/**
 * useUserProfile - User profile management hook
 *
 * Manages user profile data, auto-population from last service request,
 * and multiple addresses functionality. This hook should only execute once
 * per user session to populate their profile data automatically.
 *
 * @returns {Object} - User profile management state and methods
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useServiceRequest } from '@/hooks/useServiceRequest'

export interface UserAddress {
  id: string
  label: string
  formattedAddress: string
  coordinates: {
    lat: number
    lng: number
  }
  isDefault: boolean
}

export interface UserProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  addresses: UserAddress[]
  defaultAddress?: UserAddress
  hasBeenAutoPopulated: boolean
}

interface UseUserProfileReturn {
  profileData: UserProfileData | null
  isLoading: boolean
  error: string | null
  hasBeenAutoPopulated: boolean
  updateProfile: (data: Partial<UserProfileData>) => Promise<boolean>
  addAddress: (address: Omit<UserAddress, 'id'>) => Promise<boolean>
  removeAddress: (addressId: string) => Promise<boolean>
  setDefaultAddress: (addressId: string) => Promise<boolean>
  autoPopulateFromLastRequest: () => Promise<boolean>
  getFormInitialValues: () => Record<string, any>
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { user, isAuthenticated } = useAuth()
  const { location, formattedAddress } = useServiceRequest()

  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasBeenAutoPopulated, setHasBeenAutoPopulated] = useState(false)

  // Check if user profile has been auto-populated in this session
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.email) {
      const sessionKey = `msh_profile_populated_${user.email}`
      const wasPopulated = sessionStorage.getItem(sessionKey) === 'true'
      setHasBeenAutoPopulated(wasPopulated)
    }
  }, [user?.email])

  // Load user profile data when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !profileData) {
      loadUserProfile()
    }
  }, [isAuthenticated, user])

  /**
   * Load user profile data from the server
   */
  const loadUserProfile = useCallback(async () => {
    if (!user?.email) return

    setIsLoading(true)
    setError(null)

    try {
      // First, get user details from the users collection
      const userResponse = await fetch(`/api/user-details?email=${encodeURIComponent(user.email)}`)

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user details')
      }

      const userData = await userResponse.json()

      // Get user's service requests to extract addresses
      const requestsResponse = await fetch(
        `/api/user-requests?email=${encodeURIComponent(user.email)}`,
      )

      if (!requestsResponse.ok) {
        throw new Error('Failed to fetch user requests')
      }

      const requestsData = await requestsResponse.json()

      // Extract unique addresses from service requests
      const addresses: UserAddress[] = []
      const addressMap = new Map<string, UserAddress>()

      if (requestsData.requests && requestsData.requests.length > 0) {
        requestsData.requests.forEach((request: any, index: number) => {
          if (request.location?.formattedAddress) {
            const addressKey = request.location.formattedAddress
            if (!addressMap.has(addressKey)) {
              addressMap.set(addressKey, {
                id: `addr_${index}_${Date.now()}`,
                label: index === 0 ? 'Primary Address' : `Address ${index + 1}`,
                formattedAddress: request.location.formattedAddress,
                coordinates: request.location.coordinates || { lat: 0, lng: 0 },
                isDefault: index === 0, // First address is default
              })
            }
          }
        })
      }

      // Add current location if it exists and is not already in addresses
      if (location && formattedAddress && !addressMap.has(formattedAddress)) {
        addressMap.set(formattedAddress, {
          id: `current_${Date.now()}`,
          label: 'Current Location',
          formattedAddress,
          coordinates: location,
          isDefault: addressMap.size === 0,
        })
      }

      addresses.push(...addressMap.values())

      const profile: UserProfileData = {
        firstName: userData.user?.name || '',
        lastName: userData.user?.lastName || '',
        email: userData.user?.email || user.email,
        phone: userData.user?.phoneNumber || '',
        addresses,
        defaultAddress: addresses.find((addr) => addr.isDefault),
        hasBeenAutoPopulated: false, // Will be set when auto-population happens
      }

      setProfileData(profile)

      // Auto-populate if not done before
      if (!hasBeenAutoPopulated && addresses.length > 0) {
        await autoPopulateFromLastRequest()
      }
    } catch (err) {
      console.error('Error loading user profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }, [user?.email, location, formattedAddress, hasBeenAutoPopulated])

  /**
   * Auto-populate profile from the user's last service request
   * This should only happen once per user session
   */
  const autoPopulateFromLastRequest = useCallback(async (): Promise<boolean> => {
    if (!user?.email || hasBeenAutoPopulated) {
      return false
    }

    try {
      const response = await fetch(`/api/user-requests?email=${encodeURIComponent(user.email)}`)

      if (!response.ok) {
        return false
      }

      const data = await response.json()

      if (data.requests && data.requests.length > 0) {
        const lastRequest = data.requests[0] // Most recent request

        if (lastRequest.customerInfo) {
          // Mark as auto-populated in session storage
          const sessionKey = `msh_profile_populated_${user.email}`
          sessionStorage.setItem(sessionKey, 'true')
          setHasBeenAutoPopulated(true)

          // Update profile data with auto-populated flag
          setProfileData((prev) =>
            prev
              ? {
                  ...prev,
                  hasBeenAutoPopulated: true,
                }
              : null,
          )

          console.log('Profile auto-populated from last request:', lastRequest.customerInfo)
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Error auto-populating profile:', error)
      return false
    }
  }, [user?.email, hasBeenAutoPopulated])

  /**
   * Update user profile data
   */
  const updateProfile = useCallback(
    async (data: Partial<UserProfileData>): Promise<boolean> => {
      if (!user?.id) return false

      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phone,
          }),
        })

        if (response.ok) {
          setProfileData((prev) => (prev ? { ...prev, ...data } : null))
          return true
        }

        return false
      } catch (error) {
        console.error('Error updating profile:', error)
        return false
      }
    },
    [user?.id],
  )

  /**
   * Add a new address to user's address list
   */
  const addAddress = useCallback(
    async (address: Omit<UserAddress, 'id'>): Promise<boolean> => {
      if (!profileData) return false

      const newAddress: UserAddress = {
        ...address,
        id: `addr_${Date.now()}`,
      }

      // If this is the first address, make it default
      if (profileData.addresses.length === 0) {
        newAddress.isDefault = true
      }

      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              addresses: [...prev.addresses, newAddress],
              defaultAddress: newAddress.isDefault ? newAddress : prev.defaultAddress,
            }
          : null,
      )

      return true
    },
    [profileData],
  )

  /**
   * Remove an address from user's address list
   */
  const removeAddress = useCallback(
    async (addressId: string): Promise<boolean> => {
      if (!profileData) return false

      const addressToRemove = profileData.addresses.find((addr) => addr.id === addressId)
      const updatedAddresses = profileData.addresses.filter((addr) => addr.id !== addressId)

      // If removing the default address, set the first remaining address as default
      let newDefaultAddress = profileData.defaultAddress
      if (addressToRemove?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0]!.isDefault = true
        newDefaultAddress = updatedAddresses[0]
      } else if (addressToRemove?.isDefault) {
        newDefaultAddress = undefined
      }

      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              addresses: updatedAddresses,
              defaultAddress: newDefaultAddress,
            }
          : null,
      )

      return true
    },
    [profileData],
  )

  /**
   * Set an address as the default address
   */
  const setDefaultAddress = useCallback(
    async (addressId: string): Promise<boolean> => {
      if (!profileData) return false

      const updatedAddresses = profileData.addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }))

      const newDefaultAddress = updatedAddresses.find((addr) => addr.id === addressId)

      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              addresses: updatedAddresses,
              defaultAddress: newDefaultAddress,
            }
          : null,
      )

      return true
    },
    [profileData],
  )

  /**
   * Get initial values for form fields based on profile data
   */
  const getFormInitialValues = useCallback((): Record<string, any> => {
    // Return empty object if no profile data exists
    if (!profileData) {
      return {}
    }

    // Build full name from firstName and lastName
    const fullName = [profileData?.firstName, profileData?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim()

    const initialValues = {
      // Standard field names
      fullName: fullName,
      firstName: profileData?.firstName || '',
      lastName: profileData?.lastName || '',
      email: profileData?.email || '',
      phone: profileData?.phone || '',

      // Alternative field name variations commonly used in PayloadCMS forms
      phoneNumberClient: profileData?.phone || '',
      phoneNumber: profileData?.phone || '',
      name: fullName, // Sometimes forms use just 'name'
      emailAddress: profileData?.email || '',
      customerEmail: profileData?.email || '',

      // Address-related fields if we have a default address
      ...(profileData.defaultAddress && {
        address: profileData.defaultAddress.formattedAddress,
        location: profileData.defaultAddress.formattedAddress,
        serviceAddress: profileData.defaultAddress.formattedAddress,
      }),
    }

    // Only log when we have meaningful data to return
    if (Object.values(initialValues).some((val) => val && val.toString().trim())) {
      console.log('getFormInitialValues: Generated values for form auto-population:', initialValues)
    }

    return initialValues
  }, [profileData, hasBeenAutoPopulated])

  return {
    profileData,
    isLoading,
    error,
    hasBeenAutoPopulated,
    updateProfile,
    addAddress,
    removeAddress,
    setDefaultAddress,
    autoPopulateFromLastRequest,
    getFormInitialValues,
  }
}
