import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/cloud-infrastructure/containers.mdx',
  vi: 'content/docs/cloud-infrastructure/containers.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Containers lesson', () => {
  it('publishes Containers immediately after Cloud Compute in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/cloud-infrastructure/meta.json',
      'content/docs/cloud-infrastructure/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const compute = source.indexOf('"cloud-compute"');
      const containers = source.indexOf('"containers"');

      expect(compute, relativePath).toBeGreaterThan(-1);
      expect(containers, relativePath).toBeGreaterThan(compute);
    }
  });

  it('places both locale variants on the canonical concept at operate depth with current freshness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: cloud-infrastructure');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - containers\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-18');

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

  it('teaches containers as isolated host processes with explicit image, runtime, resource, storage, and lifecycle boundaries', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/process|tiến trình/i);
      expect(source, relativePath).toMatch(/shared kernel|host kernel|chung kernel|kernel.*host/i);
      expect(source, relativePath).toMatch(/namespace|không gian tên/i);
      expect(source, relativePath).toMatch(/cgroup|control group|nhóm kiểm soát/i);
      expect(source, relativePath).toMatch(/OCI|Open Container Initiative/i);
      expect(source, relativePath).toMatch(/image.*container|container.*image/i);
      expect(source, relativePath).toMatch(/layer|lớp/i);
      expect(source, relativePath).toMatch(/registry|image registry|kho.*image|registry image/i);
      expect(source, relativePath).toMatch(/tag|digest|sha256/i);
      expect(source, relativePath).toMatch(/writable layer|writeable layer|lớp.*ghi/i);
      expect(source, relativePath).toMatch(/volume|bind mount|mount|ổ.*gắn|gắn kết/i);
      expect(source, relativePath).toMatch(/ephemeral|temporary|tạm thời|không bền/i);
      expect(source, relativePath).toMatch(/CPU|memory|RAM|bộ nhớ/i);
      expect(source, relativePath).toMatch(/OOM|out.of.memory|hết bộ nhớ/i);
      expect(source, relativePath).toMatch(/PID 1|PID1/i);
      expect(source, relativePath).toMatch(/SIGTERM|signal|tín hiệu/i);
      expect(source, relativePath).toMatch(/graceful|shutdown|grace period|dừng.*êm|tắt.*êm/i);
      expect(source, relativePath).toMatch(/stdout|stderr|log/i);
      expect(source, relativePath).toMatch(/port|network namespace|cổng|mạng/i);
      expect(source, relativePath).toMatch(/health|liveness|readiness|sức khỏe|sẵn sàng/i);
      expect(source, relativePath).toMatch(/non-root|rootless|capabilit|seccomp|không.*root|đặc quyền/i);
      expect(source, relativePath).toMatch(/recreate|replace|restart|tạo lại|thay thế|khởi động lại/i);
      expect(source, relativePath).toMatch(/VM|virtual machine|máy ảo/i);
      expect(source, relativePath).toMatch(/orchestrator|Kubernetes|ECS|Nomad|điều phối/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('keeps container packaging separate from orchestration and the containers-vs-serverless decision', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/container.*not.*VM|not.*lightweight VM|container.*không.*máy ảo|không phải.*VM/i);
      expect(source, relativePath).toMatch(/orchestrat|điều phối/i);
      expect(source, relativePath).toMatch(/serverless/i);
      expect(source, relativePath).toContain('containers-vs-serverless');
    }
  });

  it('records Containers in a September 18 rolling changelog and moves Atlas maintenance freshness', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 18, 2026');
    expect(en).toContain('[Containers](/docs/cloud-infrastructure/containers)');
    expect(en).toMatch(/lastVerified: 2026-09-(?:17|18|19)/);

    expect(vi).toContain('18 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/cloud-infrastructure/containers)');
    expect(vi).toMatch(/lastVerified: 2026-09-(?:17|18|19)/);

    expect(read('lib/site-metadata.ts')).toContain("atlasLastUpdated = '2026-09-21'");
    expect(read('tests/e2e/docs-shell.spec.ts')).toContain('Atlas last updated Sep 21, 2026');
  });
});
