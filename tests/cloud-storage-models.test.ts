import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/cloud-infrastructure/cloud-storage-models.mdx',
  vi: 'content/docs/cloud-infrastructure/cloud-storage-models.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Cloud Storage Models lesson', () => {
  it('publishes Cloud Storage Models immediately after Load Balancing in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/cloud-infrastructure/meta.json',
      'content/docs/cloud-infrastructure/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const loadBalancing = source.indexOf('"load-balancing"');
      const storage = source.indexOf('"cloud-storage-models"');

      expect(loadBalancing, relativePath).toBeGreaterThan(-1);
      expect(storage, relativePath).toBeGreaterThan(loadBalancing);
    }
  });

  it('places both locale variants on the canonical concept at reason depth with current freshness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: cloud-infrastructure');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - cloud-storage-models\n---/);
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

  it('teaches local, block, file, and object storage as different access and failure contracts', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/local storage|instance store|ephemeral|local SSD|đĩa cục bộ|lưu trữ cục bộ|tạm thời/i);
      expect(source, relativePath).toMatch(/block storage|block device|khối dữ liệu|lưu trữ khối/i);
      expect(source, relativePath).toMatch(/file storage|shared file|NFS|SMB|lưu trữ tệp|file share/i);
      expect(source, relativePath).toMatch(/object storage|bucket|object API|lưu trữ đối tượng/i);
      expect(source, relativePath).toMatch(/mount|format|filesystem|file system|gắn|định dạng|hệ thống tệp/i);
      expect(source, relativePath).toMatch(/attach|attachment|multi-attach|gắn.*instance|đính kèm/i);
      expect(source, relativePath).toMatch(/shared|concurrent client|nhiều client|chia sẻ/i);
      expect(source, relativePath).toMatch(/HTTP|REST|API|SDK/i);
      expect(source, relativePath).toMatch(/latency|độ trễ/i);
      expect(source, relativePath).toMatch(/IOPS/i);
      expect(source, relativePath).toMatch(/throughput|băng thông/i);
      expect(source, relativePath).toMatch(/I\/O size|request size|kích thước.*I\/O|kích thước.*request/i);
      expect(source, relativePath).toMatch(/durability|độ bền dữ liệu/i);
      expect(source, relativePath).toMatch(/availability|khả dụng|sẵn sàng/i);
      expect(source, relativePath).toMatch(/zonal|zone|Availability Zone|AZ|vùng sẵn sàng/i);
      expect(source, relativePath).toMatch(/regional|region|khu vực/i);
      expect(source, relativePath).toMatch(/multi.?region|cross.?region|geo.?replication|đa vùng|liên vùng/i);
      expect(source, relativePath).toMatch(/snapshot|ảnh chụp/i);
      expect(source, relativePath).toMatch(/backup|sao lưu/i);
      expect(source, relativePath).toMatch(/replication|replica|sao chép/i);
      expect(source, relativePath).toMatch(/restore|recovery|khôi phục/i);
      expect(source, relativePath).toMatch(/tier|storage class|archive|lifecycle|lớp lưu trữ|phân tầng/i);
      expect(source, relativePath).toMatch(/cost|pricing|retrieval|egress|request charge|chi phí|phí truy xuất/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('separates durability, availability, replication, snapshots, and backups instead of treating them as synonyms', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/durability.*availability|availability.*durability|độ bền.*khả dụng|khả dụng.*độ bền/i);
      expect(source, relativePath).toMatch(/snapshot.*backup|backup.*snapshot|ảnh chụp.*sao lưu|sao lưu.*ảnh chụp/i);
      expect(source, relativePath).toMatch(/replication.*backup|backup.*replication|sao chép.*sao lưu|sao lưu.*sao chép/i);
      expect(source, relativePath).toMatch(/RPO|recovery point|điểm khôi phục/i);
    }
  });

  it('keeps provider-specific storage semantics scoped across AWS, Google Cloud, and Azure', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/EBS|EFS|S3/);
      expect(source, relativePath).toMatch(/Persistent Disk|Hyperdisk|Filestore|Cloud Storage/);
      expect(source, relativePath).toMatch(/Managed Disks|Azure Files|Blob Storage/);
      expect(source, relativePath).toMatch(/provider|product-specific|platform-specific|nhà cung cấp|từng sản phẩm|từng nền tảng/i);
      expect(source, relativePath).toMatch(/different|differ|khác nhau|khác biệt/i);
    }
  });

  it('links to the dedicated Object Storage lesson instead of duplicating its deep object semantics', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('object-storage');
      expect(source, relativePath).toMatch(/deeper|dedicated|chi tiết|chuyên sâu/i);
    }
  });

  it('records Cloud Storage Models in the September 18 rolling changelog for both locales', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 18, 2026');
    expect(en).toContain('[Cloud Storage Models](/docs/cloud-infrastructure/cloud-storage-models)');
    expect(en).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);

    expect(vi).toContain('18 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/cloud-infrastructure/cloud-storage-models)');
    expect(vi).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);
  });
});
