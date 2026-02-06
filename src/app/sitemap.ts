import { MetadataRoute } from 'next'
import { getCourts } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courts = await getCourts()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mypickle.me'

  const courtUrls = courts.map((court) => ({
    url: `${baseUrl}/court/${court.id}`,
    lastModified: new Date(court.updated_at || court.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...courtUrls,
  ]
}
