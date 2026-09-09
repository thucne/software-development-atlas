import { getMDXComponents } from '@/components/mdx';
import { TermBox, type TermBoxProps } from '@/components/mdx/term-box';
import {
  createElement,
  type ComponentType,
  type ReactNode,
} from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

type OptionalChildren<Props extends { children: ReactNode }> = Omit<
  Props,
  'children'
> & {
  children?: ReactNode;
};

const TestTermBox = TermBox as ComponentType<OptionalChildren<TermBoxProps>>;

describe('TermBox', () => {
  it('renders a visible accessible terminology explanation', () => {
    const html = renderToStaticMarkup(
      createElement(
        TestTermBox,
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
