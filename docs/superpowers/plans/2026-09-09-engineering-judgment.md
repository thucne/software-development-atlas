# Engineering Judgment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make decision guides and architecture walkthroughs a first-class Atlas experience with one reusable static comparison primitive and representative senior-level content.

**Architecture:** Judgment content remains ordinary validated MDX under a new top-level `engineering-judgment` section; no decision registry is introduced. A single server/static `DecisionMatrix` component is registered for MDX because the initial decision guides share a semantic comparison-table need, while architecture diagrams continue to use existing Mermaid support.

**Tech Stack:** Next.js 16, React 19, TypeScript, Fumadocs + MDX, Vitest, Playwright, axe-core, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-09-engineering-judgment-design.md`

## Global Constraints

- Keep `content/atlas-map.json` as the only canonical concept registry.
- Keep decision guides and walkthroughs as ordinary canonical MDX; do not add a decision/walkthrough JSON registry.
- Add exactly three representative decision guides and one architecture walkthrough in this PR.
- Add only one new reusable judgment component: `DecisionMatrix`.
- `DecisionMatrix` must require no `use client` boundary and must render semantic table markup.
- Continue using Mermaid for architecture flow; do not add a diagram framework.
- Do not add Java/Node/Go/Rust or queue/event-stream guides in this PR.
- Do not add runtime services, accounts, recommendation engines, paid infrastructure, or bulk-generated content.
- Follow TDD for component and route behavior.
- Final verification requires `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.

---

### Task 1: Add the static DecisionMatrix primitive

**Files:**
- Test: `tests/decision-matrix.test.ts`
- Create: `components/judgment/decision-matrix.tsx`
- Modify: `components/mdx.tsx`

**Interfaces:**
- Produces `DecisionMatrixRow = { criterion: string; values: readonly string[] }`.
- Produces `DecisionMatrix({ options, rows, caption })`.
- Registers `DecisionMatrix` for MDX usage.

- [ ] **Step 1: Write the failing render-contract tests**

Create `tests/decision-matrix.test.ts`:

```ts
import { DecisionMatrix } from '@/components/judgment/decision-matrix';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

describe('DecisionMatrix', () => {
  it('renders a semantic table in authored order', () => {
    const html = renderToStaticMarkup(
      createElement(DecisionMatrix, {
        caption: 'Rendering model trade-offs',
        options: ['CSR', 'SSR', 'SSG'],
        rows: [
          { criterion: 'Personalization', values: ['Strong', 'Strong', 'Limited'] },
          { criterion: 'CDN fit', values: ['Medium', 'Medium', 'Strong'] },
        ],
      }),
    );

    expect(html).toContain('<table');
    expect(html).toContain('<caption>Rendering model trade-offs</caption>');
    expect(html).toContain('scope="col">CSR');
    expect(html).toContain('scope="row">Personalization');
    expect(html.indexOf('Personalization')).toBeLessThan(html.indexOf('CDN fit'));
    expect(html.indexOf('CSR')).toBeLessThan(html.indexOf('SSR'));
  });

  it('rejects rows that do not match the option count', () => {
    expect(() =>
      renderToStaticMarkup(
        createElement(DecisionMatrix, {
          caption: 'Broken matrix',
          options: ['A', 'B'],
          rows: [{ criterion: 'Cost', values: ['Low'] }],
        }),
      ),
    ).toThrow(/DecisionMatrix row "Cost" has 1 values but expected 2/);
  });
});
```

- [ ] **Step 2: Run the unit suite and verify RED**

Expected: the test fails because `@/components/judgment/decision-matrix` does not exist.

- [ ] **Step 3: Implement the minimal semantic component**

Create `components/judgment/decision-matrix.tsx` with the exact exported type/function above. Validate every row width before returning JSX. Render `<div className="overflow-x-auto">`, `<table>`, `<caption>`, `<thead>`, `<tbody>`, `scope="col"` headers, and `scope="row"` criterion headers. Do not add client state, scores, colors, or icons.

- [ ] **Step 4: Register the component in `components/mdx.tsx`**

Import `DecisionMatrix` and add it to the object returned by `getMDXComponents`.

- [ ] **Step 5: Run `pnpm test`, `pnpm typecheck`, and `pnpm build` and verify GREEN**

- [ ] **Step 6: Commit**

Commit message: `feat: add static decision matrix primitive`.

---

### Task 2: Add the Engineering Judgment information architecture

**Files:**
- Test: `tests/e2e/engineering-judgment.spec.ts`
- Create: `content/docs/engineering-judgment/meta.json`
- Create: `content/docs/engineering-judgment/index.mdx`
- Create: `content/docs/engineering-judgment/decision-guides/meta.json`
- Create: `content/docs/engineering-judgment/architecture-walkthroughs/meta.json`
- Modify: `content/docs/meta.json`

**Interfaces:**
- Produces `/docs/engineering-judgment` as a top-level discoverable section.
- Produces nested `Decision Guides` and `Architecture Walkthroughs` navigation groups.

- [ ] **Step 1: Add a failing E2E navigation test**

Create `tests/e2e/engineering-judgment.spec.ts` with:

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('exposes Engineering Judgment in docs navigation', async ({ page }) => {
  await page.goto('/docs');
  await expect(page.getByText('Engineering Judgment', { exact: true }).first()).toBeVisible();
});
```

- [ ] **Step 2: Run `pnpm test:e2e` and verify RED**

Expected: navigation assertion fails because the section does not exist.

- [ ] **Step 3: Create navigation metadata and hub page**

Use root `meta.json` order:

```json
{
  "title": "Atlas",
  "pages": ["index", "start-here", "learning-paths", "engineering-judgment", "programming"]
}
```

Use `engineering-judgment/meta.json`:

```json
{
  "title": "Engineering Judgment",
  "pages": ["index", "decision-guides", "architecture-walkthroughs"]
}
```

Use subsection metadata with the exact page IDs implemented in Tasks 3 and 4.

The hub MDX uses `contentType: guide`, `learningDepth: recognize`, `concepts: []`, and explains the distinction between decision guides and architecture walkthroughs without claiming coverage.

- [ ] **Step 4: Run build and E2E; verify the navigation test is GREEN**

- [ ] **Step 5: Commit**

Commit message: `feat: add engineering judgment navigation`.

---

### Task 3: Add three representative decision guides

**Files:**
- Test: `tests/judgment-content.test.ts`
- Create: `content/docs/engineering-judgment/decision-guides/csr-vs-ssr-vs-ssg.mdx`
- Create: `content/docs/engineering-judgment/decision-guides/monolith-vs-modular-monolith-vs-microservices.mdx`
- Create: `content/docs/engineering-judgment/decision-guides/containers-vs-serverless.mdx`
- Modify: `content/docs/engineering-judgment/decision-guides/meta.json`
- Modify: `tests/e2e/engineering-judgment.spec.ts`

**Interfaces:**
- Each page is ordinary validated Atlas content with `contentType: decision-guide` and `learningDepth: reason`.
- Each page uses `DecisionMatrix` for its primary explicit comparison.

- [ ] **Step 1: Write failing content-contract tests**

Create `tests/judgment-content.test.ts` using `source.getPages()`:

```ts
import { source } from '@/lib/source';
import { describe, expect, it } from 'vitest';

const byUrl = new Map(source.getPages().map((page) => [page.url, page]));

const expectedDecisionGuides = [
  '/docs/engineering-judgment/decision-guides/csr-vs-ssr-vs-ssg',
  '/docs/engineering-judgment/decision-guides/monolith-vs-modular-monolith-vs-microservices',
  '/docs/engineering-judgment/decision-guides/containers-vs-serverless',
];

describe('engineering judgment content', () => {
  it('publishes the three representative decision guides', () => {
    for (const url of expectedDecisionGuides) {
      expect(byUrl.get(url)?.data.contentType).toBe('decision-guide');
      expect(byUrl.get(url)?.data.learningDepth).toBe('reason');
      expect(byUrl.get(url)?.data.concepts.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run unit tests and verify RED**

Expected: one or more expected URLs are missing.

- [ ] **Step 3: Author CSR vs SSR vs SSG**

Required canonical concepts:

```yaml
concepts:
  - csr-ssr-ssg
  - hydration
  - frontend-data-fetching
  - http-caching
  - cdn-behavior
```

Required comparison criteria: personalization, freshness, initial response, interactivity, CDN/cache fit, server work, and operational complexity. State clearly that modern frameworks can combine rendering strategies and that the decision can be route-specific.

- [ ] **Step 4: Author monolith vs modular monolith vs microservices**

Required concepts:

```yaml
concepts:
  - monolith-architecture
  - modular-monolith
  - microservices
  - domain-boundaries
  - coupling-and-cohesion
  - partial-failure
```

Required criteria: deployment independence, transaction simplicity, team ownership, failure isolation, operational complexity, scaling boundaries, and debugging cost. Explicitly treat distributed-systems cost as a trade-off, not a maturity badge.

- [ ] **Step 5: Author containers vs serverless**

Required concepts:

```yaml
concepts:
  - containers
  - serverless-compute
  - cloud-compute
  - autoscaling
  - deployment-strategies
```

Required criteria: workload duration, traffic shape, startup sensitivity, runtime control, scaling model, local parity, operational ownership, and cost predictability. Keep the guide provider-independent.

- [ ] **Step 6: Extend E2E coverage for a representative guide**

Add assertions that `/docs/engineering-judgment/decision-guides/csr-vs-ssr-vs-ssg` renders the H1, a table with caption `CSR vs SSR vs SSG decision matrix`, visible conditional recommendation text, and no serious/critical axe violations.

- [ ] **Step 7: Run unit, build, and E2E checks; verify GREEN**

- [ ] **Step 8: Commit**

Commit message: `content: add representative decision guides`.

---

### Task 4: Add the reliable checkout architecture walkthrough

**Files:**
- Modify: `tests/judgment-content.test.ts`
- Create: `content/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout.mdx`
- Modify: `content/docs/engineering-judgment/architecture-walkthroughs/meta.json`
- Modify: `tests/e2e/engineering-judgment.spec.ts`

**Interfaces:**
- Publishes `/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout` with `contentType: architecture-walkthrough`.
- Uses existing `Mermaid` component for the high-level flow.

- [ ] **Step 1: Extend the content-contract test first**

Add:

```ts
it('publishes the reliable checkout architecture walkthrough', () => {
  const page = byUrl.get(
    '/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout',
  );

  expect(page?.data.contentType).toBe('architecture-walkthrough');
  expect(page?.data.learningDepth).toBe('reason');
  expect(page?.data.concepts).toEqual(
    expect.arrayContaining([
      'api-design',
      'idempotency',
      'database-transactions',
      'transactional-outbox',
      'partial-failure',
      'logs-metrics-traces',
    ]),
  );
});
```

- [ ] **Step 2: Run unit tests and verify RED**

Expected: the checkout route is missing.

- [ ] **Step 3: Author the walkthrough**

Use this canonical placement:

```yaml
concepts:
  - api-design
  - idempotency
  - database-transactions
  - background-jobs
  - message-queues
  - transactional-outbox
  - partial-failure
  - retries-and-backoff
  - delivery-semantics
  - logs-metrics-traces
  - threat-modeling
```

Include sections for system goal/constraints, Mermaid flow, request and transaction boundaries, payment ambiguity, duplicate request handling, durable publication/outbox, async consumers and redelivery, security/trust boundaries, observability, scaling/cost, alternatives, and a review checklist.

The reference flow must describe one robust shape without claiming it is universally required.

- [ ] **Step 4: Extend E2E coverage**

Assert the checkout page renders the H1, `Failure modes` and `Observability` headings, visible `Transactional outbox` text, and no serious/critical axe violations.

- [ ] **Step 5: Run unit, build, and E2E checks; verify GREEN**

- [ ] **Step 6: Commit**

Commit message: `content: add reliable checkout architecture walkthrough`.

---

### Task 5: Align authoring, contributor, agent, and roadmap contracts

**Files:**
- Modify: `CONTENT_GUIDE.md`
- Modify: `AGENTS.md`
- Modify: `CONTRIBUTING.md`
- Modify: `README.md`
- Modify: `docs/roadmap.md`

**Interfaces:**
- Documents the implemented Engineering Judgment content mode and its constraints.

- [ ] **Step 1: Expand `CONTENT_GUIDE.md`**

Add explicit recommended anatomy for decision guides and architecture walkthroughs matching the governing spec. Document that `DecisionMatrix` is optional and should only be used when explicit criteria comparison improves clarity.

- [ ] **Step 2: Expand `AGENTS.md`**

Require agents authoring judgment content to start from an explicit decision/system question, avoid universal winners, separate durable reasoning from evolving details, use only genuine canonical placements, reuse `DecisionMatrix` for comparison, and prefer Mermaid before new walkthrough primitives.

- [ ] **Step 3: Update contributor and project docs**

Document Engineering Judgment as first-class content in `CONTRIBUTING.md` and `README.md`. In `docs/roadmap.md`, mark Phase 0.6 as established with the initial three guides and reliable-checkout walkthrough while keeping the remaining candidates future work.

- [ ] **Step 4: Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`**

- [ ] **Step 5: Commit**

Commit message: `docs: define engineering judgment authoring rules`.

---

### Task 6: Final review, verification, and merge

**Files:**
- Modify only files necessary to fix review findings.

**Interfaces:**
- Produces a merged PR3 with post-merge verification on `main`.

- [ ] **Step 1: Run the full CI suite on current head**

Require success for lint, typecheck, unit tests, build, Chromium setup, browser tests, and accessibility tests.

- [ ] **Step 2: Review `main...HEAD` against the spec**

Check specifically for:

- a hidden second judgment registry;
- incidental concept placement used to inflate coverage;
- `DecisionMatrix` client-JS creep or inaccessible semantics;
- universal-winner language or false precision;
- framework/vendor claims that need verification but lack appropriate sourcing;
- architecture walkthrough omissions around failure/security/observability;
- duplicated content relationships or navigation drift;
- accidental expansion into excluded PR3 candidates.

- [ ] **Step 3: Fix every blocking finding and rerun full CI on the new SHA**

Do not merge using earlier green evidence after any fix.

- [ ] **Step 4: Update the PR description with review and validation evidence**

- [ ] **Step 5: Mark ready and squash-merge only the verified head SHA**

- [ ] **Step 6: Verify post-merge push CI on the merge commit**

Completion requires the merge commit's `main` workflow to finish successfully.