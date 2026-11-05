import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

const pairs = [
  {
    name: 'oauth-and-oidc',
    en: ['requires PKCE', 'mix-up defense', 'does not authenticate a public client'],
    vi: ['yêu cầu PKCE', 'chống mix-up', 'không xác thực danh tính của public client'],
  },
  {
    name: 'sso-and-identity-federation',
    en: ['not an atomic transaction', 'already issued access tokens', 'hypothetical'],
    vi: ['không phải transaction nguyên tử', 'access token còn hạn', 'giả định'],
  },
  {
    name: 'keycloak-in-practice',
    en: ["pkceMethod: 'S256'", 'adapter-version-dependent', 'hypothetical'],
    vi: ["pkceMethod: 'S256'", 'phiên bản adapter', 'giả định'],
  },
] as const;

describe('Wave 1 protocol and identity security semantics', () => {
  for (const item of pairs) {
    it(`preserves ${item.name} EN/VI boundaries and verification date`, () => {
      for (const locale of ['en', 'vi'] as const) {
        const file = `content/docs/backend-engineering/${item.name}${locale === 'vi' ? '.vi' : ''}.mdx`;
        const body = readFileSync(path.join(root, file), 'utf8');
        expect(body, file).toContain('lastVerified: 2026-11-05');
        for (const phrase of item[locale]) {
          expect(body, `${file}: ${phrase}`).toContain(phrase);
        }
      }
    });
  }
});
