import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const lessonPaths = {
  en: 'content/docs/ai-native-engineering/verification-loops-and-machine-checkable-guardrails.mdx',
  vi: 'content/docs/ai-native-engineering/verification-loops-and-machine-checkable-guardrails.vi.mdx',
} as const;

describe('Verification Loops & Machine-Checkable Guardrails lesson', () => {
  it('publishes a bilingual AI-Native Engineering section', () => {
    expect(read('content/docs/meta.json')).toContain('"ai-native-engineering"');
    expect(read('content/docs/meta.vi.json')).toContain('"ai-native-engineering"');
    expect(read('content/docs/ai-native-engineering/meta.json')).toContain(
      '"verification-loops-and-machine-checkable-guardrails"',
    );
    expect(read('content/docs/ai-native-engineering/meta.vi.json')).toContain(
      '"verification-loops-and-machine-checkable-guardrails"',
    );
  });

  it('places both variants on canonical verification concepts at operate depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);

      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: operate');
      expect(source, relativePath).toContain('  - verification-loops');
      expect(source, relativePath).toContain('  - machine-checkable-guardrails');
    }
  });

  it('teaches an evidence-driven loop that cannot be gamed by weakening checks', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [
      [lessonPaths.en, en],
      [lessonPaths.vi, vi],
    ] as const) {
      expect(source, relativePath).toContain('<TermBox term=');
      expect(source, relativePath).toContain('```mermaid');
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }

    expect(en).toMatch(/verification loop/i);
    expect(en).toMatch(/machine-checkable/i);
    expect(en).toMatch(/acceptance criteria/i);
    expect(en).toMatch(/latest commit/i);
    expect(en).toMatch(/do not (delete|weaken)/i);
    expect(en).toMatch(/stop|escalate/i);
    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');

    expect(vi).toMatch(/vòng lặp kiểm chứng/i);
    expect(vi).toMatch(/kiểm tra được bằng máy/i);
    expect(vi).toMatch(/tiêu chí chấp nhận/i);
    expect(vi).toMatch(/commit mới nhất/i);
    expect(vi).toMatch(/không (xóa|nới lỏng)/i);
    expect(vi).toMatch(/dừng|chuyển cho người/i);
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
