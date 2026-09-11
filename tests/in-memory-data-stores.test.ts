import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/data-systems/in-memory-data-stores.mdx',
  vi: 'content/docs/data-systems/in-memory-data-stores.vi.mdx',
} as const;

describe('In-Memory Data Stores lesson', () => {
  it('publishes the lesson after Partitioning & Sharding in both Data Systems sidebars', () => {
    for (const relativePath of [
      'content/docs/data-systems/meta.json',
      'content/docs/data-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const partitioning = source.indexOf('"data-partitioning"');
      const inMemory = source.indexOf('"in-memory-data-stores"');

      expect(partitioning, relativePath).toBeGreaterThan(-1);
      expect(inMemory, relativePath).toBeGreaterThan(partitioning);
    }
  });

  it('places both locale variants on only the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - in-memory-data-stores\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-10');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches memory, eviction, expiry, persistence, replication, hot keys, and failure contracts', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/in-memory|bộ nhớ|RAM/i);
      expect(source, relativePath).toMatch(/working set|tập dữ liệu nóng/i);
      expect(source, relativePath).toMatch(/source of truth|nguồn sự thật/i);
      expect(source, relativePath).toMatch(/cache/i);
      expect(source, relativePath).toMatch(/eviction|maxmemory/i);
      expect(source, relativePath).toMatch(/TTL|expire|expiration|hết hạn/i);
      expect(source, relativePath).toMatch(/RDB/i);
      expect(source, relativePath).toMatch(/AOF/i);
      expect(source, relativePath).toMatch(/persistence|durability|bền vững/i);
      expect(source, relativePath).toMatch(/replication/i);
      expect(source, relativePath).toMatch(/hot key/i);
      expect(source, relativePath).toMatch(/shard|hash slot/i);
      expect(source, relativePath).toMatch(/stampede|thundering herd|dogpile/i);
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
      expect(source, relativePath).toContain('29');
      expect(source, relativePath).toContain('/data-systems/data-partitioning');
      expect(source, relativePath).toContain('/data-systems/in-memory-data-stores');
      expect(source, relativePath).toContain('/data-systems/search-indexes');
      expect(source, relativePath).toContain('/data-systems/object-storage');
    }

    const banner = read('components/atlas/release-banner.tsx');
    expect(banner).toContain('29 bài học kiến trúc hệ thống');
    expect(banner).toContain('29 new system architecture lessons');
  });
});
