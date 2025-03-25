import type { BeforeChangeHook } from 'payload/dist/collections/config/types'

export const populatePublishedAt: BeforeChangeHook = ({ data, req, operation }) => {
  if (operation === 'create' || operation === 'update') {
    if (data._status === 'published' && !data.publishedAt) {
      return {
        ...data,
        publishedAt: new Date(),
      }
    }

    if (data._status === 'draft' && data.publishedAt) {
      return {
        ...data,
        publishedAt: null,
      }
    }
  }

  return data
}
