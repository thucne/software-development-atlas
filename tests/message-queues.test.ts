import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/backend-engineering/message-queues.mdx',
  vi: 'content/docs/backend-engineering/message-queues.vi.mdx',
} as const;

describe('Message Queues lesson', () => {
  it('publishes the lesson after application caching in the bilingual backend section', () => {
    for (const relativePath of [
      'content/docs/backend-engineering/meta.json',
      'content/docs/backend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const caching = source.indexOf('"application-caching"');
      const queues = source.indexOf('"message-queues"');

      expect(queues, relativePath).toBeGreaterThan(caching);
    }
  });

  it('places both variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toContain('  - message-queues');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches broker delivery semantics, ownership, flow control, failure, and operations', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/producer|nhà sản xuất|bên gửi/i);
      expect(source, relativePath).toMatch(/broker|message broker|bộ môi giới|hệ thống hàng đợi/i);
      expect(source, relativePath).toMatch(/consumer|worker|bên tiêu thụ|bên xử lý/i);
      expect(source, relativePath).toMatch(/competing consumer|consumer cạnh tranh|worker cạnh tranh/i);
      expect(source, relativePath).toMatch(/acknowledg|\back\b|xác nhận xử lý|xác nhận hoàn tất/i);
      expect(source, relativePath).toMatch(/redeliver|giao lại/i);
      expect(source, relativePath).toMatch(/visibility timeout|prefetch|thời gian ẩn|cửa sổ.*chưa xác nhận/i);
      expect(source, relativePath).toMatch(/in[- ]flight|đang xử lý|đang bay/i);
      expect(source, relativePath).toMatch(/ordering|order.*scope|thứ tự/i);
      expect(source, relativePath).toMatch(/dead[- ]letter|hàng đợi lỗi|thư chết/i);
      expect(source, relativePath).toMatch(/idempoten|lũy đẳng/i);
      expect(source, relativePath).toMatch(/publisher confirm|publish.*confirm|xác nhận.*publish|xác nhận.*gửi/i);
      expect(source, relativePath).toMatch(/queue depth|backlog|độ sâu hàng đợi|tồn đọng/i);
      expect(source, relativePath).toMatch(/oldest|age of.*message|tuổi.*message|message.*lâu nhất/i);
      expect(source, relativePath).toMatch(/backpressure|áp lực ngược|kiểm soát áp lực/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
