import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/cloud-infrastructure/serverless-compute.mdx',
  vi: 'content/docs/cloud-infrastructure/serverless-compute.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Serverless Compute lesson', () => {
  it('publishes Serverless Compute immediately after Containers in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/cloud-infrastructure/meta.json',
      'content/docs/cloud-infrastructure/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const containers = source.indexOf('"containers"');
      const serverless = source.indexOf('"serverless-compute"');

      expect(containers, relativePath).toBeGreaterThan(-1);
      expect(serverless, relativePath).toBeGreaterThan(containers);
    }
  });

  it('places both locale variants on the canonical concept at reason depth with current freshness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: cloud-infrastructure');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - serverless-compute\n---/);
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

  it('teaches serverless as delegated execution lifecycle with explicit invocation, scaling, state, and failure semantics', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/serverless.*server|no servers|không.*server|máy chủ/i);
      expect(source, relativePath).toMatch(/execution environment|môi trường thực thi/i);
      expect(source, relativePath).toMatch(/cold start|khởi động lạnh/i);
      expect(source, relativePath).toMatch(/warm|reuse|tái sử dụng|làm ấm/i);
      expect(source, relativePath).toMatch(/scale to zero|scale-to-zero|co.*0|về 0/i);
      expect(source, relativePath).toMatch(/minimum instance|provisioned concurrency|always ready|pre.?warm|instance tối thiểu|capacity.*sẵn/i);
      expect(source, relativePath).toMatch(/concurrency|đồng thời/i);
      expect(source, relativePath).toMatch(/quota|throttl|429|hạn ngạch|giới hạn/i);
      expect(source, relativePath).toMatch(/synchronous|sync|đồng bộ/i);
      expect(source, relativePath).toMatch(/asynchronous|async|bất đồng bộ/i);
      expect(source, relativePath).toMatch(/trigger|event source|nguồn sự kiện/i);
      expect(source, relativePath).toMatch(/retry|redeliver|at-least-once|thử lại|giao lại/i);
      expect(source, relativePath).toMatch(/idempot|duplicate|trùng lặp/i);
      expect(source, relativePath).toMatch(/timeout|deadline|thời gian chờ|hạn thời gian/i);
      expect(source, relativePath).toMatch(/ephemeral|temporary|\/tmp|tạm thời/i);
      expect(source, relativePath).toMatch(/stateless|durable state|trạng thái bền|không trạng thái/i);
      expect(source, relativePath).toMatch(/database|connection|downstream|cơ sở dữ liệu|kết nối/i);
      expect(source, relativePath).toMatch(/backpressure|maximum instances|reserved concurrency|giới hạn.*instance|áp lực ngược/i);
      expect(source, relativePath).toMatch(/queue|backlog|hàng đợi|tồn đọng/i);
      expect(source, relativePath).toMatch(/metric|log|trace|quan sát|telemetry/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('keeps provider-specific serverless contracts scoped instead of inventing one universal function model', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/AWS Lambda/);
      expect(source, relativePath).toMatch(/Cloud Run|Cloud Run functions|Google Cloud/);
      expect(source, relativePath).toMatch(/Azure Functions/);
      expect(source, relativePath).toMatch(/provider|product-specific|platform-specific|nhà cung cấp|từng sản phẩm|từng nền tảng/i);
      expect(source, relativePath).toMatch(/different|differ|khác nhau|khác biệt/i);
    }
  });

  it('separates operating semantics from the Containers vs Serverless decision guide', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('containers-vs-serverless');
      expect(source, relativePath).toMatch(/operat|execution|lifecycle|vận hành|thực thi|vòng đời/i);
    }
  });

  it('records Serverless Compute in the September 18 rolling changelog for both locales', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 18, 2026');
    expect(en).toContain('[Serverless Compute](/docs/cloud-infrastructure/serverless-compute)');
    expect(en).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);

    expect(vi).toContain('18 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/cloud-infrastructure/serverless-compute)');
    expect(vi).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);
  });
});
