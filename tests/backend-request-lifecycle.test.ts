import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/backend-engineering/backend-request-lifecycle.mdx',
  vi: 'content/docs/backend-engineering/backend-request-lifecycle.vi.mdx',
} as const;

describe('Backend Request Lifecycle lesson', () => {
  it('publishes the bilingual backend engineering section', () => {
    expect(read('content/docs/meta.json')).toContain('"backend-engineering"');
    expect(read('content/docs/meta.vi.json')).toContain('"backend-engineering"');
    expect(read('content/docs/backend-engineering/meta.json')).toContain('"backend-request-lifecycle"');
    expect(read('content/docs/backend-engineering/meta.vi.json')).toContain('"backend-request-lifecycle"');
  });

  it('places both variants on the canonical concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toContain('  - backend-request-lifecycle');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches request boundaries, cancellation, transaction scope, async work, and evidence', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/authentication|xác thực/i);
      expect(source, relativePath).toMatch(/authorization|phân quyền/i);
      expect(source, relativePath).toMatch(/validation|kiểm tra đầu vào/i);
      expect(source, relativePath).toMatch(/deadline|hạn chót/i);
      expect(source, relativePath).toMatch(/cancell|hủy/i);
      expect(source, relativePath).toMatch(/transaction|giao dịch/i);
      expect(source, relativePath).toMatch(/after commit|sau khi.*ghi nhận|sau khi.*commit/i);
      expect(source, relativePath).toMatch(/request[_ -]?id|correlation|tương quan/i);
      expect(source, relativePath).toMatch(/async|bất đồng bộ/i);
      expect(source, relativePath).toMatch(/error mapping|ánh xạ lỗi/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
