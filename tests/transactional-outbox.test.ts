import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/distributed-systems/transactional-outbox.mdx',
  vi: 'content/docs/distributed-systems/transactional-outbox.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Transactional Outbox lesson', () => {
  it('publishes immediately after Distributed Locks in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/distributed-systems/meta.json',
      'content/docs/distributed-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const locks = source.indexOf('"distributed-locks"');
      const outbox = source.indexOf('"transactional-outbox"');
      expect(locks, relativePath).toBeGreaterThan(-1);
      expect(outbox, relativePath).toBeGreaterThan(locks);
    }
  });

  it('places both locale variants on the canonical concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - transactional-outbox\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-17');

      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes, relativePath).toBeGreaterThanOrEqual(2);
      expect(termBoxes, relativePath).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches the outbox as an atomic communication-intent pattern rather than an exactly-once promise', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/dual[- ]write|ghi kép|hai hệ thống/i);
      expect(source, relativePath).toMatch(/same (database )?transaction|cùng (một )?transaction/i);
      expect(source, relativePath).toMatch(/outbox (row|record|table)|bảng outbox|bản ghi outbox/i);
      expect(source, relativePath).toMatch(/communication intent|publication intent|ý định.*(giao tiếp|phát|publish)/i);
      expect(source, relativePath).toMatch(/relay|poller|publisher|bộ chuyển tiếp|bộ phát/i);
      expect(source, relativePath).toMatch(/CDC|change data capture/i);
      expect(source, relativePath).toMatch(/commit.*before.*publish|publish.*after.*commit|commit.*trước.*(?:phát|publish)|(?:phát|publish).*sau.*commit/i);
      expect(source, relativePath).toMatch(/duplicate|redeliver|trùng lặp|phát lại/i);
      expect(source, relativePath).toMatch(/idempotent|idempotency/i);
      expect(source, relativePath).toMatch(/event id|message id|id sự kiện|event_id/i);
      expect(source, relativePath).toMatch(/ordering|sequence|aggregate.*key|partition.*key|thứ tự|khóa.*partition/i);
      expect(source, relativePath).toMatch(/claim|SKIP LOCKED|lease|khóa.*hàng|nhận quyền xử lý/i);
      expect(source, relativePath).toMatch(/retry|backoff/i);
      expect(source, relativePath).toMatch(/poison|quarantine|dead[- ]letter|cách ly|DLQ/i);
      expect(source, relativePath).toMatch(/retention|cleanup|delete|archive|lưu giữ|dọn dẹp|xóa/i);
      expect(source, relativePath).toMatch(/backlog|lag|oldest|age|độ trễ|tuổi.*event|tồn đọng/i);
      expect(source, relativePath).toMatch(/exactly[- ]once/i);
      expect(source, relativePath).toMatch(/2PC|two[- ]phase commit|distributed transaction|giao dịch phân tán/i);
      expect(source, relativePath).toMatch(/saga/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('records Transactional Outbox in the September 17 changelog for both locales', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 17, 2026');
    expect(en).toMatch(/(?:4|5) canonical distributed-systems deep dives/);
    expect(en).toContain('[Transactional Outbox](/docs/distributed-systems/transactional-outbox)');
    expect(en).toMatch(/lastVerified: 2026-09-(?:17|18|19)/);

    expect(vi).toContain('17 tháng 9, 2026');
    expect(vi).toMatch(/(?:4|5) bài deep dive canonical về hệ thống phân tán/);
    expect(vi).toContain('](/vi/docs/distributed-systems/transactional-outbox)');
    expect(vi).toMatch(/lastVerified: 2026-09-(?:17|18|19)/);
  });
});
