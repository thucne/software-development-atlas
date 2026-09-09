import { atlasConceptIds } from '@/lib/content/atlas-map';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const docsRoot = path.join(process.cwd(), 'content', 'docs');

function listMdxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return listMdxFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith('.mdx') ? [fullPath] : [];
  });
}

function extractFrontmatter(source: string, filePath: string): string {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!match) {
    throw new Error(`${filePath}: missing YAML frontmatter`);
  }

  return match[1];
}

function extractScalar(frontmatter: string, key: string): string | undefined {
  return frontmatter.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm'))?.[1];
}

function extractStringArray(frontmatter: string, key: string): string[] | undefined {
  const lines = frontmatter.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith(`${key}:`));

  if (start === -1) {
    return undefined;
  }

  const inlineValue = lines[start].slice(key.length + 1).trim();
  if (inlineValue === '[]') {
    return [];
  }

  if (inlineValue.length > 0) {
    throw new Error(`${key}: use a block string array or []`);
  }

  const values: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const match = lines[index].match(/^\s{2}-\s+(.+?)\s*$/);
    if (!match) {
      break;
    }

    values.push(match[1]);
  }

  return values;
}

describe('authored Atlas content', () => {
  const files = listMdxFiles(docsRoot);

  it('has authored MDX content to validate', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const filePath of files) {
    const relativePath = path.relative(process.cwd(), filePath);

    it(`${relativePath} declares valid Atlas placement metadata`, () => {
      const source = readFileSync(filePath, 'utf8');
      const frontmatter = extractFrontmatter(source, relativePath);
      const contentType = extractScalar(frontmatter, 'contentType');
      const learningDepth = extractScalar(frontmatter, 'learningDepth');
      const concepts = extractStringArray(frontmatter, 'concepts');

      expect(contentType, `${relativePath}: contentType`).toBeTruthy();
      expect(learningDepth, `${relativePath}: learningDepth`).toBeTruthy();
      expect(concepts, `${relativePath}: concepts`).toBeDefined();

      const conceptIds = concepts ?? [];
      expect(new Set(conceptIds).size, `${relativePath}: duplicate concepts`).toBe(
        conceptIds.length,
      );

      for (const conceptId of conceptIds) {
        expect(
          atlasConceptIds.has(conceptId),
          `${relativePath}: unknown concept ${conceptId}`,
        ).toBe(true);
      }
    });
  }
});
