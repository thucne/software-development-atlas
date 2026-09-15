import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/frontend-engineering/hydration.mdx',
  vi: 'content/docs/frontend-engineering/hydration.vi.mdx',
} as const;

describe('Hydration lesson', () => {
  it('publishes immediately after CSR, SSR, and SSG in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/frontend-engineering/meta.json',
      'content/docs/frontend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const rendering = source.indexOf('"csr-ssr-ssg"');
      const hydration = source.indexOf('"hydration"');
      expect(rendering, relativePath).toBeGreaterThan(-1);
      expect(hydration, relativePath).toBeGreaterThan(rendering);
    }
  });

  it('places both locale variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - hydration\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-15');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches hydration identity, mismatch causes, performance boundaries, and debugging', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/visible HTML|HTML.*hiển thị|interactive|tương tác/i);
      expect(source, relativePath).toMatch(/attach|gắn.*behavior|reuse.*DOM|tái sử dụng.*DOM/i);
      expect(source, relativePath).toMatch(/initial.*match|initial.*khớp|same output|khớp.*initial|đầu tiên.*khớp/i);
      expect(source, relativePath).toMatch(/Date\.now|Math\.random|locale|window|localStorage|browser-only/i);
      expect(source, relativePath).toMatch(/snapshot|dữ liệu.*snapshot|cùng.*dữ liệu/i);
      expect(source, relativePath).toMatch(/invalid.*nesting|HTML nesting|lồng.*HTML/i);
      expect(source, relativePath).toMatch(/hydration gap|main thread|JavaScript cost|chi phí JavaScript|luồng chính/i);
      expect(source, relativePath).toMatch(/streaming|selective hydration|partial hydration|hydrate.*boundary|hydration.*boundary/i);
      expect(source, relativePath).toMatch(/suppressHydrationWarning/i);
      expect(source, relativePath).toMatch(/server.*snapshot|client.*first render|compare|so sánh/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
