import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/data-systems/search-indexes.mdx',
  vi: 'content/docs/data-systems/search-indexes.vi.mdx',
} as const;

describe('Search Indexes lesson', () => {
  it('publishes after In-Memory Data Stores in both Data Systems sidebars', () => {
    for (const relativePath of [
      'content/docs/data-systems/meta.json',
      'content/docs/data-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const inMemory = source.indexOf('"in-memory-data-stores"');
      const search = source.indexOf('"search-indexes"');

      expect(inMemory, relativePath).toBeGreaterThan(-1);
      expect(search, relativePath).toBeGreaterThan(inMemory);
    }
  });

  it('places both locale variants on only the canonical search-indexes concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - search-indexes\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-10');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches inverted indexes, analysis, relevance, freshness, and reindexing contracts', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/inverted index|chỉ mục đảo/i);
      expect(source, relativePath).toMatch(/analy[sz]er|bộ phân tích/i);
      expect(source, relativePath).toMatch(/token/i);
      expect(source, relativePath).toMatch(/text`?\s+field|trường text/i);
      expect(source, relativePath).toMatch(/keyword`?\s+field|trường keyword/i);
      expect(source, relativePath).toMatch(/match`?\s+query/i);
      expect(source, relativePath).toMatch(/BM25/i);
      expect(source, relativePath).toMatch(/refresh/i);
      expect(source, relativePath).toMatch(/near.?real.?time|gần thời gian thực|NRT/i);
      expect(source, relativePath).toMatch(/source of truth|nguồn sự thật/i);
      expect(source, relativePath).toMatch(/reindex/i);
      expect(source, relativePath).toMatch(/alias/i);
      expect(source, relativePath).toMatch(/stale|staleness|cũ|độ trễ/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('keeps the bilingual September release ledger and banner current', () => {
    for (const relativePath of [
      'content/docs/start-here/changelog.mdx',
      'content/docs/start-here/changelog.vi.mdx',
    ]) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('33');
      expect(source, relativePath).toContain('/data-systems/in-memory-data-stores');
      expect(source, relativePath).toContain('/data-systems/search-indexes');
      expect(source, relativePath).toContain('/data-systems/object-storage');
    }

    const banner = read('components/atlas/release-banner.tsx');
    expect(banner).toContain('33 bài học kiến trúc hệ thống');
    expect(banner).toContain('33 new system architecture lessons');
  });
});
