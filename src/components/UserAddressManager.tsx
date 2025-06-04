/**
 * UserAddressManager - Address management component for authenticated users
 *
 * Allows users to view, add, edit, and manage multiple addresses.
 * Integrates with the location selection flow and provides options
 * to use existing addresses or add new ones.
 *
 * @param {UserAddressManagerProps} props - Component props
 * @returns {JSX.Element} - Address management component
 */
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Plus, Trash2, Star, Edit3, Check, X } from 'lucide-react'
import { useUserProfile, type UserAddress } from '@/hooks/useUserProfile'
import { useServiceRequest } from '@/hooks/useServiceRequest'

export interface UserAddressManagerProps {
  onAddressSelect?: (address: UserAddress) => void
  onAddNewAddress?: () => void
  showActions?: boolean
  compact?: boolean
  className?: string
}

export const UserAddressManager: React.FC<UserAddressManagerProps> = ({
  onAddressSelect,
  onAddNewAddress,
  showActions = true,
  compact = false,
  className = '',
}) => {
  const { profileData, isLoading, error, removeAddress, setDefaultAddress } = useUserProfile()

  const { location, formattedAddress, setLocation, setFormattedAddress } = useServiceRequest()

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    profileData?.defaultAddress?.id || null,
  )

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="text-sm text-muted-foreground">Loading addresses...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-sm text-red-600 dark:text-red-400">
            Error loading addresses: {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profileData || profileData.addresses.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <p className="text-sm font-medium">No saved addresses</p>
              <p className="text-xs text-muted-foreground">
                Add an address to save it for future use
              </p>
            </div>
            {showActions && onAddNewAddress && (
              <Button variant="outline" size="sm" onClick={onAddNewAddress} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleSelectAddress = (address: UserAddress) => {
    setSelectedAddressId(address.id)

    // Update service request context with selected address
    setLocation(address.coordinates)
    setFormattedAddress(address.formattedAddress)

    // Call callback if provided
    onAddressSelect?.(address)
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId)
    } catch (error) {
      console.error('Error setting default address:', error)
    }
  }

  const handleRemoveAddress = async (addressId: string) => {
    if (window.confirm('Are you sure you want to remove this address?')) {
      try {
        await removeAddress(addressId)

        // If this was the selected address, clear the selection
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null)
        }
      } catch (error) {
        console.error('Error removing address:', error)
      }
    }
  }

  return (
    <Card className={className}>
      {!compact && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Saved Addresses
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="space-y-3">
          {profileData.addresses.map((address) => {
            const isSelected = selectedAddressId === address.id
            const isCurrentLocation =
              location &&
              address.coordinates.lat === location.lat &&
              address.coordinates.lng === location.lng

            return (
              <div
                key={address.id}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all
                  ${
                    isSelected
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }
                  ${isCurrentLocation ? 'ring-2 ring-primary/20' : ''}
                `}
                onClick={() => handleSelectAddress(address)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{address.label}</span>
                      {address.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      {isCurrentLocation && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {address.formattedAddress}
                    </p>
                  </div>

                  {showActions && (
                    <div className="flex items-center gap-1 ml-2">
                      {isSelected && (
                        <div className="text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                      )}

                      {!address.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSetDefault(address.id)
                          }}
                          className="h-8 w-8 p-0"
                          title="Set as default"
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveAddress(address.id)
                        }}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        title="Remove address"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {showActions && onAddNewAddress && (
            <Button variant="outline" onClick={onAddNewAddress} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
