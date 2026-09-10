import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/backend-engineering/rate-limiting.mdx',
  vi: 'content/docs/backend-engineering/rate-limiting.vi.mdx',
} as const;

describe('Rate Limiting lesson', () => {
  it('publishes the lesson after message queues in the bilingual backend section', () => {
    for (const relativePath of [
      'content/docs/backend-engineering/meta.json',
      'content/docs/backend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const queues = source.indexOf('"message-queues"');
      const rateLimiting = source.indexOf('"rate-limiting"');

      expect(rateLimiting, relativePath).toBeGreaterThan(queues);
    }
  });

  it('places both variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toContain('  - rate-limiting');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches admission policy, identity scope, bursts, distributed enforcement, client signaling, and operations', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/admission|admit|tiếp nhận|cho phép đi vào/i);
      expect(source, relativePath).toMatch(/rate[- ]limit key|limiter key|khóa giới hạn|khóa rate limit/i);
      expect(source, relativePath).toMatch(/tenant|organization|user|api key|người dùng|tổ chức/i);
      expect(source, relativePath).toMatch(/token bucket|thùng token/i);
      expect(source, relativePath).toMatch(/fixed window|sliding window|cửa sổ cố định|cửa sổ trượt/i);
      expect(source, relativePath).toMatch(/burst|bùng nổ|đột biến/i);
      expect(source, relativePath).toMatch(/concurrency|đồng thời/i);
      expect(source, relativePath).toMatch(/quota|hạn ngạch/i);
      expect(source, relativePath).toMatch(/429|Too Many Requests/i);
      expect(source, relativePath).toMatch(/Retry-After/i);
      expect(source, relativePath).toMatch(/RateLimit-Policy|RateLimit header/i);
      expect(source, relativePath).toMatch(/draft|work in progress|bản nháp|đang hoàn thiện/i);
      expect(source, relativePath).toMatch(/replica|instance|bản sao|tiến trình/i);
      expect(source, relativePath).toMatch(/fail[- ]open|fail[- ]closed|mở khi lỗi|đóng khi lỗi/i);
      expect(source, relativePath).toMatch(/allowed|limited|throttled|được phép|bị giới hạn/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
