import type { ContentPlacement } from '@/lib/content/coverage';
import { source } from '@/lib/source';

export function getContentPlacements(): ContentPlacement[] {
  return source.getPages('en').map((page) => ({
    title: page.data.title,
    url: page.url,
    concepts: page.data.concepts,
  }));
}
