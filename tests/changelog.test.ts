import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const changelogPolicyStart = '2026-09-11';

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function listFiles(relativeDir: string): string[] {
  const absoluteDir = path.join(repoRoot, relativeDir);

  return readdirSync(absoluteDir, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.posix.join(relativeDir, entry.name);
    return entry.isDirectory() ? listFiles(relativePath) : [relativePath];
  });
}

function extractLastVerified(source: string) {
  const match = source.match(/^lastVerified:\s*(\d{4}-\d{2}-\d{2})$/m);
  if (!match) throw new Error('Missing lastVerified frontmatter');
  return match[1];
}

function trackedLessonFiles() {
  return listFiles('content/docs').filter((relativePath) => {
    if (!relativePath.endsWith('.mdx') || relativePath.endsWith('.vi.mdx')) return false;
    if (relativePath.startsWith('content/docs/start-here/')) return false;

    return extractLastVerified(read(relativePath)) >= changelogPolicyStart;
  });
}

function lessonRoute(relativePath: string, locale: 'en' | 'vi') {
  const slug = relativePath
    .replace(/^content\/docs\//, '')
    .replace(/\.mdx$/, '');
  return `${locale === 'vi' ? '/vi' : ''}/docs/${slug}`;
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
      expect(source).toMatch(/^lastVerified: \d{4}-\d{2}-\d{2}$/m);
      expect(source).toContain('reviewAfterDays: 365');
    }
  });

  it('keeps changelog freshness aligned with the newest substantive lesson', () => {
    const enDate = extractLastVerified(read(changelogPaths.en));
    const viDate = extractLastVerified(read(changelogPaths.vi));
    const latestLessonDate = trackedLessonFiles()
      .map((relativePath) => extractLastVerified(read(relativePath)))
      .sort()
      .at(-1);

    expect(enDate).toBe(viDate);
    expect(latestLessonDate).toBeDefined();
    expect(enDate >= latestLessonDate!).toBe(true);
  });

  it('reconciles every substantive lesson verified since the rolling changelog policy began', () => {
    const en = read(changelogPaths.en);
    const vi = read(changelogPaths.vi);

    for (const relativePath of trackedLessonFiles()) {
      expect(en, relativePath).toContain(`](${lessonRoute(relativePath, 'en')})`);
      expect(vi, relativePath).toContain(`](${lessonRoute(relativePath, 'vi')})`);
    }
  });

  it('documents recent major milestone releases and discovery mechanisms', () => {
    const en = read(changelogPaths.en);
    const vi = read(changelogPaths.vi);

    // English content
    expect(en).toContain('September 16, 2026');
    expect(en).toContain('September 10, 2026');
    expect(en).toContain('September 09, 2026');
    expect(en).toContain('Frontend Data Fetching');
    expect(en).toContain('Retries & Backoff');
    expect(en).toContain('Architecture Decision Records');
    expect(en).toContain('Backend Request Lifecycle');
    expect(en).toContain('API Design');
    expect(en).toContain('Database Indexes & Query Plans');
    expect(en).toContain('Threat Modeling & Least Privilege');
    expect(en).toContain('Top Announcement Banner');
    expect(en).toContain('Sidebar Status Badges');

    // Vietnamese content
    expect(vi).toContain('Ngày 16 tháng 09 năm 2026');
    expect(vi).toContain('Ngày 10 tháng 09 năm 2026');
    expect(vi).toContain('Ngày 09 tháng 09 năm 2026');
    expect(vi).toContain('Data Fetching phía Frontend');
    expect(vi).toContain('Retries & Backoff');
    expect(vi).toContain('Architecture Decision Records');
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
