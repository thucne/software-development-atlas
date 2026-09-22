import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/testing-quality/unit-testing.mdx',
  vi: 'content/docs/testing-quality/unit-testing.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Unit Testing lesson', () => {
  it('publishes Unit Testing immediately after Test Strategy in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/testing-quality/meta.json',
      'content/docs/testing-quality/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const strategy = source.indexOf('"test-strategy"');
      const unit = source.indexOf('"unit-testing"');
      expect(strategy, relativePath).toBeGreaterThan(-1);
      expect(unit, relativePath).toBeGreaterThan(strategy);
    }
  });

  it('publishes both locale variants at operate depth with current freshness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: testing-quality');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - unit-testing\n---/);
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

  it('defines a unit by behavioral scope rather than file, class, or function size', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/behavioral (unit|contract)|behavior.*boundary|đơn vị hành vi|ranh giới hành vi/i);
      expect(source, relativePath).toMatch(/not.*function|not.*class|not.*file|không.*function|không.*class|không.*file/i);
      expect(source, relativePath).toMatch(/public behavior|public API|observable behavior|hành vi quan sát|hành vi công khai/i);
      expect(source, relativePath).toMatch(/implementation detail|chi tiết triển khai/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('teaches readable focused tests with explicit setup, action, and oracle', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/Arrange.*Act.*Assert|Given.*When.*Then/i);
      expect(source, relativePath).toMatch(/test name|naming|tên test/i);
      expect(source, relativePath).toMatch(/one behavior|single behavior|one scenario|một hành vi|một scenario/i);
      expect(source, relativePath).toMatch(/oracle|assertion|kỳ vọng|assert/i);
      expect(source, relativePath).toMatch(/concise|clarity|readable|rõ ràng|dễ đọc/i);
    }
  });

  it('covers boundary values, equivalence classes, and parameterized cases', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/boundary value|boundary case|giá trị biên|ca biên/i);
      expect(source, relativePath).toMatch(/equivalence class|lớp tương đương/i);
      expect(source, relativePath).toMatch(/zero|empty|null|minimum|maximum|leap day|off-by-one|rỗng|tối thiểu|tối đa|ngày nhuận/i);
      expect(source, relativePath).toMatch(/parameterized|table-driven|test\.each|test\.for|tham số hóa|theo bảng/i);
    }
  });

  it('operates deterministic tests by controlling clocks, randomness, IDs, and shared state', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/clock|fake timer|time source|đồng hồ|nguồn thời gian/i);
      expect(source, relativePath).toMatch(/random|seed|ngẫu nhiên/i);
      expect(source, relativePath).toMatch(/UUID|ID generator|identifier|bộ sinh ID|định danh/i);
      expect(source, relativePath).toMatch(/shared state|global state|trạng thái dùng chung|trạng thái toàn cục/i);
      expect(source, relativePath).toMatch(/order independent|independent.*order|không phụ thuộc thứ tự|độc lập.*thứ tự/i);
      expect(source, relativePath).toMatch(/network|database|filesystem|mạng|cơ sở dữ liệu|hệ thống tệp/i);
    }
  });

  it('tests state transitions, invariants, errors, and meaningful side effects', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/state transition|transition table|chuyển trạng thái/i);
      expect(source, relativePath).toMatch(/invariant|bất biến/i);
      expect(source, relativePath).toMatch(/error|exception|invalid input|lỗi|ngoại lệ|đầu vào không hợp lệ/i);
      expect(source, relativePath).toMatch(/side effect|state-changing|tác dụng phụ|thay đổi trạng thái/i);
      expect(source, relativePath).toMatch(/output|return value|result|kết quả|giá trị trả về/i);
    }
  });

  it('keeps mocks subordinate to behavior and avoids interaction over-specification', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/mock|stub|fake|test double/i);
      expect(source, relativePath).toMatch(/interaction|call order|method call|tương tác|thứ tự gọi|lời gọi hàm/i);
      expect(source, relativePath).toMatch(/brittle|fragile|giòn|mong manh/i);
      expect(source, relativePath).toMatch(/state-changing|side effect|thay đổi trạng thái|tác dụng phụ/i);
      expect(source, relativePath).toContain('test-doubles');
    }
  });

  it('explains coverage limits and stronger assertion feedback such as mutation testing', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/coverage|độ bao phủ/i);
      expect(source, relativePath).toMatch(/not.*correctness|not.*quality|không.*đúng|không.*chất lượng/i);
      expect(source, relativePath).toMatch(/mutation testing|mutation test|kiểm thử đột biến/i);
      expect(source, relativePath).toMatch(/weak assertion|assertion.*weak|assert yếu|kỳ vọng yếu/i);
    }
  });

  it('covers red-green-refactor without turning TDD into a correctness guarantee', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/red.*green.*refactor/i);
      expect(source, relativePath).toMatch(/TDD|test-driven/i);
      expect(source, relativePath).toMatch(/not.*guarantee|không.*đảm bảo|không.*bảo đảm/i);
    }
  });

  it('keeps integration, property-based, static-analysis, and test-double mechanics as explicit boundaries', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('test-strategy');
      expect(source, relativePath).toContain('integration-testing');
      expect(source, relativePath).toContain('property-based-testing');
      expect(source, relativePath).toContain('static-analysis');
      expect(source, relativePath).toContain('test-doubles');
    }
  });

  it('records Unit Testing in the September 19 rolling changelog', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 19, 2026');
    expect(en).toContain('[Unit Testing](/docs/testing-quality/unit-testing)');
    expect(en).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);

    expect(vi).toContain('19 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/testing-quality/unit-testing)');
    expect(vi).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);
  });
});
