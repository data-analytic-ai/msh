/**
 * TestQuotesButton - Development testing component
 *
 * Allows adding mock quotes to a service request for testing the
 * bidding system functionality. Should be removed in production.
 *
 * @param {string} requestId - ID of the service request
 * @returns {JSX.Element} - The rendered test button component
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wrench } from 'lucide-react'

interface TestQuotesButtonProps {
  requestId: string | null
}

export const TestQuotesButton: React.FC<TestQuotesButtonProps> = ({ requestId }) => {
  const [isAdding, setIsAdding] = useState(false)

  // Mock quotes data for testing
  const mockQuotes = [
    {
      contractor: 'mock-contractor-1',
      amount: 250,
      description:
        'Reparación completa de plomería con garantía de 6 meses. Incluye revisión de tuberías y cambio de accesorios necesarios.',
      status: 'pending',
      estimatedDuration: '2-3 horas',
      warranty: '6 meses',
      materials: ['Tubería PVC', 'Conectores', 'Sellador'],
    },
    {
      contractor: 'mock-contractor-2',
      amount: 300,
      description:
        'Servicio premium de plomería con materiales de alta calidad. Inspección con cámara incluida.',
      status: 'pending',
      estimatedDuration: '3-4 horas',
      warranty: '1 año',
      materials: ['Tubería de cobre', 'Válvulas premium', 'Aislamiento'],
    },
    {
      contractor: 'mock-contractor-3',
      amount: 180,
      description: 'Reparación básica y efectiva. Solución rápida para tu problema de plomería.',
      status: 'pending',
      estimatedDuration: '1-2 horas',
      warranty: '3 meses',
      materials: ['Materiales básicos'],
    },
  ]

  const addTestQuotes = async () => {
    if (!requestId || isAdding) return

    setIsAdding(true)

    try {
      console.log('Adding test quotes to request:', requestId)

      // Add quotes one by one with a small delay
      for (const quote of mockQuotes) {
        const response = await fetch(`/api/service-requests/${requestId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quotes: [quote],
          }),
        })

        if (!response.ok) {
          console.error('Error adding test quote:', await response.text())
        } else {
          console.log('Test quote added successfully')
        }

        // Small delay between quotes to simulate real-time arrival
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      console.log('All test quotes added successfully')
    } catch (error) {
      console.error('Error adding test quotes:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // Only show in development environment
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-yellow-800">Modo de Desarrollo</h4>
          <p className="text-xs text-yellow-600">
            Agregar cotizaciones de prueba para testear la funcionalidad
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={addTestQuotes}
          disabled={!requestId || isAdding}
          className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
        >
          <Wrench className="h-4 w-4 mr-2" />
          {isAdding ? 'Agregando...' : 'Agregar Cotizaciones de Prueba'}
        </Button>
      </div>
    </div>
  )
}

export default TestQuotesButton
