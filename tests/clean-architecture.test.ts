import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/software-architecture/clean-architecture.mdx',
  vi: 'content/docs/software-architecture/clean-architecture.vi.mdx',
} as const;

describe('Clean Architecture lesson', () => {
  it('publishes after Hexagonal Architecture in both Software Architecture sidebars', () => {
    for (const relativePath of [
      'content/docs/software-architecture/meta.json',
      'content/docs/software-architecture/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const hexagonal = source.indexOf('"hexagonal-architecture"');
      const clean = source.indexOf('"clean-architecture"');

      expect(hexagonal, relativePath).toBeGreaterThan(-1);
      expect(clean, relativePath).toBeGreaterThan(hexagonal);
    }
  });

  it('places both locale variants on only the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - clean-architecture\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-10');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches the Dependency Rule, policy/detail boundaries, adapters, and testing consequences', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/Dependency Rule|quy tắc phụ thuộc/i);
      expect(source, relativePath).toMatch(/entit(?:y|ies)|business rule|business policy|thực thể|quy tắc nghiệp vụ|policy nghiệp vụ/i);
      expect(source, relativePath).toMatch(/use case|application rule|application policy|quy tắc ứng dụng|policy ứng dụng/i);
      expect(source, relativePath).toMatch(/interface adapter|adapter giao diện|bộ chuyển đổi giao diện/i);
      expect(source, relativePath).toMatch(/framework|driver|công cụ|chi tiết kỹ thuật/i);
      expect(source, relativePath).toMatch(/source.?code depend|compile.?time depend|phụ thuộc mã nguồn|phụ thuộc lúc biên dịch/i);
      expect(source, relativePath).toMatch(/inward|hướng vào trong/i);
      expect(source, relativePath).toMatch(/dependency inversion|đảo ngược phụ thuộc/i);
      expect(source, relativePath).toMatch(/DTO|boundary data|request model|response model|dữ liệu qua ranh giới|mô hình request|mô hình response/i);
      expect(source, relativePath).toMatch(/composition root|dependency injection|DI|lắp ghép|khởi tạo/i);
      expect(source, relativePath).toMatch(/database|ORM|web framework|cơ sở dữ liệu/i);
      expect(source, relativePath).toMatch(/unit test|integration test|kiểm thử đơn vị|kiểm thử tích hợp/i);
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
      expect(source, relativePath).toContain('32');
      expect(source, relativePath).toContain('/software-architecture/hexagonal-architecture');
      expect(source, relativePath).toContain('/software-architecture/clean-architecture');
    }

    const banner = read('components/atlas/release-banner.tsx');
    expect(banner).toContain('32 bài học kiến trúc hệ thống');
    expect(banner).toContain('32 new system architecture lessons');
  });
});
