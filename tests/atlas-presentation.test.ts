import { AtlasCoverageView } from '@/components/atlas/atlas-coverage';
import { LearningPathView } from '@/components/atlas/learning-path';
import { LearningPathsOverviewView } from '@/components/atlas/learning-paths-overview';
import type {
  DomainCoverage,
  PathCoverage,
} from '@/lib/content/coverage';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

const domainCoverage: DomainCoverage[] = [
  {
    id: 'web-platform',
    title: 'Web Platform',
    covered: 1,
    total: 2,
    concepts: [
      {
        id: 'browser-event-loop',
        title: 'Browser Event Loop',
        targetDepth: 'reason',
        covered: true,
        content: [
          {
            title: 'How the Browser Event Loop Works',
            url: '/docs/programming/async/how-the-browser-event-loop-works',
            concepts: ['browser-event-loop'],
          },
        ],
      },
      {
        id: 'dns-resolution',
        title: 'DNS Resolution',
        targetDepth: 'reason',
        covered: false,
        content: [],
      },
    ],
  },
];

const pathCoverage: PathCoverage = {
  id: 'modern-web-systems',
  title: 'Modern Web Systems',
  covered: 1,
  total: 2,
  steps: [
    {
      id: 'browser-event-loop',
      title: 'Browser Event Loop',
      targetDepth: 'reason',
      covered: true,
      content: [
        {
          title: 'How the Browser Event Loop Works',
          url: '/docs/programming/async/how-the-browser-event-loop-works',
          concepts: ['browser-event-loop'],
        },
      ],
    },
    {
      id: 'dns-resolution',
      title: 'DNS Resolution',
      targetDepth: 'reason',
      covered: false,
      content: [],
    },
  ],
};

describe('Atlas presentation', () => {
  it('renders semantic domain coverage with visible counts and progress', () => {
    const html = renderToStaticMarkup(
      createElement(AtlasCoverageView, { domains: domainCoverage }),
    );

    expect(html).toContain('Web Platform');
    expect(html).toContain('1 / 2 concepts covered');
    expect(html).toContain('<progress');
    expect(html).toContain('value="1"');
    expect(html).toContain('max="2"');
    expect(html).toContain('DNS Resolution');
    expect(html).toContain('Uncovered');
  });

  it('renders learning-path steps in order with content links and gaps', () => {
    const html = renderToStaticMarkup(
      createElement(LearningPathView, {
        path: {
          title: 'Modern Web Systems',
          description: 'Systems-level web learning.',
          audience: 'Software engineers.',
          targetDepth: 'reason',
          outcomes: ['Trace a request.'],
        },
        coverage: pathCoverage,
      }),
    );

    expect(html.indexOf('Browser Event Loop')).toBeLessThan(
      html.indexOf('DNS Resolution'),
    );
    expect(html).toContain(
      'href="/docs/programming/async/how-the-browser-event-loop-works"',
    );
    expect(html).toContain('No Atlas content yet');
    expect(html).toContain('Target depth: reason');
  });

  it('renders an overview with ordinary path links and coverage counts', () => {
    const html = renderToStaticMarkup(
      createElement(LearningPathsOverviewView, {
        paths: [
          {
            id: 'modern-web-systems',
            title: 'Modern Web Systems',
            description: 'Systems-level web learning.',
            audience: 'Software engineers.',
            covered: 1,
            total: 2,
          },
        ],
      }),
    );

    expect(html).toContain('href="/docs/learning-paths/modern-web-systems"');
    expect(html).toContain('1 / 2 concepts currently covered');
    expect(html).toContain('<progress');
  });
});
