import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/software-architecture/layered-architecture.mdx',
  vi: 'content/docs/software-architecture/layered-architecture.vi.mdx',
} as const;

describe('Layered Architecture lesson', () => {
  it('publishes after Modularity in both Software Architecture sidebars', () => {
    for (const relativePath of [
      'content/docs/software-architecture/meta.json',
      'content/docs/software-architecture/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const modularity = source.indexOf('"modularity"');
      const layered = source.indexOf('"layered-architecture"');

      expect(modularity, relativePath).toBeGreaterThan(-1);
      expect(layered, relativePath).toBeGreaterThan(modularity);
    }
  });

  it('places both locale variants on only the canonical layered-architecture concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - layered-architecture\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-10');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches layer responsibilities, dependency rules, bypass risks, and architectural trade-offs', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/presentation(?:\s+layer)?|tầng trình bày/i);
      expect(source, relativePath).toMatch(/application layer|tầng ứng dụng/i);
      expect(source, relativePath).toMatch(/domain layer|tầng domain|tầng miền/i);
      expect(source, relativePath).toMatch(/infrastructure layer|tầng hạ tầng/i);
      expect(source, relativePath).toMatch(/dependency rule|quy tắc phụ thuộc/i);
      expect(source, relativePath).toMatch(/strict layering|strict layer|layering nghiêm ngặt|phân tầng nghiêm ngặt/i);
      expect(source, relativePath).toMatch(/relaxed layering|relaxed layer|layering linh hoạt|phân tầng linh hoạt/i);
      expect(source, relativePath).toMatch(/bypass|đi tắt|vượt tầng/i);
      expect(source, relativePath).toMatch(/layer|tier/i);
      expect(source, relativePath).toMatch(/transaction boundary|ranh giới transaction|ranh giới giao dịch/i);
      expect(source, relativePath).toMatch(/cross.?cutting|xuyên tầng/i);
      expect(source, relativePath).toMatch(/DTO|mapping|ánh xạ/i);
      expect(source, relativePath).toMatch(/package by feature|vertical slice|theo feature|lát cắt dọc/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('keeps the bilingual September release ledger and banner current', () => {
    for (const relativePath of [
      'content/docs/start-here/changelog.mdx',
      'content/docs/start-here/changelog.vi.mdx',
    ]) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('33');
      expect(source, relativePath).toContain('/software-architecture/modularity');
      expect(source, relativePath).toContain('/software-architecture/layered-architecture');
      expect(source, relativePath).toContain('/software-architecture/hexagonal-architecture');
      expect(source, relativePath).toContain('/software-architecture/clean-architecture');
      expect(source, relativePath).toContain('/software-architecture/monolith-architecture');
    }

    const banner = read('components/atlas/release-banner.tsx');
    expect(banner).toContain('33 bài học kiến trúc hệ thống');
    expect(banner).toContain('33 new system architecture lessons');
  });
});
