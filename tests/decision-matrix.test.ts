import { DecisionMatrix } from '@/components/judgment/decision-matrix';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

describe('DecisionMatrix', () => {
  it('renders a semantic table in authored order', () => {
    const html = renderToStaticMarkup(
      createElement(DecisionMatrix, {
        caption: 'Rendering model trade-offs',
        options: ['CSR', 'SSR', 'SSG'],
        rows: [
          {
            criterion: 'Personalization',
            values: ['Strong', 'Strong', 'Limited'],
          },
          { criterion: 'CDN fit', values: ['Medium', 'Medium', 'Strong'] },
        ],
      }),
    );

    expect(html).toContain('<table');
    expect(html).toContain('<caption>Rendering model trade-offs</caption>');
    expect(html).toContain('scope="col">CSR');
    expect(html).toContain('scope="row">Personalization');
    expect(html.indexOf('Personalization')).toBeLessThan(html.indexOf('CDN fit'));
    expect(html.indexOf('CSR')).toBeLessThan(html.indexOf('SSR'));
  });

  it('rejects rows that do not match the option count', () => {
    expect(() =>
      renderToStaticMarkup(
        createElement(DecisionMatrix, {
          caption: 'Broken matrix',
          options: ['A', 'B'],
          rows: [{ criterion: 'Cost', values: ['Low'] }],
        }),
      ),
    ).toThrow(/DecisionMatrix row "Cost" has 1 values but expected 2/);
  });
});
