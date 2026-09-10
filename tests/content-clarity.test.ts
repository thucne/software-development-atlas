import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const substantivePages = [
  'content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx',
  'content/docs/programming/async/how-the-browser-event-loop-works.mdx',
  'content/docs/programming/async/promises.mdx',
  'content/docs/web-platform/http-request-lifecycle.mdx',
  'content/docs/engineering-judgment/decision-guides/csr-vs-ssr-vs-ssg.mdx',
  'content/docs/engineering-judgment/decision-guides/monolith-vs-modular-monolith-vs-microservices.mdx',
  'content/docs/engineering-judgment/decision-guides/containers-vs-serverless.mdx',
  'content/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout.mdx',
] as const;

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Atlas content reliability migration', () => {
  it('records verification dates for the migrated deep dives', () => {
    expect(
      read('content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx'),
    ).toContain('lastVerified: 2026-09-09');
    expect(
      read('content/docs/programming/async/how-the-browser-event-loop-works.mdx'),
    ).toContain('lastVerified: 2026-09-09');
    expect(read('content/docs/programming/async/promises.mdx')).toContain(
      'lastVerified: 2026-09-10',
    );
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

describe('Atlas teaching clarity migration', () => {
  it('adds visible terminology support to every substantive teaching page', () => {
    for (const relativePath of substantivePages) {
      expect(read(relativePath), relativePath).toContain('<TermBox term=');
    }
  });

  it('documents the working-developer teaching baseline', () => {
    const guide = read('CONTENT_GUIDE.md');

    expect(guide).toContain('## Atlas Teaching Contract');
    expect(guide).toContain('working software developer');
    expect(guide).toContain('TermBox');
    expect(guide).toContain('first substantive use');
  });

  it('protects representative difficult-term explanations', () => {
    const eventLoop = read(
      'content/docs/programming/async/how-the-browser-event-loop-works.mdx',
    );
    const checkout = read(
      'content/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout.mdx',
    );

    expect(eventLoop).toContain('<TermBox term="Microtask checkpoint">');
    expect(eventLoop).toContain('<TermBox term="Task source">');
    expect(eventLoop).toContain('<TermBox term="Rendering opportunity">');
    expect(checkout).toContain('<TermBox term="Transactional outbox">');
  });
});
