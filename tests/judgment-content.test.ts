import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const decisionGuideFiles = [
  'csr-vs-ssr-vs-ssg.mdx',
  'monolith-vs-modular-monolith-vs-microservices.mdx',
  'containers-vs-serverless.mdx',
];

function readDecisionGuide(fileName: string): string {
  return readFileSync(
    path.join(
      process.cwd(),
      'content',
      'docs',
      'engineering-judgment',
      'decision-guides',
      fileName,
    ),
    'utf8',
  );
}

function extractFrontmatter(source: string): string {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!match) {
    throw new Error('missing YAML frontmatter');
  }

  return match[1];
}

describe('engineering judgment content', () => {
  it('publishes three representative decision guides with canonical metadata', () => {
    for (const fileName of decisionGuideFiles) {
      const frontmatter = extractFrontmatter(readDecisionGuide(fileName));

      expect(frontmatter).toMatch(/^contentType:\s+decision-guide$/m);
      expect(frontmatter).toMatch(/^learningDepth:\s+reason$/m);
      expect(frontmatter).toMatch(/^concepts:\s*$/m);
      expect(frontmatter).toMatch(/^\s{2}-\s+[a-z0-9-]+$/m);
    }
  });
});
