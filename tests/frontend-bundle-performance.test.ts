import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/frontend-engineering/frontend-bundle-performance.mdx',
  vi: 'content/docs/frontend-engineering/frontend-bundle-performance.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Frontend Bundle Performance lesson', () => {
  it('publishes immediately after Component Boundaries in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/frontend-engineering/meta.json',
      'content/docs/frontend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const componentBoundaries = source.indexOf('"component-boundaries"');
      const bundlePerformance = source.indexOf('"frontend-bundle-performance"');
      expect(componentBoundaries, relativePath).toBeGreaterThan(-1);
      expect(bundlePerformance, relativePath).toBeGreaterThan(componentBoundaries);
    }
  });

  it('places both locale variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - frontend-bundle-performance\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-16');
      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes, relativePath).toBeGreaterThanOrEqual(2);
      expect(termBoxes, relativePath).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches bundle cost as dependency graph, timing, transfer, and browser work', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/dependency graph|import graph|đồ thị phụ thuộc|đồ thị import/i);
      expect(source, relativePath).toMatch(/transfer|compressed|gzip|brotli|truyền|nén/i);
      expect(source, relativePath).toMatch(/decompress|parse|compile|execute|giải nén|phân tích cú pháp|biên dịch|thực thi/i);
      expect(source, relativePath).toMatch(/static import|dynamic import|import\(\)|import tĩnh|import động/i);
      expect(source, relativePath).toMatch(/code.?splitting|lazy|defer|chia mã|trì hoãn/i);
      expect(source, relativePath).toMatch(/tree.?shak|dead.?code|sideEffects|mã chết|tác dụng phụ/i);
      expect(source, relativePath).toMatch(/third.?party|bên thứ ba/i);
      expect(source, relativePath).toMatch(/chunk|cache|caching|bộ nhớ đệm/i);
      expect(source, relativePath).toMatch(/bundle analys|analyzer|stats|phân tích bundle/i);
      expect(source, relativePath).toMatch(/budget|regression|ngân sách|hồi quy/i);
      expect(source, relativePath).toMatch(/client graph|use client|đồ thị client/i);
      expect(source, relativePath).toMatch(/waterfall|thác nước|parallel|song song/i);
      expect(source, relativePath).toMatch(/too many|tiny chunks|giant bundle|quá nhiều.*chunk|bundle.*khổng lồ/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('reconciles the rolling changelog in both locales', () => {
    expect(read('content/docs/start-here/changelog.mdx')).toContain(
      '[Frontend Bundle Performance](/docs/frontend-engineering/frontend-bundle-performance)',
    );
    expect(read('content/docs/start-here/changelog.vi.mdx')).toContain(
      '[Hiệu năng Bundle Frontend](/vi/docs/frontend-engineering/frontend-bundle-performance)',
    );
  });
});
