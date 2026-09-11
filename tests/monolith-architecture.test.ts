import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/software-architecture/monolith-architecture.mdx',
  vi: 'content/docs/software-architecture/monolith-architecture.vi.mdx',
} as const;

describe('Monolith Architecture lesson', () => {
  it('publishes after Clean Architecture in both Software Architecture sidebars', () => {
    for (const relativePath of [
      'content/docs/software-architecture/meta.json',
      'content/docs/software-architecture/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const clean = source.indexOf('"clean-architecture"');
      const monolith = source.indexOf('"monolith-architecture"');

      expect(clean, relativePath).toBeGreaterThan(-1);
      expect(monolith, relativePath).toBeGreaterThan(clean);
    }
  });

  it('places both locale variants on only the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - monolith-architecture\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-10');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches deployment boundaries, internal structure, scaling, releases, transactions, and decomposition signals', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/single deploy|deployment unit|một đơn vị triển khai|deploy cùng nhau/i);
      expect(source, relativePath).toMatch(/process boundary|ranh giới process|tiến trình/i);
      expect(source, relativePath).toMatch(/module|modular|mô-?đun/i);
      expect(source, relativePath).toMatch(/horizontal scal|scale out|nhân bản|mở rộng ngang/i);
      expect(source, relativePath).toMatch(/release|deploy|triển khai/i);
      expect(source, relativePath).toMatch(/blast radius|phạm vi ảnh hưởng|failure domain|miền lỗi/i);
      expect(source, relativePath).toMatch(/transaction|giao dịch/i);
      expect(source, relativePath).toMatch(/shared database|shared schema|cơ sở dữ liệu dùng chung|schema dùng chung/i);
      expect(source, relativePath).toMatch(/in-process|function call|lời gọi trong process|gọi hàm/i);
      expect(source, relativePath).toMatch(/microservice|dịch vụ nhỏ/i);
      expect(source, relativePath).toMatch(/decompos|strangler|tách dần|phân rã/i);
      expect(source, relativePath).toMatch(/team|ownership|đội|quyền sở hữu/i);
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
      expect(source, relativePath).toContain('/software-architecture/clean-architecture');
      expect(source, relativePath).toContain('/software-architecture/monolith-architecture');
    }

    const banner = read('components/atlas/release-banner.tsx');
    expect(banner).toContain('33 bài học kiến trúc hệ thống');
    expect(banner).toContain('33 new system architecture lessons');
  });
});
