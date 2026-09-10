import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/backend-engineering/authentication-and-authorization.mdx',
  vi: 'content/docs/backend-engineering/authentication-and-authorization.vi.mdx',
} as const;

describe('Authentication and Authorization lesson', () => {
  it('publishes the lesson in the bilingual backend engineering section', () => {
    expect(read('content/docs/backend-engineering/meta.json')).toContain('"authentication-and-authorization"');
    expect(read('content/docs/backend-engineering/meta.vi.json')).toContain('"authentication-and-authorization"');
  });

  it('places both variants on the canonical concept at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toContain('  - authentication-and-authorization');
      expect(source, relativePath).toContain('<TermBox');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches identity assurance, resource authorization, session lifecycle, and denial evidence', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toMatch(/authentication|xác thực/i);
      expect(source, relativePath).toMatch(/authorization|phân quyền|ủy quyền/i);
      expect(source, relativePath).toMatch(/principal|chủ thể/i);
      expect(source, relativePath).toMatch(/subject[\s\S]*action[\s\S]*resource[\s\S]*context|chủ thể[\s\S]*hành động[\s\S]*tài nguyên[\s\S]*ngữ cảnh/i);
      expect(source, relativePath).toMatch(/deny by default|mặc định từ chối/i);
      expect(source, relativePath).toMatch(/object[- ]level|resource[- ]level|cấp đối tượng|cấp tài nguyên/i);
      expect(source, relativePath).toMatch(/session|phiên/i);
      expect(source, relativePath).toMatch(/reauth|xác thực lại/i);
      expect(source, relativePath).toMatch(/revocation|thu hồi/i);
      expect(source, relativePath).toMatch(/phishing[- ]resistant|chống phishing|kháng phishing/i);
      expect(source, relativePath).toMatch(/audit|nhật ký/i);
      expect(source, relativePath).toMatch(/service identit|machine identit|danh tính dịch vụ|danh tính máy/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');

    expect(en).toContain('NIST SP 800-63-4');
    expect(en).toContain('OWASP Authorization Cheat Sheet');
    expect(en).toMatch(/Broken Object Level Authorization|BOLA/);
  });
});
