import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { atlasIllustrationDefinitions } from '../components/mdx/atlas-illustration';

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

function countVisualAnchors(source: string) {
  return (
    illustrationIds(source).length +
    [...source.matchAll(/```mermaid\b/g)].length +
    [...source.matchAll(/<DecisionMatrix\b/g)].length +
    [...source.matchAll(/<([A-Z][A-Za-z0-9]*(?:Lab|Explorer))\b/g)].length
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

      return JSON.stringify(sortedUnique(enIds)) ===
        JSON.stringify(sortedUnique(viIds))
        ? []
        : [`${basePath} illustration IDs differ between locales`];
    });

    expect(failures).toEqual([]);
  });

  test('substantive lessons keep meaningful visual cadence in both locales', () => {
    const failures = lessonPairs.flatMap((basePath) =>
      (['en', 'vi'] as const).flatMap((locale) => {
        const count = countVisualAnchors(readLesson(basePath, locale));
        return count >= 3 ? [] : [`${basePath} (${locale}) has only ${count} visual anchors`];
      }),
    );

    expect(failures).toEqual([]);
  });

  test('every referenced Atlas illustration resolves to a registered definition', () => {
    const failures = lessonPairs.flatMap((basePath) =>
      illustrationIds(readLesson(basePath, 'en')).flatMap((id) =>
        id in atlasIllustrationDefinitions ? [] : [`${basePath} references unknown illustration ${id}`],
      ),
    );

    expect(failures).toEqual([]);
  });

  test('static teaching images have accessible shared repository assets', () => {
    const staticDefinitions = Object.entries(atlasIllustrationDefinitions).filter(
      ([, definition]) => definition.kind === 'static-image',
    );

    const failures = staticDefinitions.flatMap(([id, definition]) => {
      if (definition.kind !== 'static-image') return [];

      const problems: string[] = [];
      if (!/^\/illustrations\/.+\.webp$/.test(definition.asset)) {
        problems.push(`${id} has invalid asset path ${definition.asset}`);
      }
      if (!definition.asset.endsWith(`/${id}.webp`)) {
        problems.push(`${id} asset filename does not match its semantic ID`);
      }
      if (!definition.description.en.trim() || !definition.description.vi.trim()) {
        problems.push(`${id} is missing a localized accessible description`);
      }
      if (!existsSync(path.join(process.cwd(), 'public', definition.asset))) {
        problems.push(`${id} asset does not exist at public${definition.asset}`);
      }
      return problems;
    });

    expect(failures).toEqual([]);
  });
});