import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/backend-engineering/service-resilience.mdx',
  vi: 'content/docs/backend-engineering/service-resilience.vi.mdx',
} as const;

describe('Service Resilience lesson', () => {
  it('publishes the lesson after idempotency in the bilingual backend section', () => {
    for (const relativePath of [
      'content/docs/backend-engineering/meta.json',
      'content/docs/backend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const idempotency = source.indexOf('"idempotency"');
      const resilience = source.indexOf('"service-resilience"');

      expect(resilience, relativePath).toBeGreaterThan(idempotency);
    }
  });

  it('places both variants on the canonical concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toContain('  - service-resilience');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches dependency criticality, budgets, isolation, circuit breaking, degradation, and overload evidence', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/critical|optional|required|quan trọng|bắt buộc|tùy chọn/i);
      expect(source, relativePath).toMatch(/deadline budget|latency budget|time budget|ngân sách.*thời gian|deadline/i);
      expect(source, relativePath).toMatch(/bulkhead|isolation|cô lập/i);
      expect(source, relativePath).toMatch(/bounded concurrency|concurrency limit|giới hạn.*đồng thời/i);
      expect(source, relativePath).toMatch(/circuit breaker|cầu dao/i);
      expect(source, relativePath).toMatch(/open|half[- ]open|closed|mở|nửa mở|đóng/i);
      expect(source, relativePath).toMatch(/retry budget|ngân sách retry/i);
      expect(source, relativePath).toMatch(/load shed|load shedding|overload|giảm tải|quá tải/i);
      expect(source, relativePath).toMatch(/fallback|degrad|suy giảm|phương án thay thế/i);
      expect(source, relativePath).toMatch(/stale|cached|cache|cũ/i);
      expect(source, relativePath).toMatch(/saturation|queue|pool|bão hòa|hàng đợi/i);
      expect(source, relativePath).toMatch(/cascad|dây chuyền|lan truyền/i);
      expect(source, relativePath).toMatch(/dependency latency|dependency error|breaker state|latency.*dependency|lỗi.*dependency|trạng thái.*breaker/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('keeps exact audit boundaries and primary-source evidence aligned across EN/VI', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);
    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toContain('lastVerified: 2026-11-18');
      expect(source, relativePath).toMatch(/hypothetical|giả định/i);
      expect(source, relativePath).toMatch(/instance|process|tiến trình/i);
      expect(source, relativePath).toMatch(/fleet|toàn bộ hệ thống/i);
      expect(source, relativePath).toMatch(/required work|nghiệp vụ bắt buộc/i);
      expect(source, relativePath).toMatch(/Report failure|Báo lỗi rõ ràng/i);
      expect(source, relativePath).toContain('https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead');
      expect(source, relativePath).toContain('https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker');
      expect(source, relativePath).toContain('https://learn.microsoft.com/en-us/azure/architecture/best-practices/transient-faults');
      expect(source, relativePath).toContain('https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/');
    }
    expect(read('content/docs/start-here/changelog.mdx')).toContain('](/docs/backend-engineering/service-resilience)');
    expect(read('content/docs/start-here/changelog.vi.mdx')).toContain('](/vi/docs/backend-engineering/service-resilience)');
  });

});
