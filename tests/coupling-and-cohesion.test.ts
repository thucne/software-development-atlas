import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/software-architecture/coupling-and-cohesion.mdx',
  vi: 'content/docs/software-architecture/coupling-and-cohesion.vi.mdx',
} as const;

describe('Coupling and Cohesion lesson', () => {
  it('opens Software Architecture between Data Systems and Distributed Systems in both root sidebars', () => {
    for (const relativePath of ['content/docs/meta.json', 'content/docs/meta.vi.json']) {
      const source = read(relativePath);
      const dataSystems = source.indexOf('"data-systems"');
      const architecture = source.indexOf('"software-architecture"');
      const distributed = source.indexOf('"distributed-systems"');

      expect(dataSystems, relativePath).toBeGreaterThan(-1);
      expect(architecture, relativePath).toBeGreaterThan(dataSystems);
      expect(distributed, relativePath).toBeGreaterThan(architecture);
    }

    for (const relativePath of [
      'content/docs/software-architecture/meta.json',
      'content/docs/software-architecture/meta.vi.json',
    ]) {
      expect(read(relativePath), relativePath).toContain('"coupling-and-cohesion"');
    }
  });

  it('places both locale variants on only the canonical concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - coupling-and-cohesion\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-10');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches actionable coupling, cohesion, ownership, and change-locality techniques', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/coupling|liên kết phụ thuộc/i);
      expect(source, relativePath).toMatch(/cohesion|tính gắn kết/i);
      expect(source, relativePath).toMatch(/ripple|change propagation|lan truyền thay đổi|blast radius/i);
      expect(source, relativePath).toMatch(/dependency|phụ thuộc/i);
      expect(source, relativePath).toMatch(/encapsulation|information hiding|đóng gói|che giấu thông tin/i);
      expect(source, relativePath).toMatch(/shared data|shared schema|shared table|dữ liệu dùng chung|schema dùng chung|bảng dùng chung/i);
      expect(source, relativePath).toMatch(/temporal coupling|call order|thứ tự gọi|phụ thuộc thời gian/i);
      expect(source, relativePath).toMatch(/cycle|cyclic|vòng phụ thuộc/i);
      expect(source, relativePath).toMatch(/contract|API|giao diện/i);
      expect(source, relativePath).toMatch(/change together|co.?change|thay đổi cùng nhau/i);
      expect(source, relativePath).toMatch(/business rule|invariant|quy tắc nghiệp vụ|bất biến/i);
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
      expect(source, relativePath).toContain('30');
      expect(source, relativePath).toContain('/software-architecture/coupling-and-cohesion');
      expect(source, relativePath).toContain('/software-architecture/modularity');
      expect(source, relativePath).toContain('/software-architecture/layered-architecture');
    }

    const banner = read('components/atlas/release-banner.tsx');
    expect(banner).toContain('30 bài học kiến trúc hệ thống');
    expect(banner).toContain('30 new system architecture lessons');
  });
});
