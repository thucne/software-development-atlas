import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const searchRoute = readFileSync(
  path.join(process.cwd(), 'app/api/search/route.ts'),
  'utf8',
);
const searchDialog = readFileSync(
  path.join(process.cwd(), 'components/search-dialog.tsx'),
  'utf8',
);

describe('search runtime', () => {
  it('keeps the search index on the server instead of prerendering a static payload', () => {
    expect(searchRoute).toMatch(
      /export const \{\s*GET\s*\} = createFromSource\(source\);/,
    );
    expect(searchRoute).not.toContain('staticGET');
    expect(searchRoute).not.toMatch(/export const revalidate\s*=\s*false/);
  });

  it('queries the server search endpoint through the configured base path', () => {
    expect(searchDialog).toContain("fumadocs-core/search/client/fetch");
    expect(searchDialog).toMatch(
      /fetchClient\(\{\s*api: withBasePath\('\/api\/search'\),?\s*\}\)/,
    );
    expect(searchDialog).not.toContain('orama-static');
    expect(searchDialog).not.toContain('staticClient');
  });
});
