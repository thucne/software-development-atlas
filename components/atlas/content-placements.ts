import type { ContentPlacement } from '@/lib/content/coverage';
import { source } from '@/lib/source';

export function getContentPlacements(locale: string = 'en'): ContentPlacement[] {
  if (locale === 'vi') {
    const viPages = source.getPages('vi');
    const viPageMap = new Map(viPages.map((p) => [p.slugs.join('/'), p]));

    return source.getPages('en').map((enPage) => {
      const viPage = viPageMap.get(enPage.slugs.join('/'));
      return {
        title: viPage ? viPage.data.title : enPage.data.title,
        url: viPage ? viPage.url : enPage.url,
        concepts: enPage.data.concepts,
      };
    });
  }

  return source.getPages('en').map((page) => ({
    title: page.data.title,
    url: page.url,
    concepts: page.data.concepts,
  }));
}
