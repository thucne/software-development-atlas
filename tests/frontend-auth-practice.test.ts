import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const files = {
  architecture: {
    en: 'content/docs/engineering-judgment/architecture-walkthroughs/frontend-authentication-architecture.mdx',
    vi: 'content/docs/engineering-judgment/architecture-walkthroughs/frontend-authentication-architecture.vi.mdx',
  },
  debugging: {
    en: 'content/docs/backend-engineering/auth-debugging-field-guide.mdx',
    vi: 'content/docs/backend-engineering/auth-debugging-field-guide.vi.mdx',
  },
} as const;

function lesson(relativePath: string) {
  const absolute = path.join(repoRoot, relativePath);
  expect(existsSync(absolute), relativePath).toBe(true);
  return readFileSync(absolute, 'utf8');
}

function mermaidCount(source: string) {
  return (source.match(/(?:```|~~~)mermaid/g) ?? []).length;
}

describe('Frontend auth architecture and debugging practice', () => {
  it('publishes both bilingual artifacts in the intended navigation locations', () => {
    const walkthroughPages = JSON.parse(
      read('content/docs/engineering-judgment/architecture-walkthroughs/meta.json'),
    ).pages as string[];
    const walkthroughPagesVi = JSON.parse(
      read('content/docs/engineering-judgment/architecture-walkthroughs/meta.vi.json'),
    ).pages as string[];

    expect(walkthroughPages).toContain('frontend-authentication-architecture');
    expect(walkthroughPagesVi).toContain('frontend-authentication-architecture');

    for (const relativePath of [
      'content/docs/backend-engineering/meta.json',
      'content/docs/backend-engineering/meta.vi.json',
    ]) {
      const pages = JSON.parse(read(relativePath)).pages as string[];
      const keycloak = pages.indexOf('keycloak-in-practice');
      expect(pages[keycloak + 1], relativePath).toBe('auth-debugging-field-guide');
    }
  });

  it('keeps architecture walkthrough metadata and pedagogy aligned in EN/VI', () => {
    for (const relativePath of [files.architecture.en, files.architecture.vi]) {
      const source = lesson(relativePath);
      expect(source).toContain('category: engineering-judgment');
      expect(source).toContain('contentType: architecture-walkthrough');
      expect(source).toContain('learningDepth: reason');
      expect(source).toContain('lastVerified: 2026-09-21');
      expect(source).toContain('  - oauth-and-oidc');
      expect(source).toContain('  - authentication-and-authorization');
      expect(source).toContain('  - identity-provider-integration');
      expect(source).toContain('  - cookies-and-sessions');
      expect((source.match(/<TermBox/g) ?? []).length).toBeGreaterThanOrEqual(2);
      expect((source.match(/<TermBox/g) ?? []).length).toBeLessThanOrEqual(3);
      expect(mermaidCount(source)).toBeGreaterThanOrEqual(3);
      expect(mermaidCount(source)).toBeLessThanOrEqual(4);
      expect(source).toContain('<details>');
      expect(source).toContain('- [ ]');
      expect(source).toMatch(/Rule of thumb|Quy tắc bỏ túi/);
      expect(source).toMatch(/Fatal pitfall|Sai lầm chí mạng/);
      expect(source).toMatch(/Direct SPA/i);
      expect(source).toMatch(/Backend for Frontend|BFF/i);
      expect(source).toMatch(/PKCE/i);
      expect(source).toMatch(/HttpOnly/i);
      expect(source).toMatch(/SameSite/i);
      expect(source).toMatch(/CSRF/i);
      expect(source).toMatch(/refresh token/i);
      expect(source).toMatch(/logout/i);
      expect(source).toMatch(/DevTools/i);
    }
  });

  it('teaches boundary-first auth debugging in both languages', () => {
    for (const relativePath of [files.debugging.en, files.debugging.vi]) {
      const source = lesson(relativePath);
      expect(source).toContain('category: backend-engineering');
      expect(source).toContain('contentType: field-guide');
      expect(source).toContain('learningDepth: operate');
      expect(source).toContain('lastVerified: 2026-09-21');
      expect(source).toContain('  - authentication-and-authorization');
      expect(source).toContain('  - oauth-and-oidc');
      expect(source).toContain('  - identity-provider-integration');
      expect(source).toContain('  - same-origin-and-cors');
      expect((source.match(/<TermBox/g) ?? []).length).toBeGreaterThanOrEqual(2);
      expect((source.match(/<TermBox/g) ?? []).length).toBeLessThanOrEqual(3);
      expect(mermaidCount(source)).toBeGreaterThanOrEqual(3);
      expect(source).toContain('<details>');
      expect(source).toContain('- [ ]');
      expect(source).toMatch(/401/);
      expect(source).toMatch(/403/);
      expect(source).toMatch(/CORS/i);
      expect(source).toMatch(/redirect/i);
      expect(source).toMatch(/issuer/i);
      expect(source).toMatch(/audience/i);
      expect(source).toMatch(/JWKS/i);
      expect(source).toMatch(/realm role/i);
      expect(source).toMatch(/client role/i);
      expect(source).toMatch(/refresh/i);
      expect(source).toMatch(/logout/i);
    }
  });

  it('anchors both artifacts in production consequences', () => {
    for (const relativePath of [files.architecture.en, files.debugging.en]) {
      const source = lesson(relativePath);
      expect(source).toContain('**Impact:**');
      expect(source).toContain('**Root cause:**');
      expect(source).toContain('**Correct pattern:**');
    }

    for (const relativePath of [files.architecture.vi, files.debugging.vi]) {
      const source = lesson(relativePath);
      expect(source).toContain('**Hậu quả:**');
      expect(source).toContain('**Nguyên nhân cốt lõi:**');
      expect(source).toContain('**Cách khắc phục chuẩn:**');
    }
  });

  it('records the new routes in the rolling changelog', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 21, 2026 · Frontend Authentication Architecture & Debugging');
    expect(en).toContain(
      '](/docs/engineering-judgment/architecture-walkthroughs/frontend-authentication-architecture)',
    );
    expect(en).toContain('](/docs/backend-engineering/auth-debugging-field-guide)');

    expect(vi).toContain('Ngày 21 tháng 09 năm 2026 · Kiến trúc Xác thực Frontend & Debugging');
    expect(vi).toContain(
      '](/vi/docs/engineering-judgment/architecture-walkthroughs/frontend-authentication-architecture)',
    );
    expect(vi).toContain('](/vi/docs/backend-engineering/auth-debugging-field-guide)');
  });

  it('contains no placeholders', () => {
    for (const relativePath of [
      files.architecture.en,
      files.architecture.vi,
      files.debugging.en,
      files.debugging.vi,
    ]) {
      const source = lesson(relativePath);
      expect(source).not.toMatch(/TODO|TBD|PLACEHOLDER/i);
    }
  });
});
