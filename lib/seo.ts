import { atlasMaintainer } from '@/lib/site-metadata';
import type { Metadata, MetadataRoute } from 'next';

const siteOrigin = 'https://thucde.dev';
const sitePath = '/learn';

export const atlasSeo = {
  siteName: 'Software Development Atlas',
  siteDescription:
    'A personal learning atlas for modern software engineering, with clear lessons, practical examples, learning paths, and engineering judgment.',
  siteOrigin,
  siteUrl: `${siteOrigin}${sitePath}`,
  ogImage: {
    url: `${siteOrigin}${sitePath}/og/software-development-atlas`,
    width: 1200,
    height: 630,
    alt: 'Software Development Atlas — a personal learning atlas for modern software engineering',
  },
  keywords: [
    'software engineering',
    'software development',
    'programming',
    'system design',
    'web platform',
    'backend engineering',
    'DevOps',
    'JavaScript',
    'engineering judgment',
    'software engineering learning',
  ],
} as const;

function normalizePath(path: string) {
  if (!path || path === '/') return '';
  return `/${path.replace(/^\/+|\/+$/g, '')}`;
}

export function canonicalUrl(path: string) {
  return `${atlasSeo.siteUrl}${normalizePath(path)}`;
}

const author = {
  name: atlasMaintainer.name,
  url: atlasMaintainer.githubUrl,
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(atlasSeo.siteOrigin),
  title: {
    default: atlasSeo.siteName,
    template: `%s | ${atlasSeo.siteName}`,
  },
  description: atlasSeo.siteDescription,
  applicationName: atlasSeo.siteName,
  authors: [author],
  creator: atlasMaintainer.name,
  publisher: atlasMaintainer.name,
  keywords: [...atlasSeo.keywords],
  category: 'technology',
  alternates: {
    canonical: atlasSeo.siteUrl,
    languages: {
      en: atlasSeo.siteUrl,
      vi: `${atlasSeo.siteUrl}/vi/docs`,
      'x-default': atlasSeo.siteUrl,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['vi_VN'],
    siteName: atlasSeo.siteName,
    url: atlasSeo.siteUrl,
    title: atlasSeo.siteName,
    description: atlasSeo.siteDescription,
    images: [atlasSeo.ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: atlasSeo.siteName,
    description: atlasSeo.siteDescription,
    images: [atlasSeo.ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function createPageMetadata({
  title,
  description,
  path,
  locale,
}: {
  title: string;
  description: string;
  path: string;
  locale?: 'en' | 'vi';
}): Metadata {
  const effectiveLocale = locale ?? (path.startsWith('/vi') ? 'vi' : 'en');
  let enPath: string;
  let viPath: string;

  if (path.startsWith('/vi/docs')) {
    enPath = path.replace(/^\/vi\/docs/, '/docs');
    viPath = path;
  } else if (path.startsWith('/docs')) {
    enPath = path;
    viPath = path.replace(/^\/docs/, '/vi/docs');
  } else if (path.startsWith('/vi')) {
    enPath = path.replace(/^\/vi/, '') || '/';
    viPath = path;
  } else {
    enPath = path;
    viPath = path === '/' || path === '' ? '/vi' : `/vi${path}`;
  }

  const url = canonicalUrl(path);

  return {
    title,
    description,
    authors: [author],
    creator: atlasMaintainer.name,
    alternates: {
      canonical: url,
      languages: {
        en: canonicalUrl(enPath),
        vi: canonicalUrl(viPath),
        'x-default': canonicalUrl(enPath),
      },
    },
    openGraph: {
      type: 'article',
      locale: effectiveLocale === 'vi' ? 'vi_VN' : 'en_US',
      alternateLocale: effectiveLocale === 'vi' ? ['en_US'] : ['vi_VN'],
      siteName: atlasSeo.siteName,
      url,
      title,
      description,
      images: [atlasSeo.ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [atlasSeo.ogImage.url],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export type JsonLdPageInput = {
  url: string;
  data: {
    title: string;
    description: string;
    lastVerified?: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | string;
    category?: string;
    topics?: string[];
  };
};

export function createJsonLdArticle(
  page: JsonLdPageInput,
  locale: 'en' | 'vi' = 'en',
) {
  const url = canonicalUrl(page.url);
  const homeUrl = canonicalUrl(locale === 'vi' ? '/vi/docs' : '/docs');
  const homeName = locale === 'vi' ? 'Trang chủ Atlas' : 'Atlas Home';

  const breadcrumbElements: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: homeName,
      item: homeUrl,
    },
  ];

  if (page.data.category && page.data.category !== 'start-here') {
    const categorySegment = page.data.category;
    const categoryTitle = categorySegment
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const categoryUrl = canonicalUrl(
      locale === 'vi' ? `/vi/docs/${categorySegment}` : `/docs/${categorySegment}`,
    );

    breadcrumbElements.push({
      '@type': 'ListItem',
      position: 2,
      name: categoryTitle,
      item: categoryUrl,
    });

    breadcrumbElements.push({
      '@type': 'ListItem',
      position: 3,
      name: page.data.title,
      item: url,
    });
  } else {
    breadcrumbElements.push({
      '@type': 'ListItem',
      position: 2,
      name: page.data.title,
      item: url,
    });
  }

  const proficiencyMap: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Expert',
  };

  const article: Record<string, unknown> = {
    '@type': 'TechArticle',
    '@id': `${url}#article`,
    isPartOf: {
      '@type': 'WebSite',
      name: atlasSeo.siteName,
      url: atlasSeo.siteUrl,
    },
    headline: page.data.title,
    description: page.data.description,
    url,
    inLanguage: locale === 'vi' ? 'vi-VN' : 'en-US',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Person',
      name: atlasMaintainer.name,
      url: atlasMaintainer.githubUrl,
    },
    publisher: {
      '@type': 'Person',
      name: atlasMaintainer.name,
      url: atlasMaintainer.githubUrl,
    },
  };

  if (page.data.lastVerified) {
    article.dateModified = page.data.lastVerified;
  }

  if (page.data.level) {
    article.proficiencyLevel =
      proficiencyMap[page.data.level] ?? page.data.level;
  }

  if (page.data.category) {
    article.articleSection = page.data.category;
  }

  if (page.data.topics && page.data.topics.length > 0) {
    article.keywords = page.data.topics.join(', ');
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      article,
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbElements,
      },
    ],
  };
}

type SitemapPage = {
  url: string;
};

export function createSitemapEntries(
  pages: SitemapPage[],
): MetadataRoute.Sitemap {
  return pages.map((page) => ({
    url: canonicalUrl(page.url),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));
}
