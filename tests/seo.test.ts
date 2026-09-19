import { describe, expect, it } from 'vitest';
import {
  atlasSeo,
  canonicalUrl,
  createJsonLdArticle,
  createPageMetadata,
  createSitemapEntries,
  rootMetadata,
} from '@/lib/seo';
import { generateLlmsManifest } from '@/lib/llms-txt';

describe('Atlas SEO', () => {
  it('uses the public /learn deployment as the canonical site URL', () => {
    expect(atlasSeo.siteUrl).toBe('https://thucde.dev/learn');
    expect(canonicalUrl('/')).toBe('https://thucde.dev/learn');
    expect(canonicalUrl('/docs/programming/async/promises')).toBe(
      'https://thucde.dev/learn/docs/programming/async/promises',
    );
  });

  it('includes root hreflang alternates in rootMetadata', () => {
    expect(rootMetadata.alternates).toMatchObject({
      canonical: 'https://thucde.dev/learn',
      languages: {
        en: 'https://thucde.dev/learn',
        vi: 'https://thucde.dev/learn/vi/docs',
        'x-default': 'https://thucde.dev/learn',
      },
    });
  });

  it('builds English page metadata with canonical, bidirectional hreflang, Open Graph, and Twitter data', () => {
    const metadata = createPageMetadata({
      title: 'Promises: Resolution, Chaining, and Failure',
      description: 'Reason about Promise states and chaining.',
      path: '/docs/programming/async/promises',
      locale: 'en',
    });

    expect(metadata.alternates?.canonical).toBe(
      'https://thucde.dev/learn/docs/programming/async/promises',
    );
    expect(metadata.alternates?.languages).toEqual({
      en: 'https://thucde.dev/learn/docs/programming/async/promises',
      vi: 'https://thucde.dev/learn/vi/docs/programming/async/promises',
      'x-default': 'https://thucde.dev/learn/docs/programming/async/promises',
    });
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      locale: 'en_US',
      alternateLocale: ['vi_VN'],
      siteName: 'Software Development Atlas',
      url: 'https://thucde.dev/learn/docs/programming/async/promises',
      title: 'Promises: Resolution, Chaining, and Failure',
      description: 'Reason about Promise states and chaining.',
      images: [
        {
          url: 'https://thucde.dev/learn/og/software-development-atlas',
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
      images: ['https://thucde.dev/learn/og/software-development-atlas'],
    });
  });

  it('builds Vietnamese page metadata with proper canonical and hreflang links', () => {
    const metadata = createPageMetadata({
      title: 'Promises: Giải quyết, Nối chuỗi và Xử lý Lỗi',
      description: 'Hiểu sâu trạng thái Promise và luồng bất đồng bộ.',
      path: '/vi/docs/programming/async/promises',
      locale: 'vi',
    });

    expect(metadata.alternates?.canonical).toBe(
      'https://thucde.dev/learn/vi/docs/programming/async/promises',
    );
    expect(metadata.alternates?.languages).toEqual({
      en: 'https://thucde.dev/learn/docs/programming/async/promises',
      vi: 'https://thucde.dev/learn/vi/docs/programming/async/promises',
      'x-default': 'https://thucde.dev/learn/docs/programming/async/promises',
    });
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      locale: 'vi_VN',
      alternateLocale: ['en_US'],
    });
  });

  it('generates valid Schema.org TechArticle and BreadcrumbList JSON-LD', () => {
    const jsonLd = createJsonLdArticle(
      {
        url: '/docs/programming/async/promises',
        data: {
          title: 'Promises: Resolution, Chaining, and Failure',
          description: 'Reason about Promise states and chaining.',
          lastVerified: '2026-09-19',
          level: 'intermediate',
          category: 'programming',
          topics: ['promises', 'async', 'javascript'],
        },
      },
      'en',
    );

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(Array.isArray(jsonLd['@graph'])).toBe(true);

    const article = jsonLd['@graph'][0] as Record<string, unknown>;
    expect(article['@type']).toBe('TechArticle');
    expect(article.headline).toBe('Promises: Resolution, Chaining, and Failure');
    expect(article.url).toBe(
      'https://thucde.dev/learn/docs/programming/async/promises',
    );
    expect(article.inLanguage).toBe('en-US');
    expect(article.dateModified).toBe('2026-09-19');
    expect(article.proficiencyLevel).toBe('Intermediate');
    expect(article.articleSection).toBe('programming');
    expect(article.keywords).toBe('promises, async, javascript');

    const breadcrumbs = jsonLd['@graph'][1] as {
      '@type': string;
      itemListElement: Array<{ position: number; name: string; item: string }>;
    };
    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
    expect(breadcrumbs.itemListElement).toHaveLength(3);
    expect(breadcrumbs.itemListElement[0].item).toBe(
      'https://thucde.dev/learn/docs',
    );
    expect(breadcrumbs.itemListElement[1].item).toBe(
      'https://thucde.dev/learn/docs/programming',
    );
    expect(breadcrumbs.itemListElement[2].item).toBe(
      'https://thucde.dev/learn/docs/programming/async/promises',
    );
  });

  it('generates Vietnamese localized BreadcrumbList and inLanguage in JSON-LD', () => {
    const jsonLd = createJsonLdArticle(
      {
        url: '/vi/docs/programming/async/promises',
        data: {
          title: 'Promises: Giải quyết, Nối chuỗi và Xử lý Lỗi',
          description: 'Hiểu sâu trạng thái Promise.',
          lastVerified: '2026-09-19',
          level: 'intermediate',
          category: 'programming',
        },
      },
      'vi',
    );

    const article = jsonLd['@graph'][0] as Record<string, unknown>;
    expect(article.inLanguage).toBe('vi-VN');

    const breadcrumbs = jsonLd['@graph'][1] as {
      '@type': string;
      itemListElement: Array<{ position: number; name: string; item: string }>;
    };
    expect(breadcrumbs.itemListElement[0].name).toBe('Trang chủ Atlas');
    expect(breadcrumbs.itemListElement[0].item).toBe(
      'https://thucde.dev/learn/vi/docs',
    );
  });

  it('lists canonical content URLs without claiming verification dates are edit dates', () => {
    expect(
      createSitemapEntries([
        {
          url: '/docs/programming/async/promises',
        },
      ]),
    ).toEqual([
      {
        url: 'https://thucde.dev/learn/docs/programming/async/promises',
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ]);
  });

  it('generates a formatted /llms.txt manifest linking to .md raw endpoints', () => {
    const text = generateLlmsManifest([
      {
        url: '/docs/start-here/about',
        data: {
          title: 'About this Atlas',
          description: 'Vision, operating model, and zero-cost constraints.',
          category: 'start-here',
        },
      },
      {
        url: '/docs/programming/async/promises',
        data: {
          title: 'Promises: Resolution, Chaining, and Failure',
          description:
            'Reason about Promise states, chaining, microtask timing, and unhandled rejection semantics.',
          category: 'programming',
        },
      },
    ]);

    expect(text).toContain('# Software Development Atlas');
    expect(text).toContain('## Start Here');
    expect(text).toContain(
      '- [About this Atlas](https://thucde.dev/learn/docs/start-here/about.md): Vision, operating model, and zero-cost constraints.',
    );
    expect(text).toContain('## Programming & Runtimes');
    expect(text).toContain(
      '- [Promises: Resolution, Chaining, and Failure](https://thucde.dev/learn/docs/programming/async/promises.md): Reason about Promise states, chaining, microtask timing, and unhandled rejection semantics.',
    );
  });
});
