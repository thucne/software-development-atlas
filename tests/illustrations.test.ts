import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

const lessonPairs = [
  'content/docs/programming/async/avoiding-sequential-async-waterfalls',
  'content/docs/programming/async/how-the-browser-event-loop-works',
  'content/docs/programming/async/promises',
  'content/docs/web-platform/http-request-lifecycle',
  'content/docs/engineering-judgment/decision-guides/containers-vs-serverless',
  'content/docs/engineering-judgment/decision-guides/csr-vs-ssr-vs-ssg',
  'content/docs/engineering-judgment/decision-guides/monolith-vs-modular-monolith-vs-microservices',
  'content/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout',
] as const;

function readLesson(basePath: string, locale: 'en' | 'vi') {
  const suffix = locale === 'vi' ? '.vi.mdx' : '.mdx';
  return readFileSync(path.join(process.cwd(), `${basePath}${suffix}`), 'utf8');
}

function illustrationIds(source: string) {
  return [...source.matchAll(/<AtlasIllustration\s+id="([^"]+)"/g)].map(
    (match) => match[1],
  );
}

function sortedUnique(ids: string[]) {
  return [...new Set(ids)].sort();
}

describe('substantive lesson illustrations', () => {
  test('published lessons contain real illustrations instead of authoring placeholders', () => {
    const failures = lessonPairs.flatMap((basePath) =>
      (['en', 'vi'] as const).flatMap((locale) => {
        const source = readLesson(basePath, locale);
        const hasPlaceholder =
          source.includes('Illustration Placeholder') ||
          source.includes('*Illustration prompt:*') ||
          source.includes('*Illustration description:*') ||
          source.includes('*Mô tả hình minh họa:*');

        return hasPlaceholder ? [`${basePath} (${locale})`] : [];
      }),
    );

    expect(failures).toEqual([]);
  });

  test('English and Vietnamese companions use the same illustration concepts', () => {
    const failures = lessonPairs.flatMap((basePath) => {
      const enIds = illustrationIds(readLesson(basePath, 'en'));
      const viIds = illustrationIds(readLesson(basePath, 'vi'));

      if (enIds.length < 3) {
        return [`${basePath} has only ${enIds.length} English illustrations`];
      }

      return JSON.stringify(sortedUnique(enIds)) ===
        JSON.stringify(sortedUnique(viIds))
        ? []
        : [`${basePath} illustration IDs differ between locales`];
    });

    expect(failures).toEqual([]);
  });
});
