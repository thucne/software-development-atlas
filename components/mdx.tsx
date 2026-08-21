import { AsyncWaterfallLab } from '@/components/learning/async-waterfall-lab';
import { EventLoopLab } from '@/components/learning/event-loop-lab';
import { PromiseResolutionLab } from '@/components/learning/promise-resolution-lab';
import { Mermaid } from '@/components/mdx/mermaid';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    pre: ({ ref, ...props }) => {
      void ref;

      return (
        <CodeBlock keepBackground {...props}>
          <Pre>{props.children}</Pre>
        </CodeBlock>
      );
    },
    AsyncWaterfallLab,
    EventLoopLab,
    PromiseResolutionLab,
    Mermaid,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
