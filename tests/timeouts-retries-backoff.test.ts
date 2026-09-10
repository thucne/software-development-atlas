import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/distributed-systems/timeouts-retries-and-backoff.mdx',
  vi: 'content/docs/distributed-systems/timeouts-retries-and-backoff.vi.mdx',
} as const;

describe('Timeouts, Retries & Backoff lesson', () => {
  it('publishes a bilingual Distributed Systems section', () => {
    expect(read('content/docs/meta.json')).toContain('"distributed-systems"');
    expect(read('content/docs/meta.vi.json')).toContain('"distributed-systems"');
    expect(read('content/docs/distributed-systems/meta.json')).toContain(
      '"timeouts-retries-and-backoff"',
    );
    expect(read('content/docs/distributed-systems/meta.vi.json')).toContain(
      '"timeouts-retries-and-backoff"',
    );
  });

  it('places both variants on canonical distributed-systems concepts', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toContain('  - partial-failure');
      expect(source, relativePath).toContain('  - timeouts');
      expect(source, relativePath).toContain('  - retries-and-backoff');
    }
  });

  it('teaches safe retry policy and failure amplification', () => {
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
      expect(source, relativePath).toMatch(/jitter/i);
      expect(source, relativePath).toMatch(/idempoten/i);
      expect(source, relativePath).toMatch(/deadline/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
