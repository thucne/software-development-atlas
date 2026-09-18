import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/cloud-infrastructure/load-balancing.mdx',
  vi: 'content/docs/cloud-infrastructure/load-balancing.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Load Balancing lesson', () => {
  it('publishes Load Balancing immediately after Serverless Compute in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/cloud-infrastructure/meta.json',
      'content/docs/cloud-infrastructure/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const serverless = source.indexOf('"serverless-compute"');
      const loadBalancing = source.indexOf('"load-balancing"');

      expect(serverless, relativePath).toBeGreaterThan(-1);
      expect(loadBalancing, relativePath).toBeGreaterThan(serverless);
    }
  });

  it('places both locale variants on the canonical concept at operate depth with current freshness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: cloud-infrastructure');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - load-balancing\n---/);
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

  it('teaches the full load-balancer data path, backend eligibility, distribution, and lifecycle controls', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/Layer 4|L4|transport layer|lớp 4/i);
      expect(source, relativePath).toMatch(/Layer 7|L7|application layer|lớp 7/i);
      expect(source, relativePath).toMatch(/listener|frontend|điểm nghe|mặt trước/i);
      expect(source, relativePath).toMatch(/target group|backend pool|origin pool|nhóm đích|pool backend/i);
      expect(source, relativePath).toMatch(/health check|health probe|kiểm tra sức khỏe/i);
      expect(source, relativePath).toMatch(/readiness|ready|sẵn sàng/i);
      expect(source, relativePath).toMatch(/round robin|least outstanding|least request|weighted|hash|trọng số/i);
      expect(source, relativePath).toMatch(/sticky|stickiness|session affinity|affinity|bám phiên/i);
      expect(source, relativePath).toMatch(/connection draining|deregistration delay|drain|rút kết nối/i);
      expect(source, relativePath).toMatch(/in.?flight|đang xử lý/i);
      expect(source, relativePath).toMatch(/TLS termination|terminate TLS|kết thúc TLS|TLS/i);
      expect(source, relativePath).toMatch(/cross.?zone|availability zone|AZ|zone|vùng sẵn sàng/i);
      expect(source, relativePath).toMatch(/slow start|ramp|warm.?up|khởi động chậm|tăng dần/i);
      expect(source, relativePath).toMatch(/fail.?open|all.*unhealthy|tất cả.*unhealthy|mọi backend.*lỗi/i);
      expect(source, relativePath).toMatch(/access log|metric|latency|5xx|log truy cập|độ trễ/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('keeps health checks from becoming a proxy for all business correctness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/health check.*not|not.*health check|health check.*không|không.*health check/i);
      expect(source, relativePath).toMatch(/dependency|database|downstream|phụ thuộc|cơ sở dữ liệu/i);
      expect(source, relativePath).toMatch(/overload|saturation|quá tải|bão hòa/i);
      expect(source, relativePath).toMatch(/flap|flapping|oscillat|dao động|chập chờn/i);
    }
  });

  it('keeps provider-specific behavior scoped across AWS, Google Cloud, and Azure', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/AWS|Application Load Balancer|Network Load Balancer/);
      expect(source, relativePath).toMatch(/Google Cloud|Cloud Load Balancing/);
      expect(source, relativePath).toMatch(/Azure Load Balancer|Azure/);
      expect(source, relativePath).toMatch(/provider|product-specific|platform-specific|nhà cung cấp|từng sản phẩm|từng nền tảng/i);
      expect(source, relativePath).toMatch(/different|differ|khác nhau|khác biệt/i);
    }
  });

  it('records Load Balancing in the September 18 rolling changelog for both locales', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 18, 2026');
    expect(en).toContain('[Load Balancing](/docs/cloud-infrastructure/load-balancing)');
    expect(en).toContain('lastVerified: 2026-09-18');

    expect(vi).toContain('18 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/cloud-infrastructure/load-balancing)');
    expect(vi).toContain('lastVerified: 2026-09-18');
  });
});
