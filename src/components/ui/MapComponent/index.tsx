'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react'
import { GoogleMap, useLoadScript, Marker, Libraries } from '@react-google-maps/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Search, X } from 'lucide-react'
import { ServiceType } from '@/hooks/useServiceRequest'
// Configuración de bibliotecas de Google Maps
const libraries: Libraries = ['places']

// Estilo del contenedor del mapa
const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

export type LocationType = {
  lat: number
  lng: number
}

type MapComponentProps = {
  selectedService: ServiceType | ServiceType[] | null
  location: LocationType | null
  setLocation: (location: LocationType | null) => void
  onContinue: () => void
  formattedAddress?: string
  setFormattedAddress?: (address: string) => void
  readOnly?: boolean
}

const MapComponent: React.FC<MapComponentProps> = ({
  selectedService,
  location,
  setLocation,
  onContinue,
  formattedAddress = '',
  setFormattedAddress,
  readOnly = false,
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [searchAddress, setSearchAddress] = useState(formattedAddress)
  const mapRef = useRef<google.maps.Map | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  // Bandera para controlar la dirección de la sincronización
  const isInternalUpdate = useRef(false)

  // Cargar el script de Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  // Configurar el centro del mapa
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: location?.lat || 40.7128, // Coordenadas de Nueva York
    lng: location?.lng || -74.006,
  })

  // Actualizar el centro cuando cambia la ubicación
  useEffect(() => {
    if (location) {
      setCenter({ lat: location.lat, lng: location.lng })
    }
  }, [location])

  // Actualizar el useEffect que maneja el autocompletado
  useEffect(() => {
    if (!isLoaded || !searchInputRef.current) return

    const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
      types: ['address'],
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()

        setLocation({ lat, lng })
        isInternalUpdate.current = true
        setSearchAddress(place.formatted_address || '')

        // Usar centerMapWithPinInLowerThird en lugar de panTo directo
        centerMapWithPinInLowerThird(lat, lng)

        // Podemos mantener el zoom
        if (mapRef.current) {
          mapRef.current.setZoom(15)
        }
      }
    })

    autocompleteRef.current = autocomplete

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, setLocation])

  // Actualizar searchAddress cuando cambia formattedAddress en props
  useEffect(() => {
    if (formattedAddress && formattedAddress !== searchAddress) {
      if (!isInternalUpdate.current) {
        setSearchAddress(formattedAddress)
      }
      isInternalUpdate.current = false
    }
  }, [formattedAddress, searchAddress])

  // Actualizar formattedAddress en el contexto cuando cambia searchAddress
  useEffect(() => {
    if (setFormattedAddress && searchAddress && searchAddress !== formattedAddress) {
      isInternalUpdate.current = true
      setFormattedAddress(searchAddress)
    }
  }, [searchAddress, setFormattedAddress, formattedAddress])

  // Función para centrar el mapa con el pin en la tercera parte inferior
  const centerMapWithPinInLowerThird = (lat: number, lng: number) => {
    if (mapRef.current) {
      // Obtener los límites visibles del mapa
      const bounds = mapRef.current.getBounds()
      if (bounds) {
        // Calcular el desplazamiento vertical necesario
        // Desplazamos el centro hacia arriba para que el pin quede en el tercio inferior
        const latSpan = bounds.getNorthEast().lat() - bounds.getSouthWest().lat()
        const latOffset = latSpan / 6 // Dividimos por 6 para mover 1/3 hacia arriba

        // Establecer el nuevo centro
        const newCenterLat = lat + latOffset
        mapRef.current.panTo({ lat: newCenterLat, lng: lng })
      } else {
        // Si no hay bounds disponibles, solo hacer un desplazamiento aproximado
        const approximateOffset = 0.01 // Valor aproximado de desplazamiento
        mapRef.current.panTo({ lat: lat + approximateOffset, lng: lng })
      }
    }
  }

  // Obtener la ubicación actual del usuario
  const handleGetLocation = () => {
    setIsGettingLocation(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ lat: latitude, lng: longitude })

          // Centrar con el pin en el tercio inferior
          centerMapWithPinInLowerThird(latitude, longitude)

          // Obtener la dirección desde las coordenadas (Geocodificación inversa)
          if (isLoaded && window.google) {
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
              if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
                isInternalUpdate.current = true
                setSearchAddress(results[0].formatted_address)
              }
            })
          }

          setIsGettingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          let errorMessage = 'Unable to get your location. Please select it manually on the map.'

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                'Location access denied. Please enable location access or select it manually.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                'Location information is unavailable. Please select your location manually.'
              break
            case error.TIMEOUT:
              errorMessage =
                'Location request timed out. Please try again or select your location manually.'
              break
          }

          alert(errorMessage)
          setIsGettingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      )
    } else {
      alert('Your browser does not support geolocation. Please select your location manually.')
      setIsGettingLocation(false)
    }
  }


  // Helper function to check if we have services selected
  const hasSelectedServices = () => {
    if (!selectedService) return false
    if (Array.isArray(selectedService)) return selectedService.length > 0
    return true // If it's a single ServiceType
  }

  // Manejar clic en el mapa
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!readOnly && hasSelectedServices() && e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      setLocation({ lat, lng })

      // Centrar con el pin en el tercio inferior
      centerMapWithPinInLowerThird(lat, lng)

      // Obtener la dirección desde las coordenadas (Geocodificación inversa)
      if (isLoaded && window.google) {
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            isInternalUpdate.current = true
            setSearchAddress(results[0].formatted_address)
          }
        })
      }
    }
  }

  // Buscar un lugar por dirección
  const handleSearchPlace = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchInputRef.current?.value || !isLoaded || !mapRef.current) return

    const placesService = new google.maps.places.PlacesService(mapRef.current as google.maps.Map)
    placesService.findPlaceFromQuery(
      {
        query: searchInputRef.current.value,
        fields: ['geometry', 'formatted_address', 'name'],
      },
      (results, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          results?.[0]?.geometry?.location
        ) {
          const lat = results[0].geometry.location.lat()
          const lng = results[0].geometry.location.lng()

          setLocation({ lat, lng })
          isInternalUpdate.current = true
          setSearchAddress(results[0].formatted_address || searchInputRef.current?.value || '')

          // Usar centerMapWithPinInLowerThird en lugar de panTo directo
          centerMapWithPinInLowerThird(lat, lng)

          // Podemos mantener el zoom
          if (mapRef.current) {
            mapRef.current.setZoom(15)
          }
        }
      },
    )
  }

  // Callback para cuando se carga el mapa
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  // Función para eliminar la ubicación seleccionada
  const handleClearLocation = () => {
    if (!readOnly) {
      // Solo eliminamos la ubicación sin cambiar el centro del mapa
      // Establecemos la ubicación a null
      setLocation(null)

      // Limpiar el campo de dirección
      isInternalUpdate.current = true
      setSearchAddress('')
    }
  }

  if (loadError) return <div className="text-center p-4">Error loading maps</div>
  if (!isLoaded) return <div className="text-center p-4">Loading maps...</div>

  const shortenAddress = (address: string): string => {
    if (!address) return ''

    // Dividir la dirección en partes
    const parts = address.split(',')

    // Si hay suficientes partes, mostrar solo la calle y la ciudad
    if (parts.length > 2) {
      // Tomar primera parte (calle y número) y la penúltima (ciudad normalmente)
      const street = parts[0]?.trim() || ''
      const city = parts[parts.length - 2]?.trim() || ''
      return `${street}, ${city}`
    }
    return address
  }

  return (
    <div className="h-full relative bg-background dark:text-white text-primary">
      {/* Google Map - Siempre visible */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        mapContainerClassName=" bg-background text-secondary"
        center={center}
        zoom={13}
        onClick={readOnly ? undefined : handleMapClick}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: true,
          zoomControl: !readOnly,
          mapId: 'map-container',
          clickableIcons: false,
          draggable: !readOnly,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        }}
      >
        {location && <Marker position={{ lat: location.lat, lng: location.lng }} />}
      </GoogleMap>

      {hasSelectedServices() && !readOnly ? (
        <>
          {/* Action buttons at the top */}
          <div className="absolute top-2 left-7 z-10">
            <div className="flex gap-2 justify-end items-center">
              {location && (
                <Button
                  onClick={handleClearLocation}
                  className="flex items-center gap-2 bg-accent/90 hover:bg-red-500 hover:text-accent-foreground"
                  size="sm"
                  variant="destructive"
                >
                  <X className="h-4 w-4" />
                  Clear location
                </Button>
              )}
            </div>
          </div>

          {/* Search form below marker */}
          <div className="absolute bottom-16 left-0 right-8 z-10 flex justify-center h-10">
            <div className="px-8 w-full max-w-md flex flex-col gap-2">
              <form onSubmit={handleSearchPlace} className="flex gap-2">
                <div className="relative flex-grow">
                  <div
                    className={`flex items-center h-10 bg-background/90 rounded-md pr-8 pl-2 ${location ? 'border-accent border-2' : 'border border-input'}`}
                  >
                    <MapPin
                      className={`h-4 w-4 mr-2 ${location ? 'text-accent' : 'text-muted-foreground'}`}
                    />

                    <Input
                      ref={searchInputRef}
                      placeholder={
                        location ? shortenAddress(searchAddress) : 'Search for an address'
                      }
                      className="text-card-foreground dark:text-accent h-full bg-transparent border-0 shadow-none text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={searchAddress}
                      onChange={(e) => {
                        if (e.target.value !== searchAddress) {
                          isInternalUpdate.current = true
                          setSearchAddress(e.target.value)
                        }
                      }}
                      title={searchAddress}
                    />
                  </div>

                  {searchAddress && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary"
                      onClick={() => {
                        isInternalUpdate.current = true
                        setSearchAddress('')
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  size="sm"
                  className="h-10 px-3 bg-background/90 text-primary hover:bg-accent hover:text-accent-foreground"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              {/* Siempre mantenemos un espacio para el botón de localización */}
              <div className="h-0">
                {!location && (
                  <Button
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="flex bg-secondary text-primary items-center gap-2 w-full hover:bg-accent hover:text-accent-foreground"
                    size="sm"
                  >
                    <MapPin className="h-3 w-3" />
                    {isGettingLocation ? 'Getting location...' : 'Get my location'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      ) : readOnly && location ? (
        <div className="absolute bottom-0 left-0 right-0 bg-background/90 p-2">
          <div className="flex items-center justify-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium truncate">{shortenAddress(searchAddress)}</span>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center p-4 pointer-events-none">
          <p className="text-white bg-error/70 p-3 rounded-md font-medium">
            Select a service to continue
          </p>
        </div>
      )}

      {/* Botón de continuar (siempre abajo) */}
      {location && hasSelectedServices() && !readOnly && (
        <div className="absolute py-2 bottom-0 left-1/2 transform -translate-x-1/2 ">
          <Button
            onClick={onContinue}
            className="bg-accent/90 text-accent-foreground hover:bg-red-500"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  )
}

export default MapComponent
