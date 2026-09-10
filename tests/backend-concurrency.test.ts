import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/backend-engineering/backend-concurrency.mdx',
  vi: 'content/docs/backend-engineering/backend-concurrency.vi.mdx',
} as const;

describe('Backend Concurrency lesson', () => {
  it('publishes the lesson after authentication in the bilingual backend section', () => {
    for (const relativePath of [
      'content/docs/backend-engineering/meta.json',
      'content/docs/backend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const auth = source.indexOf('"authentication-and-authorization"');
      const concurrency = source.indexOf('"backend-concurrency"');

      expect(concurrency, relativePath).toBeGreaterThan(auth);
    }
  });

  it('places both variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toContain('  - backend-concurrency');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches invariants, races, atomicity, coordination choices, and failure modes', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/concurren|đồng thời/i);
      expect(source, relativePath).toMatch(/invariant|bất biến/i);
      expect(source, relativePath).toMatch(/race condition|race|tranh chấp|điều kiện tranh đua/i);
      expect(source, relativePath).toMatch(/atomic|nguyên tử/i);
      expect(source, relativePath).toMatch(/critical section|vùng tới hạn/i);
      expect(source, relativePath).toMatch(/lost update|mất cập nhật/i);
      expect(source, relativePath).toMatch(/optimistic|lạc quan/i);
      expect(source, relativePath).toMatch(/pessimistic|bi quan/i);
      expect(source, relativePath).toMatch(/lock|khóa/i);
      expect(source, relativePath).toMatch(/transaction|giao dịch/i);
      expect(source, relativePath).toMatch(/contention|tranh chấp tài nguyên/i);
      expect(source, relativePath).toMatch(/deadlock|bế tắc/i);
      expect(source, relativePath).toMatch(/process-local|per-process|nội bộ tiến trình|trong một tiến trình/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
