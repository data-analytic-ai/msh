import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type {
  FieldErrorsImpl,
  FieldValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { MapPin, Navigation } from 'lucide-react'

import { Error } from '../Error'
import { Width } from '../Width'

/**
 * Location - Address input field with geolocation support
 *
 * A specialized location input that allows users to enter addresses manually
 * or use their current location. Formats and validates addresses for
 * service request purposes.
 *
 * @param {TextField & FormProps} props - Field configuration and form methods
 * @returns {JSX.Element} - Rendered location input field
 */
export const Location: React.FC<
  TextField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: any
      }>
    >
    register: UseFormRegister<FieldValues>
    setValue?: UseFormSetValue<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width, setValue }) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [currentAddress, setCurrentAddress] = useState(defaultValue || '')

  const getCurrentLocation = async () => {
    setIsGettingLocation(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // Reverse geocoding using a free service (you might want to use Google Maps API)
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || 'demo'}`,
          )

          if (response.ok) {
            const data = await response.json()
            if (data.results && data.results.length > 0) {
              const formattedAddress = data.results[0].formatted
              setCurrentAddress(formattedAddress)
              if (setValue) {
                setValue(name, formattedAddress)
              }
            }
          } else {
            // Fallback: create a basic address from coordinates
            const basicAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            setCurrentAddress(basicAddress)
            if (setValue) {
              setValue(name, basicAddress)
            }
          }
        } catch (error) {
          console.error('Error getting address:', error)
          setLocationError('Unable to get address from location')
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setLocationError('Unable to get your location. Please enter address manually.')
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAddress(e.target.value)
    setLocationError(null)
  }

  return (
    <Width width={width}>
      <Label htmlFor={name}>
        {label}
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </Label>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            id={name}
            type="text"
            value={currentAddress}
            placeholder="Enter your address or use current location"
            className="flex-1"
            {...register(name, {
              required: required ? 'Location is required' : false,
              onChange: handleAddressChange,
              minLength: {
                value: 10,
                message: 'Please enter a complete address',
              },
            })}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="shrink-0"
            title="Use current location"
          >
            {isGettingLocation ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
          </Button>
        </div>

        {currentAddress && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{currentAddress}</span>
          </div>
        )}

        {locationError && <div className="text-sm text-destructive">{locationError}</div>}
      </div>

      {errors[name] && <Error />}
    </Width>
  )
}
