import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/distributed-systems/distributed-replication.mdx',
  vi: 'content/docs/distributed-systems/distributed-replication.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Distributed Replication lesson', () => {
  it('publishes immediately after Distributed Consistency in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/distributed-systems/meta.json',
      'content/docs/distributed-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const consistency = source.indexOf('"distributed-consistency"');
      const replication = source.indexOf('"distributed-replication"');
      expect(consistency, relativePath).toBeGreaterThan(-1);
      expect(replication, relativePath).toBeGreaterThan(consistency);
    }
  });

  it('places both locale variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - distributed-replication\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-17');

      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes, relativePath).toBeGreaterThanOrEqual(2);
      expect(termBoxes, relativePath).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches replication as a copy-and-authority protocol rather than a database-specific feature', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/replicat.*state|copies.*state|copy.*state|sao chép.*trạng thái|bản sao.*trạng thái/i);
      expect(source, relativePath).toMatch(/authoritative|writer|leader|nguồn.*quyền|writer|leader/i);
      expect(source, relativePath).toMatch(/log|ordered updates|thứ tự.*cập nhật|nhật ký/i);
      expect(source, relativePath).toMatch(/asynchronous|async|bất đồng bộ/i);
      expect(source, relativePath).toMatch(/synchronous|sync|đồng bộ/i);
      expect(source, relativePath).toMatch(/acknowledg|commit boundary|xác nhận|ranh giới.*commit/i);
      expect(source, relativePath).toMatch(/replica lag|replication lag|độ trễ.*replica|độ trễ.*sao chép/i);
      expect(source, relativePath).toMatch(/snapshot|catch[- ]?up|bootstrap|ảnh chụp|bắt kịp|khởi tạo/i);
      expect(source, relativePath).toMatch(/failover|promotion|promote|chuyển đổi dự phòng|thăng cấp/i);
      expect(source, relativePath).toMatch(/fenc|epoch|term|split[- ]brain|rào chắn|kỷ nguyên|nhiệm kỳ|hai.*leader/i);
      expect(source, relativePath).toMatch(/replication factor|fault domain|hệ số sao chép|miền lỗi/i);
      expect(source, relativePath).toMatch(/multi[- ]leader|multi[- ]writer|leaderless|conflict|nhiều writer|không leader|xung đột/i);
      expect(source, relativePath).toMatch(/anti[- ]entropy|read repair|reconcil|đối soát|hòa giải|sửa.*đọc/i);
      expect(source, relativePath).toMatch(/partitioning.*orthogonal|orthogonal.*partition|partitioning.*độc lập|phân vùng.*độc lập|sharding.*replication|replication.*sharding/i);
      expect(source, relativePath).toMatch(/consensus.*replication|replication.*consensus|đồng thuận.*sao chép|sao chép.*đồng thuận/i);
      expect(source, relativePath).toMatch(/database replication|database-specific|replication database|sao chép database|database.*sao chép/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('records the September 17 release in both locale changelogs', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 17, 2026');
    expect(en).toContain('[Distributed Replication](/docs/distributed-systems/distributed-replication)');
    expect(en).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);

    expect(vi).toContain('17 tháng 9, 2026');
    expect(vi).toContain('[Sao chép phân tán](/vi/docs/distributed-systems/distributed-replication)');
    expect(vi).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);
  });

  it('tracks the current Atlas maintenance footer date', () => {
    expect(read('lib/site-metadata.ts')).toContain("atlasLastUpdated = '2026-09-22'");
    expect(read('tests/e2e/docs-shell.spec.ts')).toContain('Atlas last updated Sep 22, 2026');
  });
});
