import {
  getLearningPath,
  learningPaths,
  learningPathsSchema,
} from '@/lib/content/learning-paths';
import { describe, expect, it } from 'vitest';

describe('learning paths', () => {
  it('loads the four curated path ids', () => {
    expect(learningPaths.paths.map((path) => path.id)).toEqual([
      'modern-web-systems',
      'backend-systems',
      'cloud-architecture-for-software-engineers',
      'ai-native-software-engineering',
    ]);
  });

  it('looks up a path by id', () => {
    expect(getLearningPath('backend-systems').title).toBe('Backend Systems');
  });

  it('rejects duplicate concept ids inside a path', () => {
    const invalid = structuredClone(learningPaths);
    invalid.paths[0].concepts = ['dns-resolution', 'dns-resolution'];

    expect(() => learningPathsSchema.parse(invalid)).toThrow(
      /Duplicate Atlas concept id/,
    );
  });

  it('rejects unknown concept ids', () => {
    const invalid = structuredClone(learningPaths);
    invalid.paths[0].concepts = ['dns-resolution', 'missing-concept'];

    expect(() => learningPathsSchema.parse(invalid)).toThrow(
      /Unknown Atlas concept id/,
    );
  });

  it('rejects duplicate path ids', () => {
    const invalid = structuredClone(learningPaths);
    invalid.paths[1].id = invalid.paths[0].id;

    expect(() => learningPathsSchema.parse(invalid)).toThrow(
      /Duplicate learning path id/,
    );
  });

  it('rejects page mappings and other unexpected path fields', () => {
    const invalid = structuredClone(learningPaths) as typeof learningPaths & {
      paths: Array<
        (typeof learningPaths.paths)[number] & {
          pages?: string[];
        }
      >;
    };
    invalid.paths[0].pages = ['/docs/programming/async/promises'];

    expect(() => learningPathsSchema.parse(invalid)).toThrow();
  });

  it('throws a clear error for an unknown lookup id', () => {
    expect(() => getLearningPath('missing-path')).toThrow(
      /Unknown learning path: missing-path/,
    );
  });
});
