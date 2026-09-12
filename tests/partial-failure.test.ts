import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/distributed-systems/partial-failure.mdx',
  vi: 'content/docs/distributed-systems/partial-failure.vi.mdx',
} as const;

describe('Partial Failure lesson', () => {
  it('publishes before the existing timeouts/retries lesson in both Distributed Systems sidebars', () => {
    for (const relativePath of [
      'content/docs/distributed-systems/meta.json',
      'content/docs/distributed-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const partialFailure = source.indexOf('"partial-failure"');
      const legacyTimeouts = source.indexOf('"timeouts-retries-and-backoff"');

      expect(partialFailure, relativePath).toBeGreaterThan(-1);
      expect(legacyTimeouts, relativePath).toBeGreaterThan(partialFailure);
    }
  });

  it('places both locale variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - partial-failure\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-12');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches uncertainty, independent observations, blast radius, and safe recovery', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/partial failure|lỗi cục bộ|lỗi một phần/i);
      expect(source, relativePath).toMatch(/timeout.*(unknown|ambiguous)|unknown.*outcome|timeout.*không.*chứng minh|kết quả.*không rõ/i);
      expect(source, relativePath).toMatch(/caller.*callee|client.*server|bên gọi.*bên nhận|máy khách.*máy chủ/i);
      expect(source, relativePath).toMatch(/network partition|lost response|slow dependency|process crash|phân vùng mạng|mất phản hồi|dependency chậm|tiến trình.*crash/i);
      expect(source, relativePath).toMatch(/retry.*duplicate|duplicate.*side effect|thử lại.*trùng|tác dụng phụ.*lặp/i);
      expect(source, relativePath).toMatch(/idempotency|idempotent|request identity|idempotency key|định danh yêu cầu/i);
      expect(source, relativePath).toMatch(/deadline|cancellation|hạn chót|hủy/i);
      expect(source, relativePath).toMatch(/blast radius|dependency chain|chuỗi dependency|phạm vi ảnh hưởng/i);
      expect(source, relativePath).toMatch(/fail-fast|degrade|fallback|isolate|cô lập|suy giảm chức năng/i);
      expect(source, relativePath).toMatch(/correlation ID|request ID|trace|dependency metric|metric.*dependency|mã tương quan/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
