import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Find trusted local contractors for emergency repairs and home services. 24/7 emergency response, verified professionals, and instant quotes.',
  images: [
    {
      url: `${getServerSideURL()}/emergency-repair-og.webp`,
    },
  ],
  siteName: 'EmergencyRepair24',
  title: 'EmergencyRepair24 - Emergencies & Repairs',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
