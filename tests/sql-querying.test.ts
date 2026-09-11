import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/data-systems/sql-querying.mdx',
  vi: 'content/docs/data-systems/sql-querying.vi.mdx',
} as const;

describe('SQL Querying lesson', () => {
  it('publishes the lesson after relational modeling and before query-plan optimization', () => {
    for (const relativePath of [
      'content/docs/data-systems/meta.json',
      'content/docs/data-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const relational = source.indexOf('"relational-data-model"');
      const querying = source.indexOf('"sql-querying"');
      const indexes = source.indexOf('"database-indexes-and-query-plans"');

      expect(relational, relativePath).toBeGreaterThan(-1);
      expect(querying, relativePath).toBeGreaterThan(relational);
      expect(querying, relativePath).toBeLessThan(indexes);
    }
  });

  it('places both variants on the canonical SQL querying concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - sql-querying\n---/);
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches query semantics before optimization mechanics', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/SELECT/i);
      expect(source, relativePath).toMatch(/FROM/i);
      expect(source, relativePath).toMatch(/WHERE/i);
      expect(source, relativePath).toMatch(/JOIN/i);
      expect(source, relativePath).toMatch(/GROUP BY/i);
      expect(source, relativePath).toMatch(/HAVING/i);
      expect(source, relativePath).toMatch(/NULL/i);
      expect(source, relativePath).toMatch(/three-valued|ba giá trị/i);
      expect(source, relativePath).toMatch(/ORDER BY/i);
      expect(source, relativePath).toMatch(/LIMIT/i);
      expect(source, relativePath).toMatch(/cursor|keyset/i);
      expect(source, relativePath).toMatch(/CTE/i);
      expect(source, relativePath).toMatch(/subquer|truy vấn con/i);
      expect(source, relativePath).toMatch(/parameter|tham số hóa/i);
      expect(source, relativePath).toMatch(/EXPLAIN/i);
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

      expect(source, relativePath).toContain('30');
      expect(source, relativePath).toContain('/data-systems/relational-data-model');
      expect(source, relativePath).toContain('/data-systems/sql-querying');
      expect(source, relativePath).toContain('/data-systems/database-indexes-and-query-plans');
      expect(source, relativePath).toContain('/data-systems/mvcc');
      expect(source, relativePath).toContain('/data-systems/database-replication');
      expect(source, relativePath).toContain('/data-systems/data-partitioning');
      expect(source, relativePath).toContain('/data-systems/in-memory-data-stores');
      expect(source, relativePath).toContain('/data-systems/search-indexes');
      expect(source, relativePath).toContain('/data-systems/object-storage');
    }

    const banner = read('components/atlas/release-banner.tsx');
    expect(banner).toContain('30 bài học kiến trúc hệ thống');
    expect(banner).toContain('30 new system architecture lessons');
  });
});
