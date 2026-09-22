import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/testing-quality/test-strategy.mdx',
  vi: 'content/docs/testing-quality/test-strategy.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Test Strategy lesson', () => {
  it('opens the Testing & Quality domain and publishes Test Strategy first in both locales', () => {
    for (const relativePath of [
      'content/docs/meta.json',
      'content/docs/meta.vi.json',
    ]) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('"testing-quality"');
      expect(source.indexOf('"testing-quality"'), relativePath)
        .toBeGreaterThan(source.indexOf('"cloud-infrastructure"'));
      expect(source.indexOf('"testing-quality"'), relativePath)
        .toBeLessThan(source.indexOf('"delivery-operations"'));
    }

    for (const relativePath of [
      'content/docs/testing-quality/meta.json',
      'content/docs/testing-quality/meta.vi.json',
    ]) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('"test-strategy"');
    }
  });

  it('publishes both locale variants at operate depth with current freshness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: testing-quality');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - test-strategy\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-19');

      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes, relativePath).toBeGreaterThanOrEqual(2);
      expect(termBoxes, relativePath).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
      expect(source, relativePath).toMatch(/> 💡 \*\*(Rule of thumb|Quy tắc bỏ túi):\*\*/);
      expect(source, relativePath).toMatch(/Fatal pitfall|Cạm bẫy chết người|Sai lầm chí mạng/i);
    }
  });

  it('defines strategy as risk-driven evidence rather than a test-count target', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/risk|failure mode|rủi ro|kiểu lỗi/i);
      expect(source, relativePath).toMatch(/evidence|confidence|bằng chứng|độ tin cậy/i);
      expect(source, relativePath).toMatch(/test count|number of tests|số lượng test|đếm test/i);
      expect(source, relativePath).toMatch(/coverage|độ bao phủ/i);
      expect(source, relativePath).toMatch(/not.*quality|không.*chất lượng|not.*confidence|không.*độ tin cậy/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('builds a layered portfolio without treating the testing pyramid as a fixed ratio', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/unit test/i);
      expect(source, relativePath).toMatch(/integration test/i);
      expect(source, relativePath).toMatch(/end-to-end|E2E/i);
      expect(source, relativePath).toMatch(/contract test/i);
      expect(source, relativePath).toMatch(/static analysis|typecheck|lint|phân tích tĩnh/i);
      expect(source, relativePath).toMatch(/exploratory|manual testing|thăm dò|kiểm thử thủ công/i);
      expect(source, relativePath).toMatch(/performance|load test|hiệu năng|tải/i);
      expect(source, relativePath).toMatch(/security test|bảo mật/i);
      expect(source, relativePath).toMatch(/pyramid|kim tự tháp/i);
      expect(source, relativePath).toMatch(/70.?20.?10|fixed ratio|exact ratio|tỷ lệ cố định|tỷ lệ chính xác/i);
    }
  });

  it('teaches test placement through speed, fidelity, reliability, and diagnosability trade-offs', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/speed|fast feedback|tốc độ|feedback nhanh/i);
      expect(source, relativePath).toMatch(/fidelity|realistic|giống production|độ chân thực/i);
      expect(source, relativePath).toMatch(/reliab|determin|ổn định|xác định/i);
      expect(source, relativePath).toMatch(/diagnos|isolate failure|khoanh vùng lỗi|chẩn đoán/i);
      expect(source, relativePath).toMatch(/maintenance|cost|chi phí bảo trì|chi phí/i);
    }
  });

  it('makes critical user journeys and boundary failures explicit', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/Critical User Journey|CUJ|hành trình người dùng trọng yếu/i);
      expect(source, relativePath).toMatch(/boundary|integration boundary|ranh giới tích hợp/i);
      expect(source, relativePath).toMatch(/API schema|contract|database|queue|external service|dịch vụ ngoài/i);
      expect(source, relativePath).toMatch(/happy path|failure path|error path|đường lỗi|nhánh lỗi/i);
      expect(source, relativePath).toMatch(/rollback|deployment|release|triển khai|phát hành/i);
    }
  });

  it('covers flakiness, test data, hermeticity, clocks, randomness, and shared environments', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/flaky|flakiness|chập chờn/i);
      expect(source, relativePath).toMatch(/test data|fixture|dữ liệu test/i);
      expect(source, relativePath).toMatch(/hermetic|isolat|cô lập/i);
      expect(source, relativePath).toMatch(/clock|time|thời gian|đồng hồ/i);
      expect(source, relativePath).toMatch(/random|seed|ngẫu nhiên/i);
      expect(source, relativePath).toMatch(/shared environment|shared state|môi trường dùng chung|trạng thái dùng chung/i);
      expect(source, relativePath).toMatch(/quarantine|retry.*test|cách ly|rerun/i);
    }
  });

  it('teaches release gates and production feedback without conflating testing with deployment safety', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/pre-merge|premerge|pull request|trước merge/i);
      expect(source, relativePath).toMatch(/post-deploy|smoke test|synthetic|sau deploy|sau triển khai/i);
      expect(source, relativePath).toMatch(/canary|progressive delivery|triển khai dần/i);
      expect(source, relativePath).toMatch(/observability|monitoring|telemetry|quan sát/i);
      expect(source, relativePath).toMatch(/test.*cannot.*prove|testing.*cannot.*prove|test.*không.*chứng minh|kiểm thử.*không.*chứng minh/i);
    }
  });

  it('keeps follow-on testing concepts as explicit lesson boundaries', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('unit-testing');
      expect(source, relativePath).toContain('integration-testing');
      expect(source, relativePath).toContain('end-to-end-testing');
      expect(source, relativePath).toContain('contract-testing');
      expect(source, relativePath).toContain('property-based-testing');
      expect(source, relativePath).toContain('static-analysis');
      expect(source, relativePath).toContain('test-doubles');
    }
  });

  it('records the new domain and Test Strategy in the September 19 rolling changelog and footer date', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 19, 2026');
    expect(en).toContain('[Test Strategy](/docs/testing-quality/test-strategy)');
    expect(en).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);

    expect(vi).toContain('19 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/testing-quality/test-strategy)');
    expect(vi).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);

    expect(read('lib/site-metadata.ts')).toContain("atlasLastUpdated = '2026-09-22'");
    expect(read('tests/e2e/docs-shell.spec.ts')).toContain('Atlas last updated Sep 22, 2026');
  });
});
