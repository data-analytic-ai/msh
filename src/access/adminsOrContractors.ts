import type { Access } from 'payload'

import type { User } from '../payload-types'

export const adminsOrContractors: Access = ({ req }) => {
  // Si el usuario no está autenticado, no tiene acceso
  if (!req.user) return false

  const user = req.user as User

  // Los administradores y contratistas tienen acceso
  if (user.role === 'admin' || user.role === 'contractor') return true

  // Por defecto, no tiene acceso
  return false
}
