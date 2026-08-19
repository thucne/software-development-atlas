'use client';

import { useEffect, useId, useState } from 'react';
import { useTheme } from 'next-themes';

export function Mermaid({ chart }: { chart: string }) {
  const id = useId().replaceAll(':', '');
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setSvg('');

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
        if (!cancelled) setSvg(result.svg);
      } catch {
        if (!cancelled) setFailed(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [chart, id, resolvedTheme]);

  if (failed) {
    return (
      <pre aria-label="Mermaid diagram source" className="overflow-x-auto">
        {chart}
      </pre>
    );
  }

  if (!svg) {
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
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      <figcaption className="sr-only">{chart}</figcaption>
    </figure>
  );
}
