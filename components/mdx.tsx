import { AsyncWaterfallLab } from '@/components/learning/async-waterfall-lab';
import { EventLoopLab } from '@/components/learning/event-loop-lab';
import { PromiseResolutionLab } from '@/components/learning/promise-resolution-lab';
import { Mermaid } from '@/components/mdx/mermaid';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
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
