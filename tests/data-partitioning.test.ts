import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/data-systems/data-partitioning.mdx',
  vi: 'content/docs/data-systems/data-partitioning.vi.mdx',
} as const;

describe('Partitioning and Sharding lesson', () => {
  it('publishes after database replication in both Data Systems sidebars', () => {
    for (const relativePath of [
      'content/docs/data-systems/meta.json',
      'content/docs/data-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const replication = source.indexOf('"database-replication"');
      const partitioning = source.indexOf('"data-partitioning"');

      expect(replication, relativePath).toBeGreaterThan(-1);
      expect(partitioning, relativePath).toBeGreaterThan(replication);
    }
  });

  it('places both locale variants on only the canonical data-partitioning concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - data-partitioning\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-10');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches partitioning keys, pruning, sharding, hotspots, fan-out, and resharding trade-offs', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/partition key|khóa phân vùng/i);
      expect(source, relativePath).toMatch(/range partition|phân vùng theo range/i);
      expect(source, relativePath).toMatch(/list partition|phân vùng theo list/i);
      expect(source, relativePath).toMatch(/hash partition|phân vùng theo hash/i);
      expect(source, relativePath).toMatch(/partition pruning|pruning phân vùng|loại bỏ partition/i);
      expect(source, relativePath).toMatch(/shard key|khóa shard/i);
      expect(source, relativePath).toMatch(/hotspot|điểm nóng/i);
      expect(source, relativePath).toMatch(/fan.?out|scatter.?gather|quét nhiều shard/i);
      expect(source, relativePath).toMatch(/cross.?shard|liên shard/i);
      expect(source, relativePath).toMatch(/reshard|tái phân shard|di chuyển shard/i);
      expect(source, relativePath).toMatch(/unique|duy nhất/i);
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
      expect(source, relativePath).toContain('32');
      expect(source, relativePath).toContain('/data-systems/data-partitioning');
      expect(source, relativePath).toContain('/data-systems/in-memory-data-stores');
      expect(source, relativePath).toContain('/data-systems/search-indexes');
      expect(source, relativePath).toContain('/data-systems/object-storage');
    }

    const banner = read('components/atlas/release-banner.tsx');
    expect(banner).toContain('32 bài học kiến trúc hệ thống');
    expect(banner).toContain('32 new system architecture lessons');
  });
});
