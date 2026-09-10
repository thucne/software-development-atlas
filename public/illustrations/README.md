# Atlas static teaching assets

`<AtlasIllustration id="..." />` remains the lesson-facing API. Static assets
live here and are selected by `components/mdx/atlas-static-illustrations.ts`.

## When to add an asset

Prefer programmatic diagrams for exact state, ordering, timing, protocol,
transaction, and bilingual-label teaching. Add a static asset only when a
production-quality language-neutral image clearly beats a diagram for spatial
or operational intuition (pressure, blast radius, fan-out, ambiguity shape).

Do not commit skeleton/placeholder SVG just to occupy this directory.

## Format choice

Choose the file format from the artwork, not from novelty:

- **SVG** — preferred for geometric, language-neutral technical editorial
  illustrations whose meaning is carried by spatial relationships, boundaries,
  flow, pressure, or failure. Use a `1600 × 900` viewBox, no embedded `<text>`,
  no scripts/`foreignObject`, and no external resources.
- **WebP** — preferred for raster or generative artwork where texture, lighting,
  or painterly detail is part of the teaching value. Target `1600 × 900` and
  roughly `<300 KB` where practical.

The filename must match the semantic illustration ID exactly. Examples:

```text
public/illustrations/async/bounded-concurrency.webp
public/illustrations/cloud/serverless-downstream-avalanche.svg
```

English and Vietnamese reuse one semantic asset by default. Localized title,
caption, and accessible description belong in `atlas-static-illustrations.ts`,
not in image pixels.

Important technical facts, exact labels, numbers, and guarantees remain in
authored lesson text or semantic UI. Static artwork is supplementary.

Runtime note: unoptimized SVG/`next/image` paths must go through `withBasePath`
because the app mounts under `/learn`.
