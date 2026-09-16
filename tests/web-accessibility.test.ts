import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/frontend-engineering/web-accessibility.mdx',
  vi: 'content/docs/frontend-engineering/web-accessibility.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Web Accessibility lesson', () => {
  it('publishes immediately after Frontend Bundle Performance in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/frontend-engineering/meta.json',
      'content/docs/frontend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const bundlePerformance = source.indexOf('"frontend-bundle-performance"');
      const accessibility = source.indexOf('"web-accessibility"');
      expect(bundlePerformance, relativePath).toBeGreaterThan(-1);
      expect(accessibility, relativePath).toBeGreaterThan(bundlePerformance);
    }
  });

  it('places both locale variants on the canonical concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - web-accessibility\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-16');

      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes, relativePath).toBeGreaterThanOrEqual(2);
      expect(termBoxes, relativePath).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches accessibility as an operational engineering workflow', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/semantic HTML|native HTML|native control|HTML ngữ nghĩa|phần tử HTML|control gốc/i);
      expect(source, relativePath).toMatch(/accessible name|accessible label|accessible description|tên truy cập|tên có thể truy cập|nhãn.*truy cập/i);
      expect(source, relativePath).toMatch(/keyboard|bàn phím/i);
      expect(source, relativePath).toMatch(/focus indicator|visible focus|focus management|quản lý focus|chỉ báo focus|focus.*hiển thị/i);
      expect(source, relativePath).toMatch(/form|label|error message|validation|biểu mẫu|nhãn|thông báo lỗi|xác thực/i);
      expect(source, relativePath).toMatch(/live region|aria-live|role=.status|dynamic update|vùng live|cập nhật động|thông báo động/i);
      expect(source, relativePath).toMatch(/contrast|non.?color|color alone|độ tương phản|không chỉ.*màu|màu sắc.*duy nhất/i);
      expect(source, relativePath).toMatch(/zoom|reflow|target size|touch target|phóng to|tái bố cục|kích thước.*mục tiêu/i);
      expect(source, relativePath).toMatch(/alt text|text alternative|image alternative|văn bản thay thế|thay thế.*hình/i);
      expect(source, relativePath).toMatch(/automated|axe|lint|static check|tự động|kiểm tra tĩnh/i);
      expect(source, relativePath).toMatch(/screen reader|assistive technolog|manual test|trình đọc màn hình|công nghệ hỗ trợ|kiểm thử thủ công/i);
      expect(source, relativePath).toMatch(/ARIA|role=|aria-/i);
      expect(source, relativePath).toMatch(/WCAG 2\.2/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('reconciles the rolling changelog in both locales', () => {
    expect(read('content/docs/start-here/changelog.mdx')).toContain(
      '[Web Accessibility](/docs/frontend-engineering/web-accessibility)',
    );
    expect(read('content/docs/start-here/changelog.vi.mdx')).toContain(
      '[Khả năng truy cập Web](/vi/docs/frontend-engineering/web-accessibility)',
    );
  });
});
