import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/frontend-engineering/frontend-state-models.mdx',
  vi: 'content/docs/frontend-engineering/frontend-state-models.vi.mdx',
} as const;

describe('Frontend State Models lesson', () => {
  it('publishes immediately after Server and Client Components in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/frontend-engineering/meta.json',
      'content/docs/frontend-engineering/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const components = source.indexOf('"server-and-client-components"');
      const stateModels = source.indexOf('"frontend-state-models"');
      expect(components, relativePath).toBeGreaterThan(-1);
      expect(stateModels, relativePath).toBeGreaterThan(components);
    }
  });

  it('places both locale variants on the canonical concept at reason depth', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = read(relativePath);
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - frontend-state-models\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-16');
      expect(source.match(/<TermBox/g)?.length ?? 0, relativePath).toBeGreaterThanOrEqual(3);
      expect(source.match(/```mermaid/g)?.length ?? 0, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
    }
  });

  it('teaches ownership, derived state, URL state, synchronization risks, and state scope', () => {
    const en = read(lessonPaths.en);
    const vi = read(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/owner|ownership|sở hữu/i);
      expect(source, relativePath).toMatch(/lifetime|vòng đời|thời gian sống/i);
      expect(source, relativePath).toMatch(/scope|phạm vi/i);
      expect(source, relativePath).toMatch(/persist|persistence|lưu bền|lưu trữ/i);
      expect(source, relativePath).toMatch(/derived state|derive|dẫn xuất|tính từ/i);
      expect(source, relativePath).toMatch(/single source of truth|nguồn sự thật duy nhất|một nguồn.*sự thật/i);
      expect(source, relativePath).toMatch(/URL|search params|query string|đường dẫn/i);
      expect(source, relativePath).toMatch(/bookmark|share|back|forward|chia sẻ|quay lại|tiến tới/i);
      expect(source, relativePath).toMatch(/colocat|closest common parent|gần.*owner|gần.*sở hữu|lift.*state|nâng state/i);
      expect(source, relativePath).toMatch(/global store|context|global state|store toàn cục|state toàn cục/i);
      expect(source, relativePath).toMatch(/effect.*sync|synchroni[sz]|đồng bộ.*effect|hai bản sao|two copies/i);
      expect(source, relativePath).toMatch(/remote|server-owned|cache|dữ liệu.*server|server.*data/i);
      expect(source, relativePath).toMatch(/localStorage|storage/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });
});
