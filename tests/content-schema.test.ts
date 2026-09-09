import { lessonFrontmatterSchema } from '@/lib/content/schema';
import { describe, expect, it } from 'vitest';

const validLesson = {
  title: 'How to Use the Atlas',
  description:
    'Learn how lessons, freshness, and related concepts fit together.',
  category: 'start-here',
  level: 'beginner',
  status: 'evergreen',
  lastVerified: '2026-08-19',
  reviewAfterDays: 365,
  topics: ['atlas'],
  prerequisites: [],
  related: ['freshness'],
  technologies: [],
  contentType: 'guide',
  learningDepth: 'recognize',
  concepts: [],
};

describe('lessonFrontmatterSchema', () => {
  it('accepts complete Atlas lesson metadata', () => {
    expect(lessonFrontmatterSchema.parse(validLesson)).toMatchObject(
      validLesson,
    );
  });

  it('accepts canonical concept references', () => {
    expect(
      lessonFrontmatterSchema.parse({
        ...validLesson,
        title: 'Promises',
        contentType: 'deep-dive',
        learningDepth: 'reason',
        concepts: ['promises'],
      }),
    ).toMatchObject({
      contentType: 'deep-dive',
      learningDepth: 'reason',
      concepts: ['promises'],
    });
  });

  it('rejects an unknown freshness status', () => {
    expect(() =>
      lessonFrontmatterSchema.parse({ ...validLesson, status: 'current' }),
    ).toThrow();
  });

  it('rejects non-ISO date-shaped lastVerified values', () => {
    expect(() =>
      lessonFrontmatterSchema.parse({
        ...validLesson,
        lastVerified: '19/08/2026',
      }),
    ).toThrow();
  });

  it('rejects non-positive review periods', () => {
    expect(() =>
      lessonFrontmatterSchema.parse({ ...validLesson, reviewAfterDays: 0 }),
    ).toThrow();
  });

  it('rejects an unknown content type', () => {
    expect(() =>
      lessonFrontmatterSchema.parse({
        ...validLesson,
        contentType: 'tutorial',
      }),
    ).toThrow();
  });

  it('rejects an unknown learning depth', () => {
    expect(() =>
      lessonFrontmatterSchema.parse({
        ...validLesson,
        learningDepth: 'expert',
      }),
    ).toThrow();
  });

  it('rejects unknown Atlas concept ids', () => {
    expect(() =>
      lessonFrontmatterSchema.parse({
        ...validLesson,
        concepts: ['not-a-real-atlas-concept'],
      }),
    ).toThrow(/Unknown Atlas concept id/);
  });

  it('rejects duplicate Atlas concept ids', () => {
    expect(() =>
      lessonFrontmatterSchema.parse({
        ...validLesson,
        concepts: ['promises', 'promises'],
      }),
    ).toThrow(/Duplicate Atlas concept id/);
  });
});
