import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(path.join(root, relativePath), 'utf8');

const decision = {
  en: 'content/docs/engineering-judgment/decision-guides/frontend-modernization-upgrade-replace-wrap-delete.mdx',
  vi: 'content/docs/engineering-judgment/decision-guides/frontend-modernization-upgrade-replace-wrap-delete.vi.mdx',
};

const walkthrough = {
  en: 'content/docs/engineering-judgment/architecture-walkthroughs/modernizing-seven-year-react-app.mdx',
  vi: 'content/docs/engineering-judgment/architecture-walkthroughs/modernizing-seven-year-react-app.vi.mdx',
};

function lesson(relativePath: string) {
  const absolute = path.join(root, relativePath);
  expect(existsSync(absolute), relativePath).toBe(true);
  return readFileSync(absolute, 'utf8');
}

describe('frontend modernization judgment content', () => {
  it('publishes the decision guide and walkthrough in both locales', () => {
    const decisionPages = JSON.parse(
      read('content/docs/engineering-judgment/decision-guides/meta.json'),
    ).pages as string[];
    const decisionPagesVi = JSON.parse(
      read('content/docs/engineering-judgment/decision-guides/meta.vi.json'),
    ).pages as string[];
    const walkthroughPages = JSON.parse(
      read('content/docs/engineering-judgment/architecture-walkthroughs/meta.json'),
    ).pages as string[];
    const walkthroughPagesVi = JSON.parse(
      read('content/docs/engineering-judgment/architecture-walkthroughs/meta.vi.json'),
    ).pages as string[];

    expect(decisionPages).toContain(
      'frontend-modernization-upgrade-replace-wrap-delete',
    );
    expect(decisionPagesVi).toContain(
      'frontend-modernization-upgrade-replace-wrap-delete',
    );
    expect(walkthroughPages).toContain('modernizing-seven-year-react-app');
    expect(walkthroughPagesVi).toContain('modernizing-seven-year-react-app');
  });

  it('keeps decision-guide contracts aligned in EN/VI', () => {
    for (const relativePath of [decision.en, decision.vi]) {
      const source = lesson(relativePath);

      expect(source).toContain('category: engineering-judgment');
      expect(source).toContain('contentType: decision-guide');
      expect(source).toContain('learningDepth: reason');
      expect(source).toContain('lastVerified: 2026-09-22');

      for (const concept of [
        'frontend-modernization',
        'software-supply-chain',
        'component-boundaries',
        'coupling-and-cohesion',
        'test-strategy',
      ]) {
        expect(source).toContain(`  - ${concept}`);
      }

      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes).toBeGreaterThanOrEqual(2);
      expect(termBoxes).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length).toBeGreaterThanOrEqual(3);
      expect(source).toContain('<DecisionMatrix');
      expect(source).toContain('<details>');
      expect(source).toContain('- [ ]');
      expect(source).toMatch(/Keep|Giữ/);
      expect(source).toMatch(/Upgrade|Nâng/);
      expect(source).toMatch(/Wrap|Bọc/);
      expect(source).toMatch(/Replace|Thay/);
      expect(source).toMatch(/Delete|Xóa/);
      expect(source).toMatch(/reversib|đảo ngược/i);
      expect(source).not.toMatch(/TODO|TBD|PLACEHOLDER/i);
    }
  });

  it('keeps the seven-year walkthrough contracts aligned in EN/VI', () => {
    for (const relativePath of [walkthrough.en, walkthrough.vi]) {
      const source = lesson(relativePath);

      expect(source).toContain('category: engineering-judgment');
      expect(source).toContain('contentType: architecture-walkthrough');
      expect(source).toContain('learningDepth: reason');
      expect(source).toContain('lastVerified: 2026-09-22');

      for (const concept of [
        'frontend-modernization',
        'frontend-state-models',
        'frontend-data-fetching',
        'component-boundaries',
        'frontend-bundle-performance',
        'software-supply-chain',
        'test-strategy',
        'deployment-strategies',
        'logs-metrics-traces',
      ]) {
        expect(source).toContain(`  - ${concept}`);
      }

      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes).toBeGreaterThanOrEqual(2);
      expect(termBoxes).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length).toBeGreaterThanOrEqual(4);
      expect(source).toContain('<details>');
      expect(source).toContain('- [ ]');
      expect(source).toMatch(/Redux/i);
      expect(source).toMatch(/beta/i);
      expect(source).toMatch(/compatibility/i);
      expect(source).toMatch(/rollout/i);
      expect(source).toMatch(/delet/i);
      expect(source).not.toMatch(/TODO|TBD|PLACEHOLDER/i);
    }
  });

  it('anchors both artifacts in production consequences', () => {
    for (const relativePath of [decision.en, walkthrough.en]) {
      const source = lesson(relativePath);
      expect(source).toContain('**Impact:**');
      expect(source).toContain('**Root cause:**');
      expect(source).toContain('**Correct pattern:**');
    }

    for (const relativePath of [decision.vi, walkthrough.vi]) {
      const source = lesson(relativePath);
      expect(source).toContain('**Hậu quả:**');
      expect(source).toContain('**Nguyên nhân cốt lõi:**');
      expect(source).toContain('**Cách khắc phục chuẩn:**');
    }
  });

  it('records both Engineering Judgment routes in the changelog', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain(
      'September 22, 2026 · Frontend Modernization Judgment & Walkthrough',
    );
    expect(en).toContain(
      '](/docs/engineering-judgment/decision-guides/frontend-modernization-upgrade-replace-wrap-delete)',
    );
    expect(en).toContain(
      '](/docs/engineering-judgment/architecture-walkthroughs/modernizing-seven-year-react-app)',
    );

    expect(vi).toContain(
      'Ngày 22 tháng 09 năm 2026 · Judgment & Walkthrough cho Modernization Frontend',
    );
    expect(vi).toContain(
      '](/vi/docs/engineering-judgment/decision-guides/frontend-modernization-upgrade-replace-wrap-delete)',
    );
    expect(vi).toContain(
      '](/vi/docs/engineering-judgment/architecture-walkthroughs/modernizing-seven-year-react-app)',
    );
  });
});
