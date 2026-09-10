import { lessonFrontmatterSchema } from '@/lib/content/schema';
import { i18n } from '@/lib/i18n';
import { loader, type LoaderPlugin } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { createElement, type ReactNode } from 'react';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: lessonFrontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

function atlasStatusBadgesPlugin(): LoaderPlugin {
  return {
    name: 'atlas:status-badges',
    transformPageTree: {
      file(node, filePath) {
        if (!filePath) return node;
        const file = this.storage.read(filePath);
        if (file?.format !== 'page' || !file.data) return node;

        const data = file.data as {
          badge?: 'new' | 'updated';
          lastVerified?: string;
          category?: string;
        };

        const isVi = filePath.endsWith('.vi.mdx') || filePath.includes('.vi.');
        const isNewRelease =
          data.lastVerified === '2026-09-10' && data.category !== 'start-here';
        const badgeType = data.badge ?? (isNewRelease ? 'new' : undefined);

        if (!badgeType) return node;

        const badgeText =
          badgeType === 'new'
            ? isVi
              ? 'Mới'
              : 'New'
            : isVi
              ? 'Cập nhật'
              : 'Updated';

        const badgeTone =
          badgeType === 'new'
            ? 'border-emerald-700/40 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/50 dark:text-emerald-300'
            : 'border-blue-700/40 bg-blue-50 text-blue-800 dark:border-blue-500/40 dark:bg-blue-950/50 dark:text-blue-300';

        const originalName = node.name as ReactNode;

        node.name = createElement(
          'span',
          { className: 'flex w-full items-center justify-between gap-1.5' },
          createElement('span', { className: 'truncate' }, originalName),
          createElement(
            'span',
            {
              'data-status': badgeType,
              className: `shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider leading-none ${badgeTone}`,
            },
            badgeText,
          ),
        );

        return node;
      },
    },
  };
}

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n,
  plugins: [atlasStatusBadgesPlugin()],
});
