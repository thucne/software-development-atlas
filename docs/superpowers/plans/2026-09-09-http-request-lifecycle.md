# HTTP Request Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `operate`-depth HTTP Request Lifecycle deep dive with a deterministic Request Path Explorer that teaches which request stages occur, are skipped, or are conditional across cache, connection-reuse, intermediary, and redirect scenarios.

**Architecture:** Keep all HTTP path semantics in a pure TypeScript scenario module and render them through one specialized client component that reuses the existing Phase 0.3 presentation primitives. Add a new top-level Web Platform docs section and one canonical MDX page covering only `http-request-lifecycle`; existing coverage and learning-path derivation should discover it automatically from frontmatter.

**Tech Stack:** Next.js 16, React 19, TypeScript, Fumadocs, Vitest, Playwright, axe-core, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-09-http-request-lifecycle-design.md`

## Global Constraints

- Branch: `feat/http-request-lifecycle`, based on `main` commit `bda31f085d92bc68b4f749e62afc470d411d4064`.
- Preserve Next.js `basePath: '/learn'`; all browser paths use the existing `appUrl(...)` helper.
- Canonical page: `content/docs/web-platform/http-request-lifecycle.mdx`.
- `contentType: deep-dive`, `learningDepth: operate`, `concepts: [http-request-lifecycle]`.
- `lastVerified: 2026-09-09`, `status: evolving`, `reviewAfterDays: 180`.
- The explorer is deterministic: no live network requests and no invented timing values.
- Do not teach DNS, TCP/QUIC, or TLS setup as mandatory HTTP semantics for every request.
- Do not claim adjacent concepts as canonical coverage merely because they are referenced.
- Reuse Phase 0.3 presentation primitives where useful; do not add a generic network-simulator framework.
- No new dependencies, external services, Sandpack, or WebContainers.
- Existing authored-route rendering audit, Markdown routes, `/learn` basePath, and accessibility contracts must stay green.

---

## File structure

### Create

- `lib/learning/http-request-path.ts` — pure scenario data/types and lookup.
- `tests/http-request-path.test.ts` — unit contracts for scenario semantics.
- `components/learning/http-request-path-explorer.tsx` — specialized deterministic UI.
- `content/docs/web-platform/meta.json` — Web Platform navigation section.
- `content/docs/web-platform/http-request-lifecycle.mdx` — canonical lesson.
- `tests/e2e/http-request-lifecycle.spec.ts` — rendered interaction/Markdown/edit/accessibility contracts.

### Modify

- `components/mdx.tsx` — register `HttpRequestPathExplorer`.
- `content/docs/meta.json` — add `web-platform` to top-level navigation.

No other production files are expected.

---

### Task 1: Pure Request Path Model

**Files:**
- Create: `tests/http-request-path.test.ts`
- Create: `lib/learning/http-request-path.ts`

**Interfaces:**
- Produces `RequestPathScenarioId`, `RequestStageId`, `RequestStageState`, `RequestPathStage`, `RequestPathScenario`.
- Produces `HTTP_REQUEST_PATH_SCENARIOS: readonly RequestPathScenario[]`.
- Produces `getRequestPathScenario(id: RequestPathScenarioId): RequestPathScenario`.
- Later UI code consumes only these exports.

- [ ] **Step 1: Write the failing model contract**

Create `tests/http-request-path.test.ts` with tests equivalent to:

```ts
import { describe, expect, it } from 'vitest';
import {
  HTTP_REQUEST_PATH_SCENARIOS,
  getRequestPathScenario,
} from '@/lib/learning/http-request-path';

const ids = [
  'cold-request',
  'warm-connection',
  'fresh-cache-hit',
  'stale-cache-revalidation',
  'intermediary-cache-hit',
  'redirect',
] as const;

describe('HTTP request path scenarios', () => {
  it('defines exactly the six approved scenarios', () => {
    expect(HTTP_REQUEST_PATH_SCENARIOS.map((scenario) => scenario.id)).toEqual(ids);
  });

  it('fresh cache hit stops before network and origin work', () => {
    const scenario = getRequestPathScenario('fresh-cache-hit');
    const state = Object.fromEntries(scenario.stages.map((stage) => [stage.id, stage.state]));

    expect(state['http-cache']).toBe('performed');
    expect(state.dns).toBe('skipped');
    expect(state['transport-connect']).toBe('skipped');
    expect(state.tls).toBe('skipped');
    expect(state['send-http']).toBe('skipped');
    expect(state.origin).toBe('skipped');
  });

  it('warm connection skips new setup but still sends HTTP', () => {
    const scenario = getRequestPathScenario('warm-connection');
    const state = Object.fromEntries(scenario.stages.map((stage) => [stage.id, stage.state]));

    expect(state.dns).toBe('skipped');
    expect(state['transport-connect']).toBe('skipped');
    expect(state.tls).toBe('skipped');
    expect(state['send-http']).toBe('performed');
    expect(state.origin).toBe('performed');
  });

  it('stale-cache revalidation describes one conditional validation path', () => {
    const scenario = getRequestPathScenario('stale-cache-revalidation');
    expect(scenario.summary).toMatch(/conditional/i);
    expect(scenario.summary).toMatch(/304 Not Modified/i);
    expect(scenario.summary).toMatch(/this scenario|one possible/i);
  });

  it('intermediary cache hit stops before origin processing', () => {
    const scenario = getRequestPathScenario('intermediary-cache-hit');
    const origin = scenario.stages.find((stage) => stage.id === 'origin');
    expect(origin?.state).toBe('skipped');
  });

  it('redirect makes the follow-up request evaluate its path again', () => {
    const scenario = getRequestPathScenario('redirect');
    const follow = scenario.stages.find((stage) => stage.id === 'follow-redirect');
    expect(follow?.state).toBe('performed');
    expect(follow?.explanation).toMatch(/evaluat/i);
  });

  it('contains no invented duration fields', () => {
    expect(JSON.stringify(HTTP_REQUEST_PATH_SCENARIOS)).not.toMatch(/duration|latencyMs|timeMs/);
  });
});
```

- [ ] **Step 2: Run unit tests and prove RED**

Run the repository unit workflow or PR CI. Expected failure: TypeScript/Vitest cannot resolve `@/lib/learning/http-request-path`.

- [ ] **Step 3: Implement the pure model minimally**

Create `lib/learning/http-request-path.ts` with the exact exported types from the spec and six explicit scenario objects. Every scenario must contain a locally complete explanation for each stage. Use `conditional` only when the scenario intentionally teaches that a participant can exist but is not guaranteed, such as an intermediary in a cold request.

Use a lookup that fails loudly for programmer errors:

```ts
export function getRequestPathScenario(id: RequestPathScenarioId) {
  const scenario = HTTP_REQUEST_PATH_SCENARIOS.find((candidate) => candidate.id === id);
  if (!scenario) throw new Error(`Unknown HTTP request path scenario: ${id}`);
  return scenario;
}
```

- [ ] **Step 4: Run the unit suite and prove GREEN**

Expected: all existing tests plus the new request-path model tests pass.

- [ ] **Step 5: Commit**

Commit message: `feat: model HTTP request paths`.

---

### Task 2: Route, Navigation, and Missing-Component RED Boundary

**Files:**
- Create: `content/docs/web-platform/meta.json`
- Create: `content/docs/web-platform/http-request-lifecycle.mdx`
- Modify: `content/docs/meta.json`
- Modify: `components/mdx.tsx`

**Interfaces:**
- Adds MDX tag `<HttpRequestPathExplorer />`.
- Adds route `/learn/docs/web-platform/http-request-lifecycle` through existing Fumadocs routing.
- Adds top-level nav section `Web Platform`.

- [ ] **Step 1: Create the navigation metadata and lesson skeleton**

Create `content/docs/web-platform/meta.json`:

```json
{
  "title": "Web Platform",
  "pages": ["http-request-lifecycle"]
}
```

Append `"web-platform"` to `content/docs/meta.json` before `"programming"` so the broad platform section appears before language/runtime lessons.

Create the MDX skeleton with valid canonical frontmatter:

```yaml
---
title: "HTTP Request Lifecycle: From URL to Response"
description: Trace how an HTTP request can use caches, reused connections, intermediaries, and origins without confusing HTTP semantics with network setup.
category: web-platform
level: intermediate
status: evolving
lastVerified: 2026-09-09
reviewAfterDays: 180
topics:
  - http
  - web
  - networking
  - caching
  - debugging
prerequisites:
  - urls
  - client-server-model
related:
  - dns-resolution
  - tls-and-https
  - http-caching
  - cdn-behavior
  - backend-request-lifecycle
  - idempotency
technologies:
  - http
  - browser
contentType: deep-dive
learningDepth: operate
concepts:
  - http-request-lifecycle
---
```

Include a temporary heading and `<HttpRequestPathExplorer />` only; do not write the final lesson yet.

- [ ] **Step 2: Register the missing MDX component import**

Modify `components/mdx.tsx` to import and expose:

```ts
import { HttpRequestPathExplorer } from '@/components/learning/http-request-path-explorer';
```

and add `HttpRequestPathExplorer` to the returned component map.

- [ ] **Step 3: Run typecheck and prove RED**

Expected failure: TypeScript cannot resolve `@/components/learning/http-request-path-explorer`.

- [ ] **Step 4: Commit the intentional RED boundary**

Commit message: `test: define HTTP request lesson route boundary`.

---

### Task 3: Specialized Request Path Explorer

**Files:**
- Create: `components/learning/http-request-path-explorer.tsx`
- Uses: `components/learning/primitives/*`
- Uses: `lib/learning/http-request-path.ts`

**Interfaces:**
- Exports `HttpRequestPathExplorer()`.
- Stable selector: `data-testid="http-path-scenario"` for the selected scenario summary.
- Stage rows expose `data-stage-id` and `data-stage-state` for state assertions when accessible text alone would be ambiguous.

- [ ] **Step 1: Implement the minimal client component**

Use existing primitives:

```tsx
'use client';

import {
  LabControls,
  LabPanel,
  LabShell,
  LiveStatus,
  ScenarioSelect,
} from '@/components/learning/primitives';
import {
  getRequestPathScenario,
  HTTP_REQUEST_PATH_SCENARIOS,
  type RequestPathScenarioId,
} from '@/lib/learning/http-request-path';
import { useMemo, useState } from 'react';
```

Behavior:

- initial scenario is `cold-request`;
- selecting a scenario updates immediately;
- Reset restores `cold-request`;
- no autoplay and no network calls;
- render every stage in authored order;
- each stage visibly and textually says `Performed`, `Skipped`, or `Conditional`;
- stage explanation is always visible;
- `LiveStatus` announces the selected scenario title and summary;
- controls use native select/button semantics and existing focus styling conventions.

Suggested UI shape:

```tsx
<LabShell title="Request Path Explorer" description="Compare deterministic HTTP request paths without inventing network timings.">
  <ScenarioSelect ... />
  <LabControls>
    <button type="button" onClick={() => setScenarioId('cold-request')}>Reset</button>
  </LabControls>
  <LiveStatus label="Selected request path">
    <span data-testid="http-path-scenario">{scenario.title}: {scenario.summary}</span>
  </LiveStatus>
  <LabPanel title="Stages">
    <ol>{/* semantic rows */}</ol>
  </LabPanel>
</LabShell>
```

Do not encode HTTP path semantics inside React conditions; render the pure model.

- [ ] **Step 2: Run lint, typecheck, unit tests, and build**

Expected: component resolves and the route skeleton builds successfully.

- [ ] **Step 3: Commit**

Commit message: `feat: add HTTP request path explorer`.

---

### Task 4: Author the Complete Standards-Grounded Lesson

**Files:**
- Modify: `content/docs/web-platform/http-request-lifecycle.mdx`

**Interfaces:**
- Essential explanation must exist in Markdown independently of the explorer.
- Sources must include RFC 9110, RFC 9111, RFC 9113, RFC 9114, and WHATWG Fetch.

- [ ] **Step 1: Replace the skeleton with the complete lesson**

Follow the spec flow exactly. The TL;DR should retain this locally complete rule in substance:

> An HTTP request is a request/response exchange, not necessarily a new network connection. Trace the request by asking which cache, connection, intermediary, and origin stages actually participated. Do not assume that every request repeats DNS, transport connection setup, TLS setup, and origin processing.

The mental model must distinguish:

```text
HTTP semantics: request method/target/headers/body -> response status/headers/body

Possible surrounding path:
request construction -> cache -> connection reuse/setup -> HTTP exchange -> intermediary/origin -> response handling
```

Explicitly define `origin`, `intermediary`, `fresh`, `stale`, and `revalidation` before later sections depend on them.

Cover the six explorer paths textually so raw Markdown is sufficient even without React.

For protocol versions, state only the needed tracing distinctions:

- HTTP/1.1, HTTP/2, and HTTP/3 use the semantics in RFC 9110.
- HTTP/2 allows multiple concurrent exchanges on one connection.
- HTTP/3 maps HTTP semantics over QUIC.
- This changes how requests travel, not the meaning of methods/statuses/fields established by shared HTTP semantics.

For browser Fetch, scope browser-specific statements to Fetch or HTTP cache behavior rather than attributing every step to HTTP itself.

The debugging section should use an evidence ladder:

1. Was a response returned from a client/private cache?
2. Did a network request occur?
3. Was there a redirect or revalidation?
4. Was an existing connection reused or was new setup required?
5. Which intermediary or origin generated the response?
6. Was latency before server processing, during server processing, or while receiving the body?
7. Was the result an HTTP error status, a network failure, or an application-level failure encoded in a successful HTTP response?

The retry section must direct readers to idempotency and avoid claiming that HTTP method names alone make an arbitrary application operation safe to repeat.

- [ ] **Step 2: Re-verify every evolving claim against primary sources**

Required source anchors:

- https://www.rfc-editor.org/rfc/rfc9110.html
- https://www.rfc-editor.org/rfc/rfc9111.html
- https://www.rfc-editor.org/rfc/rfc9113.html
- https://www.rfc-editor.org/rfc/rfc9114.html
- https://fetch.spec.whatwg.org/

Keep `lastVerified: 2026-09-09` only because this intentional source review occurred.

- [ ] **Step 3: Run unit tests and production build**

Expected: frontmatter/schema, MDX compilation, coverage derivation, and authored-route build all pass.

- [ ] **Step 4: Commit**

Commit message: `docs: add HTTP request lifecycle deep dive`.

---

### Task 5: Browser, Raw-Markdown, and Accessibility Contracts

**Files:**
- Create: `tests/e2e/http-request-lifecycle.spec.ts`

**Interfaces:**
- Uses `appUrl('/docs/web-platform/http-request-lifecycle')` so `/learn` is applied by the existing helper.
- Protects behavior, not CSS implementation.

- [ ] **Step 1: Add route/navigation test**

Navigate to `appUrl('/docs')`, open the `Web Platform` section, click the exact lesson link, and assert the lesson heading.

- [ ] **Step 2: Add explorer scenario tests**

Protect at least:

```ts
await expect(page.getByTestId('http-path-scenario')).toContainText('Cold request');
await page.getByLabel('HTTP request scenario').selectOption('fresh-cache-hit');
await expect(page.locator('[data-stage-id="origin"]')).toHaveAttribute('data-stage-state', 'skipped');
await expect(page.locator('[data-stage-id="send-http"]')).toHaveAttribute('data-stage-state', 'skipped');

await page.getByLabel('HTTP request scenario').selectOption('warm-connection');
await expect(page.locator('[data-stage-id="transport-connect"]')).toHaveAttribute('data-stage-state', 'skipped');
await expect(page.locator('[data-stage-id="send-http"]')).toHaveAttribute('data-stage-state', 'performed');
```

Reset must restore `cold-request`; focus Reset and trigger it from the keyboard.

- [ ] **Step 3: Add shared accessibility-semantic assertions**

Verify the nearest lab section is named by its heading, the scenario select has its intended accessible label, and the selected-path status has a polite live region. Do not assert utility classes.

- [ ] **Step 4: Add raw-Markdown contract**

Request `${lessonPath}.md` and assert:

- response OK and `text/markdown`;
- title;
- phrase equivalent to `not necessarily a new network connection`;
- explicit warning not to assume DNS/transport/TLS for every request;
- `fresh`, `stale`, and `revalidation` explanations;
- HTTP/2 and HTTP/3 distinctions;
- `idempotency` retry boundary;
- all five primary source URLs.

- [ ] **Step 5: Add Edit-on-GitHub assertion**

Expected href:

```text
https://github.com/thucne/software-development-atlas/edit/main/content/docs/web-platform/http-request-lifecycle.mdx
```

- [ ] **Step 6: Add axe check**

Run `AxeBuilder` and fail on serious/critical violations, matching the existing lesson contracts.

- [ ] **Step 7: Run the full permanent CI workflow**

Required gates: frozen install, lint, typecheck, unit tests, production build, Chromium install, all Playwright/rendered-route tests, and axe.

If any browser contract fails, use systematic debugging and fix the root cause rather than weakening the test.

- [ ] **Step 8: Commit**

Commit message: `test: cover HTTP request lifecycle lesson`.

---

### Task 6: Review, Exact-Head Verification, and Merge

**Files:**
- No planned production files.
- Optional review note only if useful: `docs/superpowers/plans/2026-09-09-http-request-lifecycle-self-review.md`.

- [ ] **Step 1: Audit the diff against `main`**

Expected production scope:

- pure request-path model;
- explorer component;
- MDX registration;
- Web Platform navigation metadata;
- one canonical lesson;
- unit and browser tests;
- governing spec/plan.

Confirm no dependency, lockfile, CI workflow, basePath, atlas-map, or learning-path-data change unless an evidence-backed integration failure proves one is necessary.

- [ ] **Step 2: Run Clarity Contract review**

Specifically check:

- no dangling `this diagram`/`above` referents;
- terms defined before use;
- no mandatory `DNS -> connect -> TLS -> HTTP` claim;
- cache, connection reuse, and intermediaries are conditional where appropriate;
- protocol-version claims are scoped;
- every explorer stage explanation is locally complete;
- the raw Markdown contains all essential teaching.

- [ ] **Step 3: Verify exact PR head**

Fetch the final head SHA, then verify its attached CI run is `completed / success`. Do not reuse evidence from an earlier commit.

- [ ] **Step 4: Update PR metadata and mark ready**

Record exact test counts, exact head SHA, source-verification scope, and clean diff audit.

- [ ] **Step 5: Re-fetch PR and squash-merge with expected-head protection**

Only merge if the PR remains open, non-draft, mergeable, based on `main`, unchanged at the verified head, and all required CI checks are successful.

Use squash merge. Do not delete the feature branch unless separately authorized.

- [ ] **Step 6: Post-merge verification**

Confirm GitHub records the PR closed/merged and `main` points to the returned squash merge SHA.
