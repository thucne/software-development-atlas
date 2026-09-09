import { createSitemapEntries } from '@/lib/seo';
import { source } from '@/lib/source';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return createSitemapEntries(
    source.getPages().map((page) => ({
      url: page.url,
      lastVerified: page.data.lastVerified,
    })),
  );
}
