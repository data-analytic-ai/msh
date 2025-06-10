/**
 * ServiceRequestSummary - Service request summary display and editing component
 *
 * A specialized component that displays and allows editing of service request
 * context information including selected services and location. Only visible
 * for authenticated users and integrates with the service request flow.
 *
 * @param {ServiceRequestSummaryProps} props - Component configuration
 * @returns {JSX.Element} - Rendered service request summary
 */
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Info, Edit3, Check, X, MapPin, Star } from 'lucide-react'
import { useServiceRequest } from '@/hooks/useServiceRequest'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useAuth } from '@/providers/AuthProvider'

export interface ServiceRequestSummaryProps {
  className?: string
  showEditActions?: boolean
  compact?: boolean
}

export const ServiceRequestSummary: React.FC<ServiceRequestSummaryProps> = ({
  className = '',
  showEditActions = true,
  compact = false,
}) => {
  const {
    selectedServices,
    formattedAddress,
    setSelectedServices,
    setLocation,
    setFormattedAddress,
  } = useServiceRequest()

  const { isAuthenticated } = useAuth()
  const { profileData } = useUserProfile()

  // State for editing mode
  const [isEditingServices, setIsEditingServices] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [tempSelectedServices, setTempSelectedServices] = useState<any[]>([])

  // Don't render for non-authenticated users
  if (!isAuthenticated) {
    return null
  }

  // Handle editing services
  const handleStartEditServices = () => {
    setTempSelectedServices([...selectedServices])
    setIsEditingServices(true)
  }

  const handleSaveServices = () => {
    setSelectedServices(tempSelectedServices)
    setIsEditingServices(false)
  }

  const handleCancelServicesEdit = () => {
    setTempSelectedServices([])
    setIsEditingServices(false)
  }

  // Handle address selection from saved addresses
  const handleSelectAddress = (address: any) => {
    setLocation(address.coordinates)
    setFormattedAddress(address.formattedAddress)
    setIsEditingAddress(false)
  }

  return (
    <div
      className={`mb-6 p-4 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-lg ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${compact ? 'text-base' : 'text-lg'}`}>
          Service Request Summary
        </h3>
        {showEditActions && (
          <Badge variant="secondary" className="text-xs">
            <Info className="h-3 w-3 mr-1" />
            Editable
          </Badge>
        )}
      </div>

      {/* Services Section */}
      <div className="mb-4 p-3 bg-background/50 rounded-md border">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm text-muted-foreground">Selected Services</h4>
          {showEditActions && !isEditingServices ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEditServices}
              className="h-8 px-2 text-xs"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          ) : showEditActions && isEditingServices ? (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveServices}
                className="h-8 px-2 text-xs text-green-600 hover:text-green-700"
              >
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelServicesEdit}
                className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          ) : null}
        </div>

        {!isEditingServices ? (
          <div className="flex flex-wrap gap-2">
            {selectedServices && selectedServices.length > 0 ? (
              selectedServices.map((service, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {typeof service === 'object' ? service.id : service}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No services selected</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Note: Service editing functionality would be implemented with a service selector
              component
            </p>
            <div className="flex flex-wrap gap-2">
              {tempSelectedServices.map((service, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {typeof service === 'object' ? service.id : service}
                  <button
                    onClick={() =>
                      setTempSelectedServices(tempSelectedServices.filter((_, i) => i !== index))
                    }
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Address Section */}
      <div className="p-3 bg-background/50 rounded-md border">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm text-muted-foreground">Service Location</h4>
          {showEditActions && !isEditingAddress ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingAddress(true)}
              className="h-8 px-2 text-xs"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          ) : showEditActions && isEditingAddress ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingAddress(false)}
              className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3 mr-1" />
              Close
            </Button>
          ) : null}
        </div>

        {!isEditingAddress ? (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm">{formattedAddress || 'Loading address...'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span>Choose from saved addresses:</span>
            </div>

            {profileData && profileData.addresses.length > 0 ? (
              <div className="max-h-32 overflow-y-auto space-y-2">
                {profileData.addresses.map((address) => (
                  <button
                    key={address.id}
                    onClick={() => handleSelectAddress(address)}
                    className="w-full p-2 text-left text-sm bg-background hover:bg-muted rounded border transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {address.isDefault && (
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      )}
                      <span className="font-medium text-xs text-muted-foreground">
                        {address.label}
                      </span>
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground truncate">
                      {address.formattedAddress}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No saved addresses found</p>
                <p className="text-xs text-muted-foreground">
                  Your current location will be used and saved after submitting
                </p>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Current: {formattedAddress || 'Loading...'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
