import { atlasMap, atlasMapSchema } from '@/lib/content/atlas-map';
import { describe, expect, it } from 'vitest';

const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe('canonical Atlas map', () => {
  it('parses the committed map', () => {
    expect(atlasMapSchema.parse(atlasMap)).toEqual(atlasMap);
  });

  it('starts with the agreed broad software-engineering domains', () => {
    expect(atlasMap.domains).toHaveLength(13);
    expect(atlasMap.domains.map((domain) => domain.id)).toEqual([
      'computing-foundations',
      'programming-runtimes',
      'web-platform',
      'frontend-engineering',
      'backend-engineering',
      'data-systems',
      'software-architecture',
      'distributed-systems',
      'cloud-infrastructure',
      'testing-quality',
      'delivery-operations',
      'security',
      'ai-native-engineering',
    ]);
  });

  it('uses unique lowercase kebab-case domain ids', () => {
    const ids = atlasMap.domains.map((domain) => domain.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => kebabCase.test(id))).toBe(true);
  });

  it('uses globally unique lowercase kebab-case concept ids', () => {
    const ids = atlasMap.domains.flatMap((domain) =>
      domain.concepts.map((concept) => concept.id),
    );

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => kebabCase.test(id))).toBe(true);
  });

  it('declares a valid learning-depth target for every concept', () => {
    const depths = new Set(['recognize', 'reason', 'operate']);

    for (const domain of atlasMap.domains) {
      for (const concept of domain.concepts) {
        expect(depths.has(concept.targetDepth)).toBe(true);
      }
    }
  });

  it('rejects duplicate domain ids at parse time', () => {
    const duplicate = structuredClone(atlasMap);
    duplicate.domains[1].id = duplicate.domains[0].id;

    expect(() => atlasMapSchema.parse(duplicate)).toThrow(
      /Duplicate Atlas domain id/,
    );
  });

  it('rejects globally duplicate concept ids at parse time', () => {
    const duplicate = structuredClone(atlasMap);
    duplicate.domains[1].concepts[0].id = duplicate.domains[0].concepts[0].id;

    expect(() => atlasMapSchema.parse(duplicate)).toThrow(
      /Duplicate Atlas concept id/,
    );
  });
});
