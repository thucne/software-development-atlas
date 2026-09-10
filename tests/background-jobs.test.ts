import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/backend-engineering/background-jobs.mdx',
  vi: 'content/docs/backend-engineering/background-jobs.vi.mdx',
} as const;

describe('Background Jobs lesson', () => {
  it('publishes the lesson after backend concurrency in the bilingual backend section', () => {
    for (const relativePath of [
      'content/docs/backend-engineering/meta.json',
      'content/docs/backend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const concurrency = source.indexOf('"backend-concurrency"');
      const jobs = source.indexOf('"background-jobs"');

      expect(jobs, relativePath).toBeGreaterThan(concurrency);
    }
  });

  it('places both variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toContain('  - background-jobs');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches durable lifecycle, ownership, redelivery, retries, idempotency, poison work, and operations', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/background job|công việc nền/i);
      expect(source, relativePath).toMatch(/durable|bền vững/i);
      expect(source, relativePath).toMatch(/state machine|lifecycle|vòng đời|máy trạng thái/i);
      expect(source, relativePath).toMatch(/claim|lease|quyền xử lý|quyền sở hữu/i);
      expect(source, relativePath).toMatch(/acknowledg|ack\b|xác nhận/i);
      expect(source, relativePath).toMatch(/at-least-once|redeliver|giao lại|phát lại/i);
      expect(source, relativePath).toMatch(/idempoten|lặp lại an toàn/i);
      expect(source, relativePath).toMatch(/retry|thử lại/i);
      expect(source, relativePath).toMatch(/backoff|giãn cách/i);
      expect(source, relativePath).toMatch(/poison|dead-letter|lỗi vĩnh viễn|không thể xử lý/i);
      expect(source, relativePath).toMatch(/cancel|hủy/i);
      expect(source, relativePath).toMatch(/progress|tiến độ/i);
      expect(source, relativePath).toMatch(/worker crash|worker.*crash|worker.*chết|worker.*dừng đột ngột/i);
      expect(source, relativePath).toMatch(/queue age|backlog|độ tuổi.*hàng đợi|tồn đọng/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
