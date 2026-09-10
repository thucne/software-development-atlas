import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/engineering-judgment/decision-guides/queue-vs-event-stream.mdx',
  vi: 'content/docs/engineering-judgment/decision-guides/queue-vs-event-stream.vi.mdx',
} as const;

describe('Queue vs Event Stream decision guide', () => {
  it('publishes the bilingual decision guide in Engineering Judgment', () => {
    expect(read('content/docs/engineering-judgment/decision-guides/meta.json')).toContain(
      '"queue-vs-event-stream"',
    );
    expect(read('content/docs/engineering-judgment/decision-guides/meta.vi.json')).toContain(
      '"queue-vs-event-stream"',
    );
  });

  it('places both variants on canonical messaging concepts at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: decision-guide');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toContain('  - message-queues');
      expect(source, relativePath).toContain('  - delivery-semantics');
    }
  });

  it('teaches the decision through consumption, replay, ordering, and backpressure trade-offs', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toContain('<DecisionMatrix');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
      expect(source, relativePath).toMatch(/competing consumer|cạnh tranh.*consumer/i);
      expect(source, relativePath).toMatch(/replay|phát lại/i);
      expect(source, relativePath).toMatch(/retention|lưu giữ/i);
      expect(source, relativePath).toMatch(/ordering|thứ tự/i);
      expect(source, relativePath).toMatch(/partition|phân vùng/i);
      expect(source, relativePath).toMatch(/backpressure|áp lực ngược/i);
      expect(source, relativePath).toMatch(/acknowledg|xác nhận/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
