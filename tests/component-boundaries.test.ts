import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/frontend-engineering/component-boundaries.mdx',
  vi: 'content/docs/frontend-engineering/component-boundaries.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Component Boundaries lesson', () => {
  it('publishes immediately after Frontend Data Fetching in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/frontend-engineering/meta.json',
      'content/docs/frontend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const dataFetching = source.indexOf('"frontend-data-fetching"');
      const componentBoundaries = source.indexOf('"component-boundaries"');
      expect(dataFetching, relativePath).toBeGreaterThan(-1);
      expect(componentBoundaries, relativePath).toBeGreaterThan(dataFetching);
    }
  });

  it('places both locale variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - component-boundaries\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-16');
      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes, relativePath).toBeGreaterThanOrEqual(2);
      expect(termBoxes, relativePath).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches responsibility, ownership, explicit interfaces, composition, and change locality', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/responsibilit|trách nhiệm|cohesion|gắn kết/i);
      expect(source, relativePath).toMatch(/reason to change|change together|change locality|thay đổi cùng|lý do.*thay đổi|cục bộ.*thay đổi/i);
      expect(source, relativePath).toMatch(/owner|ownership|sở hữu/i);
      expect(source, relativePath).toMatch(/state|data|action|event|sự kiện/i);
      expect(source, relativePath).toMatch(/props|contract|interface|hợp đồng|giao diện/i);
      expect(source, relativePath).toMatch(/callback|event.*up|intent|ý định/i);
      expect(source, relativePath).toMatch(/composition|children|slot|kết hợp/i);
      expect(source, relativePath).toMatch(/context|prop drilling/i);
      expect(source, relativePath).toMatch(/boolean prop|flag.*prop|prop.*boolean|cờ boolean/i);
      expect(source, relativePath).toMatch(/god component|large component|component.*lớn|component.*ôm/i);
      expect(source, relativePath).toMatch(/test|testing|kiểm thử/i);
      expect(source, relativePath).toMatch(/not.*line count|not.*file size|không.*số dòng|không.*kích thước file/i);
      expect(source, relativePath).toMatch(/server.*client.*different|execution boundary|khác.*Server.*Client|ranh giới thực thi/i);
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
      '[Component Boundaries](/docs/frontend-engineering/component-boundaries)',
    );
    expect(read('content/docs/start-here/changelog.vi.mdx')).toContain(
      '[Ranh giới Component](/vi/docs/frontend-engineering/component-boundaries)',
    );
  });
});
