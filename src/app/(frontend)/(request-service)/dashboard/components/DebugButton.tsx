/**
 * DebugButton - Temporary debugging component
 *
 * Provides debugging information about PayloadCMS initialization
 * and collection availability. For development use only.
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bug } from 'lucide-react'

export const DebugButton: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchDebugInfo = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/debug/collections')
      const data = await response.json()
      setDebugInfo(data)
      console.log('🐛 Debug info:', data)
    } catch (error) {
      console.error('Debug error:', error)
      setDebugInfo({ error: 'Failed to fetch debug info' })
    } finally {
      setIsLoading(false)
    }
  }

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-red-800 flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Debug PayloadCMS
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          size="sm"
          variant="outline"
          onClick={fetchDebugInfo}
          disabled={isLoading}
          className="mb-3 border-red-300 text-red-700 hover:bg-red-100"
        >
          {isLoading ? 'Verificando...' : 'Verificar Estado de PayloadCMS'}
        </Button>

        {debugInfo && (
          <div className="mt-3 p-3 bg-white rounded-md text-xs">
            <pre className="whitespace-pre-wrap overflow-auto max-h-48">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DebugButton
