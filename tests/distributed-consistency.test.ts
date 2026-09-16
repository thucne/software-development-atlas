import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/distributed-systems/distributed-consistency.mdx',
  vi: 'content/docs/distributed-systems/distributed-consistency.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Distributed Consistency lesson', () => {
  it('publishes immediately after Delivery Semantics in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/distributed-systems/meta.json',
      'content/docs/distributed-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const delivery = source.indexOf('"delivery-semantics"');
      const consistency = source.indexOf('"distributed-consistency"');
      expect(delivery, relativePath).toBeGreaterThan(-1);
      expect(consistency, relativePath).toBeGreaterThan(delivery);
    }
  });

  it('places both locale variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - distributed-consistency\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-16');

      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes, relativePath).toBeGreaterThanOrEqual(2);
      expect(termBoxes, relativePath).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches consistency as an observable read contract instead of a single strong/eventual label', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/consistency.*contract|observable.*contract|hợp đồng.*nhất quán|contract.*quan sát/i);
      expect(source, relativePath).toMatch(/stale read|staleness|đọc.*cũ|dữ liệu cũ|độ cũ/i);
      expect(source, relativePath).toMatch(/eventual consistency|eventually consistent|nhất quán cuối cùng/i);
      expect(source, relativePath).toMatch(/linearizab|linearizable|tuyến tính/i);
      expect(source, relativePath).toMatch(/read[- ]your[- ]writes|read after write|đọc.*ghi|thấy.*thay đổi.*mình/i);
      expect(source, relativePath).toMatch(/monotonic read|monotonic reads|đọc đơn điệu|không.*quay lại.*phiên bản cũ/i);
      expect(source, relativePath).toMatch(/causal|causality|nhân quả/i);
      expect(source, relativePath).toMatch(/replica lag|replication lag|độ trễ.*replica|độ trễ.*sao chép/i);
      expect(source, relativePath).toMatch(/quorum/i);
      expect(source, relativePath).toMatch(/CAP|partition/i);
      expect(source, relativePath).toMatch(/read routing|primary|session token|version fence|bounded staleness|route.*đọc|token phiên|version|độ cũ có giới hạn/i);
      expect(source, relativePath).toMatch(/consistency.*isolation|isolation.*consistency|nhất quán.*isolation|isolation.*nhất quán/i);
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
      '[Distributed Consistency](/docs/distributed-systems/distributed-consistency)',
    );
    expect(read('content/docs/start-here/changelog.vi.mdx')).toContain(
      '[Tính nhất quán phân tán](/vi/docs/distributed-systems/distributed-consistency)',
    );
  });
});
