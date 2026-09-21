import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/testing-quality/property-based-testing.mdx',
  vi: 'content/docs/testing-quality/property-based-testing.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Property-Based Testing lesson', () => {
  it('publishes after Contract Testing in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/testing-quality/meta.json',
      'content/docs/testing-quality/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const contract = source.indexOf('"contract-testing"');
      const propertyBased = source.indexOf('"property-based-testing"');
      expect(contract, relativePath).toBeGreaterThan(-1);
      expect(propertyBased, relativePath).toBeGreaterThan(contract);
    }
  });

  it('publishes both locales at reason depth with the deep-dive teaching contract', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source).toContain('category: testing-quality');
      expect(source).toContain('contentType: deep-dive');
      expect(source).toContain('learningDepth: reason');
      expect(source).toMatch(/concepts:\n  - property-based-testing\n---/);
      expect(source).toContain('lastVerified: 2026-09-21');
      expect((source.match(/<TermBox/g) ?? []).length).toBeGreaterThanOrEqual(2);
      expect((source.match(/<TermBox/g) ?? []).length).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length).toBeGreaterThanOrEqual(3);
      expect(source).toContain('<details>');
      expect(source).toContain('- [ ]');
      expect(source).toMatch(/Rule of thumb|Quy tắc bỏ túi/);
      expect(source).toMatch(/Fatal pitfall|Sai lầm chí mạng/);
    }
  });

  it('covers properties, generators, shrinking, replay, and stateful search', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source).toMatch(/property|thuộc tính/i);
      expect(source).toMatch(/generator|bộ sinh/i);
      expect(source).toMatch(/counterexample|phản ví dụ/i);
      expect(source).toMatch(/shrink|thu nhỏ/i);
      expect(source).toMatch(/seed|hạt giống/i);
      expect(source).toMatch(/replay|tái hiện/i);
      expect(source).toMatch(/stateful|model-based|có trạng thái|theo mô hình/i);
      expect(source).toMatch(/not.*proof|không phải.*chứng minh|không phải chứng minh/i);
      expect(source).toMatch(/filter|lọc/i);
      expect(source).toMatch(/distribution|phân bố/i);
    }
  });

  it('anchors the lesson in production consequences and bounded CI execution', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);
    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
    expect(en).toMatch(/bounded/i);
    expect(vi).toMatch(/giới hạn/i);
  });

  it('records the September 21 release and maintenance date', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');
    expect(en).toContain('September 21, 2026');
    expect(en).toContain('[Property-Based Testing](/docs/testing-quality/property-based-testing)');
    expect(vi).toContain('21 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/testing-quality/property-based-testing)');
    expect(read('lib/site-metadata.ts')).toContain("atlasLastUpdated = '2026-09-21'");
    expect(read('tests/e2e/docs-shell.spec.ts')).toContain('Atlas last updated Sep 21, 2026');
  });
});
