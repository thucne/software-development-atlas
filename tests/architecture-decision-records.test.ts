import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/software-architecture/architecture-decision-records.mdx',
  vi: 'content/docs/software-architecture/architecture-decision-records.vi.mdx',
} as const;

describe('Architecture Decision Records lesson', () => {
  it('publishes after Domain Boundaries in both Software Architecture sidebars', () => {
    for (const relativePath of [
      'content/docs/software-architecture/meta.json',
      'content/docs/software-architecture/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const domainBoundaries = source.indexOf('"domain-boundaries"');
      const adr = source.indexOf('"architecture-decision-records"');

      expect(domainBoundaries, relativePath).toBeGreaterThan(-1);
      expect(adr, relativePath).toBeGreaterThan(domainBoundaries);
    }
  });

  it('places both locale variants on only the canonical concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - architecture-decision-records\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-12');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches how to create, review, preserve, and supersede ADRs', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/architecture decision record|\bADR\b|bản ghi quyết định kiến trúc/i);
      expect(source, relativePath).toMatch(/architecturally significant|significant decision|quyết định.*đáng kể|quyết định.*kiến trúc/i);
      expect(source, relativePath).toMatch(/context|bối cảnh/i);
      expect(source, relativePath).toMatch(/decision|quyết định/i);
      expect(source, relativePath).toMatch(/alternative|option|phương án|lựa chọn/i);
      expect(source, relativePath).toMatch(/consequence|trade.?off|hệ quả|đánh đổi/i);
      expect(source, relativePath).toMatch(/proposed|accepted|rejected|deprecated|superseded|đề xuất|chấp nhận|từ chối|không còn dùng|thay thế/i);
      expect(source, relativePath).toMatch(/owner|decision.?maker|stakeholder|người sở hữu|người ra quyết định|bên liên quan/i);
      expect(source, relativePath).toMatch(/date|scope|ngày|phạm vi/i);
      expect(source, relativePath).toMatch(/decision log|ADR collection|nhật ký quyết định|tập ADR/i);
      expect(source, relativePath).toMatch(/evidence|metric|constraint|link|bằng chứng|chỉ số|ràng buộc|liên kết/i);
      expect(source, relativePath).toMatch(/review|peer review|code review|xem xét|review/i);
      expect(source, relativePath).toMatch(/immutable|preserve.*history|do not rewrite|supersed|bất biến|giữ.*lịch sử|không.*viết lại|thay thế/i);
      expect(source, relativePath).toMatch(/lightweight|template|mẫu|gọn nhẹ/i);
      expect(source, relativePath).toMatch(/why|rationale|reason|vì sao|lý do/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
