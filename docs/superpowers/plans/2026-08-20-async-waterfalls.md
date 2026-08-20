# Async Waterfalls Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first gold-standard interactive Atlas lesson, “Avoiding Sequential Async Waterfalls,” with an accessible timing lab, canonical MDX explanation, pure scheduling model, and complete automated verification.

**Architecture:** Keep the lesson canonical in Git-tracked MDX. Model sequential and concurrent schedules in a tiny pure TypeScript module, render them through one specialized client component (`AsyncWaterfallLab`), and register that component through the existing MDX component boundary. Preserve all essential teaching content in MDX/raw Markdown so the interactive surface enhances rather than owns the explanation.

**Tech Stack:** Next.js 16.3, React 19.2, TypeScript 6.0, Fumadocs Core/UI/MDX, Tailwind CSS 4, Vitest, Playwright, axe-core, pnpm 10.

**Spec:** `docs/superpowers/specs/2026-08-20-async-waterfalls-lesson-design.md`

## Global Constraints

- Canonical lesson content remains Git-tracked MDX.
- No runtime database, paid search, hosted vector database, paid CMS, project-owned AI API, object-storage dependency, hosted sandbox, or telemetry vendor.
- The lesson teaches concurrent/overlapped asynchronous work; it must not imply JavaScript CPU parallelism.
- The central rule is: **Start independent work as early as possible. Await only where a real dependency requires ordering.**
- Do not teach “always use `Promise.all`.”
- Explain that `Promise.all` aggregate rejection does not automatically cancel other already-started operations.
- The interactive lab contains three tasks only: A, B, and C.
- Do not generalize the scheduling model into arbitrary DAG scheduling.
- Do not add Sandpack, WebContainers, a charting framework, a generic benchmark system, or a generic learning-component framework.
- All essential knowledge must remain understandable through the generated clean-Markdown route.
- Keyboard operation, reduced-motion behavior, non-color-only communication, readable light/dark contrast, and the existing serious/critical axe gate are release requirements.
- Tests verify behavior and text, not animation-frame timing or pixel geometry.
- Use the existing scripts from `package.json`: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.

---

## Planned repository surface

```text
content/docs/programming/meta.json
content/docs/programming/async/meta.json
content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx

components/learning/async-waterfall-lab.tsx
components/mdx.tsx

lib/learning/async-schedule.ts

tests/async-schedule.test.ts
tests/e2e/async-waterfalls.spec.ts
```

Existing infrastructure files should not require dependency additions or package-script changes.

---

### Task 1: Pure async scheduling model

**Files:**
- Create: `lib/learning/async-schedule.ts`
- Create: `tests/async-schedule.test.ts`

**Interfaces:**
- Consumes: no application-specific dependencies.
- Produces:

```ts
export type TaskId = 'A' | 'B' | 'C';

export type TaskDurations = Record<TaskId, number>;

export type TimelineSegment = {
  id: TaskId;
  startMs: number;
  durationMs: number;
  endMs: number;
};

export type Schedule = {
  segments: TimelineSegment[];
  totalMs: number;
};

export const DEFAULT_TASK_DURATIONS: TaskDurations;
export const MIN_TASK_DURATION_MS: number;
export const MAX_TASK_DURATION_MS: number;
export const TASK_DURATION_STEP_MS: number;

export function buildSequentialSchedule(durations: TaskDurations): Schedule;
export function buildConcurrentSchedule(durations: TaskDurations): Schedule;
export function calculateTimeSavedMs(
  sequential: Schedule,
  concurrent: Schedule,
): number;
```

Use the word `Concurrent` in exported names. Avoid `buildParallelSchedule` because the lesson intentionally distinguishes asynchronous overlap from CPU parallelism.

- [ ] **Step 1: Write failing schedule tests**

Create `tests/async-schedule.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  buildConcurrentSchedule,
  buildSequentialSchedule,
  calculateTimeSavedMs,
  DEFAULT_TASK_DURATIONS,
  MAX_TASK_DURATION_MS,
  MIN_TASK_DURATION_MS,
} from '@/lib/learning/async-schedule';

describe('buildSequentialSchedule', () => {
  it('starts each task when the previous task ends', () => {
    expect(buildSequentialSchedule({ A: 800, B: 400, C: 300 })).toEqual({
      segments: [
        { id: 'A', startMs: 0, durationMs: 800, endMs: 800 },
        { id: 'B', startMs: 800, durationMs: 400, endMs: 1200 },
        { id: 'C', startMs: 1200, durationMs: 300, endMs: 1500 },
      ],
      totalMs: 1500,
    });
  });

  it('handles the allowed minimum duration', () => {
    expect(
      buildSequentialSchedule({
        A: MIN_TASK_DURATION_MS,
        B: MIN_TASK_DURATION_MS,
        C: MIN_TASK_DURATION_MS,
      }).totalMs,
    ).toBe(MIN_TASK_DURATION_MS * 3);
  });
});

describe('buildConcurrentSchedule', () => {
  it('starts all independent tasks at zero and uses the longest task as total', () => {
    expect(buildConcurrentSchedule({ A: 800, B: 400, C: 300 })).toEqual({
      segments: [
        { id: 'A', startMs: 0, durationMs: 800, endMs: 800 },
        { id: 'B', startMs: 0, durationMs: 400, endMs: 400 },
        { id: 'C', startMs: 0, durationMs: 300, endMs: 300 },
      ],
      totalMs: 800,
    });
  });

  it('handles the allowed maximum duration', () => {
    expect(
      buildConcurrentSchedule({
        A: MAX_TASK_DURATION_MS,
        B: MAX_TASK_DURATION_MS,
        C: MAX_TASK_DURATION_MS,
      }).totalMs,
    ).toBe(MAX_TASK_DURATION_MS);
  });
});

describe('calculateTimeSavedMs', () => {
  it('returns the difference between sequential and concurrent totals', () => {
    const sequential = buildSequentialSchedule(DEFAULT_TASK_DURATIONS);
    const concurrent = buildConcurrentSchedule(DEFAULT_TASK_DURATIONS);

    expect(calculateTimeSavedMs(sequential, concurrent)).toBe(700);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm exec vitest run tests/async-schedule.test.ts
```

Expected: FAIL because `@/lib/learning/async-schedule` does not exist.

- [ ] **Step 3: Implement the minimal scheduling model**

Create `lib/learning/async-schedule.ts`:

```ts
export type TaskId = 'A' | 'B' | 'C';

export type TaskDurations = Record<TaskId, number>;

export type TimelineSegment = {
  id: TaskId;
  startMs: number;
  durationMs: number;
  endMs: number;
};

export type Schedule = {
  segments: TimelineSegment[];
  totalMs: number;
};

export const MIN_TASK_DURATION_MS = 100;
export const MAX_TASK_DURATION_MS = 2000;
export const TASK_DURATION_STEP_MS = 100;

export const DEFAULT_TASK_DURATIONS: TaskDurations = {
  A: 800,
  B: 400,
  C: 300,
};

const TASK_IDS: TaskId[] = ['A', 'B', 'C'];

export function buildSequentialSchedule(
  durations: TaskDurations,
): Schedule {
  let cursorMs = 0;

  const segments = TASK_IDS.map((id) => {
    const durationMs = durations[id];
    const startMs = cursorMs;
    const endMs = startMs + durationMs;
    cursorMs = endMs;

    return { id, startMs, durationMs, endMs };
  });

  return { segments, totalMs: cursorMs };
}

export function buildConcurrentSchedule(
  durations: TaskDurations,
): Schedule {
  const segments = TASK_IDS.map((id) => ({
    id,
    startMs: 0,
    durationMs: durations[id],
    endMs: durations[id],
  }));

  return {
    segments,
    totalMs: Math.max(...segments.map((segment) => segment.endMs)),
  };
}

export function calculateTimeSavedMs(
  sequential: Schedule,
  concurrent: Schedule,
): number {
  return Math.max(0, sequential.totalMs - concurrent.totalMs);
}
```

Do not add runtime clamping here. The model stays a simple deterministic representation of valid inputs; the UI owns input constraints through native controls.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
pnpm exec vitest run tests/async-schedule.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 5: Run the full unit suite**

Run:

```bash
pnpm test
```

Expected: existing content-schema tests plus the new scheduling tests pass.

- [ ] **Step 6: Commit the model and tests**

```bash
git add -- lib/learning/async-schedule.ts tests/async-schedule.test.ts
git commit -m "feat: add async schedule model"
```

---

### Task 2: Documentation information architecture and lesson skeleton

**Files:**
- Create: `content/docs/programming/meta.json`
- Create: `content/docs/programming/async/meta.json`
- Create: `content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx`

**Interfaces:**
- Consumes: existing Fumadocs content tree and `lessonFrontmatterSchema`.
- Produces: route `/docs/programming/async/avoiding-sequential-async-waterfalls` and canonical source path used by page actions/raw Markdown.

- [ ] **Step 1: Add the navigation metadata**

Create `content/docs/programming/meta.json`:

```json
{
  "title": "Programming",
  "pages": ["async"]
}
```

Create `content/docs/programming/async/meta.json`:

```json
{
  "title": "Asynchronous Programming",
  "pages": ["avoiding-sequential-async-waterfalls"]
}
```

- [ ] **Step 2: Add a schema-valid lesson skeleton**

Create `content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx` with this frontmatter and temporary minimal body:

```mdx
---
title: Avoiding Sequential Async Waterfalls
description: Reduce latency by overlapping independent asynchronous work without breaking real dependencies.
category: programming
level: intermediate
status: evolving
lastVerified: 2026-08-20
reviewAfterDays: 180
topics:
  - javascript
  - typescript
  - async
  - promises
  - performance
  - latency
prerequisites:
  - promises
related:
  - promise-all
  - cancellation
  - bounded-concurrency
technologies:
  - javascript
  - typescript
---

## TL;DR

Start independent asynchronous work as early as possible. Await only where a real dependency requires ordering.
```

- [ ] **Step 3: Run type generation/typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS. This verifies the new MDX parses and frontmatter satisfies the current schema.

- [ ] **Step 4: Run production build**

Run:

```bash
pnpm build
```

Expected: PASS and the new docs route appears in the route generation output.

- [ ] **Step 5: Commit the content tree**

```bash
git add -- content/docs/programming/meta.json content/docs/programming/async/meta.json content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx
git commit -m "docs: add async waterfalls lesson route"
```

---

### Task 3: Async Waterfall Lab client component

**Files:**
- Create: `components/learning/async-waterfall-lab.tsx`
- Modify: `components/mdx.tsx`
- Test later through: `tests/e2e/async-waterfalls.spec.ts`

**Interfaces:**
- Consumes:
  - `DEFAULT_TASK_DURATIONS`
  - `MIN_TASK_DURATION_MS`
  - `MAX_TASK_DURATION_MS`
  - `TASK_DURATION_STEP_MS`
  - `buildSequentialSchedule()`
  - `buildConcurrentSchedule()`
  - `calculateTimeSavedMs()`
- Produces MDX primitive:

```tsx
<AsyncWaterfallLab />
```

with no required props.

- [ ] **Step 1: Register the not-yet-existing MDX primitive to establish the expected boundary**

Modify `components/mdx.tsx` to import and expose `AsyncWaterfallLab`:

```tsx
import { AsyncWaterfallLab } from '@/components/learning/async-waterfall-lab';
import { Mermaid } from '@/components/mdx/mermaid';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    AsyncWaterfallLab,
    Mermaid,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
```

- [ ] **Step 2: Run typecheck and verify RED**

Run:

```bash
pnpm typecheck
```

Expected: FAIL because `components/learning/async-waterfall-lab.tsx` does not exist.

- [ ] **Step 3: Create the initial client component**

Create `components/learning/async-waterfall-lab.tsx` with:

```tsx
'use client';

import {
  buildConcurrentSchedule,
  buildSequentialSchedule,
  calculateTimeSavedMs,
  DEFAULT_TASK_DURATIONS,
  MAX_TASK_DURATION_MS,
  MIN_TASK_DURATION_MS,
  TASK_DURATION_STEP_MS,
  type Schedule,
  type TaskDurations,
  type TaskId,
} from '@/lib/learning/async-schedule';
import { useEffect, useMemo, useRef, useState } from 'react';

const TASK_IDS: TaskId[] = ['A', 'B', 'C'];

function ScheduleTable({
  label,
  schedule,
}: {
  label: string;
  schedule: Schedule;
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold">{label}</h4>
      <div className="overflow-x-auto">
        <table className="w-full min-w-80 text-sm">
          <thead>
            <tr>
              <th scope="col" className="text-left">Task</th>
              <th scope="col" className="text-right">Start</th>
              <th scope="col" className="text-right">Duration</th>
              <th scope="col" className="text-right">End</th>
            </tr>
          </thead>
          <tbody>
            {schedule.segments.map((segment) => (
              <tr key={segment.id}>
                <th scope="row" className="text-left">{segment.id}</th>
                <td className="text-right">{segment.startMs}ms</td>
                <td className="text-right">{segment.durationMs}ms</td>
                <td className="text-right">{segment.endMs}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        <strong>{label} total:</strong> {schedule.totalMs}ms
      </p>
    </div>
  );
}

export function AsyncWaterfallLab() {
  const [durations, setDurations] = useState<TaskDurations>(
    DEFAULT_TASK_DURATIONS,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackKey, setPlaybackKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sequential = useMemo(
    () => buildSequentialSchedule(durations),
    [durations],
  );
  const concurrent = useMemo(
    () => buildConcurrentSchedule(durations),
    [durations],
  );
  const savedMs = calculateTimeSavedMs(sequential, concurrent);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function updateDuration(id: TaskId, value: number) {
    setDurations((current) => ({ ...current, [id]: value }));
  }

  function reset() {
    setDurations(DEFAULT_TASK_DURATIONS);
    setIsPlaying(false);
    setPlaybackKey((key) => key + 1);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  function play() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPlaybackKey((key) => key + 1);
    setIsPlaying(true);
    timeoutRef.current = setTimeout(
      () => setIsPlaying(false),
      sequential.totalMs,
    );
  }

  return (
    <section
      aria-labelledby="async-waterfall-lab-title"
      className="my-8 rounded-xl border p-4 sm:p-6"
    >
      <div className="space-y-2">
        <h3 id="async-waterfall-lab-title" className="text-xl font-semibold">
          Async Waterfall Lab
        </h3>
        <p className="text-fd-muted-foreground">
          Change the task durations to compare serial waiting with independent
          asynchronous work that starts together.
        </p>
      </div>

      <fieldset className="mt-6 grid gap-4 sm:grid-cols-3">
        <legend className="sr-only">Task durations</legend>
        {TASK_IDS.map((id) => (
          <label key={id} className="grid gap-2 font-medium">
            Task {id} duration
            <span className="flex items-center gap-2">
              <input
                aria-label={`Task ${id} duration in milliseconds`}
                type="range"
                min={MIN_TASK_DURATION_MS}
                max={MAX_TASK_DURATION_MS}
                step={TASK_DURATION_STEP_MS}
                value={durations[id]}
                onChange={(event) =>
                  updateDuration(id, Number(event.currentTarget.value))
                }
                className="min-w-0 flex-1"
              />
              <output className="w-16 text-right tabular-nums">
                {durations[id]}ms
              </output>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={play} className="rounded-md border px-3 py-2">
          {isPlaying ? 'Replay' : 'Play'} timelines
        </button>
        <button type="button" onClick={reset} className="rounded-md border px-3 py-2">
          Reset
        </button>
      </div>

      <div
        key={playbackKey}
        data-playing={isPlaying ? 'true' : 'false'}
        className="mt-6 grid gap-6 lg:grid-cols-2"
      >
        <ScheduleTable label="Sequential" schedule={sequential} />
        <ScheduleTable label="Concurrent" schedule={concurrent} />
      </div>

      <p className="mt-5" aria-live="polite">
        With these durations, starting independent work together saves{' '}
        <strong>{savedMs}ms</strong> of elapsed time.
      </p>
    </section>
  );
}
```

This initial version deliberately makes exact timing available as a semantic table before adding decorative bars. The component must remain useful even if animation CSS is disabled.

- [ ] **Step 4: Add visual timelines with CSS/React primitives only**

Within the same file, add a small visual row per `TimelineSegment` above each table. Derive offsets/widths from `schedule.totalMs`:

```ts
const startPercent = (segment.startMs / schedule.totalMs) * 100;
const widthPercent = (segment.durationMs / schedule.totalMs) * 100;
```

Render each bar inside a relative track using inline percentage width/left styles. Add `aria-hidden="true"` to the decorative timeline container because the semantic table already carries the exact data.

Use Tailwind utility classes and `currentColor`/existing theme tokens only; do not add a charting dependency or hard-code bespoke color hex values.

For playback, add a CSS transition/animation that is activated only when `data-playing="true"`. Ensure a `motion-reduce:` utility disables animation/transition. The animation is illustrative only; tests must not depend on frame timing.

- [ ] **Step 5: Run typecheck and lint**

Run:

```bash
pnpm typecheck
pnpm lint
```

Expected: PASS.

- [ ] **Step 6: Commit the MDX primitive**

```bash
git add -- components/learning/async-waterfall-lab.tsx components/mdx.tsx
git commit -m "feat: add async waterfall lab"
```

---

### Task 4: Author the gold-standard lesson

**Files:**
- Modify: `content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx`

**Interfaces:**
- Consumes: `<AsyncWaterfallLab />` MDX primitive.
- Produces: complete human-readable and clean-Markdown lesson content.

- [ ] **Step 1: Verify current primary sources before writing factual claims**

Use current authoritative sources at implementation time. At minimum verify:

- ECMAScript `Promise.all` semantics or an equivalent authoritative ECMAScript reference;
- MDN `Promise.all` behavior for readable platform-level explanation;
- any framework-specific example only against that framework’s current official documentation.

Do not cite SEO/tutorial pages for language semantics. Do not copy source prose at length.

Record source links in the lesson’s `## Sources` section.

- [ ] **Step 2: Replace the skeleton with the complete lesson**

The body must contain these headings in this order:

```md
## TL;DR
## Mental model
## Why waterfalls happen
## A real accidental waterfall
## Start independent work early
## Try it: Async Waterfall Lab
## Dependencies change the answer
## `Promise.all` is a tool, not the rule
## Production considerations
## When sequential execution is correct
## Exercise
## Agent rule
## Related concepts
## Sources
```

The TL;DR must include the exact conceptual rule:

```md
Start independent asynchronous work as early as possible. Await only where a real dependency requires ordering.
```

The mental-model section must explicitly include the default arithmetic in canonical text, not only in the component:

```md
If A takes 800ms, B takes 400ms, and C takes 300ms:

- sequential elapsed time is approximately `800 + 400 + 300 = 1500ms`;
- if A, B, and C are independent and start together, elapsed time is approximately `max(800, 400, 300) = 800ms`.

This is concurrent/overlapped asynchronous work. It does not mean JavaScript is executing the tasks' CPU work in parallel on the same thread.
```

- [ ] **Step 3: Include the three required code cases**

Accidental serialization:

```ts
const user = await getUser(id);
const flags = await getFeatureFlags(id);
const recommendations = await getRecommendations(id);
```

Independent work started early:

```ts
const userPromise = getUser(id);
const flagsPromise = getFeatureFlags(id);
const recommendationsPromise = getRecommendations(id);

const [user, flags, recommendations] = await Promise.all([
  userPromise,
  flagsPromise,
  recommendationsPromise,
]);
```

Genuine dependency:

```ts
const user = await getUser(id);
const organization = await getOrganization(user.organizationId);
```

Explain in prose that the important distinction is the dependency graph and when operations start, not stylistic preference or merely whether `Promise.all` appears.

- [ ] **Step 4: Embed the lab**

Under `## Try it: Async Waterfall Lab`, include the canonical text explanation first, then:

```mdx
<AsyncWaterfallLab />
```

The surrounding MDX must remain understandable if the component disappears from a Markdown consumer.

- [ ] **Step 5: Write the `Promise.all` nuance precisely**

The section must state all of the following in original wording:

- `Promise.all` fulfills when all input promises fulfill and preserves input result order;
- it rejects when an input promise rejects;
- rejecting the aggregate promise does not automatically cancel other operations that have already started;
- if independent failures need to be observed collectively, that is a different error-handling requirement and should not be conflated with latency scheduling;
- `Promise.all` is useful when awaiting a set of already-started independent operations, but it is not the underlying rule.

- [ ] **Step 6: Keep production nuance concise but complete**

Cover:

- bounded concurrency when fan-out is large;
- rate limits and connection/resource pools;
- error handling and side effects;
- cancellation/abort as a related concern rather than a fully implemented subtopic;
- latency versus throughput;
- intentional serialization for ordering, transactions, dependent computation, or backpressure.

Avoid introducing a production concurrency limiter implementation in this lesson.

- [ ] **Step 7: Add the exercise and agent rule**

Exercise structure:

```md
Given four operations—load account, load global feature configuration, load invoices for the account, and record an audit entry—identify which operations can start immediately, which depend on account data, and which may need intentional ordering because of side effects. Estimate the critical-path latency before and after safe overlap.
```

The answer/explanation should be directly below a collapsible or clearly separated explanation if an existing Fumadocs primitive supports it without new custom infrastructure; otherwise use a normal “### Explanation” subsection.

Agent rule:

```md
> When asynchronous operations are independent, start them before awaiting earlier results. Preserve sequential awaits when a later operation depends on an earlier result or when ordering/backpressure is intentional. Do not introduce unbounded concurrency merely to reduce latency.
```

- [ ] **Step 8: Run content/build verification**

Run:

```bash
pnpm typecheck
pnpm build
```

Expected: PASS.

- [ ] **Step 9: Commit the complete lesson**

```bash
git add -- content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx
git commit -m "docs: author async waterfalls lesson"
```

---

### Task 5: Browser behavior and accessibility tests

**Files:**
- Create: `tests/e2e/async-waterfalls.spec.ts`

**Interfaces:**
- Consumes route `/docs/programming/async/avoiding-sequential-async-waterfalls` and raw route `/docs/programming/async/avoiding-sequential-async-waterfalls.md`.
- Produces automated release coverage for navigation, lab interaction, Markdown parity, page actions, and axe.

- [ ] **Step 1: Write the browser tests**

Create `tests/e2e/async-waterfalls.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const lessonPath =
  '/docs/programming/async/avoiding-sequential-async-waterfalls';

test('exposes the async waterfalls lesson in docs navigation', async ({ page }) => {
  await page.goto('/docs');

  await expect(
    page.locator(`a[href="${lessonPath}"]`).first(),
  ).toBeVisible();
});

test('renders the lab with correct default timing', async ({ page }) => {
  await page.goto(lessonPath);

  await expect(
    page.getByRole('heading', { name: 'Async Waterfall Lab' }),
  ).toBeVisible();
  await expect(page.getByText('Sequential total:')).toBeVisible();
  await expect(page.getByText('1500ms', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Concurrent total:')).toBeVisible();
  await expect(page.getByText('800ms', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/saves.*700ms/i)).toBeVisible();
});

test('recalculates totals when a task duration changes and resets', async ({
  page,
}) => {
  await page.goto(lessonPath);

  const taskB = page.getByRole('slider', {
    name: 'Task B duration in milliseconds',
  });

  await taskB.fill('1000');

  await expect(page.getByText(/Sequential total:\s*2100ms/)).toBeVisible();
  await expect(page.getByText(/Concurrent total:\s*1000ms/)).toBeVisible();
  await expect(page.getByText(/saves.*1100ms/i)).toBeVisible();

  await page.getByRole('button', { name: 'Reset' }).click();

  await expect(taskB).toHaveValue('400');
  await expect(page.getByText(/Sequential total:\s*1500ms/)).toBeVisible();
  await expect(page.getByText(/Concurrent total:\s*800ms/)).toBeVisible();
});

test('play control is keyboard operable', async ({ page }) => {
  await page.goto(lessonPath);

  const play = page.getByRole('button', { name: /play timelines/i });
  await play.focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('button', { name: /replay timelines/i })).toBeVisible();
});

test('clean Markdown preserves the essential explanation', async ({ request }) => {
  const response = await request.get(`${lessonPath}.md`);
  const markdown = await response.text();

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('text/markdown');
  expect(markdown).toContain('# Avoiding Sequential Async Waterfalls');
  expect(markdown).toContain('800 + 400 + 300 = 1500ms');
  expect(markdown).toContain('max(800, 400, 300) = 800ms');
  expect(markdown).toContain('Do not introduce unbounded concurrency');
});

test('edit action targets the canonical lesson source', async ({ page }) => {
  await page.goto(lessonPath);

  const expectedHref =
    'https://github.com/thucne/software-development-atlas/edit/main/' +
    'content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx';

  let githubLink = page.locator(`a[href="${expectedHref}"]`);

  if ((await githubLink.count()) === 0) {
    await page
      .getByRole('button', { name: /options|more|open/i })
      .last()
      .click();
    githubLink = page.locator(`a[href="${expectedHref}"]`);
  }

  await expect(githubLink.first()).toBeVisible();
});

test('has no automatically detectable serious accessibility violations', async ({
  page,
}) => {
  await page.goto(lessonPath);

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );

  expect(serious).toEqual([]);
});
```

If exact text-node splitting causes a locator to fail, change the locator to a semantic container/regex without weakening the underlying assertion. Do not remove assertions to obtain green CI.

- [ ] **Step 2: Run the focused browser suite and verify RED where the UI/text does not yet match**

Run:

```bash
pnpm exec playwright test tests/e2e/async-waterfalls.spec.ts
```

Expected on the first run: any mismatch is a genuine contract check. Inspect failures individually rather than changing all locators at once.

- [ ] **Step 3: Make minimal component/content corrections for failing behavioral assertions**

Allowed corrections include:

- adding stable semantic wrappers/accessible labels;
- making total text easier to target without changing meaning;
- fixing raw-Markdown wording so canonical content carries the required arithmetic;
- correcting edit-link source mapping if necessary;
- fixing real axe issues in the new lab.

Do not disable axe rules or hide interactive elements from accessibility APIs merely to make the test pass.

- [ ] **Step 4: Run focused browser suite until GREEN**

Run:

```bash
pnpm exec playwright test tests/e2e/async-waterfalls.spec.ts
```

Expected: 7 tests pass.

- [ ] **Step 5: Run all browser tests**

Run:

```bash
pnpm test:e2e
```

Expected: existing Phase 0.1 browser tests plus all new lesson tests pass.

- [ ] **Step 6: Commit browser coverage and any minimal fixes**

```bash
git add -- tests/e2e/async-waterfalls.spec.ts components/learning/async-waterfall-lab.tsx content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx
git commit -m "test: cover async waterfalls lesson"
```

Only include component/lesson files in this commit if they were actually changed to resolve the browser test findings.

---

### Task 6: Final quality pass and CI verification

**Files:**
- Modify only files that fail the verification gate.
- Update PR #5 description after verification; no new repository file is required solely for status reporting.

**Interfaces:**
- Consumes the full Phase 0.2 implementation.
- Produces a review-ready PR with reproducible evidence.

- [ ] **Step 1: Run the complete local-quality command sequence**

Run in this order:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Expected: every command succeeds.

Because PR #2 established CI with the same committed/frozen lockfile workflow, no package or lockfile change should be required for Phase 0.2 unless implementation accidentally introduced a dependency; if that happens, stop and remove the unnecessary dependency rather than expanding scope.

- [ ] **Step 2: Check the implementation against the design non-goals**

Confirm from the diff that it contains none of:

```text
Sandpack
WebContainers
new database client
AI/model API client
analytics/telemetry SDK
charting dependency
generic Benchmark component
generic Challenge engine
generic ExecutionTimeline framework
```

- [ ] **Step 3: Check agent/raw-Markdown parity manually**

Fetch or open:

```text
/docs/programming/async/avoiding-sequential-async-waterfalls.md
```

Confirm a non-interactive reader can recover:

- the central rule;
- 1500ms sequential arithmetic;
- 800ms concurrent arithmetic;
- why dependency-constrained awaits remain sequential;
- `Promise.all` rejection/no-auto-cancellation nuance;
- bounded-concurrency warning;
- the agent rule.

- [ ] **Step 4: Review the final diff for speculative abstractions**

Expected implementation surface is approximately:

```text
content/docs/programming/meta.json
content/docs/programming/async/meta.json
content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx
components/learning/async-waterfall-lab.tsx
components/mdx.tsx
lib/learning/async-schedule.ts
tests/async-schedule.test.ts
tests/e2e/async-waterfalls.spec.ts
```

The already-committed spec and this plan are also part of PR #5. If substantially more application files are required, reconsider whether scope has silently expanded before proceeding.

- [ ] **Step 5: Verify GitHub Actions on PR #5**

Push all implementation commits to `agent/async-waterfalls` and inspect the PR workflow. Required green steps:

```text
Install dependencies
Lint
Typecheck
Unit tests
Build
Install Chromium
Browser and accessibility tests
```

Do not mark the PR ready based only on earlier task-level checks; use the final head SHA’s workflow result.

- [ ] **Step 6: Update PR #5 description with final evidence and mark ready for review**

The PR description should summarize:

- lesson/content hierarchy added;
- `AsyncWaterfallLab` behavior;
- scheduling model and test counts;
- exact primary sources used by the lesson;
- zero-cost/no-new-service preservation;
- final CI result;
- any accessibility or API issues discovered and fixed during execution.

Keep the PR open for human review. Do not merge without explicit authorization.
