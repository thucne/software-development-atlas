import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/testing-quality/integration-testing.mdx',
  vi: 'content/docs/testing-quality/integration-testing.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Integration Testing lesson', () => {
  it('publishes Integration Testing immediately after Unit Testing in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/testing-quality/meta.json',
      'content/docs/testing-quality/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const unit = source.indexOf('"unit-testing"');
      const integration = source.indexOf('"integration-testing"');
      expect(unit, relativePath).toBeGreaterThan(-1);
      expect(integration, relativePath).toBeGreaterThan(unit);
    }
  });

  it('publishes both locale variants at operate depth with current freshness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: testing-quality');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - integration-testing\n---/);
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

  it('defines integration tests around real boundaries without requiring the whole system', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/integration boundary|real boundary|ranh giới tích hợp|boundary thật/i);
      expect(source, relativePath).toMatch(/real implementation|production-compatible|implementation thật|tương thích production/i);
      expect(source, relativePath).toMatch(/not.*full system|not.*end-to-end|không.*full system|không.*end-to-end/i);
      expect(source, relativePath).toMatch(/controlled environment|controlled topology|môi trường được kiểm soát|topology được kiểm soát/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('teaches production-relevant dependency semantics instead of convenient substitutes', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/same database engine|production database|cùng database engine|database production/i);
      expect(source, relativePath).toMatch(/SQLite.*PostgreSQL|PostgreSQL.*SQLite/i);
      expect(source, relativePath).toMatch(/version|extension|collation|timezone|phiên bản|múi giờ/i);
      expect(source, relativePath).toMatch(/constraint|foreign key|unique index|ràng buộc|khóa ngoại|chỉ mục duy nhất/i);
      expect(source, relativePath).toMatch(/transaction isolation|READ COMMITTED|SERIALIZABLE|isolation level|mức cô lập/i);
    }
  });

  it('covers migrations as executable compatibility paths, not just final-schema setup', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/migration|schema change|thay đổi schema/i);
      expect(source, relativePath).toMatch(/previous schema|old schema|production-like starting state|schema trước|trạng thái schema trước/i);
      expect(source, relativePath).toMatch(/apply migration|run migration|chạy migration|áp dụng migration/i);
      expect(source, relativePath).toMatch(/backfill|data migration|di chuyển dữ liệu/i);
      expect(source, relativePath).toMatch(/rollback|forward fix|recovery|khôi phục|sửa tiến/i);
    }
  });

  it('covers database, broker, cache, filesystem, and HTTP boundaries', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/database|cơ sở dữ liệu/i);
      expect(source, relativePath).toMatch(/broker|queue|message/i);
      expect(source, relativePath).toMatch(/cache|TTL|expiration|hết hạn/i);
      expect(source, relativePath).toMatch(/filesystem|file system|hệ thống tệp/i);
      expect(source, relativePath).toMatch(/HTTP|API|service boundary|ranh giới service/i);
    }
  });

  it('teaches broker delivery semantics and idempotency with real protocol behavior', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/ack|nack|acknowledg/i);
      expect(source, relativePath).toMatch(/redeliver|redelivery|deliver again|giao lại/i);
      expect(source, relativePath).toMatch(/idempotent|idempotency|idempotent/i);
      expect(source, relativePath).toMatch(/ordering|order guarantee|thứ tự message|bảo đảm thứ tự/i);
      expect(source, relativePath).toMatch(/duplicate|at-least-once|trùng lặp/i);
    }
  });

  it('operates dependency startup through readiness signals instead of sleeps', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/readiness|health check|ready signal|tín hiệu sẵn sàng/i);
      expect(source, relativePath).toMatch(/sleep|fixed delay|delay cố định/i);
      expect(source, relativePath).toMatch(/wait strategy|startup timeout|timeout khởi động/i);
      expect(source, relativePath).toMatch(/Testcontainers|Docker Compose|container/i);
    }
  });

  it('explains isolation and cleanup strategies including transaction rollback caveats', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/transaction rollback|rollback transaction|rollback giao dịch/i);
      expect(source, relativePath).toMatch(/truncate|disposable database|ephemeral database|schema per test|database tạm|schema riêng/i);
      expect(source, relativePath).toMatch(/after commit|post-commit|sau commit/i);
      expect(source, relativePath).toMatch(/multiple connections|second connection|nhiều connection|connection thứ hai/i);
      expect(source, relativePath).toMatch(/cleanup|teardown|dọn dẹp/i);
    }
  });

  it('supports safe parallelism through namespaced data and isolated resources', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/parallel|concurrent|song song|đồng thời/i);
      expect(source, relativePath).toMatch(/unique.*schema|unique.*database|namespace|key prefix|schema riêng|database riêng|tiền tố key/i);
      expect(source, relativePath).toMatch(/test data|seed data|fixture|dữ liệu test/i);
      expect(source, relativePath).toMatch(/minimal|small fixture|tối thiểu|fixture nhỏ/i);
    }
  });

  it('handles asynchronous and eventually consistent behavior with bounded polling', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/eventual consistency|eventually consistent|nhất quán cuối cùng/i);
      expect(source, relativePath).toMatch(/poll|retry assertion|assert eventually|thăm dò/i);
      expect(source, relativePath).toMatch(/deadline|timeout|bounded|giới hạn thời gian/i);
      expect(source, relativePath).toMatch(/sleep|arbitrary delay|delay tùy ý/i);
    }
  });

  it('distinguishes integration testing from contract and end-to-end testing', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('unit-testing');
      expect(source, relativePath).toContain('end-to-end-testing');
      expect(source, relativePath).toContain('contract-testing');
      expect(source, relativePath).toContain('test-doubles');
      expect(source, relativePath).toMatch(/contract test|compatibility|tương thích/i);
      expect(source, relativePath).toMatch(/end-to-end|E2E/i);
    }
  });

  it('records Integration Testing in the September 19 rolling changelog', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 19, 2026');
    expect(en).toContain('[Integration Testing](/docs/testing-quality/integration-testing)');
    expect(en).toContain('lastVerified: 2026-09-19');

    expect(vi).toContain('19 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/testing-quality/integration-testing)');
    expect(vi).toContain('lastVerified: 2026-09-19');
  });
});
