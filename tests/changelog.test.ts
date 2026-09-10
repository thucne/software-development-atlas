import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const changelogPaths = {
  en: 'content/docs/start-here/changelog.mdx',
  vi: 'content/docs/start-here/changelog.vi.mdx',
} as const;

describe('Changelog & What\'s New system', () => {
  it('registers changelog in both English and Vietnamese Start Here navigation', () => {
    const metaEn = JSON.parse(read('content/docs/start-here/meta.json'));
    const metaVi = JSON.parse(read('content/docs/start-here/meta.vi.json'));

    expect(metaEn.pages).toContain('changelog');
    expect(metaVi.pages).toContain('changelog');
  });

  it('declares valid guide metadata with empty concepts for Start Here placement', () => {
    for (const relativePath of Object.values(changelogPaths)) {
      const source = read(relativePath);

      expect(source).toContain('contentType: guide');
      expect(source).toContain('learningDepth: recognize');
      expect(source).toContain('category: start-here');
      expect(source).toContain('concepts: []');
      expect(source).toContain('lastVerified: 2026-09-10');
      expect(source).toContain('reviewAfterDays: 365');
    }
  });

  it('documents recent major milestone releases and discovery mechanisms', () => {
    const en = read(changelogPaths.en);
    const vi = read(changelogPaths.vi);

    // English content
    expect(en).toContain('September 10, 2026');
    expect(en).toContain('September 09, 2026');
    expect(en).toContain('Backend Request Lifecycle');
    expect(en).toContain('API Design');
    expect(en).toContain('Database Indexes & Query Plans');
    expect(en).toContain('Threat Modeling & Least Privilege');
    expect(en).toContain('Top Announcement Banner');
    expect(en).toContain('Sidebar Status Badges');

    // Vietnamese content
    expect(vi).toContain('Ngày 10 tháng 09 năm 2026');
    expect(vi).toContain('Ngày 09 tháng 09 năm 2026');
    expect(vi).toContain('Vòng đời Request phía Backend');
    expect(vi).toContain('Thiết kế API');
    expect(vi).toContain('Database Indexes & Kế hoạch Thực thi');
    expect(vi).toContain('Threat Modeling & Đặc quyền Tối thiểu');
    expect(vi).toContain('Banner thông báo đầu trang');
    expect(vi).toContain('Huy hiệu trạng thái trên Sidebar');
  });

  it('maintains strict single-language purity in companion files', () => {
    const en = read(changelogPaths.en);
    const vi = read(changelogPaths.vi);

    // English file should not contain Vietnamese diacritics
    expect(en).not.toMatch(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i);

    // Vietnamese file must use translated headings and labels
    expect(vi).toContain('Các mốc phát hành quan trọng');
    expect(vi).toContain('Cách nắm bắt nội dung mới');
  });
});
