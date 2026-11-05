import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

const pairs = [
  {
    slug: 'distributed-systems/partial-failure',
    en: ['does not automatically halt the thread', 'Cancellation is not rollback', 'idempotency key alone'],
    vi: ['không tự động làm dừng thread', 'Cancellation không phải rollback', 'idempotency key'],
  },
  {
    slug: 'distributed-systems/distributed-replication',
    en: ['remote_write', 'remote_apply', 'does not imply remote fsync'],
    vi: ['remote_write', 'remote_apply', 'không tự bảo đảm remote fsync'],
  },
  {
    slug: 'distributed-systems/sagas',
    en: ['Forward progress is not unconditional', 'MANUAL_REVIEW', 'not an equivalent replacement'],
    vi: ['Không thể bảo đảm forward progress vô điều kiện', 'MANUAL_REVIEW', 'không có'],
  },
  {
    slug: 'backend-engineering/authentication-and-authorization',
    en: ['BOLA', 'NIST', 'not universal mandates on all websites', 'JWT'],
    vi: ['BOLA', 'NIST', 'không phải yêu cầu bắt buộc với mọi website', 'JWT'],
  },
] as const;

describe('Wave 1 technical-boundary and evidence regression', () => {
  for (const pair of pairs) {
    it(`keeps the ${pair.slug} contract in both locales`, () => {
      for (const locale of ['en', 'vi'] as const) {
        const relativePath = `content/docs/${pair.slug}${locale === 'vi' ? '.vi' : ''}.mdx`;
        const source = readFileSync(path.join(repoRoot, relativePath), 'utf8');
        expect(source, relativePath).toContain('lastVerified: 2026-11-05');
        for (const expected of pair[locale]) {
          expect(source, `${relativePath}: ${expected}`).toContain(expected);
        }
        expect(source, relativePath).toMatch(/hypothetical|giả định/i);
      }
    });
  }
});
