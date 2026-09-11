import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/software-architecture/modular-monolith.mdx',
  vi: 'content/docs/software-architecture/modular-monolith.vi.mdx',
} as const;

describe('Modular Monolith lesson', () => {
  it('publishes after Monolith Architecture in both Software Architecture sidebars', () => {
    for (const relativePath of [
      'content/docs/software-architecture/meta.json',
      'content/docs/software-architecture/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const monolith = source.indexOf('"monolith-architecture"');
      const modularMonolith = source.indexOf('"modular-monolith"');

      expect(monolith, relativePath).toBeGreaterThan(-1);
      expect(modularMonolith, relativePath).toBeGreaterThan(monolith);
    }
  });

  it('places both locale variants on only the canonical concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - modular-monolith\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-11');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches enforceable module, data, communication, transaction, and extraction boundaries', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/single deploy|one deployable|một deployable|một đơn vị triển khai/i);
      expect(source, relativePath).toMatch(/public (api|surface|contract)|public contract/i);
      expect(source, relativePath).toMatch(/private internals?|implementation detail/i);
      expect(source, relativePath).toMatch(/dependency graph|dependency direction/i);
      expect(source, relativePath).toMatch(/architecture test|import rule/i);
      expect(source, relativePath).toMatch(/data ownership|owns? (its )?(tables|schema)|module ownership/i);
      expect(source, relativePath).toMatch(/shared database|single database|physical database|database vật lý|database dùng chung/i);
      expect(source, relativePath).toMatch(/direct (table|database|sql) access|cross-module quer|query chéo module/i);
      expect(source, relativePath).toMatch(/in-process|function call/i);
      expect(source, relativePath).toMatch(/event|sự kiện/i);
      expect(source, relativePath).toMatch(/transaction|giao dịch/i);
      expect(source, relativePath).toMatch(/fault isolation|failure boundary|cô lập lỗi|ranh giới lỗi/i);
      expect(source, relativePath).toMatch(/extract|extraction|tách thành service|tách module/i);
      expect(source, relativePath).toMatch(/microservice|dịch vụ nhỏ/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
