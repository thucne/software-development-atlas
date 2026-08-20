# Browser Event Loop Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the second gold-standard Atlas lesson, **How the Browser Event Loop Actually Works**, with a deterministic, accessible browser event-loop simulator and no premature generic learning-component abstraction.

**Architecture:** Keep canonical teaching content in MDX. Put all simulator semantics in a pure TypeScript state machine under `lib/learning/browser-event-loop.ts`; render that state through a specialized client component `EventLoopLab`. The simulator executes only predefined scenarios, exposes implementation-defined scheduler choice explicitly, and never runs arbitrary JavaScript.

**Tech Stack:** Next.js 16, React 19, TypeScript 6, Fumadocs/MDX, Tailwind CSS 4, Vitest, Playwright, axe-core.

**Spec:** `docs/superpowers/specs/2026-08-20-browser-event-loop-lesson-design.md`

## Global Constraints

- Canonical model is the browser / WHATWG HTML event loop; Node.js is comparison-only.
- Do not teach one universal FIFO “macrotask queue.”
- Use HTML-standard term **task**; mention “macrotask” only as informal terminology if needed.
- Promise reactions and `queueMicrotask()` participate in browser microtask processing.
- Rendering is a browser-controlled **rendering opportunity**; never claim paint occurs after every callback.
- `requestAnimationFrame()` is part of rendering work, not a browser equivalent of Node.js `setImmediate()`.
- Timers establish later eligibility, not exact execution deadlines.
- One scenario must expose a learner-visible valid scheduler choice between unrelated runnable task sources.
- Starvation demonstration must be bounded and must not enqueue a real infinite browser microtask chain.
- Do not parse or execute arbitrary JavaScript.
- Do not add Sandpack, WebContainers, a charting library, database, hosted execution service, model API, or paid infrastructure.
- Do not extract a generic `ExecutionTimeline`, queue framework, or generic learning component in this PR.
- Interactive UI must not contain unique knowledge unavailable in clean Markdown.
- Existing `AsyncWaterfallLab` remains unchanged unless a tiny proven accessibility/style fix is required by CI.
- Permanent CI remains read-only with frozen lockfile and the normal combined browser/accessibility command.

---

## File Structure

**Create**

- `lib/learning/browser-event-loop.ts` — pure scenario definitions, state types, transition functions, scheduler-choice handling.
- `components/learning/event-loop-lab.tsx` — specialized accessible simulator UI; no scheduling rules duplicated here.
- `content/docs/programming/async/how-the-browser-event-loop-works.mdx` — canonical lesson.
- `tests/browser-event-loop.test.ts` — unit tests for guaranteed ordering, nested microtasks, scheduler choices, rendering and bounded starvation.
- `tests/e2e/browser-event-loop.spec.ts` — navigation, simulator interaction, raw Markdown, Edit-on-GitHub, accessibility.

**Modify**

- `components/mdx.tsx` — register `EventLoopLab`.
- `content/docs/programming/async/meta.json` — add the new lesson after async waterfalls.

No dependency or workflow changes are expected.

---

### Task 1: Build the pure browser event-loop model with TDD

**Files:**
- Create: `tests/browser-event-loop.test.ts`
- Create: `lib/learning/browser-event-loop.ts`

**Interfaces:**

Produces these stable public concepts for the UI/tests:

```ts
export type ScenarioId =
  | 'promise-vs-timer'
  | 'nested-microtasks'
  | 'timer-queues-promise'
  | 'rendering-opportunity'
  | 'microtask-starvation'
  | 'multiple-task-sources';

export type TaskSource =
  | 'script'
  | 'timer'
  | 'user-interaction'
  | 'networking'
  | 'rendering';

export type WorkKind = 'task' | 'microtask' | 'animation-frame';

export type WorkItem = {
  id: string;
  label: string;
  kind: WorkKind;
  source?: TaskSource;
};

export type EventLoopStatus =
  | 'running-work'
  | 'microtask-checkpoint'
  | 'scheduler-choice'
  | 'rendering-opportunity'
  | 'rendering-update'
  | 'idle'
  | 'starvation-warning';

export type SchedulerChoice = {
  id: string;
  label: string;
  source: TaskSource;
};

export type EventLoopState = {
  scenarioId: ScenarioId;
  current: WorkItem | null;
  microtasks: WorkItem[];
  runnableTasksBySource: Partial<Record<TaskSource, WorkItem[]>>;
  animationFrameCallbacks: WorkItem[];
  output: string[];
  stepIndex: number;
  status: EventLoopStatus;
  explanation: string;
  choices: SchedulerChoice[];
  complete: boolean;
};

export type ScenarioDefinition = {
  id: ScenarioId;
  title: string;
  description: string;
  source: string;
};

export const EVENT_LOOP_SCENARIOS: readonly ScenarioDefinition[];
export function createScenarioState(id: ScenarioId): EventLoopState;
export function stepEventLoop(state: EventLoopState): EventLoopState;
export function chooseRunnableTask(
  state: EventLoopState,
  choiceId: string,
): EventLoopState;
```

The implementation may use private scripted transition definitions, but scenario semantics stay in this module.

- [ ] **Step 1: Write failing model tests**

Add tests that assert at minimum:

```ts
import {
  chooseRunnableTask,
  createScenarioState,
  stepEventLoop,
} from '@/lib/learning/browser-event-loop';
import { describe, expect, it } from 'vitest';

function runDeterministicScenario(id: Parameters<typeof createScenarioState>[0]) {
  let state = createScenarioState(id);

  for (let guard = 0; guard < 100 && !state.complete; guard += 1) {
    if (state.status === 'scheduler-choice') {
      throw new Error(`Scenario ${id} unexpectedly requires a scheduler choice`);
    }
    state = stepEventLoop(state);
  }

  return state;
}

describe('browser event-loop simulator', () => {
  it('runs synchronous output before Promise microtasks and timer tasks', () => {
    const state = runDeterministicScenario('promise-vs-timer');
    expect(state.output).toEqual(['A', 'B', 'promise', 'timer']);
  });

  it('drains a newly queued microtask during the same checkpoint', () => {
    const state = runDeterministicScenario('nested-microtasks');
    expect(state.output).toEqual(['script', 'microtask A', 'microtask B']);
  });

  it('runs a Promise reaction queued by a timer before later tasks proceed', () => {
    const state = runDeterministicScenario('timer-queues-promise');
    expect(state.output).toEqual(['script', 'timer', 'promise from timer', 'later task']);
  });

  it('represents requestAnimationFrame inside rendering work', () => {
    const state = runDeterministicScenario('rendering-opportunity');
    expect(state.output).toContain('animation frame');
    expect(state.status).toBe('idle');
  });

  it('bounds recursive microtask production with an explicit warning', () => {
    const state = runDeterministicScenario('microtask-starvation');
    expect(state.output.filter((line) => line.startsWith('microtask')).length).toBe(5);
    expect(state.explanation).toContain('Later tasks and rendering');
  });

  it('requires an explicit valid choice between unrelated runnable task sources', () => {
    let state = createScenarioState('multiple-task-sources');
    for (let guard = 0; guard < 100 && state.status !== 'scheduler-choice'; guard += 1) {
      state = stepEventLoop(state);
    }

    expect(state.status).toBe('scheduler-choice');
    expect(state.choices.map((choice) => choice.source).sort()).toEqual([
      'timer',
      'user-interaction',
    ]);

    const timerChoice = state.choices.find((choice) => choice.source === 'timer');
    expect(timerChoice).toBeDefined();
    state = chooseRunnableTask(state, timerChoice!.id);
    expect(state.explanation).toContain('valid scheduling choice');
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm exec vitest run tests/browser-event-loop.test.ts
```

Expected: FAIL because `@/lib/learning/browser-event-loop` does not exist.

- [ ] **Step 3: Implement the minimum deterministic state machine**

Use predefined transition scripts rather than a JavaScript interpreter. A private transition shape can be:

```ts
type Transition = {
  status: EventLoopStatus;
  explanation: string;
  apply(state: EventLoopState): EventLoopState;
};
```

Each scenario owns an ordered transition list. `stepIndex` indexes the next transition. The multiple-task-sources transition must stop in `scheduler-choice` until `chooseRunnableTask()` receives one of the current `choices`; invalid choice IDs throw an error.

For starvation, model exactly five microtask outputs and then enter a `starvation-warning` explanation before completing. Never call `queueMicrotask()` in the simulator implementation.

- [ ] **Step 4: Run focused tests until GREEN**

```bash
pnpm exec vitest run tests/browser-event-loop.test.ts
```

Expected: all browser event-loop model tests pass.

- [ ] **Step 5: Run the full unit suite**

```bash
pnpm test
```

Expected: existing content/schema and async-schedule tests plus the new model tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/learning/browser-event-loop.ts tests/browser-event-loop.test.ts
git commit -m "feat: add browser event loop simulation model"
```

---

### Task 2: Add lesson navigation and MDX boundary with an intentional RED component reference

**Files:**
- Modify: `content/docs/programming/async/meta.json`
- Create: `content/docs/programming/async/how-the-browser-event-loop-works.mdx`
- Modify: `components/mdx.tsx`

**Interfaces:**
- Consumes: existing Fumadocs content schema and `getMDXComponents()` boundary.
- Produces: canonical route `/docs/programming/async/how-the-browser-event-loop-works` and MDX component name `<EventLoopLab />`.

- [ ] **Step 1: Add the navigation entry**

Set async `meta.json` pages to:

```json
{
  "title": "Asynchronous Programming",
  "pages": [
    "avoiding-sequential-async-waterfalls",
    "how-the-browser-event-loop-works"
  ]
}
```

- [ ] **Step 2: Add a schema-valid lesson skeleton**

Create the MDX file with approved metadata and enough initial content for the route:

```mdx
---
title: How the Browser Event Loop Actually Works
description: Understand run-to-completion, tasks, microtasks, rendering opportunities, and why Node.js has a different scheduling model.
category: programming
level: intermediate
status: evolving
lastVerified: 2026-08-20
reviewAfterDays: 180
topics:
  - javascript
  - browser
  - event-loop
  - microtasks
  - promises
  - rendering
  - performance
prerequisites:
  - promises
related:
  - async-waterfalls
  - promises
  - long-tasks
  - request-animation-frame
  - nodejs-event-loop
technologies:
  - javascript
  - html
  - browsers
  - nodejs
---

## TL;DR

Browser JavaScript runs the currently selected work to completion. After relevant work finishes, the browser coordinates microtask checkpoints, later tasks, and rendering-related work. Do not model the browser as one universal FIFO macrotask queue.

## Event Loop Lab

<EventLoopLab />
```

- [ ] **Step 3: Register the component before it exists**

Modify `components/mdx.tsx`:

```ts
import { AsyncWaterfallLab } from '@/components/learning/async-waterfall-lab';
import { EventLoopLab } from '@/components/learning/event-loop-lab';
// ...

return {
  ...defaultMdxComponents,
  AsyncWaterfallLab,
  EventLoopLab,
  Mermaid,
  ...components,
} satisfies MDXComponents;
```

- [ ] **Step 4: Run typecheck and verify RED**

```bash
pnpm typecheck
```

Expected: FAIL because `@/components/learning/event-loop-lab` does not exist.

- [ ] **Step 5: Commit the intentional RED boundary**

```bash
git add content/docs/programming/async/meta.json content/docs/programming/async/how-the-browser-event-loop-works.mdx components/mdx.tsx
git commit -m "test: define event loop lesson component boundary"
```

---

### Task 3: Build the specialized accessible `EventLoopLab`

**Files:**
- Create: `components/learning/event-loop-lab.tsx`
- Consume: `lib/learning/browser-event-loop.ts`

**Interfaces:**
- Consumes `EVENT_LOOP_SCENARIOS`, `createScenarioState`, `stepEventLoop`, `chooseRunnableTask`.
- Produces no reusable generic public API; only `export function EventLoopLab()`.

- [ ] **Step 1: Implement semantic UI state**

Use client state:

```ts
const [scenarioId, setScenarioId] = useState<ScenarioId>('promise-vs-timer');
const [state, setState] = useState(() => createScenarioState('promise-vs-timer'));
const [isRunning, setIsRunning] = useState(false);
```

Changing scenario calls `createScenarioState(nextId)` and stops auto-run.

- [ ] **Step 2: Implement accessible scenario controls**

Use a labelled native `<select>` for scenarios and native buttons for `Step`, `Run`, and `Reset`.

Required accessible names:

- `Event loop scenario`
- `Step`
- `Run` / `Pause`
- `Reset`

At `scheduler-choice`, show native buttons based on `state.choices`, such as `Run timer task` and `Run user-interaction task`.

- [ ] **Step 3: Render semantic state panels**

Render:

- current work;
- microtask queue as `<ol>`;
- runnable tasks grouped by source, with copy explicitly saying this is pedagogical grouping and does not imply one browser queue per source;
- animation-frame callbacks/rendering panel;
- output log as `<ol>`;
- explanation in a named region;
- status/progress text.

Empty queues must visibly say `Empty` instead of disappearing.

Use stable test IDs only for exact derived simulator state where role/name selectors would be brittle:

```tsx
<span data-testid="event-loop-status">{state.status}</span>
<ol data-testid="event-loop-output">...</ol>
```

- [ ] **Step 4: Implement auto-run without changing semantics**

Auto-run repeatedly calls `stepEventLoop()` with a short presentation delay (for example 550ms) only when:

- scenario is not complete;
- status is not `scheduler-choice`;
- status is not `starvation-warning`.

If a scheduler choice is reached, stop running and require learner input.

Clean up timers on unmount/scenario changes. Auto-run must never be the only way to advance; `Step` remains fully usable.

Under `prefers-reduced-motion: reduce`, visual transitions should be absent/instant. Do not change logical state timing or hide information.

- [ ] **Step 5: Verify typecheck turns GREEN**

```bash
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 6: Verify lint and unit suite**

```bash
pnpm lint
pnpm test
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/learning/event-loop-lab.tsx
git commit -m "feat: add interactive browser event loop lab"
```

---

### Task 4: Author the complete gold-standard lesson from primary sources

**Files:**
- Modify: `content/docs/programming/async/how-the-browser-event-loop-works.mdx`

**Source requirements:**

Before finalizing technical prose, re-check current primary sources:

- WHATWG HTML Standard event loops / tasks / microtask checkpoints / rendering updates.
- ECMAScript Jobs and `HostEnqueuePromiseJob`.
- Current Node.js official docs for event loop/timers/`process.nextTick()` comparison.
- MDN only as secondary explanation when useful.

**Required lesson sections:**

```md
## TL;DR
## Mental model
## Why this matters
## Run-to-completion
## Tasks are not one universal FIFO queue
## Microtasks and checkpoints
## Promise reactions and queueMicrotask()
## Timers mean later, not exactly on time
## Rendering opportunities and requestAnimationFrame()
## Event Loop Lab
## Multiple task sources and scheduler choice
## Starvation and responsiveness
## Browser versus Node.js
## Production considerations
## Exercise
## Agent rule
## Related concepts
## Sources
```

- [ ] **Step 1: Write the mental model and guaranteed ordering example**

Include the canonical example:

```ts
console.log('A');

setTimeout(() => console.log('timer'), 0);

Promise.resolve().then(() => console.log('promise'));

console.log('B');
```

Explain guaranteed teaching output:

```text
A
B
promise
timer
```

Do not generalize from this into one global task FIFO.

- [ ] **Step 2: Explain microtask draining and nested microtasks**

Include `queueMicrotask()` and a microtask that enqueues another microtask. State that microtasks produced during the checkpoint can run before the checkpoint finishes.

- [ ] **Step 3: Explain timers and rendering accurately**

State that timer delays are not exact execution deadlines. Use **rendering opportunity** language and explicitly state that paint is not guaranteed between arbitrary callbacks. Explain `requestAnimationFrame()` inside browser rendering work.

- [ ] **Step 4: Add simulator framing and implementation-defined scheduling section**

Immediately before `<EventLoopLab />`, summarize all six scenarios in prose so clean Markdown preserves the teaching content.

Explain that the multiple-task-sources scenario lets learners choose between two valid paths because the simplified example intentionally has no universal cross-source ordering guarantee.

- [ ] **Step 5: Add starvation, production, exercise, and agent rule**

Exercise must include synchronous logs, timer, Promise reaction, `queueMicrotask()`, and a nested microtask. Add a second question asking whether a paint is guaranteed between callbacks; answer **no**.

Agent rule must include all of:

- current work runs to completion;
- reason about microtask checkpoints separately;
- Promise reactions / `queueMicrotask()` are microtasks in the browser model;
- timers are later tasks, not precise deadlines;
- no global FIFO task-queue assumption;
- no guaranteed render between callbacks;
- do not copy browser scheduling rules directly into Node.js.

- [ ] **Step 6: Add primary sources and freshness metadata**

Keep `status: evolving`, `lastVerified: 2026-08-20`, `reviewAfterDays: 180`.

- [ ] **Step 7: Verify content schema and production build**

```bash
pnpm test
pnpm build
```

Expected: PASS and route appears in Next build output.

- [ ] **Step 8: Commit**

```bash
git add content/docs/programming/async/how-the-browser-event-loop-works.mdx content/docs/programming/async/meta.json components/mdx.tsx
git commit -m "docs: add browser event loop lesson"
```

---

### Task 5: Add browser, raw-Markdown, and accessibility contracts

**Files:**
- Create: `tests/e2e/browser-event-loop.spec.ts`

**Interfaces:**
- Route: `/docs/programming/async/how-the-browser-event-loop-works`
- Clean Markdown: same route plus `.md`.

- [ ] **Step 1: Add navigation test**

Navigate `/docs`, expand `Programming`, expand `Asynchronous Programming`, locate the exact lesson href, click it, and assert the page heading.

- [ ] **Step 2: Add default lab + stepping test**

Assert `Event Loop Lab` is visible. For the default `Promise vs timer` scenario, repeatedly click `Step` until complete, then assert output text/order equals:

```text
A
B
promise
timer
```

Use `page.getByTestId('event-loop-output').locator('li').allTextContents()` for exact ordered output.

- [ ] **Step 3: Add nested-microtask scenario test**

Select `nested-microtasks`, run/step to completion, assert `microtask A` precedes `microtask B` and status becomes `idle`.

- [ ] **Step 4: Add scheduler-choice test**

Select `multiple-task-sources`, step until the two choice buttons appear, assert both are visible, choose the timer path, and assert the explanation includes `valid scheduling choice`.

Reset, repeat with the user-interaction path, and assert that path is also accepted. This test exists specifically to prevent future code from hard-coding one cross-source ordering as “the” browser rule.

- [ ] **Step 5: Add rendering and bounded-starvation tests**

For rendering scenario, assert the UI reaches `rendering-opportunity` or `rendering-update` before output contains `animation frame`.

For starvation, assert exactly five bounded microtask outputs and visible warning copy explaining that later tasks/rendering cannot progress while new microtasks keep being produced.

- [ ] **Step 6: Add keyboard/control test**

Focus `Step`, activate with Enter, assert state advances. Focus `Reset`, activate with Space, assert initial state returns.

- [ ] **Step 7: Add raw Markdown test**

Fetch `${lessonPath}.md` and assert:

```ts
expect(markdown).toContain('# How the Browser Event Loop Actually Works');
expect(markdown).toContain('one universal FIFO');
expect(markdown).toContain('rendering opportunity');
expect(markdown).toContain('does not mean'); // timer precision paragraph can use equivalent exact phrase chosen in content
expect(markdown).toContain('Node.js');
expect(markdown).toContain('queueMicrotask');
```

Choose final exact assertions after lesson prose is fixed; do not weaken them to generic words.

- [ ] **Step 8: Add Edit-on-GitHub test**

Expected source href:

```text
https://github.com/thucne/software-development-atlas/edit/main/content/docs/programming/async/how-the-browser-event-loop-works.mdx
```

Use the established fallback that opens the page options menu if the link is not initially rendered.

- [ ] **Step 9: Add axe serious/critical gate**

Run `AxeBuilder({ page }).analyze()` and require zero `serious`/`critical` violations. Do not suppress rules.

- [ ] **Step 10: Run focused browser tests**

```bash
pnpm exec playwright install chromium
pnpm exec playwright test tests/e2e/browser-event-loop.spec.ts
```

Expected: all new tests pass.

- [ ] **Step 11: Commit**

```bash
git add tests/e2e/browser-event-loop.spec.ts
git commit -m "test: cover browser event loop lesson"
```

---

### Task 6: Full regression verification and evidence-based fixes

**Files:**
- Modify only files implicated by failing tests.

- [ ] **Step 1: Run permanent quality gate locally/through CI-equivalent commands**

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Expected: zero failures.

- [ ] **Step 2: Diagnose any failure before patching**

For a failing test, capture the exact assertion/axe/build error before changing code. Do not weaken accessibility thresholds or delete behavior assertions to make the suite green.

- [ ] **Step 3: Verify no accidental architecture expansion**

Compare branch to `main` and confirm there is no new dependency, no database/service integration, no Sandpack/WebContainers, no generic timeline component, and no unrelated refactor.

- [ ] **Step 4: Verify clean Markdown carries unique knowledge**

Read the generated `.md` route in browser test or production output and confirm the simulator is supplementary: task/microtask/rendering rules, scheduler-choice caveat, starvation, Node comparison, exercise reasoning, agent rule, and sources all exist as text.

- [ ] **Step 5: Commit any evidence-driven corrections**

Use focused messages such as:

```bash
git commit -m "fix: improve event loop lab accessibility"
git commit -m "fix: align event loop scenario semantics"
```

Do not create “cleanup” changes unrelated to a verified issue.

---

### Task 7: Final PR verification and review handoff

**Files:**
- Update PR #6 metadata only; no source changes unless verification exposes a defect.

- [ ] **Step 1: Run/confirm one fresh final CI on the exact branch head**

Required final evidence:

- frozen install PASS;
- lint PASS;
- typecheck PASS;
- full unit suite PASS;
- production build PASS;
- Chromium setup PASS;
- full combined browser/accessibility suite PASS.

- [ ] **Step 2: Compare `main...agent/event-loop`**

Document changed files and confirm the branch is not behind `main` at handoff time.

- [ ] **Step 3: Update PR #6 title/body**

Final title:

```text
feat: add interactive browser event loop lesson
```

Body should summarize:

- browser-first standards model;
- six deterministic scenarios;
- scheduler-choice teaching behavior;
- specialized simulator/pure state model;
- Node comparison boundary;
- accessibility and raw-Markdown support;
- exact final CI evidence;
- no generic learning abstraction or paid/runtime dependency added.

- [ ] **Step 4: Mark PR #6 ready for review**

Do **not** merge. The user retains the merge decision.

---

## Self-Review Checklist

Before execution, verify:

- Every spec requirement maps to a task above.
- No `TODO`, `TBD`, or “implement appropriate…” placeholders remain.
- Model names use `runnableTasksBySource`, never a misleading one-queue-per-source `taskQueues` abstraction.
- Rendering callback work uses `running-work`, not `running-task`.
- The scheduler-choice API is explicit and invalid choice IDs fail rather than silently choosing.
- The UI has no scheduling rules duplicated from the pure model.
- Browser tests verify both valid scheduler-choice branches.
- Accessibility stays at serious/critical zero violations with no exclusions.
- Raw Markdown assertions protect all essential non-interactive teaching content.
- No generic primitive extraction happens before lesson #3 provides more evidence.
