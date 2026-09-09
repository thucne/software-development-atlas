import { i18n, i18nUI } from '@/lib/i18n';
import { loader } from 'fumadocs-core/source';
import { describe, expect, it } from 'vitest';

describe('Bilingual i18n infrastructure', () => {
  it('defines valid i18n configuration', () => {
    expect(i18n.defaultLanguage).toBe('en');
    expect(i18n.languages).toEqual(['en', 'vi']);
  });

  it('provides UI translations for en and vi', () => {
    const enProvider = i18nUI.provider('en');
    expect(enProvider.locale).toBe('en');
    expect(enProvider.locales).toEqual([
      { locale: 'en', name: 'English' },
      { locale: 'vi', name: 'Tiếng Việt' },
    ]);

    const viProvider = i18nUI.provider('vi');
    expect(viProvider.locale).toBe('vi');
    expect(viProvider.translations?.['Search(search trigger)']).toBe('Tìm kiếm');
  });

  it('loader supports i18n and generates correct language pages', () => {
    const testSource = loader({
      baseUrl: '/docs',
      source: {
        files: [
          {
            type: 'page',
            path: 'programming/async/promises.mdx',
            slugs: ['programming', 'async', 'promises'],
            data: {
              title: 'Promises: State, Chaining, and Combinators',
              description: 'English description',
              concepts: ['promises'],
            },
          },
          {
            type: 'page',
            path: 'programming/async/promises.vi.mdx',
            slugs: ['programming', 'async', 'promises'],
            data: {
              title: 'Promises: Trạng thái, Chuỗi và Combinators',
              description: 'Vietnamese description',
              concepts: ['promises'],
            },
          },
        ],
      },
      i18n,
    });

    const languages = testSource.getLanguages();
    expect(languages.map((l) => l.language)).toEqual(['en', 'vi']);

    const enPage = testSource.getPage(['programming', 'async', 'promises'], 'en');
    expect(enPage).toBeDefined();
    expect(enPage?.data.title).toBe('Promises: State, Chaining, and Combinators');
    expect(enPage?.url).toBe('/docs/programming/async/promises');

    const viPage = testSource.getPage(['programming', 'async', 'promises'], 'vi');
    expect(viPage).toBeDefined();
    expect(viPage?.data.title).toBe('Promises: Trạng thái, Chuỗi và Combinators');
    expect(viPage?.url).toBe('/vi/docs/programming/async/promises');

    // Page tree provides language-specific root
    const enTree = testSource.getPageTree('en');
    const viTree = testSource.getPageTree('vi');
    expect(enTree).toBeDefined();
    expect(viTree).toBeDefined();
  });
});
