'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react'
import { GoogleMap, useLoadScript, Marker, Libraries } from '@react-google-maps/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Search } from 'lucide-react'

// Configuración de bibliotecas de Google Maps
const libraries: Libraries = ['places']

// Estilo del contenedor del mapa
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
}

export type LocationType = {
  lat: number
  lng: number
}

type MapComponentProps = {
  selectedService: string | null
  location: LocationType | null
  setLocation: (location: LocationType) => void
  onContinue: () => void
}

const MapComponent: React.FC<MapComponentProps> = ({
  selectedService,
  location,
  setLocation,
  onContinue,
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [searchAddress, setSearchAddress] = useState('')
  const mapRef = useRef<google.maps.Map | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Cargar el script de Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  // Configurar el centro del mapa
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: location?.lat || 40.7128,
    lng: location?.lng || -74.006,
  })

  // Actualizar el centro cuando cambia la ubicación
  useEffect(() => {
    if (location) {
      setCenter({ lat: location.lat, lng: location.lng })
    }
  }, [location])

  // Obtener la ubicación actual del usuario
  const handleGetLocation = () => {
    setIsGettingLocation(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ lat: latitude, lng: longitude })
          setCenter({ lat: latitude, lng: longitude })
          setIsGettingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to retrieve your location. Please select it manually on the map.')
          setIsGettingLocation(false)
        },
      )
    } else {
      alert('Geolocation is not supported by this browser.')
      setIsGettingLocation(false)
    }
  }

  // Manejar clic en el mapa
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (selectedService && e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      setLocation({ lat, lng })

      // Obtener la dirección desde las coordenadas (Geocodificación inversa)
      if (isLoaded && window.google) {
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
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

          setCenter({ lat, lng })
          setLocation({ lat, lng })
          setSearchAddress(results[0].formatted_address || searchInputRef.current?.value || '')

          if (mapRef.current) {
            mapRef.current.panTo({ lat, lng })
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

  if (loadError) return <div className="text-center p-4">Error loading maps</div>
  if (!isLoaded) return <div className="text-center p-4">Loading maps...</div>

  return (
    <div className="h-full relative">
      {selectedService ? (
        <>
          {/* Barra de búsqueda */}
          <form
            onSubmit={handleSearchPlace}
            className="absolute top-2 left-2 right-2 z-10 flex gap-2"
          >
            <Input
              ref={searchInputRef}
              placeholder="Search for an address"
              className="h-10 bg-white/90"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
            />
            <Button type="submit" size="sm" className="h-10 px-3">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Google Map */}
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            onClick={handleMapClick}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            {location && <Marker position={{ lat: location.lat, lng: location.lng }} />}
          </GoogleMap>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-center">Select a service to continue</p>
        </div>
      )}

      {/* Botones de ubicación */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3">
        <Button
          onClick={handleGetLocation}
          disabled={!selectedService || isGettingLocation}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          {isGettingLocation ? 'Getting location...' : 'Get my location'}
        </Button>

        {location && selectedService && (
          <Button onClick={onContinue} className="bg-primary">
            Continue
          </Button>
        )}
      </div>
    </div>
  )
}

export default MapComponent
