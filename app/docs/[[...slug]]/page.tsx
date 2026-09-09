import { getMDXComponents } from '@/components/mdx';
import { withBasePath } from '@/lib/base-path';
import { getFreshnessState } from '@/lib/content/freshness';
import { source } from '@/lib/source';
import { atlasLastUpdated, atlasMaintainer } from '@/lib/site-metadata';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const freshness = getFreshnessState(
    page.data.lastVerified,
    page.data.reviewAfterDays,
  );
  // Fumadocs page-action helpers do not reliably apply Next.js `basePath`.
  const markdownUrl = withBasePath(`${page.url}.md`);
  const githubUrl =
    `https://github.com/thucne/software-development-atlas/edit/main/` +
    `content/docs/${page.path}`;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>

      <section
        aria-label="Content freshness"
        className="mt-4 space-y-2 rounded-lg border bg-fd-card p-3 text-sm"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-fd-muted-foreground">
          <span
            className={
              freshness.state === 'overdue'
                ? 'rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 font-medium text-red-700 dark:text-red-300'
                : freshness.state === 'due-soon'
                  ? 'rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-medium text-amber-800 dark:text-amber-300'
                  : 'rounded-full border px-2 py-0.5 font-medium text-fd-foreground'
            }
          >
            {page.data.status[0].toUpperCase() + page.data.status.slice(1)}
          </span>
          <span>Verified {formatDate(page.data.lastVerified)}</span>
          <span>Review target: {page.data.reviewAfterDays} days</span>
        </div>

        {freshness.state === 'due-soon' ? (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-900 dark:text-amber-200">
            Verification is due soon: {freshness.daysUntilReview} days remain in
            this lesson&apos;s review window.
          </p>
        ) : null}

        {freshness.state === 'overdue' ? (
          <p
            role="status"
            className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-800 dark:text-red-200"
          >
            Verification overdue by {Math.abs(freshness.daysUntilReview)} days.
            Some details may have changed since this lesson was last checked.
          </p>
        ) : null}
      </section>

      <div className="mt-4 border-b pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <a
            href={githubUrl}
            className="inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            Edit on GitHub
          </a>
          <ViewOptionsPopover
            markdownUrl={markdownUrl}
            githubUrl={githubUrl}
          />
        </div>
        <p className="mt-3 text-xs text-fd-muted-foreground">
          Personal learning atlas by{' '}
          <a
            href={atlasMaintainer.githubUrl}
            className="underline underline-offset-2"
          >
            {atlasMaintainer.name}
          </a>{' '}
          · Atlas last updated {formatDate(atlasLastUpdated)}
        </p>
      </div>

      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
