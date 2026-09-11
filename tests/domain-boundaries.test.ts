import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/software-architecture/domain-boundaries.mdx',
  vi: 'content/docs/software-architecture/domain-boundaries.vi.mdx',
} as const;

describe('Domain Boundaries lesson', () => {
  it('publishes after Event-Driven Architecture in both Software Architecture sidebars', () => {
    for (const relativePath of [
      'content/docs/software-architecture/meta.json',
      'content/docs/software-architecture/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const eventDriven = source.indexOf('"event-driven-architecture"');
      const domainBoundaries = source.indexOf('"domain-boundaries"');

      expect(eventDriven, relativePath).toBeGreaterThan(-1);
      expect(domainBoundaries, relativePath).toBeGreaterThan(eventDriven);
    }
  });

  it('places both locale variants on only the canonical concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - domain-boundaries\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-12');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches how to discover, define, integrate, and enforce domain boundaries', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/bounded context|context boundary|ranh giới ngữ cảnh|bounded context/i);
      expect(source, relativePath).toMatch(/ubiquitous language|domain language|ngôn ngữ chung|ngôn ngữ domain/i);
      expect(source, relativePath).toMatch(/business capability|business responsibility|năng lực nghiệp vụ|trách nhiệm nghiệp vụ/i);
      expect(source, relativePath).toMatch(/model ownership|data ownership|rule ownership|sở hữu.*mô hình|sở hữu.*dữ liệu|sở hữu.*quy tắc/i);
      expect(source, relativePath).toMatch(/invariant|transaction boundary|transactional consistency|bất biến|ranh giới giao dịch/i);
      expect(source, relativePath).toMatch(/co-change|change together|change coupling|thay đổi cùng nhau|coupling thay đổi/i);
      expect(source, relativePath).toMatch(/team ownership|team boundary|quyền sở hữu của đội|ranh giới đội/i);
      expect(source, relativePath).toMatch(/context map|relationship between contexts|bản đồ ngữ cảnh|quan hệ giữa.*context/i);
      expect(source, relativePath).toMatch(/anti-corruption layer|translation layer|lớp chống tha hóa|lớp dịch/i);
      expect(source, relativePath).toMatch(/shared kernel|nhân dùng chung/i);
      expect(source, relativePath).toMatch(/integration contract|contract.*boundary|hợp đồng tích hợp|hợp đồng.*ranh giới/i);
      expect(source, relativePath).toMatch(/same term.*different meaning|different model|cùng thuật ngữ.*khác nghĩa|mô hình khác nhau/i);
      expect(source, relativePath).toMatch(/boundary.*evolve|revisit.*boundary|ranh giới.*tiến hóa|xem lại.*ranh giới/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
