# Plataforma de Servicios de Emergencia

Este repositorio contiene el código fuente para la plataforma de servicios de emergencia, una aplicación web que conecta a clientes con contratistas en tiempo real para atender emergencias en plomería, electricidad, vidrios, HVAC, plagas y cerrajería.

## Tecnologías Utilizadas

- **Backend:** Next.js
- **Base de Datos:** MongoDB
- **Frontend:** React.js (Next.js), Payload, TailwindCSS
- **Autenticación:** JWT/OAUTH2
- **Notificaciones y Mensajería:** Twilio (para SMS y llamadas)
- **Pagos:** Stripe / PayPal
- **Mapas y Ubicación:** Google Maps API
- **Hosting:** Railway.app
- **Almacenamiento de Imágenes:** Railway.app
- **Protección contra spam:** Google reCAPTCHA v3

## Arquitectura y Características

La plataforma está construida utilizando un enfoque "Mobile First" y se desarrolla en tres fases:

### Fase 1: MVP (Versión Mínima Viable)

- **Registro y Autenticación**
  - Login con Google, Facebook, Apple o email/password
  - Validación de número telefónico por SMS (Twilio)
  - Protección con Google reCAPTCHA v3
  - Perfiles detallados para contratistas

- **Solicitudes de Servicio**
  - Formulario intuitivo con selección de servicio
  - Carga de fotos opcional
  - Ubicación automática con Google Maps
  - Validación completa antes del envío

- **Asignación de Contratistas**
  - Envío automático a 8 contratistas cercanos
  - Los primeros 3 en responder aparecen como opciones
  - El cliente selecciona uno y bloquea las otras opciones

- **Pagos y Seguridad**
  - Pago obligatorio antes del servicio (Stripe/PayPal)
  - Retención del pago hasta confirmación del servicio
  - Protección contra fraudes

- **Confirmación del Servicio**
  - Firma digital o confirmación por SMS
  - Liberación del pago al confirmar
  - Registro en la base de datos

### Fase 2: Optimización y Mejoras

- Reseñas y calificaciones para contratistas
- Tiempo estimado de llegada automatizado
- Historial de trabajos para contratistas y clientes
- Configuración de horarios para contratistas

### Fase 3: Funcionalidades Avanzadas

- Implementación de IA para precios estimados
- Tracking en tiempo real del contratista
- Expansión a más ciudades con adaptación de precios

## Cronograma de Desarrollo

| Fase | Tareas | Duración Estimada |
|------|--------|------------------|
| Fase 1 | Desarrollo del MVP 
| Fase 2 | Optimización de UX/UI, Calificaciones y Estimaciones 
| Fase 3 | IA, Tracking en Tiempo Real y Expansión 

**Tiempo total estimado:** 9 meses

## Cómo Iniciar el Desarrollo

1. Clonar este repositorio
2. Copiar `.env.example` a `.env` y configurar las variables de entorno
3. Ejecutar `pnpm install` para instalar las dependencias
4. Ejecutar `pnpm dev` para iniciar el servidor de desarrollo
5. Abrir `http://localhost:3000` en el navegador

## Consideraciones Adicionales

- La plataforma está diseñada con un enfoque "Mobile First"
- Se busca optimizar los costos de notificaciones vía Twilio
- Se reutilizan tecnologías ya implementadas en Roofing Siding Hub
- Se realizará un periodo de prueba en una ciudad piloto antes de expandirse
