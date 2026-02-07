import { MetadataRoute } from 'next'
import { getCourts, getDistinctSuburbs } from '@/lib/data'
import { toSlug } from '@/lib/utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courts, suburbs] = await Promise.all([getCourts(), getDistinctSuburbs()])
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mypickle.me'

  const courtUrls = courts.map((court) => ({
    url: `${baseUrl}/court/${court.id}`,
    lastModified: new Date(court.updated_at || court.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const suburbUrls = suburbs.map(({ suburb }) => ({
    url: `${baseUrl}/courts/${toSlug(suburb)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/list-court`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    ...suburbUrls,
    ...courtUrls,
  ]
}
