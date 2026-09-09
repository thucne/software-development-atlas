import { atlasSeo, canonicalUrl } from '@/lib/seo';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: canonicalUrl('/sitemap.xml'),
    host: atlasSeo.siteUrl,
  };
}
