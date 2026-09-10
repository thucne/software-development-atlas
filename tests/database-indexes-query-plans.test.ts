import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/data-systems/database-indexes-and-query-plans.mdx',
  vi: 'content/docs/data-systems/database-indexes-and-query-plans.vi.mdx',
} as const;

describe('Database Indexes & Query Plans lesson', () => {
  it('publishes the bilingual lesson in Data Systems navigation', () => {
    const rootMeta = read('content/docs/meta.json');
    const rootMetaVi = read('content/docs/meta.vi.json');
    const dataMeta = read('content/docs/data-systems/meta.json');
    const dataMetaVi = read('content/docs/data-systems/meta.vi.json');

    expect(rootMeta).toContain('"data-systems"');
    expect(rootMetaVi).toContain('"data-systems"');
    expect(dataMeta).toContain('"database-indexes-and-query-plans"');
    expect(dataMetaVi).toContain('"database-indexes-and-query-plans"');
  });

  it('places both language variants on the canonical operate-depth concepts', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toContain('  - database-indexes');
      expect(source, relativePath).toContain('  - query-plans');
    }
  });

  it('meets the Atlas teaching contract with active reasoning and production stakes', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toContain('<TermBox term=');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
