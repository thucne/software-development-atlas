import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/cloud-infrastructure/cloud-compute.mdx',
  vi: 'content/docs/cloud-infrastructure/cloud-compute.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Cloud Compute lesson', () => {
  it('publishes Cloud Compute immediately after Cloud Networking in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/cloud-infrastructure/meta.json',
      'content/docs/cloud-infrastructure/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const networking = source.indexOf('"cloud-networking"');
      const compute = source.indexOf('"cloud-compute"');

      expect(networking, relativePath).toBeGreaterThan(-1);
      expect(compute, relativePath).toBeGreaterThan(networking);
    }
  });

  it('places both locale variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: cloud-infrastructure');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - cloud-compute\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-17');

      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes, relativePath).toBeGreaterThanOrEqual(2);
      expect(termBoxes, relativePath).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
      expect(source, relativePath).toMatch(/> 💡 \*\*(Rule of thumb|Quy tắc bỏ túi):\*\*/);
      expect(source, relativePath).toMatch(/Fatal pitfall|Sai lầm chí mạng/i);
    }
  });

  it('teaches virtual machines as replaceable compute capacity with explicit lifecycle, storage, and failure boundaries', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/virtual machine|\bVM\b|máy ảo/i);
      expect(source, relativePath).toMatch(/hypervisor|host|máy chủ vật lý|host vật lý/i);
      expect(source, relativePath).toMatch(/vCPU|virtual CPU|CPU ảo/i);
      expect(source, relativePath).toMatch(/memory|RAM|bộ nhớ/i);
      expect(source, relativePath).toMatch(/instance type|machine type|VM size|loại máy|kiểu máy|kích cỡ VM/i);
      expect(source, relativePath).toMatch(/image|machine image|AMI|ảnh máy|image hệ điều hành/i);
      expect(source, relativePath).toMatch(/boot disk|root volume|OS disk|đĩa khởi động|ổ đĩa hệ điều hành/i);
      expect(source, relativePath).toMatch(/reboot|restart|khởi động lại/i);
      expect(source, relativePath).toMatch(/stop.*start|start.*stop|dừng.*khởi động|khởi động.*dừng/i);
      expect(source, relativePath).toMatch(/terminate|delete|xóa|chấm dứt/i);
      expect(source, relativePath).toMatch(/ephemeral|instance store|Local SSD|temporary disk|tạm thời|cục bộ/i);
      expect(source, relativePath).toMatch(/persistent|durable|EBS|Persistent Disk|managed disk|bền vững|lưu trữ lâu dài/i);
      expect(source, relativePath).toMatch(/availability zone|zone|fault domain|vùng sẵn sàng|miền lỗi/i);
      expect(source, relativePath).toMatch(/single instance|one VM|một VM|một instance/i);
      expect(source, relativePath).toMatch(/Spot|preempt|evict|interrupt|thu hồi|gián đoạn/i);
      expect(source, relativePath).toMatch(/bootstrap|startup|user data|cloud-init|khởi tạo/i);
      expect(source, relativePath).toMatch(/replace|recreate|immutable|thay thế|tạo lại|bất biến/i);
      expect(source, relativePath).toMatch(/capacity|quota|công suất|hạn ngạch/i);
      expect(source, relativePath).toMatch(/vertical|resize|right.?siz|scale up|scale down|đổi kích cỡ|tăng cấu hình/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('keeps provider-specific mechanics scoped instead of pretending all VM platforms behave identically', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/AWS|EC2/);
      expect(source, relativePath).toMatch(/Google Cloud|Compute Engine/);
      expect(source, relativePath).toMatch(/Azure|Virtual Machines/);
      expect(source, relativePath).toMatch(/provider|nhà cung cấp/i);
      expect(source, relativePath).toMatch(/different|differ|khác nhau|khác biệt/i);
    }
  });

  it('records Cloud Compute in the September 17 changelog for both locales', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 17, 2026');
    expect(en).toContain('[Cloud Compute](/docs/cloud-infrastructure/cloud-compute)');
    expect(en).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);

    expect(vi).toContain('17 tháng 9, 2026');
    expect(vi).toContain('](/vi/docs/cloud-infrastructure/cloud-compute)');
    expect(vi).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);
  });
});
