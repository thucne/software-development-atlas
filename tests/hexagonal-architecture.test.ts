import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/software-architecture/hexagonal-architecture.mdx',
  vi: 'content/docs/software-architecture/hexagonal-architecture.vi.mdx',
} as const;

describe('Hexagonal Architecture lesson', () => {
  it('publishes after Layered Architecture in both Software Architecture sidebars', () => {
    for (const relativePath of [
      'content/docs/software-architecture/meta.json',
      'content/docs/software-architecture/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const layered = source.indexOf('"layered-architecture"');
      const hexagonal = source.indexOf('"hexagonal-architecture"');

      expect(layered, relativePath).toBeGreaterThan(-1);
      expect(hexagonal, relativePath).toBeGreaterThan(layered);
    }
  });

  it('places both locale variants on only the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - hexagonal-architecture\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-10');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches ports, adapters, driving/driven sides, isolation, and dependency boundaries', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/port|cổng/i);
      expect(source, relativePath).toMatch(/adapter|bộ chuyển đổi/i);
      expect(source, relativePath).toMatch(/ports? and adapters?|cổng và bộ chuyển đổi/i);
      expect(source, relativePath).toMatch(/driving|primary actor|chủ động|khởi phát/i);
      expect(source, relativePath).toMatch(/driven|secondary actor|bị điều khiển|được ứng dụng gọi/i);
      expect(source, relativePath).toMatch(/inside|outside|bên trong|bên ngoài/i);
      expect(source, relativePath).toMatch(/database|cơ sở dữ liệu/i);
      expect(source, relativePath).toMatch(/HTTP|CLI|test harness|batch|kiểm thử/i);
      expect(source, relativePath).toMatch(/mock|fake|in-memory|bộ nhớ/i);
      expect(source, relativePath).toMatch(/dependency inversion|đảo ngược phụ thuộc/i);
      expect(source, relativePath).toMatch(/composition root|wiring|lắp ghép|khởi tạo/i);
      expect(source, relativePath).toMatch(/hexagon|sáu cạnh|6 cạnh/i);
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
      expect(source, relativePath).toContain('/software-architecture/layered-architecture');
      expect(source, relativePath).toContain('/software-architecture/hexagonal-architecture');
      expect(source, relativePath).toContain('/software-architecture/clean-architecture');
    }

    const banner = read('components/atlas/release-banner.tsx');
    expect(banner).toContain('32 bài học kiến trúc hệ thống');
    expect(banner).toContain('32 new system architecture lessons');
  });
});
