import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

const docsRoot = path.join(process.cwd(), 'content', 'docs');

function collectMdxFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    return statSync(fullPath).isDirectory()
      ? collectMdxFiles(fullPath)
      : entry.endsWith('.mdx')
        ? [fullPath]
        : [];
  });
}

function findUnclosedFence(source: string): { line: number; marker: string } | null {
  let open: { line: number; char: '`' | '~'; length: number } | null = null;

  for (const [index, line] of source.split(/\r?\n/).entries()) {
    const match = line.match(/^\s*(`{3,}|~{3,})/);
    if (!match) continue;

    const marker = match[1];
    const char = marker[0] as '`' | '~';

    if (!open) {
      open = { line: index + 1, char, length: marker.length };
      continue;
    }

    if (char === open.char && marker.length >= open.length) {
      open = null;
    }
  }

  return open
    ? { line: open.line, marker: open.char.repeat(open.length) }
    : null;
}

describe('authored MDX rendering syntax', () => {
  test('every fenced code block is explicitly closed', () => {
    const failures = collectMdxFiles(docsRoot).flatMap((filePath) => {
      const source = readFileSync(filePath, 'utf8');
      const unclosed = findUnclosedFence(source);
      if (!unclosed) return [];

      return [
        `${path.relative(process.cwd(), filePath)}:${unclosed.line} has an unclosed ${unclosed.marker} fence`,
      ];
    });

    expect(failures).toEqual([]);
  });
});
