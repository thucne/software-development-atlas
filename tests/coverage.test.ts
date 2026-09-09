import { atlasMap } from '@/lib/content/atlas-map';
import {
  buildConceptContentIndex,
  buildDomainCoverage,
  buildPathCoverage,
  type ContentPlacement,
} from '@/lib/content/coverage';
import { getLearningPath } from '@/lib/content/learning-paths';
import { describe, expect, it } from 'vitest';

const placements: ContentPlacement[] = [
  {
    title: 'Promises',
    url: '/docs/programming/async/promises',
    concepts: ['promises'],
  },
  {
    title: 'Promise Patterns',
    url: '/docs/programming/async/promise-patterns',
    concepts: ['promises'],
  },
  {
    title: 'Browser Event Loop',
    url: '/docs/programming/async/how-the-browser-event-loop-works',
    concepts: ['browser-event-loop', 'async-scheduling'],
  },
  {
    title: 'API Design',
    url: '/docs/backend/api-design',
    concepts: ['api-design'],
  },
];

describe('Atlas coverage', () => {
  it('indexes every authored page that references a concept', () => {
    const index = buildConceptContentIndex(placements);

    expect(index.get('promises')?.map((page) => page.title)).toEqual([
      'Promises',
      'Promise Patterns',
    ]);
  });

  it('derives domain counts from canonical concepts and placements', () => {
    const coverage = buildDomainCoverage(atlasMap, placements);
    const webPlatform = coverage.find((domain) => domain.id === 'web-platform');

    expect(webPlatform).toBeDefined();
    expect(webPlatform?.covered).toBe(1);
    expect(webPlatform?.total).toBe(10);
    expect(
      webPlatform?.concepts.find((concept) => concept.id === 'browser-event-loop'),
    ).toMatchObject({ covered: true });
    expect(
      webPlatform?.concepts.find((concept) => concept.id === 'dns-resolution'),
    ).toMatchObject({ covered: false, content: [] });
  });

  it('preserves learning-path order and derived content', () => {
    const path = getLearningPath('backend-systems');
    const coverage = buildPathCoverage(path, placements);

    expect(coverage.steps.slice(0, 3).map((step) => step.id)).toEqual([
      'backend-request-lifecycle',
      'api-design',
      'authentication-and-authorization',
    ]);
    expect(coverage.steps[1]).toMatchObject({
      id: 'api-design',
      covered: true,
    });
    expect(coverage.steps[1].content.map((page) => page.title)).toEqual([
      'API Design',
    ]);
  });

  it('keeps uncovered concepts visible in path coverage', () => {
    const path = getLearningPath('backend-systems');
    const coverage = buildPathCoverage(path, placements);
    const firstStep = coverage.steps[0];

    expect(firstStep).toMatchObject({
      id: 'backend-request-lifecycle',
      covered: false,
      content: [],
    });
    expect(coverage.total).toBe(path.concepts.length);
    expect(coverage.covered).toBe(1);
  });
});
