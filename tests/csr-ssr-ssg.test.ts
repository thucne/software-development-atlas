import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/frontend-engineering/csr-ssr-ssg.mdx',
  vi: 'content/docs/frontend-engineering/csr-ssr-ssg.vi.mdx',
} as const;

describe('CSR, SSR, and SSG lesson', () => {
  it('publishes Frontend Engineering between Web Platform and Backend Engineering', () => {
    for (const relativePath of ['content/docs/meta.json', 'content/docs/meta.vi.json']) {
      const source = read(relativePath);
      const web = source.indexOf('"web-platform"');
      const frontend = source.indexOf('"frontend-engineering"');
      const backend = source.indexOf('"backend-engineering"');
      expect(web, relativePath).toBeGreaterThan(-1);
      expect(frontend, relativePath).toBeGreaterThan(web);
      expect(backend, relativePath).toBeGreaterThan(frontend);
    }

    for (const relativePath of [
      'content/docs/frontend-engineering/meta.json',
      'content/docs/frontend-engineering/meta.vi.json',
    ]) {
      expect(read(relativePath), relativePath).toContain('"csr-ssr-ssg"');
    }
  });

  it('places both locale variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('category: frontend-engineering');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - csr-ssr-ssg\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-15');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches rendering placement, route-level trade-offs, hydration, and caching', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/client-side rendering|CSR|render.*browser|trình duyệt/i);
      expect(source, relativePath).toMatch(/server-side rendering|SSR|request time|mỗi request|thời điểm request/i);
      expect(source, relativePath).toMatch(/static site generation|SSG|build time|thời điểm build/i);
      expect(source, relativePath).toMatch(/freshness|độ mới|staleness|cũ/i);
      expect(source, relativePath).toMatch(/personalization|cá nhân hóa|per-user|theo người dùng/i);
      expect(source, relativePath).toMatch(/cache|CDN/i);
      expect(source, relativePath).toMatch(/hydration|interactive|tương tác/i);
      expect(source, relativePath).toMatch(/route|trang/i);
      expect(source, relativePath).toMatch(/SEO.*not|SEO.*không|không.*SEO|search engine/i);
      expect(source, relativePath).toMatch(/hybrid|revalidat|regenerat|kết hợp|tái tạo/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
