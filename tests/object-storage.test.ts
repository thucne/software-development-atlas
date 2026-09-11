import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/data-systems/object-storage.mdx',
  vi: 'content/docs/data-systems/object-storage.vi.mdx',
} as const;

describe('Object Storage lesson', () => {
  it('publishes after Search Indexes in both Data Systems sidebars', () => {
    for (const relativePath of [
      'content/docs/data-systems/meta.json',
      'content/docs/data-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const search = source.indexOf('"search-indexes"');
      const objectStorage = source.indexOf('"object-storage"');

      expect(search, relativePath).toBeGreaterThan(-1);
      expect(objectStorage, relativePath).toBeGreaterThan(search);
    }
  });

  it('places both locale variants on only the canonical object-storage concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - object-storage\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-10');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches keys, consistency, multipart integrity, access delegation, lifecycle, and versioning boundaries', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/bucket/i);
      expect(source, relativePath).toMatch(/object key|khóa object|key object/i);
      expect(source, relativePath).toMatch(/flat|phẳng|prefix/i);
      expect(source, relativePath).toMatch(/strong read.?after.?write|nhất quán mạnh|strong consistency/i);
      expect(source, relativePath).toMatch(/presigned/i);
      expect(source, relativePath).toMatch(/multipart/i);
      expect(source, relativePath).toMatch(/checksum/i);
      expect(source, relativePath).toMatch(/ETag/i);
      expect(source, relativePath).toMatch(/versioning|phiên bản hóa/i);
      expect(source, relativePath).toMatch(/lifecycle|vòng đời/i);
      expect(source, relativePath).toMatch(/storage class|lớp lưu trữ/i);
      expect(source, relativePath).toMatch(/source of truth|nguồn sự thật/i);
      expect(source, relativePath).toMatch(/immutable|bất biến/i);
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
      expect(source, relativePath).toContain('28');
      expect(source, relativePath).toContain('/data-systems/search-indexes');
      expect(source, relativePath).toContain('/data-systems/object-storage');
    }

    const banner = read('components/atlas/release-banner.tsx');
    expect(banner).toContain('28 bài học kiến trúc hệ thống');
    expect(banner).toContain('28 new system architecture lessons');
  });
});
