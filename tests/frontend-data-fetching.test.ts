import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/frontend-engineering/frontend-data-fetching.mdx',
  vi: 'content/docs/frontend-engineering/frontend-data-fetching.vi.mdx',
} as const;

describe('Frontend Data Fetching lesson', () => {
  it('publishes immediately after Frontend State Models in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/frontend-engineering/meta.json',
      'content/docs/frontend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const stateModels = source.indexOf('"frontend-state-models"');
      const dataFetching = source.indexOf('"frontend-data-fetching"');
      expect(stateModels, relativePath).toBeGreaterThan(-1);
      expect(dataFetching, relativePath).toBeGreaterThan(stateModels);
    }
  });

  it('places both locale variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - frontend-data-fetching\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-16');
      expect((source.match(/<TermBox/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches request identity, placement, waterfalls, cache semantics, races, and mutation recovery', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/server-owned|remote state|server.*authoritative|server.*sở hữu|remote.*server|server.*nguồn.*sự thật/i);
      expect(source, relativePath).toMatch(/query key|request identity|cache key|khóa truy vấn|định danh.*request|định danh.*truy vấn/i);
      expect(source, relativePath).toMatch(/server component|route|client.*fetch|fetch.*client|phía server|ranh giới route|phía client/i);
      expect(source, relativePath).toMatch(/waterfall/i);
      expect(source, relativePath).toMatch(/parallel|song song/i);
      expect(source, relativePath).toMatch(/HTTP cache|browser cache|framework cache|server cache|client cache|query cache|cache.*trình duyệt|cache.*client/i);
      expect(source, relativePath).toMatch(/fresh|stale|freshness|độ mới|cũ/i);
      expect(source, relativePath).toMatch(/dedup|coalesc|gộp.*request|khử trùng lặp/i);
      expect(source, relativePath).toMatch(/race condition|stale response|abort|cancel|ignore.*response|phản hồi.*cũ|bỏ qua.*response|hủy.*request/i);
      expect(source, relativePath).toMatch(/loading|error|empty|refetch|đang tải|lỗi|rỗng|tải lại/i);
      expect(source, relativePath).toMatch(/invalidat|revalidat|làm mất hiệu lực|xác thực lại/i);
      expect(source, relativePath).toMatch(/optimistic/i);
      expect(source, relativePath).toMatch(/rollback|reconcil|hoàn tác|đối soát/i);
      expect(source, relativePath).toMatch(/retry.*not|retry.*only|không.*retry|chỉ retry|retry.*bounded/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
