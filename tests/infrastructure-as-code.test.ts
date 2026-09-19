import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/cloud-infrastructure/infrastructure-as-code.mdx',
  vi: 'content/docs/cloud-infrastructure/infrastructure-as-code.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Infrastructure as Code lesson', () => {
  it('publishes Infrastructure as Code immediately after Kubernetes Fundamentals in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/cloud-infrastructure/meta.json',
      'content/docs/cloud-infrastructure/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const kubernetes = source.indexOf('"kubernetes-fundamentals"');
      const iac = source.indexOf('"infrastructure-as-code"');

      expect(kubernetes, relativePath).toBeGreaterThan(-1);
      expect(iac, relativePath).toBeGreaterThan(kubernetes);
    }
  });

  it('places both locale variants on the canonical concept at operate depth with current freshness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: cloud-infrastructure');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - infrastructure-as-code\n---/);
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

  it('teaches desired, recorded, and actual infrastructure state as distinct operating concepts', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/desired state|trạng thái mong muốn/i);
      expect(source, relativePath).toMatch(/state file|recorded state|trạng thái ghi nhận|tệp trạng thái/i);
      expect(source, relativePath).toMatch(/actual state|remote object|hạ tầng thực tế|trạng thái thực tế/i);
      expect(source, relativePath).toMatch(/drift|lệch trạng thái/i);
      expect(source, relativePath).toMatch(/refresh|reconcile|đối chiếu/i);
      expect(source, relativePath).toMatch(/source of truth|nguồn sự thật/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('teaches plan and apply as a reviewed change contract rather than two interchangeable commands', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/plan/i);
      expect(source, relativePath).toMatch(/apply/i);
      expect(source, relativePath).toMatch(/saved plan|plan file|saved.*plan|kế hoạch đã lưu/i);
      expect(source, relativePath).toMatch(/stale plan|stale.*plan|kế hoạch.*cũ|plan.*cũ/i);
      expect(source, relativePath).toMatch(/create|update|replace|destroy/i);
      expect(source, relativePath).toMatch(/review|approval|phê duyệt|rà soát/i);
      expect(source, relativePath).toMatch(/blast radius|phạm vi ảnh hưởng/i);
    }
  });

  it('treats state storage, locking, concurrency, and sensitive material as production concerns', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/remote backend|remote state|backend từ xa|state từ xa/i);
      expect(source, relativePath).toMatch(/state lock|locking|khóa state|khóa trạng thái/i);
      expect(source, relativePath).toMatch(/concurrent|parallel apply|đồng thời/i);
      expect(source, relativePath).toMatch(/state.*sensitive|sensitive.*state|state.*secret|secret.*state/i);
      expect(source, relativePath).toMatch(/plan.*sensitive|sensitive.*plan|plan.*secret|secret.*plan/i);
      expect(source, relativePath).toMatch(/backup|versioning|snapshot|sao lưu|phiên bản hóa/i);
    }
  });

  it('covers imports, moves, removals, and refactors without accidental replacement', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/import/i);
      expect(source, relativePath).toMatch(/moved block|moved\s*\{|khối moved/i);
      expect(source, relativePath).toMatch(/removed block|removed\s*\{|khối removed/i);
      expect(source, relativePath).toMatch(/resource address|địa chỉ resource|địa chỉ tài nguyên/i);
      expect(source, relativePath).toMatch(/rename|refactor|đổi tên|tái cấu trúc/i);
      expect(source, relativePath).toMatch(/destroy.*create|delete.*create|xóa.*tạo|replace/i);
    }
  });

  it('teaches dependency graphs, lifecycle controls, and module boundaries with their limitations', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/dependency graph|đồ thị phụ thuộc/i);
      expect(source, relativePath).toMatch(/implicit depend|explicit depend|depends_on|phụ thuộc ngầm|phụ thuộc tường minh/i);
      expect(source, relativePath).toMatch(/module/i);
      expect(source, relativePath).toMatch(/input|output|đầu vào|đầu ra/i);
      expect(source, relativePath).toMatch(/create_before_destroy/i);
      expect(source, relativePath).toMatch(/prevent_destroy/i);
      expect(source, relativePath).toMatch(/ignore_changes/i);
      expect(source, relativePath).toMatch(/not.*backup|không.*backup|not.*rollback|không.*rollback/i);
    }
  });

  it('teaches provider/module version pinning and CI delivery with short-lived credentials', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/provider version|provider.*pin|pin.*provider|phiên bản provider/i);
      expect(source, relativePath).toMatch(/lock file|\.terraform\.lock\.hcl|dependency lock|file khóa/i);
      expect(source, relativePath).toMatch(/module version|module.*pin|pin.*module|phiên bản module/i);
      expect(source, relativePath).toMatch(/CI|pipeline/i);
      expect(source, relativePath).toMatch(/OIDC|federation|short-lived|ngắn hạn/i);
      expect(source, relativePath).toMatch(/least privilege|đặc quyền tối thiểu/i);
      expect(source, relativePath).toMatch(/policy.*check|policy as code|policy-as-code|kiểm tra policy/i);
    }
  });

  it('keeps IaC boundaries explicit across Terraform, OpenTofu, Pulumi, Kubernetes, and autoscaling', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/Terraform/);
      expect(source, relativePath).toMatch(/OpenTofu/);
      expect(source, relativePath).toMatch(/Pulumi/);
      expect(source, relativePath).toContain('kubernetes-fundamentals');
      expect(source, relativePath).toContain('autoscaling');
      expect(source, relativePath).toMatch(/provider-specific|tool-specific|công cụ.*khác|khác nhau theo công cụ/i);
    }
  });

  it('records Infrastructure as Code in the September 18 rolling changelog for both locales', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 18, 2026');
    expect(en).toContain('[Infrastructure as Code](/docs/cloud-infrastructure/infrastructure-as-code)');
    expect(en).toMatch(/lastVerified: 2026-09-(?:17|18|19)/);

    expect(vi).toContain('18 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/cloud-infrastructure/infrastructure-as-code)');
    expect(vi).toMatch(/lastVerified: 2026-09-(?:17|18|19)/);
  });
});
