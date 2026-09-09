# Content Reliability and Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-verify and rewrite the first three gold-standard async deep dives for technical correctness, local clarity, and progressive teaching, then codify the same writing standard for future Atlas content.

**Architecture:** Keep canonical knowledge in existing MDX and authoring docs. Add only targeted executable/content regressions for facts that can be checked mechanically; use human/editorial review for prose quality rather than a generic prose linter. Preserve all existing learning models, UI primitives, map/path data, dependencies, and CI architecture.

**Tech Stack:** Next.js 16, React 19, TypeScript 6, Fumadocs/MDX, Vitest, Playwright, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-09-content-reliability-clarity-design.md`

## Global Constraints

- Do not add a generic prose linter, readability score, LLM judge, or hosted model call.
- Do not rewrite every authored Atlas page; PR #14 migration scope is the three async deep dives plus authoring guidance.
- Do not change `content/atlas-map.json` or `content/learning-paths.json` for this pass.
- Do not add UI primitives, interactive labs, dependencies, runtime services, analytics, databases, Sandpack, or WebContainers.
- Keep the three existing `lib/learning/*` domain models unchanged unless a verified contradiction is discovered.
- Update each migrated deep dive to `lastVerified: 2026-09-09` only after genuine current-source verification.
- Exact final head must pass the repository's permanent lint, typecheck, unit, build, Playwright, accessibility, MDX-fence, and all-authored-route rendering gates.

---

## File map

**Create**
- `tests/content-clarity.test.ts` — narrow mechanically checkable migration/authoring-contract regressions.
- `docs/superpowers/plans/2026-09-09-content-reliability-clarity-self-review.md` — source-backed technical/editorial final audit.

**Modify**
- `tests/promise-resolution.test.ts` — native Promise identity/resolution regression tests.
- `content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx` — await/critical-path clarity and source refresh.
- `content/docs/programming/async/how-the-browser-event-loop-works.mdx` — progressive browser-first rewrite and explicit runtime scope.
- `content/docs/programming/async/promises.mdx` — P0 Promise identity/resolution correction plus clarity rewrite.
- `CONTENT_GUIDE.md` — canonical Atlas Clarity Contract.
- `AGENTS.md` — automated-contributor clarity checklist.

**Must remain unchanged**
- `lib/learning/async-schedule.ts`
- `lib/learning/browser-event-loop.ts`
- `lib/learning/promise-resolution.ts`
- `content/atlas-map.json`
- `content/learning-paths.json`
- `package.json`
- `pnpm-lock.yaml`
- `.github/workflows/ci.yml`

---

### Task 1: Protect the Promise semantics that the current prose gets wrong

**Files:**
- Modify: `tests/promise-resolution.test.ts`

**Interfaces:**
- Consumes: native JavaScript `Promise` behavior from Node 22 / ECMAScript 2026.
- Produces: executable regression evidence for the content rewrite; no production API.

- [ ] **Step 1: Add native-Promise regression tests**

Append a separate `describe('native Promise semantics used by the lesson', ...)` block with these tests:

```ts
describe('native Promise semantics used by the lesson', () => {
  it('Promise.resolve preserves identity for a native same-constructor Promise', () => {
    const inner = new Promise<number>(() => {});

    expect(Promise.resolve(inner)).toBe(inner);
  });

  it('a separately constructed outer Promise can adopt a pending inner Promise', async () => {
    let resolveInner!: (value: number) => void;
    const inner = new Promise<number>((resolve) => {
      resolveInner = resolve;
    });
    const outer = new Promise<number>((resolve) => {
      resolve(inner);
    });

    expect(outer).not.toBe(inner);

    let settled = false;
    void outer.then(() => {
      settled = true;
    });

    await Promise.resolve();
    expect(settled).toBe(false);

    resolveInner(42);
    await expect(outer).resolves.toBe(42);
  });

  it('an executor throw after resolve(inner) does not replace the adopted outcome', async () => {
    let resolveInner!: (value: number) => void;
    const inner = new Promise<number>((resolve) => {
      resolveInner = resolve;
    });
    const outer = new Promise<number>((resolve) => {
      resolve(inner);
      throw new Error('ignored after resolve has already been called');
    });

    resolveInner(42);
    await expect(outer).resolves.toBe(42);
  });
});
```

- [ ] **Step 2: Run the focused unit file**

Run:

```bash
pnpm test -- tests/promise-resolution.test.ts
```

Expected: existing model tests plus the three new native-Promise tests PASS. These tests are characterization/regression evidence, not a RED product bug, because the JavaScript engine already implements the correct semantics; the old defect lives in prose.

- [ ] **Step 3: Commit**

```bash
git add tests/promise-resolution.test.ts
git commit -m "test: protect promise resolution semantics"
```

---

### Task 2: Add narrow content-migration guardrails

**Files:**
- Create: `tests/content-clarity.test.ts`

**Interfaces:**
- Consumes: repository Markdown/MDX files through `node:fs`.
- Produces: migration/contract assertions only; does not score prose quality.

- [ ] **Step 1: Write the failing content-contract test**

Create:

```ts
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const deepDives = [
  'content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx',
  'content/docs/programming/async/how-the-browser-event-loop-works.mdx',
  'content/docs/programming/async/promises.mdx',
] as const;

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Atlas content reliability migration', () => {
  it('records the completed 2026-09-09 verification date on all three migrated deep dives', () => {
    for (const relativePath of deepDives) {
      expect(read(relativePath)).toContain('lastVerified: 2026-09-09');
    }
  });

  it('removes the dangling Event Loop TLDR diagram reference', () => {
    const source = read(
      'content/docs/programming/async/how-the-browser-event-loop-works.mdx',
    );
    expect(source).not.toContain('carry this browser diagram directly into Node.js');
  });

  it('does not teach Promise.resolve(inner) as a distinct adopting outer Promise', () => {
    const source = read('content/docs/programming/async/promises.mdx');
    expect(source).toContain('Promise.resolve(inner)');
    expect(source).toContain('same === inner');
    expect(source).toContain('outer === inner');
  });

  it('publishes the named Atlas Clarity Contract', () => {
    const guide = read('CONTENT_GUIDE.md');
    expect(guide).toContain('## Atlas Clarity Contract');
    expect(guide).toContain('### Local completeness');
    expect(guide).toContain('### Define before depending');
    expect(guide).toContain('### Scope guarantees and recommendations');
    expect(guide).toContain('### Examples are factual claims');
  });
});
```

- [ ] **Step 2: Run to confirm RED**

Run:

```bash
pnpm test -- tests/content-clarity.test.ts
```

Expected: FAIL because the three deep dives still have older verification dates, the Event Loop dangling sentence still exists, the Promise identity teaching is not corrected, and the Clarity Contract has not yet been added.

- [ ] **Step 3: Commit the RED test**

```bash
git add tests/content-clarity.test.ts
git commit -m "test: define content reliability migration contract"
```

---

### Task 3: Rewrite and re-verify Avoiding Sequential Async Waterfalls

**Files:**
- Modify: `content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx`

**Interfaces:**
- Consumes: existing `AsyncWaterfallLab` contract and primary/authoritative Promise/await sources.
- Produces: clearer canonical Markdown; no component/model changes.

- [ ] **Step 1: Re-verify the claims before editing**

Check current ECMAScript 2026 Promise semantics and current MDN `await` guidance. Record in working notes that:

- `await` suspends the continuation of the surrounding async function and does not block the main thread;
- `Promise.all` aggregates all inputs and preserves fulfillment-result order by input order;
- aggregate rejection does not itself provide cancellation of underlying operations.

- [ ] **Step 2: Rewrite TL;DR and Mental model**

Required opening language:

```md
## TL;DR

**Start independent asynchronous work as early as possible. Await only when later work actually depends on an earlier result or when ordering is intentional.**

`await` suspends the continuation of the surrounding async function until the awaited value is ready. It does not block the JavaScript thread. A waterfall appears when code waits before it has started another operation that could have been running independently.

Do not mechanically replace sequential `await`s with `Promise.all()`. First identify the dependency graph: overlap independent operations, preserve real dependencies, and bound concurrency when resource pressure requires it.
```

Define critical path at first use:

```md
The **critical path** is the longest chain of dependent operations that determines the earliest possible completion time.
```

- [ ] **Step 3: Tighten ambiguous phrases throughout the lesson**

Replace phrases that can imply CPU-thread parallelism or vague “task” behavior with explicit `operation`, `wait`, `dependency`, and `resource` language. Keep the existing numeric examples, lab, exercise, production caveats, and agent rule unless verification requires wording changes.

- [ ] **Step 4: Refresh verification metadata and sources**

Set:

```yaml
lastVerified: 2026-09-09
```

Add/retain authoritative sources sufficient to support `await`, Promise aggregation, and cancellation boundaries.

- [ ] **Step 5: Run focused content/unit checks**

Run:

```bash
pnpm test -- tests/content-clarity.test.ts tests/async-schedule.test.ts
```

Expected: content test still has failures for Event Loop/Promises/Content Guide, but no Async Waterfall-specific failure; async schedule tests PASS.

- [ ] **Step 6: Commit**

```bash
git add content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx
git commit -m "docs: clarify async waterfall scheduling"
```

---

### Task 4: Rewrite and re-verify How the Browser Event Loop Actually Works

**Files:**
- Modify: `content/docs/programming/async/how-the-browser-event-loop-works.mdx`

**Interfaces:**
- Consumes: existing `EventLoopLab` behavior, WHATWG HTML Living Standard, current Node.js docs.
- Produces: browser-first progressive teaching with unchanged simulator/model.

- [ ] **Step 1: Re-verify current platform claims**

Confirm from current WHATWG HTML and Node docs:

- the event-loop task step runs selected task work before the microtask checkpoint;
- the microtask queue is separate and a checkpoint drains while non-empty;
- HTML does not define one universal FIFO “macrotask queue” across unrelated task sources;
- rendering opportunities are browser-controlled rather than guaranteed after every task/callback;
- `requestAnimationFrame()` belongs to rendering update processing, not a generic post-microtask queue;
- Node has no browser rendering pipeline;
- Node marks `process.nextTick()` Legacy and says to use `queueMicrotask()` for most userland deferral.

- [ ] **Step 2: Replace the TL;DR**

Use this teaching order:

```md
## TL;DR

**In ordinary browser code, the browser finishes the JavaScript for the current event-loop task before it starts another event-loop task. After that task finishes, the browser runs queued microtasks—such as Promise reactions and `queueMicrotask()` callbacks—before moving on to later task work.**

`setTimeout(fn, 0)` therefore means “schedule `fn` for later,” not “interrupt the JavaScript that is running now.” Rendering is scheduled separately by the browser and is not guaranteed between arbitrary callbacks.

This page describes **browser** scheduling. Node.js also runs Promise microtasks, but Node has its own event-loop rules and no browser rendering step. Do not assume that browser timer, task-source, or rendering rules automatically apply to Node.js.
```

- [ ] **Step 3: Add a vocabulary-first mental model**

Before formal queue-selection nuance, define task, microtask, task source, and rendering opportunity in plain language. Move `Job`, `HostEnqueuePromiseJob`, and formal `host` terminology to the later Promise-integration / Browser-vs-Node section.

- [ ] **Step 4: Reorder the core explanation**

Preferred order:

1. run-to-completion;
2. first Promise-vs-timer example;
3. microtasks and checkpoints;
4. timers are later work, not deadlines;
5. task sources / no universal FIFO nuance;
6. rendering opportunities and rAF;
7. lab;
8. starvation/responsiveness;
9. formal ECMAScript Job integration;
10. browser versus Node.js;
11. production/exercise/agent rule/sources.

Do not remove standards nuance; make it arrive after the reader has a usable model.

- [ ] **Step 5: Remove dangling/deictic references and scope guarantees**

At minimum remove the exact dangling phrase tested in Task 2. Replace ambiguous references with explicit nouns such as `the browser scheduling model on this page`, `the Promise-vs-timer example`, or `the current microtask checkpoint`.

- [ ] **Step 6: Refresh verification metadata/sources**

Set `lastVerified: 2026-09-09` and record current WHATWG HTML and Node documentation links in Sources.

- [ ] **Step 7: Run focused model/content checks**

Run:

```bash
pnpm test -- tests/content-clarity.test.ts tests/browser-event-loop.test.ts
```

Expected: Event Loop and browser model checks PASS; remaining RED items are Promise/Clarity Contract until later tasks.

- [ ] **Step 8: Commit**

```bash
git add content/docs/programming/async/how-the-browser-event-loop-works.mdx
git commit -m "docs: make browser event loop teaching explicit"
```

---

### Task 5: Correct and rewrite Promises: Resolution, Chaining, and Failure

**Files:**
- Modify: `content/docs/programming/async/promises.mdx`

**Interfaces:**
- Consumes: Task 1 native-Promise regression evidence, existing `PromiseResolutionLab`, ECMAScript 2026 Promise specification.
- Produces: corrected canonical Promise lesson; no model/UI change.

- [ ] **Step 1: Rewrite the resolved-vs-fulfilled example**

Replace the incorrect distinct-outer `Promise.resolve(inner)` explanation with an explicit identity contrast:

```js
let resolveInner;

const inner = new Promise((resolve) => {
  resolveInner = resolve;
});

const same = Promise.resolve(inner);
console.log(same === inner); // true

const outer = new Promise((resolve) => {
  resolve(inner);
});
console.log(outer === inner); // false
```

Explain:

- `Promise.resolve(inner)` returns the same native Promise when `inner.constructor === Promise`;
- `outer` is the distinct Promise needed for the adoption demonstration;
- after `resolve(inner)`, `outer` is resolved to/adopting `inner` and can remain pending until `inner` settles.

- [ ] **Step 2: Correct executor-throw wording**

Replace the current “throws before settlement” statement with the actual first-resolution rule. Include a compact example or explanation that if the executor calls `resolve(inner)` and then throws, the later constructor attempt to reject does not replace the already-established adopted fate.

- [ ] **Step 3: Re-verify the rest of the Promise claims**

Confirm from ECMAScript 2026:

- pending/fulfilled/rejected/settled/resolved terminology;
- `then`/`catch`/`finally` downstream behavior;
- `Promise.all`, `allSettled`, `any`, `race`, including empty inputs;
- `Promise.try()` invokes its callback synchronously before resolving/rejecting the returned Promise from that completion;
- `Promise.withResolvers()` returns `{ promise, resolve, reject }` from one Promise capability.

Retain cancellation guidance as an operation/API ownership distinction rather than a language-level Promise cancellation feature.

- [ ] **Step 4: Improve opening/section locality**

Keep the TL;DR focused on the chain outcome rules and resolved-vs-fulfilled distinction. Replace phrases such as `that behavior` when the referent is not locally explicit. Define `thenable` before relying on it.

- [ ] **Step 5: Refresh metadata and sources**

Set `lastVerified: 2026-09-09`; use ECMAScript 2026 as the primary normative source and current MDN as supporting developer documentation.

- [ ] **Step 6: Run Promise/content tests**

Run:

```bash
pnpm test -- tests/promise-resolution.test.ts tests/content-clarity.test.ts
```

Expected: Promise semantics and Promise migration assertions PASS; only Clarity Contract assertions remain RED until Task 6.

- [ ] **Step 7: Commit**

```bash
git add content/docs/programming/async/promises.mdx
git commit -m "fix: correct promise adoption teaching"
```

---

### Task 6: Publish the Atlas Clarity Contract for humans and agents

**Files:**
- Modify: `CONTENT_GUIDE.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: approved spec Section 5.
- Produces: canonical human authoring rules plus concise automated-contributor checklist.

- [ ] **Step 1: Add `## Atlas Clarity Contract` to `CONTENT_GUIDE.md`**

Place it after the existing `## Writing style` section or integrate `Writing style` into it while preserving all existing useful guidance.

Required named subsections:

```md
### Local completeness
### Define before depending
### Scope guarantees and recommendations
### Conditions over vague ranking words
### One main claim per sentence
### Examples are factual claims
### TL;DR discipline
### Put caveats beside the claim they qualify
```

For `Scope guarantees and recommendations`, explicitly distinguish:

- specification/API guarantee;
- implementation/provider freedom;
- engineering heuristic/trade-off.

Make clear that pronouns such as “this” are not banned; only unclear referents are a problem.

- [ ] **Step 2: Add the agent checklist to `AGENTS.md`**

Under content-change instructions, require automated contributors to check:

1. every formal term is defined before it carries explanatory weight;
2. deictic references remain understandable when the section is retrieved alone;
3. platform/runtime/provider scope is explicit;
4. vague ranking words name their comparison dimension/conditions;
5. code examples are treated as factual claims and executed/tested where practical;
6. TL;DRs avoid nonessential specification trivia before the practical rule.

Do not add a prose-lint tool requirement.

- [ ] **Step 3: Run the content contract**

Run:

```bash
pnpm test -- tests/content-clarity.test.ts
```

Expected: all content reliability migration tests PASS.

- [ ] **Step 4: Commit**

```bash
git add CONTENT_GUIDE.md AGENTS.md
git commit -m "docs: establish Atlas clarity contract"
```

---

### Task 7: Whole-content editorial and technical self-review

**Files:**
- Create: `docs/superpowers/plans/2026-09-09-content-reliability-clarity-self-review.md`
- Modify the three deep dives / guidance only if review finds concrete issues.

**Interfaces:**
- Consumes: final draft content plus current primary sources.
- Produces: review evidence and any narrowly scoped corrections.

- [ ] **Step 1: Perform a source-backed technical audit**

For each deep dive, record the claim categories checked and sources used. Include at least:

- Async Waterfalls: `await`, Promise aggregation/cancellation boundary, critical-path wording;
- Event Loop: task/microtask checkpoint, task-source scheduling freedom, rendering opportunities/rAF, Node comparison;
- Promises: identity/adoption, first-resolution behavior, chain methods, combinators, `Promise.try`, `Promise.withResolvers`, cancellation boundary.

- [ ] **Step 2: Perform a section-local editorial audit**

Read every modified section independently and record fixes for:

- dangling `this` / `that` / `above` / `here` references;
- undefined formal vocabulary;
- sentences combining unrelated main claims;
- unscoped guarantees;
- vague adjectives without conditions;
- caveats appearing before the model they qualify.

- [ ] **Step 3: Write the self-review document**

Document:

- correctness fixes made;
- clarity fixes made;
- primary sources checked with verification date 2026-09-09;
- files intentionally unchanged;
- any residual limitations that are deliberate and non-blocking.

- [ ] **Step 4: Run focused full unit suite**

Run:

```bash
pnpm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add content/docs/programming/async CONTENT_GUIDE.md AGENTS.md docs/superpowers/plans/2026-09-09-content-reliability-clarity-self-review.md
git commit -m "docs: complete deep-dive reliability review"
```

---

### Task 8: Exact-head final verification, PR review, and squash merge

**Files:**
- No planned source changes unless verification reveals a concrete defect.

**Interfaces:**
- Consumes: exact final branch head.
- Produces: ready PR #14 and authorized squash merge into `main`.

- [ ] **Step 1: Run/permanently observe exact-head CI**

Require success for the repository's unchanged workflow:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Use GitHub Actions as the executable environment if no local worktree/runtime is available.

- [ ] **Step 2: Audit `main...HEAD`**

Confirm there is no diff in:

```text
content/atlas-map.json
content/learning-paths.json
package.json
pnpm-lock.yaml
.github/workflows/ci.yml
lib/learning/async-schedule.ts
lib/learning/browser-event-loop.ts
lib/learning/promise-resolution.ts
```

Also confirm every changed file belongs to the approved spec/plan/tests/deep-dives/guidance/self-review scope.

- [ ] **Step 3: Open/update PR #14**

Title:

```text
fix: harden deep-dive reliability and clarity
```

Body must summarize:

- Promise P0 correctness correction;
- Event Loop teaching-order/local-reference rewrite;
- Async Waterfall `await`/critical-path clarity;
- Atlas Clarity Contract;
- exact sources re-verified;
- tests and exact-head CI evidence;
- explicit no-map/no-path/no-dependency/no-UI scope.

- [ ] **Step 4: Mark ready only after exact-head CI and diff audit**

Do not claim readiness from an earlier head.

- [ ] **Step 5: Re-fetch PR head/state and squash merge**

User has explicitly authorized PR #14 to be carried through merge. Before merging, require:

- PR open;
- non-draft;
- mergeable;
- exact head still equals the verified head.

Squash merge with the expected head SHA. Do not delete the branch unless separately authorized.

- [ ] **Step 6: Verify post-merge state**

Confirm PR #14 is closed/merged and record the squash commit SHA on `main`.
