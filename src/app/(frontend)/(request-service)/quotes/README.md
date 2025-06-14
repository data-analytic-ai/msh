# Sistema de Gestión de Cotizaciones

Este directorio contiene el sistema completo de gestión de cotizaciones para el Multi-Service Hub.

## Estructura

```
quotes/
├── [requestId]/
│   └── page.tsx          # Página principal de gestión de cotizaciones
└── README.md             # Este archivo
```

## Características Principales

### 🎯 Gestión Completa de Cotizaciones
- **Vista detallada** de todas las cotizaciones recibidas para una solicitud específica
- **Comparación lado a lado** de diferentes ofertas de contratistas
- **Información del contratista** incluyendo calificaciones, ubicación y verificación
- **Detalles completos** de cada cotización: precio, descripción, duración estimada, garantía y materiales

### 🔔 Sistema de Notificaciones en Tiempo Real
- **Notificaciones automáticas** cuando llegan nuevas cotizaciones
- **Polling automático** cada 30 segundos para detectar cambios
- **Indicadores visuales** para cotizaciones nuevas y pendientes
- **Notificaciones dismissible** con auto-ocultado después de 10 segundos

### ⚡ Acciones Rápidas
- **Aceptar cotización** y proceder directamente al pago
- **Rechazar cotizaciones** no deseadas
- **Comunicación directa** con contratistas (preguntas y llamadas)
- **Redirección automática** al flujo de pago tras aceptar una cotización

### 🎨 Experiencia de Usuario Mejorada
- **Estado visual claro** de cada cotización (pendiente, aceptada, rechazada)
- **Responsive design** que funciona en dispositivos móviles y desktop
- **Loading states** y manejo elegante de errores
- **Animaciones sutiles** para mejorar la interactividad

## Integración con Otros Componentes

### UserServiceRequests Component
El componente `UserServiceRequests` ha sido actualizado para:
- Mostrar información resumida de cotizaciones directamente en las tarjetas
- Redirigir a la página de gestión de cotizaciones cuando hay quotes disponibles
- Mostrar rangos de precios y estado de cotizaciones
- Indicar visualmente cuando hay cotizaciones pendientes nuevas

### QuotesInbox Component
El componente `QuotesInbox` (usado en confirmación) ahora:
- Muestra notificaciones destacadas para nuevas cotizaciones
- Proporciona vista resumida de las primeras 2 cotizaciones
- Incluye enlaces directos a la página de gestión completa
- Ofrece acciones rápidas para aceptar/rechazar desde la confirmación

## Hooks y Utilidades

### useQuotesNotifications Hook
Hook personalizado que proporciona:
- Estado centralizado de notificaciones
- Polling automático de nuevas cotizaciones
- Control de notificaciones (show/hide/dismiss)
- Manejo consistente de errores

### QuotesNotification Component
Componente reutilizable para mostrar notificaciones:
- Variante `default` para uso en páginas
- Variante `compact` para notificaciones tipo toast
- Funcionalidad completa de dismiss
- Enlaces directos a gestión de cotizaciones

## Rutas y Navegación

### Estructura de URLs
- `/quotes/[requestId]` - Gestión completa de cotizaciones
- Parámetros: `requestId` - ID único de la solicitud de servicio

### Flujo de Navegación
1. **Desde UserServiceRequests**: Click en "Ver Cotizaciones" → Página de gestión
2. **Desde QuotesInbox**: Click en "Ver Todas las Cotizaciones" → Página de gestión
3. **Desde Notificaciones**: Click en botón de acción → Página de gestión
4. **Después de aceptar**: Redirección automática a `/payment`

## Seguridad y Validación

### Autenticación
- Verificación de usuario autenticado antes de mostrar contenido
- Redirección a login si no está autenticado
- Validación de permisos para ver solicitudes específicas

### Validación de Datos
- Verificación de existencia de la solicitud
- Manejo elegante de errores de API
- Validación de estados de cotización antes de acciones

## Estados de Cotización

### Pending (Pendiente)
- Cotización recién recibida
- Disponible para aceptar/rechazar
- Mostrada con acciones completas

### Accepted (Aceptada)
- Una cotización ha sido aceptada por el usuario
- Otras cotizaciones se vuelven de solo lectura
- Muestra información de próximos pasos

### Rejected (Rechazada)
- Cotización rechazada por el usuario
- Mostrada con opacidad reducida
- Sin acciones disponibles

## APIs Utilizadas

### GET /api/request-details
- Obtiene detalles completos de la solicitud incluyendo cotizaciones
- Incluye información del contratista y estado actualizado

### PATCH /api/quotes
- Actualiza estado de cotizaciones (accept/reject)
- Maneja la lógica de negocio para cambios de estado
- Retorna datos actualizados para refrescar UI

## Mejores Prácticas

### Performance
- Polling inteligente que se detiene cuando no hay usuario autenticado
- Carga lazy de componentes pesados
- Optimización de re-renders con useCallback y useMemo

### UX
- Estados de loading claros durante operaciones
- Feedback inmediato para acciones del usuario
- Navegación intuitiva entre diferentes vistas
- Mensajes de error informativos y accionables

### Accesibilidad
- Semantic HTML estructura
- Keyboard navigation support
- Screen reader friendly
- Color contrast appropriate for all states

## Desarrollo Futuro

### Funcionalidades Planeadas
- Chat en tiempo real con contratistas
- Sistema de calificaciones post-servicio
- Negociación de precios
- Programación de citas integrada
- Notificaciones push para móviles

### Mejoras Técnicas
- WebSocket para actualizaciones en tiempo real
- Caché inteligente de cotizaciones
- Optimistic updates para mejor UX
- Test coverage completo 