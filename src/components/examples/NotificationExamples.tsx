/**
 * NotificationExamples - Examples of how to use the notification system
 *
 * This component demonstrates how to integrate notifications into business flows
 * like quote submission, quote acceptance, job completion, etc.
 */

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useBusinessNotifications } from '@/hooks/useBusinessNotifications'
import { useNotifications } from '@/contexts/NotificationContext'
import { Bell, MessageSquare, DollarSign, CheckCircle, AlertCircle, Settings } from 'lucide-react'

export const NotificationExamples: React.FC = () => {
  const businessNotifications = useBusinessNotifications()
  const { notify } = useNotifications()

  // Example: Send quote received notification
  const handleQuoteReceived = async () => {
    await businessNotifications.notifyQuoteReceived({
      customerId: 'customer-123',
      contractorName: 'Juan Pérez',
      amount: 150000,
      requestTitle: 'Reparación plomería cocina',
      requestId: 'request-456',
    })
  }

  // Example: Send quote accepted notification
  const handleQuoteAccepted = async () => {
    await businessNotifications.notifyQuoteAccepted({
      contractorId: 'contractor-789',
      requestTitle: 'Reparación plomería cocina',
      amount: 150000,
      customerName: 'María García',
      requestId: 'request-456',
    })
  }

  // Example: Send job assigned notification
  const handleJobAssigned = async () => {
    await businessNotifications.notifyJobAssigned({
      contractorId: 'contractor-789',
      requestTitle: 'Instalación aire acondicionado',
      customerName: 'Carlos Rodríguez',
      requestId: 'request-789',
      urgencyLevel: 'urgent',
    })
  }

  // Example: Send payment notification
  const handlePaymentReceived = async () => {
    await businessNotifications.notifyPaymentReceived({
      contractorId: 'contractor-789',
      amount: 300000,
      requestTitle: 'Instalación aire acondicionado',
      requestId: 'request-789',
    })
  }

  // Example: Send custom notification
  const handleCustomNotification = async () => {
    await notify('system_update', {
      title: 'Nueva función disponible',
      message: 'Ahora puedes rastrear el progreso de tus trabajos en tiempo real',
      priority: 'normal',
      data: {
        feature: 'job-tracking',
        actionUrl: '/dashboard/jobs',
      },
      actionLabel: 'Ver trabajos',
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Sistema de Notificaciones</h2>
        <p className="text-muted-foreground">
          Ejemplos de cómo usar las notificaciones en flujos de negocio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quote Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notificaciones de Cotizaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleQuoteReceived}
              className="w-full justify-start"
              variant="outline"
            >
              <Bell className="h-4 w-4 mr-2" />
              Cliente recibe cotización
            </Button>
            <Button
              onClick={handleQuoteAccepted}
              className="w-full justify-start"
              variant="outline"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Contratista: cotización aceptada
            </Button>
          </CardContent>
        </Card>

        {/* Job Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Notificaciones de Trabajos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleJobAssigned} className="w-full justify-start" variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Trabajo asignado (urgente)
            </Button>
            <Button
              onClick={handlePaymentReceived}
              className="w-full justify-start"
              variant="outline"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Pago recibido
            </Button>
          </CardContent>
        </Card>

        {/* System Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Notificaciones del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleCustomNotification}
              className="w-full justify-start"
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-2" />
              Actualización del sistema
            </Button>
          </CardContent>
        </Card>

        {/* Integration Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Guía de Integración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>1. En envío de cotizaciones:</strong>
              <pre className="text-xs bg-muted p-2 rounded mt-1">
                {`// En bidService.ts o API
await notifyQuoteReceived({
  customerId: request.userId,
  contractorName: contractor.name,
  amount: quote.amount,
  requestTitle: request.title,
  requestId: request.id
})`}
              </pre>
            </div>
            <div>
              <strong>2. En aceptación de cotizaciones:</strong>
              <pre className="text-xs bg-muted p-2 rounded mt-1">
                {`// En QuotesInbox.tsx
await notifyQuoteAccepted({
  contractorId: quote.contractorId,
  requestTitle: request.title,
  amount: quote.amount,
  customerName: user.name,
  requestId: request.id
})`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
        <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
          💡 Cómo funciona el sistema
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Las notificaciones se crean automáticamente en la base de datos</li>
          <li>• Se envían por múltiples canales (in-app, push, email, SMS)</li>
          <li>• Respetan las preferencias del usuario</li>
          <li>• Se muestran en tiempo real en el NotificationBell</li>
          <li>• Incluyen botones de acción personalizados</li>
        </ul>
      </div>
    </div>
  )
}

export default NotificationExamples
