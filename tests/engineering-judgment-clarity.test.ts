import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

const csrPath =
  'content/docs/engineering-judgment/decision-guides/csr-vs-ssr-vs-ssg.mdx';
const computePath =
  'content/docs/engineering-judgment/decision-guides/containers-vs-serverless.mdx';
const servicesPath =
  'content/docs/engineering-judgment/decision-guides/monolith-vs-modular-monolith-vs-microservices.mdx';
const checkoutPath =
  'content/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout.mdx';

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Engineering Judgment clarity migration', () => {
  it('replaces vague rendering rankings with explicit conditions', () => {
    const source = read(csrPath);

    expect(source).not.toContain('cheapest rendering point');
    expect(source).not.toContain("'Strong fit'");
    expect(source).not.toContain("'Excellent when content is shared'");
    expect(source).toContain('request-time state');
    expect(source).toContain('same generated representation can be reused');
  });

  it('scopes serverless guidance to the selected platform contract', () => {
    const source = read(computePath);

    expect(source).not.toContain('a strong fit');
    expect(source).not.toContain("'Generally lower;");
    expect(source).toContain('selected platform');
    expect(source).toContain('scaling, startup, concurrency, lifecycle, and billing');
  });

  it('describes architecture trade-offs without universal lowest/highest rankings', () => {
    const source = read(servicesPath);

    expect(source).not.toContain("['Lowest'");
    expect(source).not.toContain("'Highest: many deployables");
    expect(source).not.toContain('strong middle ground');
    expect(source).toContain('depends on deployment count');
    expect(source).toContain('independent deployment creates measurable value');
  });

  it('scopes duplicate-delivery guidance to systems that can redeliver', () => {
    const source = read(checkoutPath);

    expect(source).not.toContain('delivery may be at least once');
    expect(source).toContain('can deliver the same message more than once');
    expect(source).toContain('when the selected broker or delivery mode can redeliver');
    expect(source).toContain('Amazon SQS at-least-once delivery');
  });
});
