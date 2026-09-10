import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/web-platform/dns-resolution-and-tls.mdx',
  vi: 'content/docs/web-platform/dns-resolution-and-tls.vi.mdx',
} as const;

describe('DNS Resolution & TLS lesson', () => {
  it('publishes the bilingual lesson in Web Platform navigation', () => {
    expect(read('content/docs/web-platform/meta.json')).toContain(
      '"dns-resolution-and-tls"',
    );
    expect(read('content/docs/web-platform/meta.vi.json')).toContain(
      '"dns-resolution-and-tls"',
    );
  });

  it('places both variants on canonical DNS and TLS concepts at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toContain('  - dns-resolution');
      expect(source, relativePath).toContain('  - tls-and-https');
    }
  });

  it('teaches cache-aware resolution and authenticated connection setup', () => {
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
      expect(source, relativePath).toMatch(/TTL/i);
      expect(source, relativePath).toMatch(/ClientHello/i);
      expect(source, relativePath).toMatch(/certificate/i);
      expect(source, relativePath).toContain('RFC 9846');
      expect(source, relativePath).toContain('RFC 9525');
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
