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
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
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
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = canonicalUrl(path);

  return {
    title,
    description,
    authors: [author],
    creator: atlasMaintainer.name,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      locale: 'en_US',
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
