import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const deepDives = [
  'content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx',
  'content/docs/programming/async/how-the-browser-event-loop-works.mdx',
  'content/docs/programming/async/promises.mdx',
] as const;

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Atlas content reliability migration', () => {
  it('records the completed 2026-09-09 verification date on all three migrated deep dives', () => {
    for (const relativePath of deepDives) {
      expect(read(relativePath)).toContain('lastVerified: 2026-09-09');
    }
  });

  it('removes the dangling Event Loop TLDR diagram reference', () => {
    const source = read(
      'content/docs/programming/async/how-the-browser-event-loop-works.mdx',
    );

    expect(source).not.toContain(
      'carry this browser diagram directly into Node.js',
    );
  });

  it('does not teach Promise.resolve(inner) as a distinct adopting outer Promise', () => {
    const source = read('content/docs/programming/async/promises.mdx');

    expect(source).toContain('Promise.resolve(inner)');
    expect(source).toContain('same === inner');
    expect(source).toContain('outer === inner');
  });

  it('publishes the named Atlas Clarity Contract', () => {
    const guide = read('CONTENT_GUIDE.md');

    expect(guide).toContain('## Atlas Clarity Contract');
    expect(guide).toContain('### Local completeness');
    expect(guide).toContain('### Define before depending');
    expect(guide).toContain('### Scope guarantees and recommendations');
    expect(guide).toContain('### Examples are factual claims');
  });
});
