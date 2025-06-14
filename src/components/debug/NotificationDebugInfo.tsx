/**
 * NotificationDebugInfo - Debug component for notification troubleshooting
 *
 * Shows current user info, notification count, and recent notifications
 * to help troubleshoot notification delivery issues.
 */

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/providers/AuthProvider'
import { useNotifications } from '@/contexts/NotificationContext'
import { Bell, User, Database, Info } from 'lucide-react'

export const NotificationDebugInfo: React.FC = () => {
  const { user } = useAuth()
  const { notifications, unreadCount, isConnected } = useNotifications()

  if (!user) {
    return (
      <Card className="mt-4 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Info className="h-5 w-5" />
            Debug: Usuario no autenticado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700">No hay usuario autenticado para mostrar notificaciones.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Database className="h-5 w-5" />
          Debug: Información de Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="space-y-2">
          <h4 className="font-semibold text-blue-800 flex items-center gap-2">
            <User className="h-4 w-4" />
            Usuario Actual:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <strong>ID:</strong> {user.id}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Nombre:</strong> {user.firstName} {user.lastName}
            </div>
            <div>
              <strong>Rol:</strong> {user.role}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-2">
          <h4 className="font-semibold text-blue-800 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Estado de Notificaciones:
          </h4>
          <div className="flex gap-2">
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
            <Badge variant="outline">{unreadCount} sin leer</Badge>
            <Badge variant="outline">{notifications.length} total</Badge>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="space-y-2">
          <h4 className="font-semibold text-blue-800">Notificaciones Recientes:</h4>
          {notifications.length === 0 ? (
            <p className="text-blue-600 text-sm">No hay notificaciones cargadas.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="p-2 bg-white rounded border text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs">
                      {notification.type}
                    </Badge>
                    <Badge
                      variant={notification.read ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {notification.read ? 'Leída' : 'No leída'}
                    </Badge>
                  </div>
                  <div>
                    <strong>Título:</strong> {notification.title}
                  </div>
                  <div>
                    <strong>Mensaje:</strong> {notification.message}
                  </div>
                  <div className="text-gray-500 mt-1">
                    <strong>Creada:</strong> {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-3 bg-blue-100 rounded">
          <h5 className="font-semibold text-blue-900 mb-2">Para Debugging:</h5>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Verifica que el ID del usuario coincida con la notificación en la DB</li>
            <li>2. Abre la consola del navegador (F12) para ver logs detallados</li>
            <li>3. Envía una nueva cotización y verifica que aparezca aquí</li>
            <li>4. El polling se ejecuta cada 30 segundos automáticamente</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

export default NotificationDebugInfo
