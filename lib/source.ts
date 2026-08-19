import { lessonFrontmatterSchema } from '@/lib/content/schema';
import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: lessonFrontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});
