import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/testing-quality/contract-testing.mdx',
  vi: 'content/docs/testing-quality/contract-testing.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Contract Testing lesson', () => {
  it('publishes Contract Testing immediately after End-to-End Testing in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/testing-quality/meta.json',
      'content/docs/testing-quality/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const e2e = source.indexOf('"end-to-end-testing"');
      const contract = source.indexOf('"contract-testing"');
      expect(e2e, relativePath).toBeGreaterThan(-1);
      expect(contract, relativePath).toBeGreaterThan(e2e);
    }
  });

  it('publishes both locale variants at reason depth with current freshness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: testing-quality');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - contract-testing\n---/);
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

  it('defines contracts as compatibility at a communication boundary, not full business correctness', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/consumer.*provider|provider.*consumer/i);
      expect(source, relativePath).toMatch(/shared understanding|communication contract|compatibility boundary|hiểu biết chung|contract giao tiếp|ranh giới tương thích/i);
      expect(source, relativePath).toMatch(/not.*business correctness|not.*end-to-end|không.*business correctness|không.*end-to-end/i);
      expect(source, relativePath).toMatch(/request|response|message|event/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('distinguishes consumer-driven contracts from provider/schema conformance', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/consumer-driven contract|CDC|contract hướng consumer/i);
      expect(source, relativePath).toMatch(/provider verification|verify.*provider|xác minh provider/i);
      expect(source, relativePath).toMatch(/OpenAPI|schema|specification/i);
      expect(source, relativePath).toMatch(/consumer expectation|consumer need|nhu cầu consumer|kỳ vọng consumer/i);
      expect(source, relativePath).toMatch(/schema.*not.*enough|not.*consumer.*usage|schema.*không.*đủ|không.*usage.*consumer/i);
    }
  });

  it('teaches minimal expectations instead of copying the entire provider response', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/minimal expected response|minimal expectation|kỳ vọng tối thiểu/i);
      expect(source, relativePath).toMatch(/only.*field.*use|only.*parts.*use|chỉ.*field.*dùng|chỉ.*phần.*dùng/i);
      expect(source, relativePath).toMatch(/over-specif|brittle|quá đặc tả|mong manh/i);
      expect(source, relativePath).toMatch(/additive change|new field|thêm field|thay đổi cộng thêm/i);
    }
  });

  it('covers provider states and realistic verification setup', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/provider state|state setup|trạng thái provider/i);
      expect(source, relativePath).toMatch(/replay|verification|verify/i);
      expect(source, relativePath).toMatch(/deterministic|tất định/i);
      expect(source, relativePath).toMatch(/stub.*dependency|dependency.*stub|stub.*phụ thuộc|phụ thuộc.*stub/i);
    }
  });

  it('covers HTTP and asynchronous message contracts', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/HTTP|REST|API/i);
      expect(source, relativePath).toMatch(/message|event|queue|async|bất đồng bộ/i);
      expect(source, relativePath).toMatch(/header|status code|body|payload/i);
      expect(source, relativePath).toMatch(/key|field|schema|type/i);
    }
  });

  it('reasons about backward and forward compatibility during independent deploys', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/backward compat|backwards compat|tương thích ngược/i);
      expect(source, relativePath).toMatch(/forward compat|forwards compat|tương thích tiến/i);
      expect(source, relativePath).toMatch(/independent deploy|deploy independently|triển khai độc lập|deploy độc lập/i);
      expect(source, relativePath).toMatch(/old consumer|old provider|consumer cũ|provider cũ/i);
      expect(source, relativePath).toMatch(/new consumer|new provider|consumer mới|provider mới/i);
    }
  });

  it('explains API versioning and schema evolution without pretending additive changes are always safe', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/API version|versioning|phiên bản API/i);
      expect(source, relativePath).toMatch(/add.*field|new field|thêm.*field/i);
      expect(source, relativePath).toMatch(/enum|exhaustive switch|switch exhaustive/i);
      expect(source, relativePath).toMatch(/field number|reserved.*field|số field|field number.*reuse/i);
      expect(source, relativePath).toMatch(/Protobuf|Protocol Buffers/i);
    }
  });

  it('uses compatibility matrices and deployment checks rather than latest-only verification', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/Pact Broker|broker/i);
      expect(source, relativePath).toMatch(/matrix|ma trận/i);
      expect(source, relativePath).toMatch(/can-i-deploy|can I deploy|có thể deploy/i);
      expect(source, relativePath).toMatch(/production version|deployed version|phiên bản production|phiên bản đang deploy/i);
      expect(source, relativePath).toMatch(/latest.*not enough|not.*latest only|không.*latest|latest.*không đủ/i);
    }
  });

  it('keeps contracts versioned with code and avoids stale hand-maintained artifacts', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/version.*contract|contract.*version|phiên bản.*contract/i);
      expect(source, relativePath).toMatch(/CI|pipeline/i);
      expect(source, relativePath).toMatch(/hand-maintained|manually maintained|duy trì thủ công|viết tay/i);
      expect(source, relativePath).toMatch(/stale|drift|lỗi thời|lệch/i);
    }
  });

  it('distinguishes contract testing from integration and E2E testing', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('unit-testing');
      expect(source, relativePath).toContain('integration-testing');
      expect(source, relativePath).toContain('end-to-end-testing');
      expect(source, relativePath).toContain('test-doubles');
      expect(source, relativePath).toMatch(/does not prove|not prove|không chứng minh/i);
    }
  });

  it('records Contract Testing in the September 19 rolling changelog', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 19, 2026');
    expect(en).toContain('[Contract Testing](/docs/testing-quality/contract-testing)');
    expect(en).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);

    expect(vi).toContain('19 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/testing-quality/contract-testing)');
    expect(vi).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);
  });
});
