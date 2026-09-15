import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/distributed-systems/retries-and-backoff.mdx',
  vi: 'content/docs/distributed-systems/retries-and-backoff.vi.mdx',
} as const;

describe('Retries and Backoff lesson', () => {
  it('publishes after Timeouts while keeping the legacy combined slug out of navigation', () => {
    for (const relativePath of [
      'content/docs/distributed-systems/meta.json',
      'content/docs/distributed-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const timeouts = source.indexOf('"timeouts"');
      const retries = source.indexOf('"retries-and-backoff"');
      expect(timeouts, relativePath).toBeGreaterThan(-1);
      expect(retries, relativePath).toBeGreaterThan(timeouts);
      expect(source, relativePath).not.toContain('"timeouts-retries-and-backoff"');
    }
  });

  it('places both locale variants on the canonical concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - retries-and-backoff\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-15');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches retry safety, load control, ownership, and observability', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/transient|tạm thời/i);
      expect(source, relativePath).toMatch(/deterministic|không tự hết|không đổi.*retry/i);
      expect(source, relativePath).toMatch(/idempotenc|idempotent|reconciliation|đối soát/i);
      expect(source, relativePath).toMatch(/remaining deadline|retry budget|deadline còn lại|ngân sách retry/i);
      expect(source, relativePath).toMatch(/exponential backoff/i);
      expect(source, relativePath).toMatch(/jitter/i);
      expect(source, relativePath).toMatch(/Retry-After|server hint|gợi ý.*server/i);
      expect(source, relativePath).toMatch(/retry owner|ownership|chủ sở hữu retry|quyền sở hữu retry/i);
      expect(source, relativePath).toMatch(/3.*3.*3.*27|retry amplification|khuếch đại retry/i);
      expect(source, relativePath).toMatch(/retry storm|feedback loop|bão retry|vòng lặp khuếch đại/i);
      expect(source, relativePath).toMatch(/token bucket|retry budget|ngân sách retry/i);
      expect(source, relativePath).toMatch(/original request|attempt count|retry reason|exhausted|request gốc|số attempt|lý do retry|cạn budget/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
