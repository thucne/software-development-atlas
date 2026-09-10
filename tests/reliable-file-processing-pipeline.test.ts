import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const walkthroughPaths = {
  en: 'content/docs/engineering-judgment/architecture-walkthroughs/reliable-file-processing-pipeline.mdx',
  vi: 'content/docs/engineering-judgment/architecture-walkthroughs/reliable-file-processing-pipeline.vi.mdx',
} as const;

const concepts = [
  'object-storage',
  'background-jobs',
  'message-queues',
  'partial-failure',
  'retries-and-backoff',
  'delivery-semantics',
  'cloud-storage-models',
  'cloud-iam',
  'autoscaling',
  'logs-metrics-traces',
  'least-privilege',
] as const;

describe('Reliable File Processing Pipeline walkthrough', () => {
  it('publishes the bilingual architecture walkthrough', () => {
    expect(read('content/docs/engineering-judgment/architecture-walkthroughs/meta.json')).toContain(
      '"reliable-file-processing-pipeline"',
    );
    expect(read('content/docs/engineering-judgment/architecture-walkthroughs/meta.vi.json')).toContain(
      '"reliable-file-processing-pipeline"',
    );
  });

  it('places both variants on the intended cross-domain concepts at reason depth', () => {
    for (const relativePath of Object.values(walkthroughPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: architecture-walkthrough');
      expect(source, relativePath).toContain('learningDepth: reason');

      for (const concept of concepts) {
        expect(source, `${relativePath}: ${concept}`).toContain(`  - ${concept}`);
      }
    }
  });

  it('teaches durable upload, duplicate-safe processing, pressure control, security, and evidence', () => {
    const en = read(walkthroughPaths.en);
    const vi = read(walkthroughPaths.vi);

    for (const [relativePath, source] of [
      [walkthroughPaths.en, en],
      [walkthroughPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
      expect(source, relativePath).toMatch(/object storage|kho đối tượng/i);
      expect(source, relativePath).toMatch(/at least once|ít nhất một lần/i);
      expect(source, relativePath).toMatch(/idempot|lặp an toàn/i);
      expect(source, relativePath).toMatch(/checksum|tổng kiểm/i);
      expect(source, relativePath).toMatch(/quarantine|cách ly/i);
      expect(source, relativePath).toMatch(/queue age|tuổi.*hàng đợi/i);
      expect(source, relativePath).toMatch(/bounded concurrency|giới hạn.*song song/i);
      expect(source, relativePath).toMatch(/least privilege|đặc quyền tối thiểu/i);
      expect(source, relativePath).toMatch(/correlation|tương quan/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
