import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/software-architecture/modularity.mdx',
  vi: 'content/docs/software-architecture/modularity.vi.mdx',
} as const;

describe('Modularity lesson', () => {
  it('publishes after Coupling & Cohesion in both Software Architecture sidebars', () => {
    for (const relativePath of [
      'content/docs/software-architecture/meta.json',
      'content/docs/software-architecture/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const coupling = source.indexOf('"coupling-and-cohesion"');
      const modularity = source.indexOf('"modularity"');

      expect(coupling, relativePath).toBeGreaterThan(-1);
      expect(modularity, relativePath).toBeGreaterThan(coupling);
    }
  });

  it('places both locale variants on only the canonical modularity concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - modularity\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-10');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches actionable module boundaries, information hiding, dependency direction, and verification', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/module boundary|ranh giới module/i);
      expect(source, relativePath).toMatch(/information hiding|che giấu thông tin/i);
      expect(source, relativePath).toMatch(/public API|public contract|API công khai|hợp đồng công khai/i);
      expect(source, relativePath).toMatch(/dependency graph|đồ thị phụ thuộc/i);
      expect(source, relativePath).toMatch(/cycle|cyclic|vòng phụ thuộc/i);
      expect(source, relativePath).toMatch(/ownership|owner|quyền sở hữu|chủ sở hữu/i);
      expect(source, relativePath).toMatch(/package by feature|feature boundary|theo feature|ranh giới feature/i);
      expect(source, relativePath).toMatch(/internal|private|nội bộ/i);
      expect(source, relativePath).toMatch(/contract test|boundary test|kiểm thử hợp đồng|kiểm thử ranh giới/i);
      expect(source, relativePath).toMatch(/change frequency|change together|co.?change|tần suất thay đổi|thay đổi cùng nhau/i);
      expect(source, relativePath).toMatch(/stable depend|ổn định/i);
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
      expect(source, relativePath).toContain('/software-architecture/coupling-and-cohesion');
      expect(source, relativePath).toContain('/software-architecture/modularity');
      expect(source, relativePath).toContain('/software-architecture/layered-architecture');
      expect(source, relativePath).toContain('/software-architecture/hexagonal-architecture');
      expect(source, relativePath).toContain('/software-architecture/clean-architecture');
    }

    const banner = read('components/atlas/release-banner.tsx');
    expect(banner).toContain('32 bài học kiến trúc hệ thống');
    expect(banner).toContain('32 new system architecture lessons');
  });
});
