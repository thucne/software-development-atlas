import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/distributed-systems/distributed-locks.mdx',
  vi: 'content/docs/distributed-systems/distributed-locks.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Distributed Locks lesson', () => {
  it('publishes immediately after Consensus in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/distributed-systems/meta.json',
      'content/docs/distributed-systems/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const consensus = source.indexOf('"consensus"');
      const locks = source.indexOf('"distributed-locks"');
      expect(consensus, relativePath).toBeGreaterThan(-1);
      expect(locks, relativePath).toBeGreaterThan(consensus);
    }
  });

  it('places both locale variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - distributed-locks\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-17');

      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes, relativePath).toBeGreaterThanOrEqual(2);
      expect(termBoxes, relativePath).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches distributed locking as lease-backed ownership with fencing rather than a network mutex', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/distributed lock|khóa phân tán/i);
      expect(source, relativePath).toMatch(/mutex|critical section|vùng tới hạn/i);
      expect(source, relativePath).toMatch(/lease|TTL|thời hạn|hết hạn/i);
      expect(source, relativePath).toMatch(/renew|heartbeat|gia hạn|nhịp tim/i);
      expect(source, relativePath).toMatch(/owner|ownership|holder|chủ sở hữu|quyền sở hữu|bên giữ/i);
      expect(source, relativePath).toMatch(/unique.*token|owner.*token|ownership.*token|token.*duy nhất|token.*sở hữu/i);
      expect(source, relativePath).toMatch(/fencing token|token rào chắn/i);
      expect(source, relativePath).toMatch(/monotonic|increasing|tăng đơn điệu|tăng dần/i);
      expect(source, relativePath).toMatch(/stale holder|stale owner|old holder|holder.*stale|bên giữ.*cũ|chủ.*cũ/i);
      expect(source, relativePath).toMatch(/pause|GC|network partition|process stall|tạm dừng|phân vùng mạng/i);
      expect(source, relativePath).toMatch(/compare.*delete|compare-and-delete|delete.*owner|unlock.*owner|xóa.*so sánh|chỉ.*chủ.*mở khóa/i);
      expect(source, relativePath).toMatch(/contention|backoff|watch|queue|herd effect|tranh chấp|chờ theo sự kiện|hiệu ứng bầy đàn/i);
      expect(source, relativePath).toMatch(/granularity|lock scope|phạm vi khóa|độ hạt/i);
      expect(source, relativePath).toMatch(/consensus|CP subsystem|đồng thuận/i);
      expect(source, relativePath).toMatch(/idempotency|idempotent|bất biến/i);
      expect(source, relativePath).toMatch(/database lock|row lock|database transaction|khóa dòng|transaction database|khóa database/i);
      expect(source, relativePath).toMatch(/etcd/i);
      expect(source, relativePath).toMatch(/ZooKeeper/i);
      expect(source, relativePath).toMatch(/Hazelcast/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('records Distributed Locks in the September 17 changelog for both locales', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 17, 2026');
    expect(en).toContain('[Distributed Locks](/docs/distributed-systems/distributed-locks)');
    expect(en).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);

    expect(vi).toContain('17 tháng 9, 2026');
    expect(vi).toContain('](/vi/docs/distributed-systems/distributed-locks)');
    expect(vi).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);
  });
});
