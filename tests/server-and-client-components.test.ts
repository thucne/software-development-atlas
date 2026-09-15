import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/frontend-engineering/server-and-client-components.mdx',
  vi: 'content/docs/frontend-engineering/server-and-client-components.vi.mdx',
} as const;

describe('Server and Client Components lesson', () => {
  it('publishes immediately after Hydration in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/frontend-engineering/meta.json',
      'content/docs/frontend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const hydration = source.indexOf('"hydration"');
      const components = source.indexOf('"server-and-client-components"');
      expect(hydration, relativePath).toBeGreaterThan(-1);
      expect(components, relativePath).toBeGreaterThan(hydration);
    }
  });

  it('places both locale variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - server-and-client-components\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-15');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches execution boundaries, client graphs, serialization, composition, and cost', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/not.*SSR|not.*CSR|orthogonal|không.*SSR|không.*CSR|độc lập.*SSR|độc lập.*CSR/i);
      expect(source, relativePath).toMatch(/use client/i);
      expect(source, relativePath).toMatch(/module boundary|client boundary|ranh giới module|ranh giới client/i);
      expect(source, relativePath).toMatch(/transitive|dependency graph|client graph|đồ thị.*client|phụ thuộc.*client/i);
      expect(source, relativePath).toMatch(/useState|event handler|browser API|state|tương tác/i);
      expect(source, relativePath).toMatch(/serializ|tuần tự hóa|serialize/i);
      expect(source, relativePath).toMatch(/children|child.*Client Component|truyền.*children|Server Component.*Client Component/i);
      expect(source, relativePath).toMatch(/secret|credential|server-only|bí mật|chỉ.*server/i);
      expect(source, relativePath).toMatch(/bundle|JavaScript|hydration|client cost|chi phí.*client/i);
      expect(source, relativePath).toMatch(/boundary.*low|boundary.*small|ranh giới.*thấp|ranh giới.*nhỏ/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
