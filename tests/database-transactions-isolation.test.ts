import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/data-systems/database-transactions-and-isolation.mdx',
  vi: 'content/docs/data-systems/database-transactions-and-isolation.vi.mdx',
} as const;

describe('Database Transactions & Isolation lesson', () => {
  it('publishes the bilingual lesson in Data Systems navigation', () => {
    expect(read('content/docs/data-systems/meta.json')).toContain(
      '"database-transactions-and-isolation"',
    );
    expect(read('content/docs/data-systems/meta.vi.json')).toContain(
      '"database-transactions-and-isolation"',
    );
  });

  it('places both variants on canonical transaction concepts at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toContain('  - database-transactions');
      expect(source, relativePath).toContain('  - transaction-isolation');
    }
  });

  it('teaches concurrency reasoning, retries, and production review habits', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toContain('<TermBox term=');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
      expect(source, relativePath).toContain('40001');
    }

    expect(en).toContain('Read Committed');
    expect(en).toContain('Repeatable Read');
    expect(en).toContain('Serializable');
    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');

    expect(vi).toContain('Read Committed');
    expect(vi).toContain('Repeatable Read');
    expect(vi).toContain('Serializable');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
