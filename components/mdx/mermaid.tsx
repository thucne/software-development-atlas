'use client';

import { useEffect, useId, useState } from 'react';
import { useTheme } from 'next-themes';

type RenderState = {
  svg: string;
  failed: boolean;
};

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

function extractSvgDimensions(svg: string): { width: number; height: number } | null {
  const viewBoxMatch = svg.match(
    /viewBox=["']\s*([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s*["']/i,
  );
  if (viewBoxMatch) {
    const width = parseFloat(viewBoxMatch[3]);
    const height = parseFloat(viewBoxMatch[4]);
    if (!Number.isNaN(width) && !Number.isNaN(height) && width > 0 && height > 0) {
      return { width, height };
    }
  }

  const maxWidthMatch = svg.match(/max-width:\s*([0-9.]+)px/i);
  if (maxWidthMatch) {
    const width = parseFloat(maxWidthMatch[1]);
    if (!Number.isNaN(width) && width > 0) {
      return { width, height: 0 };
    }
  }

  return null;
}

export function Mermaid({ chart }: { chart: string }) {
  const id = useId().replaceAll(':', '');
  const { resolvedTheme } = useTheme();
  const [rendered, setRendered] = useState<RenderState>({
    svg: '',
    failed: false,
  });
  const [zoom, setZoom] = useState(1);

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
        const accessibleSvg = result.svg.replace(
          '<svg ',
          '<svg aria-label="Mermaid diagram" ',
        );

        if (!cancelled) {
          setRendered({ svg: accessibleSvg, failed: false });
          setZoom(1);
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

  const dimensions = extractSvgDimensions(rendered.svg);
  const naturalWidth = dimensions?.width;
  const zoomPercent = Math.round(zoom * 100);

  const containerStyle = naturalWidth
    ? {
        width: `calc(min(100%, ${naturalWidth}px) * ${zoom})`,
      }
    : {
        width: `${zoomPercent}%`,
      };

  return (
    <figure aria-label="Mermaid diagram" className="my-6">
      <div
        role="group"
        aria-label="Diagram controls"
        className="mb-2 flex items-center justify-end gap-1"
      >
        <button
          type="button"
          aria-label="Zoom out"
          disabled={zoom <= MIN_ZOOM}
          onClick={() =>
            setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP))
          }
          className="rounded-md border border-fd-border px-2 py-1 text-xs text-fd-muted-foreground hover:bg-fd-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <button
          type="button"
          aria-label="Reset zoom"
          onClick={() => setZoom(1)}
          className="min-w-14 rounded-md border border-fd-border px-2 py-1 text-xs tabular-nums text-fd-muted-foreground hover:bg-fd-accent"
        >
          {zoomPercent}%
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          disabled={zoom >= MAX_ZOOM}
          onClick={() =>
            setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP))
          }
          className="rounded-md border border-fd-border px-2 py-1 text-xs text-fd-muted-foreground hover:bg-fd-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>

      <div
        data-diagram-viewport
        role="region"
        aria-label="Diagram viewport"
        tabIndex={0}
        className="max-h-[75vh] overflow-auto rounded-md border border-fd-border p-3 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <div style={containerStyle} className="mx-auto">
          <div
            className="[&_svg]:!block [&_svg]:!h-auto [&_svg]:!w-full [&_svg]:!max-w-none"
            dangerouslySetInnerHTML={{ __html: rendered.svg }}
          />
        </div>
      </div>

      <figcaption className="sr-only">{chart}</figcaption>
    </figure>
  );
}
