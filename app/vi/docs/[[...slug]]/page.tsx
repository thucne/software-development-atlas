import { EditOnGitHubButton } from '@/components/docs/edit-on-github-button';
import { getMDXComponents } from '@/components/mdx';
import { withBasePath } from '@/lib/base-path';
import { getFreshnessState } from '@/lib/content/freshness';
import { createPageMetadata } from '@/lib/seo';
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
  return new Intl.DateTimeFormat('vi-VN', {
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
  const page = source.getPage(slug, 'vi');
  if (!page) notFound();

  const MDX = page.data.body;
  const freshness = getFreshnessState(
    page.data.lastVerified,
    page.data.reviewAfterDays,
  );
  const markdownUrl = withBasePath(`${page.url}.md`);
  const aboutUrl = withBasePath('/docs/start-here/about');
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
        aria-label="Độ tin cậy nội dung"
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
            {page.data.status === 'evergreen'
              ? 'Bền vững'
              : page.data.status === 'evolving'
                ? 'Phát triển'
                : 'Tiên phong'}
          </span>
          <span>Đã xác minh: {formatDate(page.data.lastVerified)}</span>
          <span>Đánh giá lại: {page.data.reviewAfterDays} ngày</span>
        </div>

        {freshness.state === 'due-soon' ? (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-900 dark:text-amber-200">
            Sắp đến hạn đánh giá: còn {freshness.daysUntilReview} ngày trong chu kỳ đánh giá của bài học này.
          </p>
        ) : null}

        {freshness.state === 'overdue' ? (
          <p
            role="status"
            className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-800 dark:text-red-200"
          >
            Đã quá hạn đánh giá {Math.abs(freshness.daysUntilReview)} ngày. Một số chi tiết kỹ thuật có thể đã thay đổi.
          </p>
        ) : null}
      </section>

      <div className="mt-4 border-b pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <EditOnGitHubButton href={githubUrl} label="Chỉnh sửa trên GitHub" />
          <ViewOptionsPopover
            markdownUrl={markdownUrl}
            githubUrl={githubUrl}
          />
        </div>
        <p className="mt-3 text-xs text-fd-muted-foreground">
          Bản đồ học tập phát triển phần mềm bởi{' '}
          <a
            href={atlasMaintainer.githubUrl}
            className="underline underline-offset-2"
          >
            {atlasMaintainer.name}
          </a>{' '}
          ·{' '}
          <a href={aboutUrl} className="underline underline-offset-2">
            Về dự án Atlas
          </a>{' '}
          · Cập nhật lần cuối: {formatDate(atlasLastUpdated)}
        </p>
      </div>

      <DocsBody>
        <MDX components={getMDXComponents(undefined, 'vi')} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.getPages('vi').map((page) => ({
    slug: page.slugs,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const page = source.getPage(slug, 'vi');
  if (!page) notFound();

  return createPageMetadata({
    title: page.data.title,
    description: page.data.description,
    path: page.url,
  });
}
