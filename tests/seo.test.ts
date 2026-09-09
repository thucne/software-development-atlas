import { describe, expect, it } from 'vitest';
import {
  atlasSeo,
  canonicalUrl,
  createPageMetadata,
  createSitemapEntries,
} from '@/lib/seo';

describe('Atlas SEO', () => {
  it('uses the public /learn deployment as the canonical site URL', () => {
    expect(atlasSeo.siteUrl).toBe('https://thucde.dev/learn');
    expect(canonicalUrl('/')).toBe('https://thucde.dev/learn');
    expect(canonicalUrl('/docs/programming/async/promises')).toBe(
      'https://thucde.dev/learn/docs/programming/async/promises',
    );
  });

  it('builds page metadata with canonical, Open Graph, and Twitter preview data', () => {
    const metadata = createPageMetadata({
      title: 'Promises: Resolution, Chaining, and Failure',
      description: 'Reason about Promise states and chaining.',
      path: '/docs/programming/async/promises',
    });

    expect(metadata.alternates?.canonical).toBe(
      'https://thucde.dev/learn/docs/programming/async/promises',
    );
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      siteName: 'Software Development Atlas',
      url: 'https://thucde.dev/learn/docs/programming/async/promises',
      title: 'Promises: Resolution, Chaining, and Failure',
      description: 'Reason about Promise states and chaining.',
      images: [
        {
          url: 'https://thucde.dev/learn/og/software-development-atlas.jpg',
          width: 1200,
          height: 630,
          alt: 'Software Development Atlas — a personal learning atlas for modern software engineering',
        },
      ],
    });
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'Promises: Resolution, Chaining, and Failure',
      description: 'Reason about Promise states and chaining.',
      images: ['https://thucde.dev/learn/og/software-development-atlas.jpg'],
    });
  });

  it('derives sitemap entries from canonical lesson URLs and verification dates', () => {
    expect(
      createSitemapEntries([
        {
          url: '/docs/programming/async/promises',
          lastVerified: '2026-09-09',
        },
      ]),
    ).toEqual([
      {
        url: 'https://thucde.dev/learn',
        lastModified: new Date('2026-09-09T00:00:00.000Z'),
        changeFrequency: 'weekly',
        priority: 1,
      },
      {
        url: 'https://thucde.dev/learn/docs/programming/async/promises',
        lastModified: new Date('2026-09-09T00:00:00.000Z'),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ]);
  });
});
