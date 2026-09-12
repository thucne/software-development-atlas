import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/distributed-systems/timeouts.mdx',
  vi: 'content/docs/distributed-systems/timeouts.vi.mdx',
} as const;

describe('Timeouts lesson', () => {
  it('publishes after Partial Failure and retires the combined legacy lesson from both sidebars', () => {
    for (const relativePath of [
      'content/docs/distributed-systems/meta.json',
      'content/docs/distributed-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const partialFailure = source.indexOf('"partial-failure"');
      const timeouts = source.indexOf('"timeouts"');

      expect(partialFailure, relativePath).toBeGreaterThan(-1);
      expect(timeouts, relativePath).toBeGreaterThan(partialFailure);
      expect(source, relativePath).not.toContain('"timeouts-retries-and-backoff"');
    }
  });

  it('places both locale variants on the canonical concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - timeouts\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-12');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches timeout operation from scope and budgets through cancellation and observability', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/timeout.*deadline|deadline.*timeout|timeout.*hạn chót|hạn chót.*timeout/i);
      expect(source, relativePath).toMatch(/connect|DNS|TLS|read|write|response headers|kết nối|đọc|ghi|header/i);
      expect(source, relativePath).toMatch(/remaining budget|remaining time|budget.*remaining|ngân sách.*còn lại|thời gian.*còn lại/i);
      expect(source, relativePath).toMatch(/propagat.*deadline|deadline propagation|truyền.*deadline|lan truyền.*hạn chót/i);
      expect(source, relativePath).toMatch(/SLO|latency distribution|percentile|tail latency|phân phối độ trễ|độ trễ đuôi/i);
      expect(source, relativePath).toMatch(/false timeout|false failure|timeout giả|lỗi giả/i);
      expect(source, relativePath).toMatch(/cancell.*(not|does not).*rollback|cancellation.*rollback|hủy.*không.*rollback|hủy.*không.*hoàn tác/i);
      expect(source, relativePath).toMatch(/fan-out|parallel dependenc|dependency song song|nhiều dependency/i);
      expect(source, relativePath).toMatch(/timeout stage|stage.*timeout|dependency.*latency|connect.*timeout|giai đoạn.*timeout|độ trễ.*dependency/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
