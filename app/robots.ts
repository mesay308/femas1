import { MetadataRoute } from 'next';
import siteConfig from '@/config/siteConfig';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/login/'],
    },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
