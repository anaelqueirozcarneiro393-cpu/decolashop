import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/private/'],
    },
    sitemap: 'https://apexfinder.com.br/sitemap.xml',
    host: 'https://apexfinder.com.br',
  }
}
