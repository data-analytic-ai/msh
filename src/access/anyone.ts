import type { Access } from 'payload'

export const anyone: Access = () => {
  return true
}
