import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/software-architecture/microservices.mdx',
  vi: 'content/docs/software-architecture/microservices.vi.mdx',
} as const;

describe('Microservices lesson', () => {
  it('publishes after Modular Monolith in both Software Architecture sidebars', () => {
    for (const relativePath of [
      'content/docs/software-architecture/meta.json',
      'content/docs/software-architecture/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const modularMonolith = source.indexOf('"modular-monolith"');
      const microservices = source.indexOf('"microservices"');

      expect(modularMonolith, relativePath).toBeGreaterThan(-1);
      expect(microservices, relativePath).toBeGreaterThan(modularMonolith);
    }
  });

  it('places both locale variants on only the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - microservices\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-11');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches deployment autonomy, data ownership, distributed failure, contracts, operations, and decomposition trade-offs', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/independent(ly)? deploy|deploy independently|triển khai độc lập/i);
      expect(source, relativePath).toMatch(/business capability|năng lực nghiệp vụ/i);
      expect(source, relativePath).toMatch(/own(s|ership)?.*(data|domain)|data ownership|sở hữu dữ liệu/i);
      expect(source, relativePath).toMatch(/shared database|database dùng chung/i);
      expect(source, relativePath).toMatch(/network|mạng/i);
      expect(source, relativePath).toMatch(/timeout|retry|partial failure|lỗi từng phần/i);
      expect(source, relativePath).toMatch(/synchronous|sync call|đồng bộ/i);
      expect(source, relativePath).toMatch(/asynchronous|event|bất đồng bộ|sự kiện/i);
      expect(source, relativePath).toMatch(/api contract|event contract|version|hợp đồng/i);
      expect(source, relativePath).toMatch(/observability|trace|metric|log|khả năng quan sát/i);
      expect(source, relativePath).toMatch(/eventual consistency|nhất quán cuối cùng/i);
      expect(source, relativePath).toMatch(/distributed transaction|saga|outbox|giao dịch phân tán/i);
      expect(source, relativePath).toMatch(/distributed monolith|monolith phân tán/i);
      expect(source, relativePath).toMatch(/independent scal|scale independently|mở rộng độc lập/i);
      expect(source, relativePath).toMatch(/fault isolation|cô lập lỗi/i);
      expect(source, relativePath).toMatch(/team|ownership|đội|quyền sở hữu/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
