import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/delivery-operations/logs-metrics-and-traces.mdx',
  vi: 'content/docs/delivery-operations/logs-metrics-and-traces.vi.mdx',
} as const;

describe('Logs, Metrics & Traces lesson', () => {
  it('publishes a bilingual Delivery & Operations section', () => {
    expect(read('content/docs/meta.json')).toContain('"delivery-operations"');
    expect(read('content/docs/meta.vi.json')).toContain('"delivery-operations"');
    expect(read('content/docs/delivery-operations/meta.json')).toContain(
      '"logs-metrics-and-traces"',
    );
    expect(read('content/docs/delivery-operations/meta.vi.json')).toContain(
      '"logs-metrics-and-traces"',
    );
  });

  it('places both variants on canonical observability concepts at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toContain('  - logs-metrics-traces');
    }
  });

  it('teaches evidence-driven production diagnosis across telemetry signals', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toContain('<TermBox term=');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
      expect(source, relativePath).toMatch(/cardinality/i);
      expect(source, relativePath).toMatch(/trace[_ -]?id/i);
      expect(source, relativePath).toMatch(/sampling/i);
      expect(source, relativePath).toMatch(/RED|rate/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
