import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/cloud-infrastructure/secrets-management.mdx',
  vi: 'content/docs/cloud-infrastructure/secrets-management.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Secrets Management lesson', () => {
  it('publishes Secrets Management immediately after Cloud IAM in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/cloud-infrastructure/meta.json',
      'content/docs/cloud-infrastructure/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const iam = source.indexOf('"cloud-iam"');
      const secrets = source.indexOf('"secrets-management"');

      expect(iam, relativePath).toBeGreaterThan(-1);
      expect(secrets, relativePath).toBeGreaterThan(iam);
    }
  });

  it('places both locale variants on the canonical concept at operate depth with current freshness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: cloud-infrastructure');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - secrets-management\n---/);
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

  it('teaches the full secret lifecycle from creation and storage through delivery, rotation, revocation, and deletion', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/secret lifecycle|vòng đời.*secret|vòng đời.*bí mật/i);
      expect(source, relativePath).toMatch(/create|generate|creation|tạo.*secret|sinh.*secret/i);
      expect(source, relativePath).toMatch(/store|vault|secret manager|lưu trữ|kho bí mật/i);
      expect(source, relativePath).toMatch(/retrieve|fetch|inject|delivery|phân phối|lấy.*secret|nạp.*secret/i);
      expect(source, relativePath).toMatch(/cache|caching|bộ nhớ đệm/i);
      expect(source, relativePath).toMatch(/rotate|rotation|xoay vòng/i);
      expect(source, relativePath).toMatch(/revoke|disable|invalidate|thu hồi|vô hiệu hóa/i);
      expect(source, relativePath).toMatch(/delete|destroy|purge|xóa|hủy/i);
      expect(source, relativePath).toMatch(/version|phiên bản/i);
      expect(source, relativePath).toMatch(/audit|CloudTrail|Cloud Audit Logs|Activity Log|logging|nhật ký/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('keeps secret material out of source, images, logs, command lines, and long-lived CI credentials', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/source code|repository|repo|GitHub|mã nguồn|kho mã/i);
      expect(source, relativePath).toMatch(/container image|image layer|build artifact|ảnh container|artifact build/i);
      expect(source, relativePath).toMatch(/log|stdout|trace|nhật ký/i);
      expect(source, relativePath).toMatch(/command line|CLI|process argument|dòng lệnh|tham số process/i);
      expect(source, relativePath).toMatch(/CI|OIDC|federation|federated|pipeline/i);
      expect(source, relativePath).toMatch(/secret scanning|scan.*secret|quét.*secret/i);
    }
  });

  it('separates secret storage from workload identity and from cryptographic key management', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('cloud-iam');
      expect(source, relativePath).toMatch(/workload identity|managed identity|service account|IAM role|danh tính workload|danh tính được quản lý/i);
      expect(source, relativePath).toMatch(/secret zero|bootstrap|khởi tạo|bootstrap credential/i);
      expect(source, relativePath).toMatch(/KMS|key management|encryption key|cryptographic key|khóa mã hóa|quản lý khóa/i);
      expect(source, relativePath).toMatch(/plaintext|cleartext|decrypted|giải mã|dạng rõ/i);
      expect(source, relativePath).toMatch(/compromised process|runtime compromise|process.*secret|tiến trình.*secret|runtime.*secret/i);
    }
  });

  it('teaches zero-downtime rotation as a coordinated rollout rather than replacing one stored value', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/rotation.*upstream|upstream.*rotation|database.*rotation|rotation.*database|xoay vòng.*database|dịch vụ đích/i);
      expect(source, relativePath).toMatch(/overlap|dual credential|alternating user|two sets|song song|hai bộ credential/i);
      expect(source, relativePath).toMatch(/connection pool|existing connection|kết nối hiện có|pool kết nối/i);
      expect(source, relativePath).toMatch(/refresh|reload|restart|làm mới|nạp lại|khởi động lại/i);
      expect(source, relativePath).toMatch(/rollback|roll back|quay lui/i);
      expect(source, relativePath).toMatch(/cutover|revoke old|disable old|thu hồi.*cũ|vô hiệu hóa.*cũ/i);
    }
  });

  it('covers delivery and caching trade-offs without treating environment variables as universally safe or unsafe', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/SDK|API|runtime fetch|truy xuất runtime/i);
      expect(source, relativePath).toMatch(/environment variable|env var|biến môi trường/i);
      expect(source, relativePath).toMatch(/file mount|mounted file|volume|tệp.*mount|file.*mount/i);
      expect(source, relativePath).toMatch(/cache TTL|cache.*TTL|refresh interval|TTL.*cache|chu kỳ làm mới/i);
      expect(source, relativePath).toMatch(/secret manager.*unavailable|vault.*unavailable|dependency.*outage|secret manager.*sự cố|kho bí mật.*sự cố/i);
    }
  });

  it('keeps provider-specific semantics scoped across AWS, Google Cloud, and Azure', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/AWS Secrets Manager|AWSCURRENT|AWSPREVIOUS/);
      expect(source, relativePath).toMatch(/Google Cloud Secret Manager|secret version|latest/);
      expect(source, relativePath).toMatch(/Azure Key Vault|managed identity|secret version/);
      expect(source, relativePath).toMatch(/provider|product-specific|platform-specific|nhà cung cấp|từng sản phẩm|từng nền tảng/i);
      expect(source, relativePath).toMatch(/different|differ|khác nhau|khác biệt/i);
    }
  });

  it('records Secrets Management in the September 18 rolling changelog for both locales', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 18, 2026');
    expect(en).toContain('[Secrets Management](/docs/cloud-infrastructure/secrets-management)');
    expect(en).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);

    expect(vi).toContain('18 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/cloud-infrastructure/secrets-management)');
    expect(vi).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);
  });
});
