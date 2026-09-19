import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/cloud-infrastructure/cloud-iam.mdx',
  vi: 'content/docs/cloud-infrastructure/cloud-iam.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Cloud IAM lesson', () => {
  it('publishes Cloud IAM immediately after Cloud Storage Models in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/cloud-infrastructure/meta.json',
      'content/docs/cloud-infrastructure/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const storage = source.indexOf('"cloud-storage-models"');
      const iam = source.indexOf('"cloud-iam"');

      expect(storage, relativePath).toBeGreaterThan(-1);
      expect(iam, relativePath).toBeGreaterThan(storage);
    }
  });

  it('places both locale variants on the canonical concept at operate depth with current freshness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: cloud-infrastructure');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - cloud-iam\n---/);
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

  it('teaches identity, policy evaluation, temporary credentials, scope, trust, and audit as an operating system', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/principal|identity|danh tính|chủ thể/i);
      expect(source, relativePath).toMatch(/human|workload|người dùng|khối lượng công việc/i);
      expect(source, relativePath).toMatch(/role|service account|managed identity|vai trò|tài khoản dịch vụ|danh tính được quản lý/i);
      expect(source, relativePath).toMatch(/temporary credential|short-lived|STS|token|thông tin xác thực tạm thời|ngắn hạn/i);
      expect(source, relativePath).toMatch(/long-lived|access key|service account key|secret|khóa dài hạn|khóa truy cập/i);
      expect(source, relativePath).toMatch(/allow|deny|implicit deny|explicit deny|cho phép|từ chối/i);
      expect(source, relativePath).toMatch(/identity-based|resource-based|policy binding|role assignment|chính sách.*danh tính|chính sách.*tài nguyên/i);
      expect(source, relativePath).toMatch(/condition|attribute|tag|điều kiện|thuộc tính|nhãn/i);
      expect(source, relativePath).toMatch(/scope|resource|project|subscription|account|phạm vi|tài nguyên/i);
      expect(source, relativePath).toMatch(/least privilege|đặc quyền tối thiểu/i);
      expect(source, relativePath).toMatch(/trust policy|assume role|impersonat|federat|tin cậy|mạo danh|liên kết danh tính/i);
      expect(source, relativePath).toMatch(/cross-account|cross-project|cross-tenant|liên tài khoản|liên dự án|liên tenant/i);
      expect(source, relativePath).toMatch(/permission boundary|service control policy|SCP|principal access boundary|deny assignment|ranh giới quyền/i);
      expect(source, relativePath).toMatch(/audit|CloudTrail|Cloud Audit Logs|Activity Log|nhật ký kiểm toán/i);
      expect(source, relativePath).toMatch(/revoke|disable|rotate|thu hồi|vô hiệu hóa|xoay vòng/i);
      expect(source, relativePath).toMatch(/break-glass|emergency access|truy cập khẩn cấp/i);
      expect(source, relativePath).toMatch(/propagation|eventual|delay|độ trễ.*quyền|lan truyền/i);
      expect(source, relativePath).toMatch(/PassRole|impersonation|role assignment|grant.*role|gán vai trò/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('separates authentication from authorization and workload identity from application user auth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/authentication.*authorization|authorization.*authentication|xác thực.*phân quyền|phân quyền.*xác thực/i);
      expect(source, relativePath).toContain('authentication-and-authorization');
      expect(source, relativePath).toMatch(/application|end-user|user login|ứng dụng|người dùng cuối|đăng nhập/i);
    }
  });

  it('keeps provider-specific IAM semantics scoped across AWS, Google Cloud, and Azure', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/AWS IAM|STS|IAM role/);
      expect(source, relativePath).toMatch(/Google Cloud IAM|service account|Workload Identity Federation/);
      expect(source, relativePath).toMatch(/Azure RBAC|managed identity|role assignment/);
      expect(source, relativePath).toMatch(/provider|product-specific|platform-specific|nhà cung cấp|từng sản phẩm|từng nền tảng/i);
      expect(source, relativePath).toMatch(/different|differ|khác nhau|khác biệt/i);
    }
  });

  it('records Cloud IAM in the September 18 rolling changelog for both locales', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 18, 2026');
    expect(en).toContain('[Cloud IAM](/docs/cloud-infrastructure/cloud-iam)');
    expect(en).toMatch(/lastVerified: 2026-09-(?:17|18|19)/);

    expect(vi).toContain('18 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/cloud-infrastructure/cloud-iam)');
    expect(vi).toMatch(/lastVerified: 2026-09-(?:17|18|19)/);
  });
});
