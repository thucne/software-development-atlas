import {
  AtlasCoverage,
  LearningPath,
  LearningPathsOverview,
} from '@/components/atlas/server';
import { DecisionMatrix } from '@/components/judgment/decision-matrix';
import { AsyncWaterfallLab } from '@/components/learning/async-waterfall-lab';
import { EventLoopLab } from '@/components/learning/event-loop-lab';
import { HttpRequestPathExplorer } from '@/components/learning/http-request-path-explorer';
import { PromiseResolutionLab } from '@/components/learning/promise-resolution-lab';
import { Mermaid } from '@/components/mdx/mermaid';
import { TermBox } from '@/components/mdx/term-box';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(
  components?: MDXComponents,
  locale: string = 'en',
) {
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
    input: (props: React.ComponentProps<'input'>) => {
      if (props.type === 'checkbox') {
        return (
          <input
            aria-label={locale === 'vi' ? 'Mục danh sách' : 'Checklist item'}
            {...props}
          />
        );
      }
      return <input {...props} />;
    },
    AtlasCoverage: (props: Parameters<typeof AtlasCoverage>[0]) => (
      <AtlasCoverage locale={locale} {...props} />
    ),
    LearningPath: (props: Parameters<typeof LearningPath>[0]) => (
      <LearningPath locale={locale} {...props} />
    ),
    LearningPathsOverview: (
      props: Parameters<typeof LearningPathsOverview>[0],
    ) => <LearningPathsOverview locale={locale} {...props} />,
    DecisionMatrix,
    AsyncWaterfallLab,
    EventLoopLab,
    HttpRequestPathExplorer,
    PromiseResolutionLab,
    Mermaid,
    TermBox,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
