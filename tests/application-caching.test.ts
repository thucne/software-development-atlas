import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/backend-engineering/application-caching.mdx',
  vi: 'content/docs/backend-engineering/application-caching.vi.mdx',
} as const;

describe('Application Caching lesson', () => {
  it('publishes the lesson after background jobs in the bilingual backend section', () => {
    for (const relativePath of [
      'content/docs/backend-engineering/meta.json',
      'content/docs/backend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const jobs = source.indexOf('"background-jobs"');
      const caching = source.indexOf('"application-caching"');

      expect(caching, relativePath).toBeGreaterThan(jobs);
    }
  });

  it('places both variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toContain('  - application-caching');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches cache ownership, freshness, invalidation, stampede control, negative caching, scope, and operations', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/cache-aside|đọc xuyên cache|cache đứng bên/i);
      expect(source, relativePath).toMatch(/source of truth|nguồn sự thật|nguồn dữ liệu chuẩn/i);
      expect(source, relativePath).toMatch(/cache key|khóa cache/i);
      expect(source, relativePath).toMatch(/TTL|time to live|thời gian sống/i);
      expect(source, relativePath).toMatch(/stale|staleness|dữ liệu cũ|độ cũ/i);
      expect(source, relativePath).toMatch(/invalidat|vô hiệu hóa/i);
      expect(source, relativePath).toMatch(/stampede|single-flight|dồn tải|bầy đàn/i);
      expect(source, relativePath).toMatch(/negative cach|cache.*không tồn tại|cache âm/i);
      expect(source, relativePath).toMatch(/process-local|in-process|shared cache|cache dùng chung|cache trong tiến trình/i);
      expect(source, relativePath).toMatch(/hit rate|miss rate|cache hit|cache miss|tỷ lệ hit|tỷ lệ miss/i);
      expect(source, relativePath).toMatch(/latency|độ trễ/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
