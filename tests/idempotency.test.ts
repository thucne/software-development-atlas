import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/backend-engineering/idempotency.mdx',
  vi: 'content/docs/backend-engineering/idempotency.vi.mdx',
} as const;

describe('Idempotency lesson', () => {
  it('publishes the lesson after rate limiting in the bilingual backend section', () => {
    for (const relativePath of [
      'content/docs/backend-engineering/meta.json',
      'content/docs/backend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const rateLimiting = source.indexOf('"rate-limiting"');
      const idempotency = source.indexOf('"idempotency"');

      expect(idempotency, relativePath).toBeGreaterThan(rateLimiting);
    }
  });

  it('places both variants on the canonical concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toContain('  - idempotency');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches logical-operation identity, atomic reservation, replay, retention, and effect boundaries', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/ambiguous|timeout|uncertain|mơ hồ|không biết.*thành công/i);
      expect(source, relativePath).toMatch(/idempotency key|khóa idempotency/i);
      expect(source, relativePath).toMatch(/logical operation|logical command|thao tác logic|lệnh logic/i);
      expect(source, relativePath).toMatch(/scope|tenant|principal|phạm vi/i);
      expect(source, relativePath).toMatch(/fingerprint|request hash|payload hash|dấu vân tay|băm.*payload/i);
      expect(source, relativePath).toMatch(/same key.*different|same.*key.*payload|cùng khóa.*khác|cùng key.*khác/i);
      expect(source, relativePath).toMatch(/atomic|unique constraint|compare[- ]and[- ]set|nguyên tử|ràng buộc duy nhất/i);
      expect(source, relativePath).toMatch(/in[- ]progress|đang xử lý/i);
      expect(source, relativePath).toMatch(/replay|same outcome|return.*stored|trả lại.*kết quả|phát lại/i);
      expect(source, relativePath).toMatch(/retention|ttl|retry horizon|thời gian lưu|cửa sổ retry/i);
      expect(source, relativePath).toMatch(/transaction|giao dịch/i);
      expect(source, relativePath).toMatch(/external effect|downstream|side effect|hiệu ứng bên ngoài|tác dụng phụ/i);
      expect(source, relativePath).toMatch(/exactly[- ]once|exactly once|đúng một lần/i);
      expect(source, relativePath).toMatch(/active.*Internet-Draft|Internet-Draft.*active|bản nháp.*đang hoạt động|Internet-Draft đang hoạt động/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('uses the current IETF -08 Structured Field string format and optional fingerprint semantics', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);
    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toContain('lastVerified: 2026-11-18');
      expect(source, relativePath).toContain('draft-ietf-httpapi-idempotency-key-header-08');
      expect(source, relativePath).toContain('RFC 9651');
      expect(source, relativePath).toContain('Idempotency-Key: "3e8a3c8f-4f32-4474-b7fa-5f9760dd67b4"');
      expect(source, relativePath).not.toContain('draft-ietf-httpapi-idempotency-key-header-07');
    }
    expect(en).toContain('not a mandatory header or draft requirement');
    expect(vi).toContain('không phải yêu cầu bắt buộc của bản nháp IETF');
    expect(en).toContain('three total requests for one intended purchase');
    expect(vi).toContain('ba yêu cầu cho một lần mua');
  });
});
