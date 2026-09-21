import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessons = {
  oauth: {
    en: 'content/docs/backend-engineering/oauth-and-oidc.mdx',
    vi: 'content/docs/backend-engineering/oauth-and-oidc.vi.mdx',
    concept: 'oauth-and-oidc',
  },
  sso: {
    en: 'content/docs/backend-engineering/sso-and-identity-federation.mdx',
    vi: 'content/docs/backend-engineering/sso-and-identity-federation.vi.mdx',
    concept: 'sso-and-identity-federation',
  },
  keycloak: {
    en: 'content/docs/backend-engineering/keycloak-in-practice.mdx',
    vi: 'content/docs/backend-engineering/keycloak-in-practice.vi.mdx',
    concept: 'identity-provider-integration',
  },
} as const;

function lesson(relativePath: string) {
  const absolute = path.join(repoRoot, relativePath);
  expect(existsSync(absolute), relativePath).toBe(true);
  return readFileSync(absolute, 'utf8');
}

describe('Identity protocols and Keycloak lessons', () => {
  it('registers canonical concepts after Authentication & Authorization', () => {
    const atlas = JSON.parse(read('content/atlas-map.json'));
    const backend = atlas.domains.find((domain: { id: string }) => domain.id === 'backend-engineering');
    const ids = backend.concepts.map((concept: { id: string }) => concept.id);

    const auth = ids.indexOf('authentication-and-authorization');
    expect(ids.slice(auth + 1, auth + 4)).toEqual([
      'oauth-and-oidc',
      'sso-and-identity-federation',
      'identity-provider-integration',
    ]);
  });

  it('publishes the three lessons immediately after Authentication & Authorization in both sidebars', () => {
    for (const relativePath of [
      'content/docs/backend-engineering/meta.json',
      'content/docs/backend-engineering/meta.vi.json',
    ]) {
      const pages = JSON.parse(read(relativePath)).pages as string[];
      const auth = pages.indexOf('authentication-and-authorization');
      expect(pages.slice(auth + 1, auth + 4), relativePath).toEqual([
        'oauth-and-oidc',
        'sso-and-identity-federation',
        'keycloak-in-practice',
      ]);
    }
  });

  it('adds protocol fundamentals to the Backend Systems learning path without making Keycloak mandatory', () => {
    const data = JSON.parse(read('content/learning-paths.json'));
    const backend = data.paths.find((item: { id: string }) => item.id === 'backend-systems');
    const auth = backend.concepts.indexOf('authentication-and-authorization');

    expect(backend.concepts.slice(auth + 1, auth + 3)).toEqual([
      'oauth-and-oidc',
      'sso-and-identity-federation',
    ]);
    expect(backend.concepts).not.toContain('identity-provider-integration');
  });

  it('keeps bilingual metadata and pedagogical anchors aligned', () => {
    for (const item of Object.values(lessons)) {
      for (const relativePath of [item.en, item.vi]) {
        const source = lesson(relativePath);
        expect(source).toContain('category: backend-engineering');
        expect(source).toContain('lastVerified: 2026-09-21');
        expect(source).toMatch(new RegExp(`concepts:\\n  - ` + item.concept + `\\n---`));
        expect((source.match(/<TermBox/g) ?? []).length).toBeGreaterThanOrEqual(2);
        expect((source.match(/<TermBox/g) ?? []).length).toBeLessThanOrEqual(3);
        expect((source.match(/```mermaid/g) ?? []).length).toBeGreaterThanOrEqual(3);
        expect((source.match(/```mermaid/g) ?? []).length).toBeLessThanOrEqual(4);
        expect(source).toContain('<details>');
        expect(source).toContain('- [ ]');
        expect(source).toMatch(/Rule of thumb|Quy tắc bỏ túi/);
        expect(source).toMatch(/Fatal pitfall|Sai lầm chí mạng/);
      }
    }

    expect(lesson(lessons.oauth.en)).toContain('contentType: deep-dive');
    expect(lesson(lessons.sso.en)).toContain('contentType: deep-dive');
    expect(lesson(lessons.keycloak.en)).toContain('contentType: field-guide');
    expect(lesson(lessons.keycloak.en)).toContain('learningDepth: operate');
  });

  it('teaches OAuth/OIDC from a browser and token-boundary perspective', () => {
    for (const relativePath of [lessons.oauth.en, lessons.oauth.vi]) {
      const source = lesson(relativePath);
      expect(source).toMatch(/Authorization Code/i);
      expect(source).toMatch(/PKCE/i);
      expect(source).toMatch(/public client/i);
      expect(source).toMatch(/client secret/i);
      expect(source).toMatch(/ID Token/i);
      expect(source).toMatch(/access token/i);
      expect(source).toMatch(/refresh token/i);
      expect(source).toMatch(/issuer|`iss`/i);
      expect(source).toMatch(/audience|`aud`/i);
      expect(source).toMatch(/JWKS/i);
      expect(source).toMatch(/nonce/i);
      expect(source).toMatch(/state/i);
      expect(source).toMatch(/Backend for Frontend|BFF/i);
      expect(source).toMatch(/decode.*validate|Decode.*validate/i);
    }
  });

  it('separates SSO sessions and compares OIDC, SAML, and CAS', () => {
    for (const relativePath of [lessons.sso.en, lessons.sso.vi]) {
      const source = lesson(relativePath);
      expect(source).toMatch(/Single Sign-On|SSO/i);
      expect(source).toMatch(/Identity Federation|identity federation/i);
      expect(source).toMatch(/local session/i);
      expect(source).toMatch(/IdP|Identity Provider/i);
      expect(source).toMatch(/OIDC/i);
      expect(source).toMatch(/SAML/i);
      expect(source).toMatch(/CAS/i);
      expect(source).toMatch(/Service Ticket|service ticket/i);
      expect(source).toMatch(/Single Logout|global logout|central.*logout/i);
      expect(source).toMatch(/identity brokering/i);
      expect(source).toMatch(/user federation/i);
    }
  });

  it('maps Keycloak concepts to protocol and API boundaries', () => {
    for (const relativePath of [lessons.keycloak.en, lessons.keycloak.vi]) {
      const source = lesson(relativePath);
      expect(source).toMatch(/Realm/i);
      expect(source).toMatch(/client authentication/i);
      expect(source).toMatch(/public client/i);
      expect(source).toMatch(/realm role/i);
      expect(source).toMatch(/client role/i);
      expect(source).toMatch(/client scope/i);
      expect(source).toMatch(/protocol mapper/i);
      expect(source).toMatch(/keycloak-js/i);
      expect(source).toMatch(/PKCE/i);
      expect(source).toMatch(/identity brokering/i);
      expect(source).toMatch(/user federation/i);
      expect(source).toMatch(/JWKS/i);
      expect(source).toMatch(/audience/i);
    }
  });

  it('anchors every lesson in production consequences', () => {
    for (const relativePath of [lessons.oauth.en, lessons.sso.en, lessons.keycloak.en]) {
      const source = lesson(relativePath);
      expect(source).toContain('**Impact:**');
      expect(source).toContain('**Root cause:**');
      expect(source).toContain('**Correct pattern:**');
    }
    for (const relativePath of [lessons.oauth.vi, lessons.sso.vi, lessons.keycloak.vi]) {
      const source = lesson(relativePath);
      expect(source).toContain('**Hậu quả:**');
      expect(source).toContain('**Nguyên nhân cốt lõi:**');
      expect(source).toContain('**Cách khắc phục chuẩn:**');
    }
  });

  it('records all three routes in the rolling changelog', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 21, 2026 · Identity Protocols & Keycloak');
    expect(en).toContain('](/docs/backend-engineering/oauth-and-oidc)');
    expect(en).toContain('](/docs/backend-engineering/sso-and-identity-federation)');
    expect(en).toContain('](/docs/backend-engineering/keycloak-in-practice)');

    expect(vi).toContain('Ngày 21 tháng 09 năm 2026 · Giao thức Danh tính & Keycloak');
    expect(vi).toContain('](/vi/docs/backend-engineering/oauth-and-oidc)');
    expect(vi).toContain('](/vi/docs/backend-engineering/sso-and-identity-federation)');
    expect(vi).toContain('](/vi/docs/backend-engineering/keycloak-in-practice)');
  });
});
