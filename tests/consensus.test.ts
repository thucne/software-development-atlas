import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/distributed-systems/consensus.mdx',
  vi: 'content/docs/distributed-systems/consensus.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Consensus lesson', () => {
  it('publishes immediately after Distributed Replication in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/distributed-systems/meta.json',
      'content/docs/distributed-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const replication = source.indexOf('"distributed-replication"');
      const consensus = source.indexOf('"consensus"');
      expect(replication, relativePath).toBeGreaterThan(-1);
      expect(consensus, relativePath).toBeGreaterThan(replication);
    }
  });

  it('places both locale variants on the canonical concept at recognize depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: recognize');
      expect(source, relativePath).toMatch(/concepts:\n  - consensus\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-17');

      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes, relativePath).toBeGreaterThanOrEqual(2);
      expect(termBoxes, relativePath).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches consensus as agreement on one committed history under partial failure', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/consensus.*agree|agree.*history|đồng thuận.*thống nhất|thống nhất.*lịch sử/i);
      expect(source, relativePath).toMatch(/replication.*not.*consensus|consensus.*not.*replication|replication.*không.*consensus|consensus.*không.*replication/i);
      expect(source, relativePath).toMatch(/quorum|majority|đa số/i);
      expect(source, relativePath).toMatch(/intersection|overlap|giao nhau|chồng lấp/i);
      expect(source, relativePath).toMatch(/leader election|elect.*leader|bầu.*leader|bầu.*lãnh đạo/i);
      expect(source, relativePath).toMatch(/term|epoch|nhiệm kỳ|kỷ nguyên/i);
      expect(source, relativePath).toMatch(/replicated log|log replication|nhật ký.*sao chép|sao chép.*nhật ký/i);
      expect(source, relativePath).toMatch(/commit|đã chốt|cam kết/i);
      expect(source, relativePath).toMatch(/uncommitted|chưa commit|chưa chốt/i);
      expect(source, relativePath).toMatch(/network partition|partition|phân vùng mạng|phân vùng/i);
      expect(source, relativePath).toMatch(/minority|thiểu số/i);
      expect(source, relativePath).toMatch(/lose.*quorum|quorum.*lost|mất.*quorum|mất.*đa số/i);
      expect(source, relativePath).toMatch(/safety|liveness|an toàn|tiến triển/i);
      expect(source, relativePath).toMatch(/crash fault|crash failure|Byzantine|lỗi crash|lỗi dừng|Byzantine/i);
      expect(source, relativePath).toMatch(/odd.*member|3.*member|5.*member|số lẻ|3.*node|5.*node/i);
      expect(source, relativePath).toMatch(/latency|RTT|disk|độ trễ|đĩa/i);
      expect(source, relativePath).toMatch(/Raft|Paxos/i);
      expect(source, relativePath).toMatch(/etcd/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('records Consensus in the September 17 changelog for both locales', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 17, 2026');
    expect(en).toContain('[Consensus](/docs/distributed-systems/consensus)');
    expect(en).toContain('lastVerified: 2026-09-17');

    expect(vi).toContain('17 tháng 9, 2026');
    expect(vi).toContain('[Đồng thuận phân tán](/vi/docs/distributed-systems/consensus)');
    expect(vi).toContain('lastVerified: 2026-09-17');
  });
});
