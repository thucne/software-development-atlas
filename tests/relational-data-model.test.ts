import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/data-systems/relational-data-model.mdx',
  vi: 'content/docs/data-systems/relational-data-model.vi.mdx',
} as const;

describe('Relational Data Model lesson', () => {
  it('publishes the lesson first in the bilingual Data Systems section', () => {
    for (const relativePath of [
      'content/docs/data-systems/meta.json',
      'content/docs/data-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const relational = source.indexOf('"relational-data-model"');
      const indexes = source.indexOf('"database-indexes-and-query-plans"');

      expect(relational, relativePath).toBeGreaterThan(-1);
      expect(relational, relativePath).toBeLessThan(indexes);
    }
  });

  it('places both variants on only the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - relational-data-model\n---/);
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches facts, identity, relationships, constraints, normalization, ownership, and safe evolution', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/relation|table|bảng/i);
      expect(source, relativePath).toMatch(/row|tuple/i);
      expect(source, relativePath).toMatch(/attribute|column|thuộc tính|cột/i);
      expect(source, relativePath).toMatch(/candidate key/i);
      expect(source, relativePath).toMatch(/primary key/i);
      expect(source, relativePath).toMatch(/foreign key/i);
      expect(source, relativePath).toMatch(/cardinality/i);
      expect(source, relativePath).toMatch(/nullability|nullable|NULL/i);
      expect(source, relativePath).toMatch(/many-to-many/i);
      expect(source, relativePath).toMatch(/UNIQUE/);
      expect(source, relativePath).toMatch(/CHECK/);
      expect(source, relativePath).toMatch(/NOT NULL/);
      expect(source, relativePath).toMatch(/normalization|normalize|chuẩn hóa/i);
      expect(source, relativePath).toMatch(/update anomal|write anomal|bất thường|anomaly/i);
      expect(source, relativePath).toMatch(/source of truth|nguồn sự thật/i);
      expect(source, relativePath).toMatch(/denormali/i);
      expect(source, relativePath).toMatch(/schema evolution|expand-and-contract|tiến hóa schema/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('keeps the bilingual September release ledger and banner current', () => {
    for (const relativePath of [
      'content/docs/start-here/changelog.mdx',
      'content/docs/start-here/changelog.vi.mdx',
    ]) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('24');
      expect(source, relativePath).toContain('/backend-engineering/rate-limiting');
      expect(source, relativePath).toContain('/backend-engineering/idempotency');
      expect(source, relativePath).toContain('/backend-engineering/service-resilience');
      expect(source, relativePath).toContain('/data-systems/relational-data-model');
      expect(source, relativePath).toContain('/data-systems/sql-querying');
      expect(source, relativePath).toContain('/data-systems/mvcc');
      expect(source, relativePath).toContain('/data-systems/database-replication');
      expect(source, relativePath).toContain('/data-systems/data-partitioning');
    }

    const banner = read('components/atlas/release-banner.tsx');
    expect(banner).toContain('24 bài học kiến trúc hệ thống');
    expect(banner).toContain('24 new system architecture lessons');
  });
});
