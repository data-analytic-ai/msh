import canUseDOM from './canUseDOM'

export const getServerSideURL = (): string => {
  // Si tenemos una URL base configurada explícitamente para recursos,
  // la usamos para garantizar consistencia entre cliente y servidor
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  // Primero verificamos si tenemos una URL configurada explícitamente
  if (process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || ''
  }

  // Si estamos en Vercel
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  // Si estamos en Railway
  if (process.env.RAILWAY_STATIC_URL) {
    return process.env.RAILWAY_STATIC_URL
  }

  // Para el entorno de Railway QA
  if (process.env.NODE_ENV === 'production') {
    return 'https://er24-qa.up.railway.app'
  }

  // Fallback para desarrollo local
  return 'http://localhost:3000'
}

export const getURL = (): string => {
  // En el cliente, usamos la URL desde el navegador para navegación
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // En el servidor, usamos la misma URL que en getServerSideURL
  return getServerSideURL()
}

// Para recursos como imágenes, siempre usamos la misma URL base
export const getClientSideURL = (): string => {
  // Siempre retornamos la misma URL que usa el servidor para evitar
  // errores de hidratación con los atributos src y srcSet
  return getServerSideURL()
}
