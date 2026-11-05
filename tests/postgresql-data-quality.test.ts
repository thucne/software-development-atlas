import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const pairs = [
  {
    file: 'database-transactions-and-isolation',
    en: ['engine-specific', 'locks selected rows', 'write skew'],
    vi: ['Phạm vi snapshot phụ thuộc DB', 'không tự tạo khóa cho toàn bộ predicate', 'write skew'],
  },
  {
    file: 'mvcc',
    en: ['does not disable VACUUM globally', 'VACUUM FULL', 'hypothetical'],
    vi: ['Không coi VACUUM bị vô hiệu hóa hoàn toàn', 'VACUUM FULL', 'giả định'],
  },
  {
    file: 'database-replication',
    en: ['synchronous_standby_names', 'max_slot_wal_keep_size', 'hypothetical'],
    vi: ['synchronous_standby_names', 'max_slot_wal_keep_size', 'giả định'],
  },
] as const;

describe('PostgreSQL EN/VI content-quality regression', () => {
  for (const pair of pairs) {
    it('retains the scoped database contract in ' + pair.file, () => {
      for (const locale of ['en', 'vi'] as const) {
        const filename = 'content/docs/data-systems/' + pair.file + (locale === 'vi' ? '.vi' : '') + '.mdx';
        const source = readFileSync(path.join(root, filename), 'utf8');
        expect(source, filename).toContain('lastVerified: 2026-11-05');
        for (const phrase of pair[locale]) {
          expect(source, filename + ': ' + phrase).toContain(phrase);
        }
      }
    });
  }
});
