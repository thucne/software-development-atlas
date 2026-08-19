'use client';

import { useEffect, useId, useState } from 'react';
import { useTheme } from 'next-themes';

type RenderState = {
  svg: string;
  failed: boolean;
};

export function Mermaid({ chart }: { chart: string }) {
  const id = useId().replaceAll(':', '');
  const { resolvedTheme } = useTheme();
  const [rendered, setRendered] = useState<RenderState>({
    svg: '',
    failed: false,
  });

  useEffect(() => {
    let cancelled = false;

    void import('mermaid').then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        fontFamily: 'inherit',
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
      });

      try {
        const result = await mermaid.render(
          `mermaid-${id}`,
          chart.replaceAll('\\n', '\n'),
        );
        if (!cancelled) {
          setRendered({ svg: result.svg, failed: false });
        }
      } catch {
        if (!cancelled) {
          setRendered({ svg: '', failed: true });
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [chart, id, resolvedTheme]);

  if (rendered.failed) {
    return (
      <pre aria-label="Mermaid diagram source" className="overflow-x-auto">
        {chart}
      </pre>
    );
  }

  if (!rendered.svg) {
    return (
      <div
        role="status"
        aria-label="Rendering diagram"
        className="min-h-24"
      />
    );
  }

  return (
    <figure aria-label="Mermaid diagram" className="my-6 overflow-x-auto">
      <div dangerouslySetInnerHTML={{ __html: rendered.svg }} />
      <figcaption className="sr-only">{chart}</figcaption>
    </figure>
  );
}
