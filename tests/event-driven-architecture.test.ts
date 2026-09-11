import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/software-architecture/event-driven-architecture.mdx',
  vi: 'content/docs/software-architecture/event-driven-architecture.vi.mdx',
} as const;

describe('Event-Driven Architecture lesson', () => {
  it('publishes after Microservices in both Software Architecture sidebars', () => {
    for (const relativePath of [
      'content/docs/software-architecture/meta.json',
      'content/docs/software-architecture/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const microservices = source.indexOf('"microservices"');
      const eventDriven = source.indexOf('"event-driven-architecture"');

      expect(microservices, relativePath).toBeGreaterThan(-1);
      expect(eventDriven, relativePath).toBeGreaterThan(microservices);
    }
  });

  it('places both locale variants on only the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - event-driven-architecture\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-12');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches event semantics, delivery, ordering, consistency, contracts, and operations', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/event.*fact|fact.*event|sự kiện.*sự thật|sự thật.*sự kiện/i);
      expect(source, relativePath).toMatch(/producer|publisher|nhà phát|bên phát/i);
      expect(source, relativePath).toMatch(/consumer|subscriber|bên nhận|bên tiêu thụ/i);
      expect(source, relativePath).toMatch(/publish.?subscribe|pub\/sub|phát.*đăng ký|xuất bản.*đăng ký/i);
      expect(source, relativePath).toMatch(/competing consumer|work queue|hàng đợi công việc|consumer cạnh tranh/i);
      expect(source, relativePath).toMatch(/event stream|replay|cursor|luồng sự kiện|phát lại/i);
      expect(source, relativePath).toMatch(/at-least-once|duplicate|trùng lặp|idempot/i);
      expect(source, relativePath).toMatch(/ordering|partition key|thứ tự|khóa phân vùng/i);
      expect(source, relativePath).toMatch(/schema|version|compatib|tương thích/i);
      expect(source, relativePath).toMatch(/eventual consistency|nhất quán cuối cùng/i);
      expect(source, relativePath).toMatch(/outbox|dual write|ghi kép/i);
      expect(source, relativePath).toMatch(/retry|dead.?letter|quarantine|thử lại|hàng đợi lỗi/i);
      expect(source, relativePath).toMatch(/backpressure|lag|consumer lag|độ trễ consumer|tồn đọng/i);
      expect(source, relativePath).toMatch(/trace|correlation|observability|truy vết|quan sát/i);
      expect(source, relativePath).toMatch(/choreograph|orchestrat|điều phối|biên đạo/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
