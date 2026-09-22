import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(path.join(root, relativePath), 'utf8');

const lessons = [
  {
    slug: 'de-overengineering-frontend',
    en: 'content/docs/frontend-engineering/de-overengineering-frontend.mdx',
    vi: 'content/docs/frontend-engineering/de-overengineering-frontend.vi.mdx',
    concepts: [
      'frontend-modernization',
      'coupling-and-cohesion',
      'modularity',
      'component-boundaries',
    ],
  },
  {
    slug: 'incremental-frontend-migration',
    en: 'content/docs/frontend-engineering/incremental-frontend-migration.mdx',
    vi: 'content/docs/frontend-engineering/incremental-frontend-migration.vi.mdx',
    concepts: [
      'frontend-modernization',
      'modularity',
      'component-boundaries',
      'deployment-strategies',
    ],
  },
  {
    slug: 'legacy-frontend-safety-nets',
    en: 'content/docs/frontend-engineering/legacy-frontend-safety-nets.mdx',
    vi: 'content/docs/frontend-engineering/legacy-frontend-safety-nets.vi.mdx',
    concepts: [
      'frontend-modernization',
      'test-strategy',
      'end-to-end-testing',
      'contract-testing',
      'logs-metrics-traces',
    ],
  },
] as const;

function lesson(relativePath: string) {
  const absolute = path.join(root, relativePath);
  expect(existsSync(absolute), relativePath).toBe(true);
  return readFileSync(absolute, 'utf8');
}

describe('frontend modernization migration and safety', () => {
  it('publishes the three bilingual lessons after the foundation sequence', () => {
    for (const relativePath of [
      'content/docs/frontend-engineering/meta.json',
      'content/docs/frontend-engineering/meta.vi.json',
    ]) {
      const pages = JSON.parse(read(relativePath)).pages as string[];
      const start = pages.indexOf('de-overengineering-frontend');

      expect(pages.slice(start, start + 3), relativePath).toEqual([
        'de-overengineering-frontend',
        'incremental-frontend-migration',
        'legacy-frontend-safety-nets',
      ]);

      expect(pages.indexOf('redux-everywhere')).toBeLessThan(start);
    }
  });

  it('keeps EN/VI metadata, concepts, and teaching contracts aligned', () => {
    for (const item of lessons) {
      for (const relativePath of [item.en, item.vi]) {
        const source = lesson(relativePath);

        expect(source).toContain('category: frontend-engineering');
        expect(source).toContain('lastVerified: 2026-09-22');
        expect(source).toMatch(/contentType: (deep-dive|field-guide)/);
        expect(source).toContain('learningDepth: operate');

        for (const concept of item.concepts) {
          expect(source, `${relativePath}: ${concept}`).toContain(
            `  - ${concept}`,
          );
        }

        const termBoxes = (source.match(/<TermBox/g) ?? []).length;
        expect(termBoxes).toBeGreaterThanOrEqual(2);
        expect(termBoxes).toBeLessThanOrEqual(3);
        expect((source.match(/```mermaid/g) ?? []).length).toBeGreaterThanOrEqual(3);
        expect(source).toContain('<details>');
        expect(source).toContain('- [ ]');
        expect(source).not.toMatch(/TODO|TBD|PLACEHOLDER/i);
      }
    }
  });

  it('teaches the core migration risks instead of framework-only mechanics', () => {
    const simplify = lesson(lessons[0].en);
    expect(simplify).toMatch(/change locality/i);
    expect(simplify).toMatch(/wrapper/i);
    expect(simplify).toMatch(/duplication/i);
    expect(simplify).toMatch(/provider/i);

    const migration = lesson(lessons[1].en);
    expect(migration).toMatch(/vertical slice/i);
    expect(migration).toMatch(/Strangler Fig/i);
    expect(migration).toMatch(/feature flag/i);
    expect(migration).toMatch(/rollback/i);
    expect(migration).toMatch(/delet/i);

    const safety = lesson(lessons[2].en);
    expect(safety).toMatch(/characterization test/i);
    expect(safety).toMatch(/critical browser journeys?/i);
    expect(safety).toMatch(/contract/i);
    expect(safety).toMatch(/telemetry/i);
    expect(safety).toMatch(/rollback/i);
    expect(safety).toMatch(/trace/i);
  });

  it('anchors all three lessons in production consequences', () => {
    for (const item of lessons) {
      const en = lesson(item.en);
      const vi = lesson(item.vi);

      expect(en).toContain('**Impact:**');
      expect(en).toContain('**Root cause:**');
      expect(en).toContain('**Correct pattern:**');

      expect(vi).toContain('**Hậu quả:**');
      expect(vi).toContain('**Nguyên nhân cốt lõi:**');
      expect(vi).toContain('**Cách khắc phục chuẩn:**');
    }
  });

  it('records the phase-two routes in the rolling changelog', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain(
      'September 22, 2026 · Frontend Modernization Migration & Safety',
    );
    expect(vi).toContain(
      'Ngày 22 tháng 09 năm 2026 · Migration & Safety cho Modernization Frontend',
    );

    for (const item of lessons) {
      expect(en).toContain(`](/docs/frontend-engineering/${item.slug})`);
      expect(vi).toContain(`](/vi/docs/frontend-engineering/${item.slug})`);
    }
  });
});
