import type { Access } from 'payload'

import type { User } from '../payload-types'

export const adminsOrSelf: Access = ({ req }) => {
  // Si el usuario no está autenticado, no tiene acceso
  if (!req.user) return false

  const user = req.user as User

  // Los administradores siempre tienen acceso
  if (user.role === 'admin') return true

  // Los usuarios regulares solo tienen acceso a su propio perfil
  return {
    id: {
      equals: user.id,
    },
  }
}
