import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/cloud-infrastructure/cloud-networking.mdx',
  vi: 'content/docs/cloud-infrastructure/cloud-networking.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Cloud Networking lesson', () => {
  it('publishes Cloud & Infrastructure after Distributed Systems in root navigation', () => {
    for (const relativePath of ['content/docs/meta.json', 'content/docs/meta.vi.json']) {
      const source = read(relativePath);
      const distributed = source.indexOf('"distributed-systems"');
      const cloud = source.indexOf('"cloud-infrastructure"');
      const delivery = source.indexOf('"delivery-operations"');

      expect(distributed, relativePath).toBeGreaterThan(-1);
      expect(cloud, relativePath).toBeGreaterThan(distributed);
      expect(delivery, relativePath).toBeGreaterThan(cloud);
    }
  });

  it('creates bilingual Cloud & Infrastructure sidebars with Cloud Networking first', () => {
    for (const relativePath of [
      'content/docs/cloud-infrastructure/meta.json',
      'content/docs/cloud-infrastructure/meta.vi.json',
    ]) {
      expect(existsSync(path.join(repoRoot, relativePath)), `${relativePath} should exist`).toBe(true);
      const source = read(relativePath);
      expect(source, relativePath).toContain('"cloud-networking"');
    }
  });

  it('places both locale variants on the canonical concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: cloud-infrastructure');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toMatch(/concepts:\n  - cloud-networking\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-17');

      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes, relativePath).toBeGreaterThanOrEqual(2);
      expect(termBoxes, relativePath).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches reachability by tracing addressing, routing, translation, and policy', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/CIDR|prefix|tiền tố/i);
      expect(source, relativePath).toMatch(/subnet|mạng con/i);
      expect(source, relativePath).toMatch(/route table|routing table|bảng định tuyến/i);
      expect(source, relativePath).toMatch(/destination.*target|destination.*next hop|đích.*target|đích.*next hop|đích.*chặng kế/i);
      expect(source, relativePath).toMatch(/longest prefix|most specific route|tiền tố dài nhất|route cụ thể nhất/i);
      expect(source, relativePath).toMatch(/public subnet|private subnet|subnet công khai|subnet riêng/i);
      expect(source, relativePath).toMatch(/internet gateway|cổng internet/i);
      expect(source, relativePath).toMatch(/NAT|network address translation/i);
      expect(source, relativePath).toMatch(/egress|outbound|lưu lượng đi ra/i);
      expect(source, relativePath).toMatch(/ingress|inbound|lưu lượng đi vào/i);
      expect(source, relativePath).toMatch(/firewall|security group|network security group|chính sách mạng/i);
      expect(source, relativePath).toMatch(/DNS.*reachability|reachability.*DNS|DNS.*khả năng kết nối|phân giải.*không.*kết nối/i);
      expect(source, relativePath).toMatch(/private endpoint|service endpoint|endpoint riêng/i);
      expect(source, relativePath).toMatch(/peering|VPN|transit/i);
      expect(source, relativePath).toMatch(/IAM|authorization|ủy quyền|phân quyền/i);
      expect(source, relativePath).toMatch(/packet path|đường đi.*gói|luồng gói/i);
      expect(source, relativePath).toMatch(/timeout|timed out|hết thời gian/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('records Cloud Networking in the September 17 changelog for both locales', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 17, 2026');
    expect(en).toContain('[Cloud Networking](/docs/cloud-infrastructure/cloud-networking)');
    expect(en).toContain('lastVerified: 2026-09-17');

    expect(vi).toContain('17 tháng 9, 2026');
    expect(vi).toContain('](/vi/docs/cloud-infrastructure/cloud-networking)');
    expect(vi).toContain('lastVerified: 2026-09-17');
  });
});
