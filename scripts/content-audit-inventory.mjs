#!/usr/bin/env node
// Repository-wide inventory, not a factual or bilingual audit certificate.
// No external service, hosted model, or paid API is required.
import { readdirSync, readFileSync, mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(process.cwd(), 'content/docs');
const outputDir = resolve(process.cwd(), 'audit-reports');
const tick = String.fromCharCode(96);
const fence = tick.repeat(3);

function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(target) : entry.isFile() && entry.name.endsWith('.mdx') ? [target] : [];
  });
}

function parse(file) {
  const source = readFileSync(file, 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match) return { file, source, body: source, fields: {}, concepts: [], error: 'missing YAML frontmatter' };
  const front = match[1];
  const fields = {};
  for (const line of front.split(/\r?\n/)) {
    const field = /^([a-zA-Z][a-zA-Z0-9]*):\s*(.*)$/.exec(line);
    if (field) fields[field[1]] = field[2].replace(/^["']|["']$/g, '');
  }
  const concepts = [];
  let inConcepts = false;
  for (const line of front.split(/\r?\n/)) {
    if (/^concepts:\s*$/.test(line)) { inConcepts = true; continue; }
    if (inConcepts && /^\S/.test(line)) inConcepts = false;
    if (inConcepts) {
      const item = /^\s+-\s+(.+)$/.exec(line);
      if (item) concepts.push(item[1].trim());
    }
  }
  return { file, source, body: source.slice(match[0].length), fields, concepts };
}

function stats(page) {
  if (!page) return { sources: 0, mermaid: 0, fences: 0, headings: 0, markers: [] };
  const lines = page.body.split(/\r?\n/);
  const fences = lines.filter((line) => line.startsWith(fence)).length;
  const mermaid = lines.filter((line) => line.trim() === fence + 'mermaid').length;
  const headings = lines.filter((line) => /^##\s/.test(line)).length;
  const sources = new Set(page.body.match(/https?:\/\/[^\s)>\]]+/g) || []).size;
  const markers = [];
  const lead = page.body.slice(0, 3600);
  if (/(?:\b\d[\d,.]*\s*(?:users?|requests?\s+per\s+second|qps|seconds?|million|triệu|người dùng|lượt yêu cầu)|100%\s+(?:uptime|CPU)|catastrophic|thảm họa)/i.test(lead)
      && !/(?:hypothetical|illustrative|giả định|minh họa|constructed example)/i.test(lead)) {
    markers.push('Review numeric/dramatic opening for primary evidence or explicit hypothetical label');
  }
  if (/fatal pitfall|cạm bẫy chết người|rock-solid backward compatibility/i.test(lead)) {
    markers.push('Review absolute or alarmist summary wording');
  }
  return { sources, mermaid, fences, headings, markers };
}

const allFiles = filesUnder(root);
const map = new Map(allFiles.map((file) => [relative(root, file).replace(/\\/g, '/'), parse(file)]));
const substantive = [...map.entries()].filter(([path, page]) => !path.endsWith('.vi.mdx') &&
  ['concept', 'deep-dive', 'decision-guide', 'field-guide', 'architecture-walkthrough'].includes(page.fields.contentType));
substantive.sort(([a], [b]) => a.localeCompare(b));
const hard = [];
const rows = [];
for (const [path, en] of substantive) {
  const viPath = path.replace(/\.mdx$/, '.vi.mdx');
  const vi = map.get(viPath);
  const a = stats(en), b = stats(vi);
  const review = [...a.markers.map((s) => 'EN: ' + s), ...b.markers.map((s) => 'VI: ' + s)];
  if (!vi) hard.push(path + ': missing Vietnamese companion');
  if (en.error) hard.push(path + ': ' + en.error);
  if (vi?.error) hard.push(viPath + ': ' + vi.error);
  if (vi) {
    for (const key of ['contentType', 'learningDepth', 'category', 'lastVerified', 'status']) {
      if (en.fields[key] !== vi.fields[key]) hard.push(path + ': EN/VI mismatch in ' + key);
    }
    if (JSON.stringify(en.concepts) !== JSON.stringify(vi.concepts)) hard.push(path + ': EN/VI canonical concepts differ');
  }
  if (a.fences % 2 !== 0 || b.fences % 2 !== 0) review.push('Inspect unmatched Markdown code fence');
  if (a.mermaid !== b.mermaid) review.push('Check EN/VI diagram count mismatch');
  if (a.fences !== b.fences) review.push('Check EN/VI fenced example count mismatch');
  if (a.sources === 0 || b.sources === 0) review.push('Check missing direct source URLs');
  if (Math.abs(a.headings - b.headings) > 2) review.push('Check EN/VI heading coverage differences');
  rows.push({ path: path.replace(/\.mdx$/, ''), review, en: a, vi: b, lastVerified: en.fields.lastVerified || '(missing)' });
}
const other = [...map.entries()].filter(([p, page]) => p.endsWith('.vi.mdx') &&
  ['concept', 'deep-dive', 'decision-guide', 'field-guide', 'architecture-walkthrough'].includes(page.fields.contentType) &&
  !map.has(p.replace(/\.vi\.mdx$/, '.mdx'))).map(([p]) => p);
for (const orphan of other) hard.push(orphan + ': orphan substantive Vietnamese lesson');

const lines = [
  '# Atlas full-corpus structural and risk-cue inventory',
  '',
  '**Automated triage only. NOT a technical accuracy review, translation certification, incident fact-check, source validation, or completion of master issue #116.**',
  '',
  '- Substantive EN/VI lesson pairs found: ' + rows.length,
  '- Substantive MDX files expected from pairs: ' + (rows.length * 2),
  '- Structural blockers: ' + hard.length,
  '- Pairs with advisory review cues: ' + rows.filter((r) => r.review.length).length,
  '- Generated by: scripts/content-audit-inventory.mjs (no network calls)',
  '',
  '## Structural blockers',
  '',
  ...(hard.length ? hard.map((v) => '- ' + v) : ['None detected by this structural sweep.']),
  '',
  '## Per-pair review leads',
  '',
  '| Lesson pair | Verified date | Source URLs EN/VI | Mermaid EN/VI | Fences EN/VI | Review cues |',
  '| --- | --- | ---: | ---: | ---: | --- |',
  ...rows.map((r) => '| ' + tick + r.path + tick + ' | ' + r.lastVerified + ' | ' +
    r.en.sources + '/' + r.vi.sources + ' | ' + r.en.mermaid + '/' + r.vi.mermaid + ' | ' +
    r.en.fences + '/' + r.vi.fences + ' | ' + (r.review.length ? r.review.join('; ').replace(/\|/g, '/') : '—') + ' |'),
  '',
  '## Limitations and next steps',
  '',
  '- Counts compare structure, not semantic equivalence; matching diagrams or examples can still contain different or incorrect claims.',
  '- Numeric-claim heuristics are only review leads, not proven defects; absence of a flag is not evidence that an article is accurate.',
  '- Source URL counts do not validate source authority, freshness, or whether the citation supports a claim.',
  '- A pair earns a completed checkbox only after full EN/VI reading, normative/vendor verification, example review and linked CI evidence under #116.',
  ''
];
const report = lines.join('\n');
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'content-inventory.md'), report);
writeFileSync(join(outputDir, 'content-inventory.json'), JSON.stringify({
  schemaVersion: 1, generatedBy: 'scripts/content-audit-inventory.mjs',
  disclaimer: 'Automated triage; NOT certified content quality.',
  pairCount: rows.length, blockers: hard, rows
}, null, 2) + '\n');
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
process.stdout.write('Atlas inventory: ' + rows.length + ' substantive EN/VI pairs, ' +
  hard.length + ' structural blockers, ' + rows.filter((r) => r.review.length).length + ' pairs with review leads.\n');
if (hard.length) {
  for (const issue of hard) process.stderr.write('STRUCTURAL BLOCKER: ' + issue + '\n');
  process.exitCode = 1;
}
