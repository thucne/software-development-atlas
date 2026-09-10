import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/security/threat-modeling-and-least-privilege.mdx',
  vi: 'content/docs/security/threat-modeling-and-least-privilege.vi.mdx',
} as const;

describe('Threat Modeling & Least Privilege lesson', () => {
  it('publishes a bilingual Security section', () => {
    expect(read('content/docs/meta.json')).toContain('"security"');
    expect(read('content/docs/meta.vi.json')).toContain('"security"');
    expect(read('content/docs/security/meta.json')).toContain(
      '"threat-modeling-and-least-privilege"',
    );
    expect(read('content/docs/security/meta.vi.json')).toContain(
      '"threat-modeling-and-least-privilege"',
    );
  });

  it('places both variants on canonical threat-modeling and least-privilege concepts', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toContain('  - threat-modeling');
      expect(source, relativePath).toContain('  - least-privilege');
    }
  });

  it('teaches threat modeling as an actionable authorization design loop', () => {
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
      expect(source, relativePath).toMatch(/trust boundary/i);
      expect(source, relativePath).toMatch(/deny[- ]by[- ]default/i);
      expect(source, relativePath).toMatch(/every request|mỗi request/i);
      expect(source, relativePath).toMatch(/authentication/i);
      expect(source, relativePath).toMatch(/authorization/i);
      expect(source, relativePath).toMatch(/blast radius/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
