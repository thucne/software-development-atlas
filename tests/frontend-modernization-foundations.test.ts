import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(path.join(root, relativePath), 'utf8');

const lessons = [
  {
    slug: 'legacy-frontend-assessment',
    en: 'content/docs/frontend-engineering/legacy-frontend-assessment.mdx',
    vi: 'content/docs/frontend-engineering/legacy-frontend-assessment.vi.mdx',
    concepts: ['frontend-modernization', 'software-supply-chain'],
  },
  {
    slug: 'react-modernization',
    en: 'content/docs/frontend-engineering/react-modernization.mdx',
    vi: 'content/docs/frontend-engineering/react-modernization.vi.mdx',
    concepts: ['frontend-modernization', 'component-boundaries'],
  },
  {
    slug: 'dependency-archaeology',
    en: 'content/docs/frontend-engineering/dependency-archaeology.mdx',
    vi: 'content/docs/frontend-engineering/dependency-archaeology.vi.mdx',
    concepts: [
      'frontend-modernization',
      'software-supply-chain',
      'frontend-bundle-performance',
    ],
  },
  {
    slug: 'redux-everywhere',
    en: 'content/docs/frontend-engineering/redux-everywhere.mdx',
    vi: 'content/docs/frontend-engineering/redux-everywhere.vi.mdx',
    concepts: [
      'frontend-modernization',
      'frontend-state-models',
      'frontend-data-fetching',
    ],
  },
] as const;

function lesson(relativePath: string) {
  const absolute = path.join(root, relativePath);
  expect(existsSync(absolute), relativePath).toBe(true);
  return readFileSync(absolute, 'utf8');
}

describe('frontend modernization foundations', () => {
  it('adds the durable frontend-modernization concept to the canonical map', () => {
    const map = JSON.parse(read('content/atlas-map.json'));
    const frontend = map.domains.find(
      (domain: { id: string }) => domain.id === 'frontend-engineering',
    );

    expect(frontend).toBeTruthy();
    expect(frontend.concepts).toContainEqual({
      id: 'frontend-modernization',
      title: 'Frontend Modernization',
      targetDepth: 'operate',
    });
  });

  it('publishes all four bilingual lessons in deliberate sidebar order', () => {
    for (const relativePath of [
      'content/docs/frontend-engineering/meta.json',
      'content/docs/frontend-engineering/meta.vi.json',
    ]) {
      const pages = JSON.parse(read(relativePath)).pages as string[];
      const start = pages.indexOf('legacy-frontend-assessment');

      expect(pages.slice(start, start + 4), relativePath).toEqual([
        'legacy-frontend-assessment',
        'react-modernization',
        'dependency-archaeology',
        'redux-everywhere',
      ]);
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
        expect(source).toContain('  - frontend-modernization');

        for (const concept of item.concepts) {
          expect(source, `${relativePath}: ${concept}`).toContain(
            `  - ${concept}`,
          );
        }

        const termBoxes = (source.match(/<TermBox/g) ?? []).length;
        expect(termBoxes).toBeGreaterThanOrEqual(2);
        expect(termBoxes).toBeLessThanOrEqual(3);

        expect((source.match(/\`\`\`mermaid/g) ?? []).length).toBeGreaterThanOrEqual(3);
        expect(source).toContain('<details>');
        expect(source).toContain('- [ ]');
        expect(source).not.toMatch(/TODO|TBD|PLACEHOLDER/i);
      }
    }
  });

  it('covers the core legacy-modernization failure modes', () => {
    const assessment = lesson(lessons[0].en);
    expect(assessment).toMatch(/dependency/i);
    expect(assessment).toMatch(/migration seam/i);
    expect(assessment).toMatch(/rollback/i);
    expect(assessment).toMatch(/characterization test/i);

    const react = lesson(lessons[1].en);
    expect(react).toMatch(/Strict Mode/i);
    expect(react).toMatch(/codemod/i);
    expect(react).toMatch(/compatibility island/i);
    expect(react).toMatch(/class component/i);

    const dependencies = lesson(lessons[2].en);
    expect(dependencies).toMatch(/peer dependency/i);
    expect(dependencies).toMatch(/prerelease/i);
    expect(dependencies).toMatch(/deprecated/i);
    expect(dependencies).toMatch(/reachability/i);

    const redux = lesson(lessons[3].en);
    expect(redux).toMatch(/Redux Toolkit/i);
    expect(redux).toMatch(/remote state/i);
    expect(redux).toMatch(/URL state/i);
    expect(redux).toMatch(/derived/i);
  });

  it('anchors every deep lesson in a production consequence', () => {
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

  it('records routes and current Atlas freshness', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 22, 2026 · Frontend Modernization Foundations');
    expect(vi).toContain('Ngày 22 tháng 09 năm 2026 · Nền tảng Modernization Frontend');

    for (const item of lessons) {
      expect(en).toContain(`](/docs/frontend-engineering/${item.slug})`);
      expect(vi).toContain(`](/vi/docs/frontend-engineering/${item.slug})`);
    }

    expect(read('lib/site-metadata.ts')).toContain(
      "atlasLastUpdated = '2026-09-22'",
    );
    expect(read('tests/e2e/docs-shell.spec.ts')).toContain(
      'Atlas last updated Sep 22, 2026',
    );
  });
});
