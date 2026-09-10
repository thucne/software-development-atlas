import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/backend-engineering/api-design.mdx',
  vi: 'content/docs/backend-engineering/api-design.vi.mdx',
} as const;

describe('API Design lesson', () => {
  it('publishes the lesson between request lifecycle and authentication in the bilingual backend section', () => {
    for (const relativePath of [
      'content/docs/backend-engineering/meta.json',
      'content/docs/backend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const lifecycle = source.indexOf('"backend-request-lifecycle"');
      const apiDesign = source.indexOf('"api-design"');
      const auth = source.indexOf('"authentication-and-authorization"');

      expect(apiDesign, relativePath).toBeGreaterThan(lifecycle);
      expect(auth, relativePath).toBeGreaterThan(apiDesign);
    }
  });

  it('places both variants on the canonical concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toContain('  - api-design');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches stable contracts, HTTP semantics, validation, evolution, and retry boundaries', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/contract|hợp đồng/i);
      expect(source, relativePath).toMatch(/resource|tài nguyên/i);
      expect(source, relativePath).toMatch(/GET|POST|PUT|PATCH|DELETE/);
      expect(source, relativePath).toMatch(/status code|mã trạng thái/i);
      expect(source, relativePath).toMatch(/validation|xác thực dữ liệu|kiểm tra dữ liệu/i);
      expect(source, relativePath).toMatch(/error model|problem details|mô hình lỗi|chi tiết lỗi/i);
      expect(source, relativePath).toMatch(/pagination|phân trang/i);
      expect(source, relativePath).toMatch(/backward compat|tương thích ngược/i);
      expect(source, relativePath).toMatch(/idempot|lặp lại an toàn/i);
      expect(source, relativePath).toMatch(/retry|thử lại/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');

    expect(en).toContain('RFC 9110');
    expect(en).toContain('RFC 9457');
  });
});
