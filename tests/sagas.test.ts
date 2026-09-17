import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/distributed-systems/sagas.mdx',
  vi: 'content/docs/distributed-systems/sagas.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Sagas lesson', () => {
  it('publishes immediately after Transactional Outbox in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/distributed-systems/meta.json',
      'content/docs/distributed-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const outbox = source.indexOf('"transactional-outbox"');
      const sagas = source.indexOf('"sagas"');
      expect(outbox, relativePath).toBeGreaterThan(-1);
      expect(sagas, relativePath).toBeGreaterThan(outbox);
    }
  });

  it('places both locale variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - sagas\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-17');

      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes, relativePath).toBeGreaterThanOrEqual(2);
      expect(termBoxes, relativePath).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches sagas as durable multi-step workflows with semantic compensation', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/sequence of local transactions|chuỗi.*transaction.*cục bộ|chuỗi.*local transaction/i);
      expect(source, relativePath).toMatch(/long[- ]lived|long[- ]running|dài hạn|kéo dài/i);
      expect(source, relativePath).toMatch(/compensat|bù trừ|bồi hoàn/i);
      expect(source, relativePath).toMatch(/not.*rollback|không.*rollback|semantic undo|đảo ngược.*ngữ nghĩa/i);
      expect(source, relativePath).toMatch(/orchestrat|điều phối tập trung/i);
      expect(source, relativePath).toMatch(/choreograph|phối hợp phi tập trung|điều phối phi tập trung/i);
      expect(source, relativePath).toMatch(/pivot|point of no return|điểm không quay lại/i);
      expect(source, relativePath).toMatch(/retryable|retry|thử lại/i);
      expect(source, relativePath).toMatch(/idempotent|idempotency/i);
      expect(source, relativePath).toMatch(/saga id|workflow id|correlation id|mã saga|mã workflow|mã tương quan/i);
      expect(source, relativePath).toMatch(/durable.*state|persist.*state|trạng thái.*bền vững|lưu.*trạng thái/i);
      expect(source, relativePath).toMatch(/timeout|unknown outcome|ambiguous|không chắc chắn|mơ hồ/i);
      expect(source, relativePath).toMatch(/isolation|intermediate state|semantic lock|reservation|trạng thái trung gian|đặt giữ/i);
      expect(source, relativePath).toMatch(/outbox/i);
      expect(source, relativePath).toMatch(/observab|stuck|age|compensation failure|saga bị kẹt|bù trừ.*lỗi/i);
      expect(source, relativePath).toMatch(/2PC|two[- ]phase commit|distributed transaction|giao dịch phân tán/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('records Sagas in the September 17 changelog for both locales', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 17, 2026');
    expect(en).toContain('5 canonical distributed-systems deep dives');
    expect(en).toContain('[Sagas](/docs/distributed-systems/sagas)');
    expect(en).toContain('lastVerified: 2026-09-17');

    expect(vi).toContain('17 tháng 9, 2026');
    expect(vi).toContain('5 bài deep dive canonical về hệ thống phân tán');
    expect(vi).toContain('](/vi/docs/distributed-systems/sagas)');
    expect(vi).toContain('lastVerified: 2026-09-17');
  });
});
