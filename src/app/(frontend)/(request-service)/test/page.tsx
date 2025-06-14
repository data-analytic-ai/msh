/**
 * Test Page - Diagnostic tool for quotes system
 *
 * This page helps diagnose issues with:
 * - Routing and navigation
 * - Authentication state
 * - API connectivity
 * - Component rendering
 *
 * @returns {JSX.Element} - Test diagnostic page
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TestPage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const [apiTest, setApiTest] = useState<string>('Not tested')
  const [testResults, setTestResults] = useState<any[]>([])

  useEffect(() => {
    console.log('🧪 Test Page - Initial State:', {
      isAuthenticated,
      authLoading,
      user: user?.email,
      timestamp: new Date().toISOString(),
    })
  }, [isAuthenticated, authLoading, user])

  const forceAuthRefresh = async () => {
    console.log('🔄 Forcing authentication refresh...')
    try {
      await refreshUser()
      console.log('✅ Authentication refresh completed')
    } catch (error) {
      console.error('❌ Authentication refresh failed:', error)
    }
  }

  const testAPI = async () => {
    setApiTest('Testing...')
    const results = []

    try {
      // Test 1: Basic API connectivity
      console.log('🔍 Testing basic API connectivity...')
      const healthResponse = await fetch('/api/health')
      results.push({
        test: 'API Health Check',
        status: healthResponse.ok ? 'PASS' : 'FAIL',
        details: `Status: ${healthResponse.status}`,
      })

      // Test 2: Request Details API (with a dummy ID)
      console.log('🔍 Testing request-details API...')
      const requestResponse = await fetch('/api/request-details?id=test123')
      results.push({
        test: 'Request Details API',
        status: requestResponse.status === 404 ? 'PASS' : requestResponse.ok ? 'PASS' : 'FAIL',
        details: `Status: ${requestResponse.status} (404 expected for dummy ID)`,
      })

      // Test 3: Authentication API
      console.log('🔍 Testing authentication API...')
      const authResponse = await fetch('/api/users/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      results.push({
        test: 'Authentication API (/api/users/me)',
        status: authResponse.ok ? 'PASS' : 'FAIL',
        details: `Status: ${authResponse.status} - ${authResponse.ok ? 'User authenticated' : 'Not authenticated'}`,
      })

      // Test 4: Cookie check
      const cookies = typeof document !== 'undefined' ? document.cookie : ''
      const hasPayloadToken = cookies.includes('payload-token=')
      results.push({
        test: 'Payload Token Cookie',
        status: hasPayloadToken ? 'PASS' : 'FAIL',
        details: hasPayloadToken ? 'Cookie exists' : 'Cookie missing',
      })

      // Test 5: User authentication
      results.push({
        test: 'Authentication State',
        status: isAuthenticated ? 'PASS' : 'FAIL',
        details: `User: ${user?.email || 'None'}, Authenticated: ${isAuthenticated}`,
      })

      setApiTest('Completed')
      setTestResults(results)
    } catch (error) {
      console.error('❌ API Test failed:', error)
      setApiTest('Failed')
      results.push({
        test: 'API Test Suite',
        status: 'FAIL',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
      setTestResults(results)
    }
  }

  const testNavigation = () => {
    const testId = 'test-request-id'
    console.log('🧭 Testing navigation to quotes page with ID:', testId)
    router.push(`/quotes/${testId}`)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🧪 Sistema de Diagnóstico - Gestión de Cotizaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Esta página te ayuda a diagnosticar problemas con el sistema de cotizaciones.
            </p>
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estado de Autenticación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Estado:</span>
                <Badge variant={isAuthenticated ? 'default' : 'destructive'}>
                  {authLoading ? 'Cargando...' : isAuthenticated ? 'Autenticado' : 'No autenticado'}
                </Badge>
              </div>
              {user && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Usuario:</span>
                  <span className="text-sm">{user.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="font-medium">Cargando:</span>
                <Badge variant={authLoading ? 'secondary' : 'outline'}>
                  {authLoading ? 'Sí' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button onClick={forceAuthRefresh} size="sm" variant="outline">
                  🔄 Forzar Actualización de Autenticación
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Testing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pruebas de API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button onClick={testAPI} disabled={apiTest === 'Testing...'}>
                  {apiTest === 'Testing...' ? 'Probando...' : 'Ejecutar Pruebas de API'}
                </Button>
                <Badge
                  variant={
                    apiTest === 'Completed'
                      ? 'default'
                      : apiTest === 'Failed'
                        ? 'destructive'
                        : 'outline'
                  }
                >
                  {apiTest}
                </Badge>
              </div>

              {testResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Resultados:</h4>
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="text-sm">{result.test}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.status === 'PASS' ? 'default' : 'destructive'}>
                          {result.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{result.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Testing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pruebas de Navegación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Prueba la navegación a diferentes páginas del sistema.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={testNavigation}>
                    🧭 Ir a Página de Cotizaciones (Test ID)
                  </Button>
                  <Link href="/details/test-id">
                    <Button variant="outline">📋 Ir a Detalles de Solicitud (Test ID)</Button>
                  </Link>
                  <Link href="">
                    <Button variant="outline">🏠 Ir a Solicitar Servicio</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estado de Componentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Esta página se renderiza:</span>
                <Badge variant="default">✅ SÍ</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">React hooks funcionan:</span>
                <Badge variant="default">✅ SÍ</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">UI Components cargan:</span>
                <Badge variant="default">✅ SÍ</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">AuthProvider funciona:</span>
                <Badge variant={user ? 'default' : 'secondary'}>
                  {user ? '✅ SÍ' : '❓ VERIFICAR'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div>
                <strong>Timestamp:</strong> {new Date().toISOString()}
              </div>
              <div>
                <strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'SSR'}
              </div>
              <div>
                <strong>User Agent:</strong>{' '}
                {typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR'}
              </div>
              <div>
                <strong>Auth Loading:</strong> {authLoading.toString()}
              </div>
              <div>
                <strong>Is Authenticated:</strong> {isAuthenticated.toString()}
              </div>
              <div>
                <strong>User Object:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
