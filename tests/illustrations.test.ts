import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { atlasIllustrationMedia } from '../components/mdx/atlas-illustration-runtime';

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

  test('every referenced Atlas illustration resolves to a registered medium', () => {
    const failures = lessonPairs.flatMap((basePath) =>
      illustrationIds(readLesson(basePath, 'en')).flatMap((id) =>
        id in atlasIllustrationMedia ? [] : [`${basePath} references unknown illustration ${id}`],
      ),
    );

    expect(failures).toEqual([]);
  });

  test('uses the approved first-generation static/programmatic allocation', () => {
    const definitions = Object.values(atlasIllustrationMedia);
    const staticDefinitions = definitions.filter(
      (definition) => definition.kind === 'static-image',
    );

    expect(definitions).toHaveLength(31);
    expect(staticDefinitions).toHaveLength(12);
  });

  test('static teaching images have accessible shared repository assets', () => {
    const staticDefinitions = Object.entries(atlasIllustrationMedia).filter(
      ([, definition]) => definition.kind === 'static-image',
    );

    const failures = staticDefinitions.flatMap(([id, definition]) => {
      if (definition.kind !== 'static-image') return [];

      const problems: string[] = [];
      if (!/^\/illustrations\/.+\.(?:webp|svg)$/.test(definition.asset)) {
        problems.push(`${id} has invalid asset path ${definition.asset}`);
      }
      if (!definition.asset.match(new RegExp(`/${id}\\.(?:webp|svg)$`))) {
        problems.push(`${id} asset filename does not match its semantic ID`);
      }
      if (
        !definition.title.en.trim() ||
        !definition.title.vi.trim() ||
        !definition.caption.en.trim() ||
        !definition.caption.vi.trim() ||
        !definition.description.en.trim() ||
        !definition.description.vi.trim()
      ) {
        problems.push(`${id} is missing localized title, caption, or accessible description`);
      }

      const assetPath = path.join(process.cwd(), 'public', definition.asset);
      if (!existsSync(assetPath)) {
        problems.push(`${id} asset does not exist at public${definition.asset}`);
        return problems;
      }

      const size = statSync(assetPath).size;
      if (definition.asset.endsWith('.webp') && size > 300 * 1024) {
        problems.push(`${id} raster asset exceeds the 300 KB target`);
      }

      if (definition.asset.endsWith('.svg')) {
        if (size > 100 * 1024) {
          problems.push(`${id} vector asset exceeds the 100 KB target`);
        }
        const source = readFileSync(assetPath, 'utf8');
        if (!source.includes('viewBox="0 0 1600 900"')) {
          problems.push(`${id} vector asset must use the 1600x900 teaching canvas`);
        }
        if (/<(?:text|foreignObject|script)\b/i.test(source)) {
          problems.push(`${id} vector asset contains embedded text or executable content`);
        }
        if (/(?:href|xlink:href)=["']https?:/i.test(source)) {
          problems.push(`${id} vector asset references an external resource`);
        }
      }

      return problems;
    });

    expect(failures).toEqual([]);
  });
});
