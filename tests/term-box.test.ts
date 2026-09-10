import { TermBox, type TermBoxProps } from '@/components/mdx/term-box';
import { readFileSync } from 'node:fs';
import path from 'node:path';
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
    expect(html).toContain('data-atlas-term-box');
    expect(html).toContain('aria-label="What is Microtask checkpoint?"');
    expect(html).toContain('What is Microtask checkpoint?');
    expect(html).toContain('Microtask checkpoint');
    expect(html).toContain('Runs queued microtasks until the queue is empty.');
    expect(html).toContain('atlas-term-box');
    expect(html).not.toContain('<details');
  });

  it('is registered as a global MDX component with locale wiring', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'components/mdx.tsx'),
      'utf8',
    );

    expect(source).toContain("import { TermBox } from '@/components/mdx/term-box';");
    expect(source).toContain('TermBox: (props:');
    expect(source).toContain('<TermBox locale={locale}');
  });
});
