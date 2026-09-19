import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/testing-quality/end-to-end-testing.mdx',
  vi: 'content/docs/testing-quality/end-to-end-testing.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('End-to-End Testing lesson', () => {
  it('publishes End-to-End Testing immediately after Integration Testing in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/testing-quality/meta.json',
      'content/docs/testing-quality/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const integration = source.indexOf('"integration-testing"');
      const e2e = source.indexOf('"end-to-end-testing"');
      expect(integration, relativePath).toBeGreaterThan(-1);
      expect(e2e, relativePath).toBeGreaterThan(integration);
    }
  });

  it('publishes both locale variants at reason depth with current freshness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: testing-quality');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - end-to-end-testing\n---/);
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

  it('defines end-to-end testing around critical user journeys and observable outcomes', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/Critical User Journey|CUJ|hành trình người dùng trọng yếu/i);
      expect(source, relativePath).toMatch(/user-visible|observable outcome|kết quả người dùng thấy|outcome quan sát được/i);
      expect(source, relativePath).toMatch(/assembled system|whole system|hệ thống đã lắp ghép|toàn hệ thống/i);
      expect(source, relativePath).toMatch(/black box|hộp đen/i);
      expect(source, relativePath).toMatch(/not.*every.*branch|not.*every.*feature|không.*mọi.*nhánh|không.*mọi.*feature/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('selects a small E2E portfolio by journey criticality and unique system-level risk', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/important use case|critical journey|business critical|journey quan trọng|critical flow/i);
      expect(source, relativePath).toMatch(/keep.*count low|small.*portfolio|few.*E2E|giữ.*ít|portfolio nhỏ/i);
      expect(source, relativePath).toMatch(/cannot.*reliably.*smaller test|smaller test.*cannot|không.*test nhỏ hơn|test nhỏ hơn.*không/i);
      expect(source, relativePath).toMatch(/happy path|failure class|error class|nhóm lỗi|failure path/i);
    }
  });

  it('tests through user-facing locators and behavior rather than DOM implementation details', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/getByRole|getByLabel|user-facing locator|locator theo người dùng/i);
      expect(source, relativePath).toMatch(/CSS selector|XPath|DOM structure|cấu trúc DOM/i);
      expect(source, relativePath).toMatch(/implementation detail|chi tiết triển khai/i);
      expect(source, relativePath).toMatch(/accessibility|role|label|khả năng truy cập/i);
    }
  });

  it('uses auto-waiting and web-first assertions instead of arbitrary sleeps', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/auto-wait|actionability|tự chờ|điều kiện tương tác/i);
      expect(source, relativePath).toMatch(/web-first assertion|auto-retrying assertion|assertion tự retry|assertion theo web/i);
      expect(source, relativePath).toMatch(/sleep|waitForTimeout|fixed delay|delay cố định/i);
      expect(source, relativePath).toMatch(/timeout|deadline|bounded|giới hạn thời gian/i);
    }
  });

  it('isolates browser state and test data so suites are order independent and parallel-safe', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/browser context|fresh context|ngữ cảnh trình duyệt/i);
      expect(source, relativePath).toMatch(/cookie|local storage|session storage|sessionStorage/i);
      expect(source, relativePath).toMatch(/unique.*data|namespace|test data|dữ liệu riêng|dữ liệu test/i);
      expect(source, relativePath).toMatch(/order independent|independent.*order|không phụ thuộc thứ tự|độc lập.*thứ tự/i);
      expect(source, relativePath).toMatch(/parallel|shard|song song|phân mảnh/i);
    }
  });

  it('handles authentication setup without making every test repeat the login journey', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/authentication|login|đăng nhập|xác thực/i);
      expect(source, relativePath).toMatch(/storageState|authenticated state|trạng thái đăng nhập/i);
      expect(source, relativePath).toMatch(/dedicated.*login|login.*dedicated|test riêng.*đăng nhập|journey đăng nhập/i);
      expect(source, relativePath).toMatch(/cookie|token|secret|credential|thông tin xác thực/i);
    }
  });

  it('reasons explicitly about real, sandboxed, and fake third-party dependencies', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/third-party|external provider|bên thứ ba|provider ngoài/i);
      expect(source, relativePath).toMatch(/sandbox|fake|stub|test double/i);
      expect(source, relativePath).toMatch(/drift|diverge|lệch|khác thực tế/i);
      expect(source, relativePath).toMatch(/cost|rate limit|unsafe|chi phí|giới hạn.*request|không an toàn/i);
    }
  });

  it('treats retries as flakiness evidence rather than a correctness proof', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/retry|rerun|chạy lại/i);
      expect(source, relativePath).toMatch(/flaky|flakiness|chập chờn/i);
      expect(source, relativePath).toMatch(/first run|initial run|lần chạy đầu/i);
      expect(source, relativePath).toMatch(/not.*pass|not.*proof|không.*pass|không.*bằng chứng/i);
      expect(source, relativePath).toMatch(/quarantine|owner|cách ly|người chịu trách nhiệm/i);
    }
  });

  it('preserves diagnostic artifacts for CI failures', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/trace|Trace Viewer/i);
      expect(source, relativePath).toMatch(/screenshot|ảnh chụp/i);
      expect(source, relativePath).toMatch(/network|request|response|mạng/i);
      expect(source, relativePath).toMatch(/console|log/i);
      expect(source, relativePath).toMatch(/artifact|diagnostic|chẩn đoán/i);
    }
  });

  it('places E2E checks differently across PR, broader regression, and post-deploy synthetic stages', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/pull request|pre-merge|PR/i);
      expect(source, relativePath).toMatch(/nightly|scheduled|regression|định kỳ|hồi quy/i);
      expect(source, relativePath).toMatch(/post-deploy|synthetic|production check|sau deploy|synthetic monitoring/i);
      expect(source, relativePath).toMatch(/smoke|critical subset|subset trọng yếu/i);
      expect(source, relativePath).toMatch(/not.*monitoring|monitoring.*not|không.*monitoring|không.*thay thế.*monitor/i);
    }
  });

  it('explains representative browser/device coverage instead of multiplying every journey everywhere', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/Chromium|Firefox|WebKit|browser/i);
      expect(source, relativePath).toMatch(/device|viewport|mobile|thiết bị/i);
      expect(source, relativePath).toMatch(/traffic|risk|usage|rủi ro|lưu lượng/i);
      expect(source, relativePath).toMatch(/matrix|representative|đại diện/i);
    }
  });

  it('keeps smaller tests and adjacent testing lessons as explicit boundaries', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('test-strategy');
      expect(source, relativePath).toContain('unit-testing');
      expect(source, relativePath).toContain('integration-testing');
      expect(source, relativePath).toContain('contract-testing');
      expect(source, relativePath).toContain('test-doubles');
    }
  });

  it('records End-to-End Testing in the September 19 rolling changelog', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 19, 2026');
    expect(en).toContain('[End-to-End Testing](/docs/testing-quality/end-to-end-testing)');
    expect(en).toContain('lastVerified: 2026-09-19');

    expect(vi).toContain('19 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/testing-quality/end-to-end-testing)');
    expect(vi).toContain('lastVerified: 2026-09-19');
  });
});
