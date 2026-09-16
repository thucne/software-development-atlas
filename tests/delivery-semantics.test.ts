import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/distributed-systems/delivery-semantics.mdx',
  vi: 'content/docs/distributed-systems/delivery-semantics.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Delivery Semantics lesson', () => {
  it('publishes immediately after Retries and Backoff in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/distributed-systems/meta.json',
      'content/docs/distributed-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const retries = source.indexOf('"retries-and-backoff"');
      const delivery = source.indexOf('"delivery-semantics"');
      expect(retries, relativePath).toBeGreaterThan(-1);
      expect(delivery, relativePath).toBeGreaterThan(retries);
    }
  });

  it('places both locale variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - delivery-semantics\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-16');

      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes, relativePath).toBeGreaterThanOrEqual(2);
      expect(termBoxes, relativePath).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches delivery guarantees without overclaiming business exactly-once effects', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/at-most-once|at most once|tối đa một lần/i);
      expect(source, relativePath).toMatch(/at-least-once|at least once|ít nhất một lần/i);
      expect(source, relativePath).toMatch(/exactly-once|exactly once|chính xác một lần/i);
      expect(source, relativePath).toMatch(/acknowledg|\back\b|xác nhận/i);
      expect(source, relativePath).toMatch(/redeliver|re-deliver|giao lại|phát lại/i);
      expect(source, relativePath).toMatch(/duplicate|trùng lặp/i);
      expect(source, relativePath).toMatch(/idempotent consumer|idempotency|consumer.*idempotent|idempotent.*consumer|tính lũy đẳng|idempotent/i);
      expect(source, relativePath).toMatch(/ordering|order guarantee|thứ tự/i);
      expect(source, relativePath).toMatch(/dead.?letter|\bDLQ\b|poison message|thư chết|hàng đợi.*lỗi|message độc/i);
      expect(source, relativePath).toMatch(/transport|broker|business effect|side effect|hiệu ứng nghiệp vụ|tác dụng phụ/i);
      expect(source, relativePath).toMatch(/crash|failure window|cửa sổ.*lỗi|sự cố/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('reconciles the rolling changelog in both locales', () => {
    expect(read('content/docs/start-here/changelog.mdx')).toContain(
      '[Delivery Semantics](/docs/distributed-systems/delivery-semantics)',
    );
    expect(read('content/docs/start-here/changelog.vi.mdx')).toContain(
      '[Ngữ nghĩa giao nhận](/vi/docs/distributed-systems/delivery-semantics)',
    );
  });
});
