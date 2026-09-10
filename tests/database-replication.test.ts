import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/data-systems/database-replication.mdx',
  vi: 'content/docs/data-systems/database-replication.vi.mdx',
} as const;

describe('Database Replication lesson', () => {
  it('publishes replication after MVCC in both Data Systems sidebars', () => {
    for (const relativePath of [
      'content/docs/data-systems/meta.json',
      'content/docs/data-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const mvcc = source.indexOf('"mvcc"');
      const replication = source.indexOf('"database-replication"');

      expect(mvcc, relativePath).toBeGreaterThan(-1);
      expect(replication, relativePath).toBeGreaterThan(mvcc);
    }
  });

  it('places both locale variants on the canonical replication concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - database-replication\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-10');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches replication lag, consistency contracts, failover, slots, and standby conflicts', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/WAL/i);
      expect(source, relativePath).toMatch(/streaming replication/i);
      expect(source, relativePath).toMatch(/asynchronous|bất đồng bộ|async/i);
      expect(source, relativePath).toMatch(/synchronous|đồng bộ|sync/i);
      expect(source, relativePath).toMatch(/replication lag|độ trễ replication|lag/i);
      expect(source, relativePath).toMatch(/read-after-write/i);
      expect(source, relativePath).toMatch(/replication slot/i);
      expect(source, relativePath).toMatch(/hot standby/i);
      expect(source, relativePath).toMatch(/hot_standby_feedback/i);
      expect(source, relativePath).toMatch(/failover/i);
      expect(source, relativePath).toMatch(/fenc|STONITH|split-brain/i);
      expect(source, relativePath).toMatch(/remote_apply/i);
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
      expect(source, relativePath).toContain('26');
      expect(source, relativePath).toContain('/data-systems/mvcc');
      expect(source, relativePath).toContain('/data-systems/database-replication');
      expect(source, relativePath).toContain('/data-systems/data-partitioning');
      expect(source, relativePath).toContain('/data-systems/in-memory-data-stores');
      expect(source, relativePath).toContain('/data-systems/search-indexes');
    }

    const banner = read('components/atlas/release-banner.tsx');
    expect(banner).toContain('26 bài học kiến trúc hệ thống');
    expect(banner).toContain('26 new system architecture lessons');
  });
});
