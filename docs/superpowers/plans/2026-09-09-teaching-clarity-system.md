# Atlas Teaching Clarity System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every current substantive Atlas lesson easier for a working software developer to learn from by introducing visible first-use terminology explanations and restructuring difficult material from intuition to formal nuance.

**Architecture:** Add one server-rendered `TermBox` MDX primitive and register it globally. Migrate the eight substantive teaching pages to use that primitive near difficult topic-specific terminology while preserving existing technical depth, labs, diagrams, matrices, metadata, and source-backed correctness. Update the authoring contract so future content follows the same baseline.

**Tech Stack:** Next.js 16, React 19, TypeScript 6, Fumadocs + MDX, Tailwind CSS, Vitest, Playwright, axe-core.

**Spec:** `docs/superpowers/specs/2026-09-09-teaching-clarity-system-design.md`

## Global Constraints

- Assume a working software developer, but no prior knowledge of the topic beyond declared prerequisites.
- Use visible, non-collapsible terminology boxes near first substantive use.
- Preserve specification-level and production-level nuance after the plain-language mental model is established.
- Do not add dependencies, runtime services, analytics, databases, hosted AI, a centralized glossary, automatic term linking, or client-side term state.
- Do not change the Atlas map or learning paths solely for this pass.
- Do not bump `lastVerified` for wording-only changes.
- Essential explanations must remain meaningful in raw MDX/Markdown.
- No existing test or accessibility rule may be weakened.

---

### Task 1: Add the `TermBox` primitive with a RED → GREEN cycle

**Files:**
- Create: `tests/term-box.test.ts`
- Create: `components/mdx/term-box.tsx`
- Modify: `components/mdx.tsx`

**Interfaces:**
- Produces: `TermBox({ term, children }: { term: string; children: React.ReactNode })`.
- Produces: `getMDXComponents().TermBox` for authored MDX.

- [ ] **Step 1: Write the failing component test**

```ts
import { TermBox } from '@/components/mdx/term-box';
import { getMDXComponents } from '@/components/mdx';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

describe('TermBox', () => {
  it('renders a visible accessible terminology explanation', () => {
    const html = renderToStaticMarkup(
      createElement(
        TermBox,
        { term: 'Microtask checkpoint' },
        createElement('p', null, 'Runs queued microtasks until the queue is empty.'),
      ),
    );

    expect(html).toContain('<aside');
    expect(html).toContain('aria-label="What is Microtask checkpoint?"');
    expect(html).toContain('What is Microtask checkpoint?');
    expect(html).toContain('Runs queued microtasks until the queue is empty.');
    expect(html).not.toContain('<details');
  });

  it('is registered as a global MDX component', () => {
    expect(getMDXComponents().TermBox).toBe(TermBox);
  });
});
```

- [ ] **Step 2: Verify RED**

Run in CI or locally:

```bash
pnpm test -- tests/term-box.test.ts
```

Expected: FAIL because `@/components/mdx/term-box` and `TermBox` registration do not exist.

- [ ] **Step 3: Implement the minimal server-rendered component**

```tsx
import type { ReactNode } from 'react';

export type TermBoxProps = {
  term: string;
  children: ReactNode;
};

export function TermBox({ term, children }: TermBoxProps) {
  const label = `What is ${term}?`;

  return (
    <aside
      aria-label={label}
      className="my-5 rounded-lg border border-fd-border bg-fd-card p-4"
    >
      <p className="mt-0 font-semibold text-fd-foreground">{label}</p>
      <div className="text-fd-muted-foreground [&>:first-child]:mt-2 [&>:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
```

Register it in `components/mdx.tsx` by importing `TermBox` and adding `TermBox` to the returned component map.

- [ ] **Step 4: Verify GREEN**

```bash
pnpm test -- tests/term-box.test.ts
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/term-box.test.ts components/mdx/term-box.tsx components/mdx.tsx
git commit -m "feat: add terminology explanation box"
```

---

### Task 2: Add the teaching contract and migration guardrails

**Files:**
- Modify: `tests/content-clarity.test.ts`
- Modify: `CONTENT_GUIDE.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: authored `<TermBox term="...">...</TermBox>` syntax from Task 1.
- Produces: a canonical editorial contract for future lessons.

- [ ] **Step 1: Write failing migration tests**

Extend `tests/content-clarity.test.ts` with the exact substantive-page list and assertions:

```ts
const substantivePages = [
  'content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx',
  'content/docs/programming/async/how-the-browser-event-loop-works.mdx',
  'content/docs/programming/async/promises.mdx',
  'content/docs/web-platform/http-request-lifecycle.mdx',
  'content/docs/engineering-judgment/decision-guides/csr-vs-ssr-vs-ssg.mdx',
  'content/docs/engineering-judgment/decision-guides/monolith-vs-modular-monolith-vs-microservices.mdx',
  'content/docs/engineering-judgment/decision-guides/containers-vs-serverless.mdx',
  'content/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout.mdx',
] as const;

it('migrates every substantive teaching page to visible terminology support', () => {
  for (const relativePath of substantivePages) {
    expect(read(relativePath)).toContain('<TermBox term=');
  }
});

it('documents the working-developer teaching baseline', () => {
  const guide = read('CONTENT_GUIDE.md');
  expect(guide).toContain('## Atlas Teaching Contract');
  expect(guide).toContain('working software developer');
  expect(guide).toContain('TermBox');
  expect(guide).toContain('first substantive use');
});

it('protects representative difficult-term migrations', () => {
  const eventLoop = read('content/docs/programming/async/how-the-browser-event-loop-works.mdx');
  const checkout = read('content/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout.mdx');
  expect(eventLoop).toContain('<TermBox term="Microtask checkpoint">');
  expect(eventLoop).toContain('<TermBox term="Task source">');
  expect(eventLoop).toContain('<TermBox term="Rendering opportunity">');
  expect(checkout).toContain('<TermBox term="Transactional outbox">');
});
```

- [ ] **Step 2: Verify RED**

```bash
pnpm test -- tests/content-clarity.test.ts
```

Expected: FAIL because the teaching contract and lesson migrations do not exist yet.

- [ ] **Step 3: Add the authoring contract**

Add `## Atlas Teaching Contract` to `CONTENT_GUIDE.md` with these exact rules: working-developer/no-topic-prior-knowledge baseline, concrete → plain-language rule → TermBox → small example → deeper nuance progression, first-use placement, prerequisite boundary, box-density guidance, and a canonical `TermBox` example.

Extend the `AGENTS.md` content-clarity checklist with: explain difficult topic-specific terms locally, use `TermBox` when the term would otherwise create a learning barrier, and avoid boxing ordinary baseline vocabulary.

- [ ] **Step 4: Keep the migration tests RED until lesson tasks complete**

The guide-specific assertion should pass; the eight-page migration assertion should remain intentionally failing until Tasks 3-7 are complete.

- [ ] **Step 5: Commit the contract and RED guardrails**

```bash
git add tests/content-clarity.test.ts CONTENT_GUIDE.md AGENTS.md
git commit -m "test: define Atlas teaching clarity migration"
```

---

### Task 3: Rewrite the Browser Event Loop lesson as the reference teaching example

**Files:**
- Modify: `content/docs/programming/async/how-the-browser-event-loop-works.mdx`
- Modify: `tests/e2e/browser-event-loop.spec.ts`

**Interfaces:**
- Consumes: `TermBox`.
- Produces: reference structure for difficult deep dives.

- [ ] **Step 1: Add failing rendered-page expectations**

Add a Playwright test that loads the event-loop lesson and asserts visible complementary regions/labels for `Microtask checkpoint`, `Task source`, and `Rendering opportunity`, plus raw Markdown containing the explanation text.

```ts
test('explains difficult event-loop terminology at first use', async ({ page, request }) => {
  await page.goto(lessonPath);
  await expect(page.getByRole('complementary', { name: 'What is Microtask checkpoint?' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'What is Task source?' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'What is Rendering opportunity?' })).toBeVisible();

  const response = await request.get(`${lessonPath}.md`);
  expect(await response.text()).toContain('A microtask checkpoint is');
});
```

- [ ] **Step 2: Verify RED**

```bash
pnpm test:e2e -- tests/e2e/browser-event-loop.spec.ts
```

Expected: FAIL because the boxes are not yet authored.

- [ ] **Step 3: Restructure the lesson**

Reorder the opening around the concrete `A / B / promise / timer` example. Introduce task, microtask, microtask checkpoint, later timer work, and rendering incrementally. Add visible boxes for at least `Task`, `Microtask`, `Microtask checkpoint`, `Task source`, `Rendering opportunity`, `Microtask starvation`, `ECMAScript Job`, and `Host`. Keep HTML task-source nuance after the observable model, and keep Node comparison after browser behavior is established.

Do not change `lastVerified: 2026-09-09`.

- [ ] **Step 4: Verify GREEN and preserve existing lab behavior**

```bash
pnpm test -- tests/browser-event-loop.test.ts tests/content-clarity.test.ts
pnpm test:e2e -- tests/e2e/browser-event-loop.spec.ts
```

Expected: event-loop tests pass; global migration test may still fail only for pages not yet migrated.

- [ ] **Step 5: Commit**

```bash
git add content/docs/programming/async/how-the-browser-event-loop-works.mdx tests/e2e/browser-event-loop.spec.ts
git commit -m "docs: teach the browser event loop progressively"
```

---

### Task 4: Revise Promises and Async Waterfalls

**Files:**
- Modify: `content/docs/programming/async/promises.mdx`
- Modify: `content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx`
- Modify: `tests/e2e/promises.spec.ts`
- Modify: `tests/e2e/async-waterfalls.spec.ts`

**Interfaces:**
- Consumes: `TermBox` and teaching contract.

- [ ] **Step 1: Add failing representative E2E expectations**

Promises: require visible boxes for `Resolved`, `Promise adoption`, and `Thenable`.

Async waterfalls: require visible boxes for `Async waterfall`, `Critical path`, and `Backpressure`.

- [ ] **Step 2: Verify RED**

```bash
pnpm test:e2e -- tests/e2e/promises.spec.ts tests/e2e/async-waterfalls.spec.ts
```

Expected: FAIL on missing terminology boxes.

- [ ] **Step 3: Revise Promises**

Start from one small `then()` chain before presenting the full terminology model. Add boxes for `Settled`, `Resolved`, `Promise adoption`, `Thenable`, `Downstream Promise`, `Promise reaction`, and `Promise combinator` near first substantive use. Preserve the verified `Promise.resolve(inner) === inner` identity rule and the distinct adopting Promise example.

- [ ] **Step 4: Revise Async Waterfalls**

Start from the concrete three-operation timing example. Add boxes for `Async waterfall`, `Dependency graph`, `Concurrency vs parallelism`, `Critical path`, `Fan-out`, `Backpressure`, and `Latency vs throughput`. Preserve `Promise.all()` as aggregation rather than the definition of concurrency.

- [ ] **Step 5: Verify GREEN**

```bash
pnpm test -- tests/promise-resolution.test.ts tests/async-schedule.test.ts tests/content-clarity.test.ts
pnpm test:e2e -- tests/e2e/promises.spec.ts tests/e2e/async-waterfalls.spec.ts
```

Expected: page-specific tests pass; migration remains RED only for later pages.

- [ ] **Step 6: Commit**

```bash
git add content/docs/programming/async/promises.mdx content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx tests/e2e/promises.spec.ts tests/e2e/async-waterfalls.spec.ts
git commit -m "docs: clarify promises and async scheduling"
```

---

### Task 5: Revise the HTTP Request Lifecycle lesson

**Files:**
- Modify: `content/docs/web-platform/http-request-lifecycle.mdx`
- Modify: `tests/e2e/http-request-lifecycle.spec.ts`

**Interfaces:**
- Consumes: `TermBox` and teaching contract.

- [ ] **Step 1: Add failing E2E expectations**

Require visible boxes for `Origin`, `Revalidation`, `Connection reuse`, and `Multiplexing` and verify the raw Markdown keeps the full origin/revalidation definitions.

- [ ] **Step 2: Verify RED**

```bash
pnpm test:e2e -- tests/e2e/http-request-lifecycle.spec.ts
```

Expected: FAIL.

- [ ] **Step 3: Revise the lesson**

Teach common request paths first: fresh cache hit, reused connection, new connection, intermediary hit. Add boxes near first use for `Origin`, `Intermediary`, `Fresh / stale cache entry`, `Revalidation`, `Connection reuse`, `Transport`, `TLS secure session`, `Multiplexing`, `QUIC`, and `Cache key`. Preserve the distinction between HTTP semantics and network setup.

- [ ] **Step 4: Verify GREEN**

```bash
pnpm test -- tests/http-request-path.test.ts tests/content-clarity.test.ts
pnpm test:e2e -- tests/e2e/http-request-lifecycle.spec.ts
```

- [ ] **Step 5: Commit**

```bash
git add content/docs/web-platform/http-request-lifecycle.mdx tests/e2e/http-request-lifecycle.spec.ts
git commit -m "docs: make the HTTP lifecycle easier to trace"
```

---

### Task 6: Revise all three decision guides

**Files:**
- Modify: `content/docs/engineering-judgment/decision-guides/csr-vs-ssr-vs-ssg.mdx`
- Modify: `content/docs/engineering-judgment/decision-guides/monolith-vs-modular-monolith-vs-microservices.mdx`
- Modify: `content/docs/engineering-judgment/decision-guides/containers-vs-serverless.mdx`
- Modify: `tests/e2e/engineering-judgment.spec.ts`

**Interfaces:**
- Consumes: `TermBox` and existing `DecisionMatrix`.

- [ ] **Step 1: Add failing representative rendered expectations**

Add checks for visible boxes: `Hydration` on CSR/SSR/SSG, `Independent deployment` on monolith/microservices, and `Execution environment` on containers/serverless.

- [ ] **Step 2: Verify RED**

```bash
pnpm test:e2e -- tests/e2e/engineering-judgment.spec.ts
```

Expected: FAIL.

- [ ] **Step 3: Revise CSR vs SSR vs SSG**

Explain each model in ordinary language before trade-offs. Add boxes for `CSR / SSR / SSG`, `Hydration`, `Request-time state`, static `Revalidation`, `Cache key`, and `Critical request path`.

- [ ] **Step 4: Revise Monolith vs Modular Monolith vs Microservices**

Add boxes for `Deployment unit`, `Independent deployment`, network-boundary `Partial failure`, `Eventual consistency`, `Compensating workflow`, and `Blast radius`. Do not re-teach declared prerequisite concepts generically.

- [ ] **Step 5: Revise Containers vs Serverless**

Separate packaging from operating model first. Add boxes for `Container image`, `OCI`, `Capacity provisioning`, `Execution environment`, `Autoscaling`, `Cold start`, `Scale to zero`, managed-instance `Concurrency`, and `Sidecar` where used.

- [ ] **Step 6: Verify GREEN**

```bash
pnpm test -- tests/decision-matrix.test.ts tests/engineering-judgment-clarity.test.ts tests/judgment-content.test.ts tests/content-clarity.test.ts
pnpm test:e2e -- tests/e2e/engineering-judgment.spec.ts
```

Expected: decision-guide tests pass; migration remains RED only if checkout is still unmigrated.

- [ ] **Step 7: Commit**

```bash
git add content/docs/engineering-judgment/decision-guides tests/e2e/engineering-judgment.spec.ts
git commit -m "docs: add terminology support to decision guides"
```

---

### Task 7: Revise the Reliable Checkout walkthrough

**Files:**
- Modify: `content/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout.mdx`
- Modify: `tests/e2e/engineering-judgment.spec.ts`

**Interfaces:**
- Consumes: `TermBox`, existing Mermaid support, and teaching contract.

- [ ] **Step 1: Add failing checkout terminology expectations**

Require visible complementary regions for `Transactional outbox`, `At-least-once delivery`, and `Ambiguous outcome`.

- [ ] **Step 2: Verify RED**

```bash
pnpm test:e2e -- tests/e2e/engineering-judgment.spec.ts
```

Expected: FAIL on checkout boxes.

- [ ] **Step 3: Revise the walkthrough**

Keep the happy path understandable before failure windows. Add boxes near first use for `Idempotency`, `Ambiguous outcome`, `Reconciliation`, `Transactional outbox`, `Message broker`, `Consumer`, `At-least-once delivery`, `Acknowledgement / redelivery`, `Backoff and jitter`, `Dead-letter path`, `Correlation identifier`, and `Poison message/event`. Preserve the distinction between local atomicity and cross-system recovery.

- [ ] **Step 4: Verify GREEN migration**

```bash
pnpm test -- tests/content-clarity.test.ts tests/judgment-content.test.ts
pnpm test:e2e -- tests/e2e/engineering-judgment.spec.ts
```

Expected: all teaching-migration tests pass.

- [ ] **Step 5: Commit**

```bash
git add content/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout.mdx tests/e2e/engineering-judgment.spec.ts
git commit -m "docs: clarify reliable checkout terminology"
```

---

### Task 8: Final review, full CI, PR, and merge

**Files:**
- Review: all files changed against `main`.
- Update if needed: spec status and PR description only; no unrelated changes.

**Interfaces:**
- Produces: one reviewable PR with green permanent CI.

- [ ] **Step 1: Run focused unit/content validation**

```bash
pnpm test
```

Expected: PASS.

- [ ] **Step 2: Run static validation**

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Expected: PASS.

- [ ] **Step 3: Run browser and accessibility validation**

```bash
pnpm test:e2e
```

Expected: PASS including all-authored-route rendering/overflow and axe checks.

- [ ] **Step 4: Audit the branch diff**

Confirm exactly eight substantive teaching pages were migrated, `TermBox` remains server-rendered and dependency-free, metadata dates were not bumped for wording-only edits, no Atlas-map/learning-path/dependency changes occurred, and no existing correctness/accessibility tests were weakened.

- [ ] **Step 5: Open or update the PR**

PR body must explain learner baseline, `TermBox`, lesson migration scope, preservation of technical depth, TDD evidence, CI evidence, zero-cost impact (`none`), freshness impact (`no date bump for wording-only edits`), and the learning outcome improved.

- [ ] **Step 6: Wait for the exact final head CI and inspect every job**

Do not merge based on an older green commit. If CI fails, inspect the failing job/log, fix root cause, push a new commit, and repeat until the exact head is green.

- [ ] **Step 7: Merge after green CI**

Use squash merge unless repository settings or the PR require another supported method. Confirm GitHub reports `merged: true` before reporting completion.
