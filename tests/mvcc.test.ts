import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/data-systems/mvcc.mdx',
  vi: 'content/docs/data-systems/mvcc.vi.mdx',
} as const;

describe('MVCC lesson', () => {
  it('publishes MVCC after transactions and isolation in both Data Systems sidebars', () => {
    for (const relativePath of [
      'content/docs/data-systems/meta.json',
      'content/docs/data-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const transactions = source.indexOf('"database-transactions-and-isolation"');
      const mvcc = source.indexOf('"mvcc"');

      expect(transactions, relativePath).toBeGreaterThan(-1);
      expect(mvcc, relativePath).toBeGreaterThan(transactions);
    }
  });

  it('places both locale variants on only the canonical MVCC concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - mvcc\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-10');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches versions, snapshots, visibility, isolation interaction, cleanup, and operational consequences', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/MVCC|multiversion/i);
      expect(source, relativePath).toMatch(/snapshot/i);
      expect(source, relativePath).toMatch(/row version|tuple version|phiên bản row|phiên bản tuple/i);
      expect(source, relativePath).toMatch(/visibility|visible|khả kiến|nhìn thấy/i);
      expect(source, relativePath).toMatch(/Read Committed/i);
      expect(source, relativePath).toMatch(/Repeatable Read/i);
      expect(source, relativePath).toMatch(/VACUUM/i);
      expect(source, relativePath).toMatch(/dead tuple|dead row|row version cũ|tuple cũ/i);
      expect(source, relativePath).toMatch(/long-running transaction|transaction chạy lâu/i);
      expect(source, relativePath).toMatch(/wraparound/i);
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
      expect(source, relativePath).toContain('23');
      expect(source, relativePath).toContain('/data-systems/mvcc');
      expect(source, relativePath).toContain('/data-systems/database-replication');
    }

    const banner = read('components/atlas/release-banner.tsx');
    expect(banner).toContain('23 bài học kiến trúc hệ thống');
    expect(banner).toContain('23 new system architecture lessons');
  });
});
