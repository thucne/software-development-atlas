import { getMDXComponents } from '@/components/mdx';
import { TermBox } from '@/components/mdx/term-box';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

describe('TermBox', () => {
  it('renders a visible accessible terminology explanation', () => {
    const html = renderToStaticMarkup(
      createElement(
        TermBox,
        { term: 'Microtask checkpoint' },
        createElement(
          'p',
          null,
          'Runs queued microtasks until the queue is empty.',
        ),
      ),
    );

    expect(html).toContain('<aside');
    expect(html).toContain('aria-label="What is Microtask checkpoint?"');
    expect(html).toContain('What is Microtask checkpoint?');
    expect(html).toContain('Runs queued microtasks until the queue is empty.');
    expect(html).not.toContain('<details');
  });

  it('is registered as a global MDX component', () => {
    expect(getMDXComponents().TermBox).toBe(TermBox);
  });
});
