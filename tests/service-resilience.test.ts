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
});
