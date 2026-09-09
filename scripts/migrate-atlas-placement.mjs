import { readFileSync, writeFileSync } from 'node:fs';

const placements = new Map([
  [
    'content/docs/programming/async/promises.mdx',
    {
      contentType: 'deep-dive',
      learningDepth: 'reason',
      concepts: ['promises'],
    },
  ],
  [
    'content/docs/programming/async/how-the-browser-event-loop-works.mdx',
    {
      contentType: 'deep-dive',
      learningDepth: 'reason',
      concepts: ['browser-event-loop', 'async-scheduling'],
    },
  ],
  [
    'content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx',
    {
      contentType: 'deep-dive',
      learningDepth: 'reason',
      concepts: ['async-dependency-scheduling', 'promises'],
    },
  ],
]);

for (const [filePath, placement] of placements) {
  const source = readFileSync(filePath, 'utf8');
  const closingMarker = source.indexOf('\n---\n', 4);

  if (!source.startsWith('---\n') || closingMarker === -1) {
    throw new Error(`${filePath}: expected YAML frontmatter`);
  }

  const frontmatter = source.slice(4, closingMarker);
  if (/^(contentType|learningDepth|concepts):/m.test(frontmatter)) {
    console.log(`${filePath}: Atlas placement metadata already present`);
    continue;
  }

  const concepts = placement.concepts.map((id) => `  - ${id}`).join('\n');
  const addition = [
    `contentType: ${placement.contentType}`,
    `learningDepth: ${placement.learningDepth}`,
    'concepts:',
    concepts,
  ].join('\n');

  const migrated = `${source.slice(0, closingMarker)}\n${addition}${source.slice(closingMarker)}`;
  writeFileSync(filePath, migrated);
  console.log(`${filePath}: added Atlas placement metadata`);
}
