# Browser Event Loop Lesson Design

**Status:** Proposed — gold-standard lesson #2 / Phase 0.3 evidence-building  
**Date:** 2026-08-20  
**Branch:** `agent/event-loop`  
**Intended lesson title:** **How the Browser Event Loop Actually Works**

## 1. Purpose

This specification defines the second gold-standard interactive lesson for Software Development Atlas.

The lesson teaches the browser event loop accurately enough to survive common interview diagrams and runtime myths, while remaining approachable enough to build a durable mental model.

It is also an architecture probe for Phase 0.3. The first interactive lesson, **Avoiding Sequential Async Waterfalls**, introduced a purpose-built timeline. This lesson must test whether step/timeline concepts repeat without prematurely extracting a generic visualization framework.

The result must be useful to humans, experienced engineers, coding agents, and future Atlas contributors.

## 2. Scope classification

This work is architectural rather than a bounded content edit because it introduces a second interactive teaching model and intentionally tests cross-lesson reuse boundaries.

The implementation remains one lesson plus one specialized simulator and a pure scheduling model. It must not become a generic learning-component framework.

## 3. Primary teaching decision

The canonical model is the **browser / HTML event loop**.

Node.js appears later as a deliberately separate comparison. The lesson must not mix browser rendering, Node/libuv phases, and Node-specific queues into one universal diagram.

The title therefore uses **Browser Event Loop**, not a universal “JavaScript Event Loop” claim.

## 4. Central rule

> JavaScript runs the currently selected work to completion. Browser event-loop scheduling then coordinates later tasks, microtask checkpoints, and rendering-related work. Do not model the browser as one universal FIFO “macrotask queue,” and do not assume rendering happens after every callback.

A shorter agent-facing version appears near the end of the lesson.

## 5. Standards model to teach

The lesson is grounded primarily in the current WHATWG HTML Standard and ECMAScript specification.

### 5.1 Tasks are not one universal queue

HTML event loops have one or more **task queues**. Tasks have **task sources** used to group logically related work and preserve source-specific ordering requirements.

The event loop may choose among runnable task queues in an implementation-defined manner while preserving the ordering constraints that apply within a task source.

Therefore the lesson must not teach:

```text
macrotask queue = [everything FIFO]
```

as a platform guarantee.

For beginner-friendly prose, prefer the HTML-standard term **task**. “Macrotask” may be mentioned only as common informal terminology.

### 5.2 Microtasks are distinct

Each event loop has a **microtask queue** separate from its regular task queues.

After selected task work finishes, the HTML event loop performs a microtask checkpoint. During that checkpoint, microtasks are dequeued until the microtask queue is empty.

If a running microtask queues another microtask, that new microtask can run during the same checkpoint.

### 5.3 Promise reactions are language jobs integrated by the host

ECMAScript defines Promise-related Jobs and host hooks such as `HostEnqueuePromiseJob`. The browser host integrates those jobs with its scheduling model.

The lesson should explain the boundary without turning into an ECMAScript-agent deep dive:

- ECMAScript defines Promise Jobs;
- the host schedules them;
- for the browser application mental model, Promise reactions participate in microtask processing.

### 5.4 Run-to-completion

When JavaScript callback/script work is currently executing, unrelated later callbacks do not preempt it halfway through normal execution.

Use “run-to-completion” as the practical mental model while avoiding claims about OS scheduling or worker execution that are outside this page.

### 5.5 Timers establish eligibility, not exact execution time

A timer delay does not mean “run exactly N milliseconds later.” It controls when timer-related work can become eligible/runnable; actual callback execution depends on event-loop scheduling and other work.

The simulator must not present a `0ms` timer as immediate execution.

### 5.6 Rendering is browser-controlled

Use the phrase **rendering opportunity** and explicitly reject:

```text
one task -> all microtasks -> guaranteed paint -> next task
```

as a universal sequence.

The current HTML processing model allows the user agent to decide when rendering opportunities occur. Rendering-related work is queued via the rendering task source and processed through the rendering-update algorithm. The browser may skip unnecessary rendering or coalesce work.

`requestAnimationFrame()` callbacks run during the rendering update process when that rendering work occurs. They are not a generic queue that always runs immediately after microtasks.

### 5.7 Some cross-source ordering is intentionally unspecified

The simulator must distinguish:

- ordering guaranteed by the model; and
- one valid browser scheduling choice that is not a universal guarantee.

When unrelated task sources are simultaneously runnable, the lesson must not invent a standards-mandated ordering.

## 6. Lesson location and metadata

Canonical file:

```text
content/docs/programming/async/how-the-browser-event-loop-works.mdx
```

Navigation:

```text
Programming
└── Asynchronous Programming
    ├── Avoiding Sequential Async Waterfalls
    └── How the Browser Event Loop Actually Works
```

Recommended frontmatter:

```yaml
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
```

Metadata may be adjusted only to satisfy the existing schema or naming conventions; the teaching scope must not change during cleanup.

## 7. Lesson anatomy

The page follows the established Atlas anatomy.

### 7.1 TL;DR

State the practical ordering rule and immediately reject the universal macrotask-FIFO myth.

### 7.2 Mental model

Introduce four conceptual surfaces:

1. currently running JavaScript;
2. microtask queue;
3. runnable regular work grouped by task source;
4. browser rendering-related work.

The diagram must be explicitly labeled as a browser model.

### 7.3 Why this matters

Connect the model to real symptoms:

- Promise callback versus `setTimeout(..., 0)` ordering;
- UI freezes and long synchronous tasks;
- microtask-heavy code delaying later work;
- animation/rendering misconceptions;
- bugs caused by assuming one FIFO callback queue;
- code copied between browser and Node.js with incorrect scheduling assumptions.

### 7.4 Run-to-completion

Use a tiny synchronous example and show that current work finishes before later callbacks run.

### 7.5 Tasks versus microtasks

Introduce task terminology, Promise reactions, and `queueMicrotask()`.

### 7.6 Microtask checkpoints

Explain draining until empty, including newly queued microtasks.

### 7.7 Timers

Explain timer eligibility and why `setTimeout(fn, 0)` means later task work, not immediate execution.

### 7.8 Rendering opportunities

Explain browser-controlled rendering and place `requestAnimationFrame()` inside rendering updates rather than a simplistic post-microtask queue.

### 7.9 Event Loop Lab

Embed the deterministic simulator defined below.

### 7.10 Multiple task sources

Use the simulator’s scheduler-choice scenario to demonstrate that not every cross-source ordering is standardized.

### 7.11 Starvation and responsiveness

Cover both:

- long synchronous work blocking later progress;
- microtasks recursively producing more microtasks and delaying later progress.

Do not imply microtasks are inherently bad; the problem is excessive or unbounded work before progress can continue.

### 7.12 Browser versus Node.js

Keep this section intentionally bounded. Explain that Node.js has different runtime scheduling machinery, no browser rendering pipeline, APIs such as `setImmediate()`, and Node-specific `process.nextTick()` behavior.

Current Node.js documentation marks `process.nextTick()` as Legacy and recommends `queueMicrotask()` for most portable userland deferral needs.

Do not teach the full libuv phase model here. A dedicated Node event-loop lesson can go deeper.

### 7.13 Production considerations

Include:

- break up long CPU work or move appropriate work off the main thread;
- avoid unbounded recursive microtask production;
- do not rely on timer precision for correctness;
- do not use guessed scheduling order as synchronization;
- profile real browser behavior when responsiveness matters;
- workers have their own event-loop contexts and are outside this page’s primary model.

### 7.14 Exercise

Give a code-ordering problem with:

- synchronous logs;
- one timer;
- one Promise reaction;
- one `queueMicrotask()`;
- a microtask that queues another microtask.

Ask readers to predict the guaranteed output and explain it through the current task plus one microtask checkpoint.

A second mini-question asks whether a paint is guaranteed between two callbacks; the correct answer is no.

### 7.15 Agent rule

> In browser JavaScript, let the current work run to completion, then reason about microtask checkpoints separately from regular task scheduling. Promise reactions and `queueMicrotask()` run as microtasks; timers queue later task work and are not precise deadlines. Do not assume one global FIFO task queue, guaranteed rendering between callbacks, or browser scheduling rules in Node.js.

### 7.16 Sources and freshness

Primary sources:

- WHATWG HTML Standard — event loops, task queues, microtask checkpoints, rendering updates;
- ECMAScript — Jobs and `HostEnqueuePromiseJob`;
- current Node.js official docs for the comparison section.

MDN may supplement readability but must not override primary behavior.

The lesson remains `evolving` with a 180-day review target.

## 8. Interactive architecture

### 8.1 Chosen approach

Use a **deterministic scenario simulator**, not arbitrary JavaScript execution.

Why:

- deterministic tests;
- no Sandpack/WebContainer dependency;
- no accidental reliance on one browser implementation for teaching output;
- explicit representation of guaranteed versus implementation-defined choices;
- zero-cost and portable;
- explainable and accessible.

### 8.2 Explicit non-goal: JavaScript interpreter

The simulator does not parse or execute arbitrary code.

It models predefined scenarios using a small typed event-loop state machine. Code snippets are explanatory examples whose expected scheduling behavior is encoded in scenario definitions.

### 8.3 Proposed files

```text
lib/learning/browser-event-loop.ts
components/learning/event-loop-lab.tsx
tests/browser-event-loop.test.ts
tests/e2e/browser-event-loop.spec.ts
```

`AsyncWaterfallLab` stays unchanged unless a tiny identical accessibility/style helper emerges naturally. No generic timeline component is extracted in this PR.

## 9. Pure simulator model

The pure TypeScript module owns scenario state and transitions.

Representative shape:

```ts
type TaskSource =
  | 'script'
  | 'timer'
  | 'user-interaction'
  | 'networking'
  | 'rendering';

type WorkKind = 'task' | 'microtask' | 'animation-frame';

type WorkItem = {
  id: string;
  label: string;
  kind: WorkKind;
  source?: TaskSource;
};

type EventLoopState = {
  current: WorkItem | null;
  microtasks: WorkItem[];
  runnableTasksBySource: Partial<Record<TaskSource, WorkItem[]>>;
  animationFrameCallbacks: WorkItem[];
  output: string[];
  stepIndex: number;
  status:
    | 'running-work'
    | 'microtask-checkpoint'
    | 'scheduler-choice'
    | 'rendering-opportunity'
    | 'rendering-update'
    | 'idle';
};
```

`runnableTasksBySource` is deliberately **not** called `taskQueues`. It is a pedagogical grouping used by the simulator. Real user agents may coalesce task sources into task queues; the simulator must not imply a one-source-to-one-queue browser implementation.

The shape above is illustrative rather than an API freeze.

### 9.1 Transition granularity

A **Step** is one pedagogically meaningful transition, not one specification pseudocode line.

Examples:

- start current script work;
- queue timer task work;
- queue Promise microtask;
- finish current task;
- begin microtask checkpoint;
- run one microtask;
- finish checkpoint;
- choose one runnable task source;
- expose a rendering opportunity;
- queue/run rendering-related work;
- run animation-frame callback during rendering update;
- become idle.

Every transition has a concise explanation.

### 9.2 Determinism rule

Scenarios teaching guaranteed ordering are deterministic because only one standards-relevant next choice matters for the concept.

The scenario specifically about multiple task sources must **not hide implementation-defined choice**. It enters `scheduler-choice` and allows the learner to select between at least two valid runnable sources.

Both choices are then explained as valid under the simplified scenario.

### 9.3 No wall-clock simulation

The model does not simulate actual milliseconds.

For timer scenarios, a transition may say “timer becomes runnable.” The simulator teaches ordering/eligibility, not timer precision.

### 9.4 Bounded starvation model

Never create a real infinite microtask loop.

Use a bounded sequence such as five self-enqueuing microtasks, then show:

```text
More microtasks keep being produced.
Later tasks/rendering cannot make progress in this model until the checkpoint can finish.
```

The Atlas page must never be frozen by the demonstration.

## 10. Event Loop Lab UI

Specialized component:

```tsx
<EventLoopLab />
```

### 10.1 Core layout

Desktop may use two columns; mobile stacks.

The component contains:

- scenario selector;
- short source snippet or description;
- Step, Run, Reset controls;
- currently running work;
- microtask queue;
- runnable regular work grouped by task source;
- rendering / animation-frame area;
- output log;
- “Why this step?” explanation;
- progress text such as `Step 4 of 11` where the path is fixed.

### 10.2 Semantic-first visualization

Queues and groups are semantic headings/lists first and visual lanes second.

Example:

```text
Running JavaScript
[ initial script ]

Microtasks
[ promise.then ] [ queueMicrotask #1 ]

Runnable tasks grouped by source
Timer            [ timeout ]
User interaction [ click ]
Networking       [ response ]

Rendering-related work
rAF callbacks    [ animate ]
```

Visible copy must explain that grouping by source is pedagogical and does not claim each source maps to its own browser queue.

### 10.3 Step

`Step` advances one transition.

At `scheduler-choice`, it does not silently choose. The UI presents native buttons such as:

```text
Choose one valid runnable source:
[ Timer task ] [ User-interaction task ]
```

### 10.4 Run

For deterministic scenarios, `Run` advances remaining transitions at a readable pace.

Auto-run pauses at scheduler-choice states.

With `prefers-reduced-motion: reduce`, animated transitions are disabled or effectively instantaneous while semantic state changes remain identical.

### 10.5 Reset and scenario change

Reset returns the exact initial scenario state and output.

Changing scenarios also resets state.

### 10.6 Explanation panel

Each transition has visible explanatory text, for example:

```text
The initial script task finished. The browser now performs a microtask checkpoint before selecting later regular task work.
```

or:

```text
Both sources have runnable work. The HTML Standard does not define one universal FIFO order across unrelated task queues, so either selection can be valid here.
```

No essential explanation is hover-only.

## 11. Required scenarios

Ship exactly six unless implementation reveals a standards ambiguity that cannot otherwise be explained.

### Scenario 1 — Promise reaction versus timer

Conceptual source:

```js
console.log('A');
setTimeout(() => console.log('timer'), 0);
Promise.resolve().then(() => console.log('promise'));
console.log('B');
```

Controlled-scenario output:

```text
A
B
promise
timer
```

Teach run-to-completion, Promise microtasks, timer task work, and the post-task microtask checkpoint.

### Scenario 2 — A microtask queues another microtask

Teach that the checkpoint drains until empty and newly queued microtasks can run during the same checkpoint.

### Scenario 3 — Timer task queues a Promise reaction

Teach that after the timer task runs, its Promise reaction participates in the following microtask checkpoint before later regular task selection.

### Scenario 4 — Rendering opportunity and `requestAnimationFrame()`

Teach:

- rendering opportunities are browser-controlled;
- rendering-related task work is scheduled when opportunities occur;
- `requestAnimationFrame()` callbacks run within the rendering update process;
- no rule guarantees a paint after every ordinary task.

Show at least one valid path where two ordinary tasks occur without an intervening rendering update.

### Scenario 5 — Microtask starvation

Teach that continuously producing microtasks can prevent a checkpoint from becoming empty and delay later event-loop progress.

Use bounded simulation only.

### Scenario 6 — Multiple task sources and scheduler choice

Provide simultaneously runnable work from two unrelated sources such as timer and user interaction.

Pause at scheduler-choice and allow either path.

Distinguish source-local ordering from cross-queue selection freedom.

## 12. Relationship to AsyncWaterfallLab

Do **not** refactor `AsyncWaterfallLab` into a generic primitive in this PR.

After this lesson, compare the two implementations for proven repetition:

- bordered interactive card;
- run/step/reset controls;
- reduced-motion behavior;
- semantic fallback data;
- active-step/timeline visualization;
- explanation/output areas.

The expected next lesson is **Promises**. After a third gold-standard lesson, Phase 0.3 can make an evidence-based extraction decision unless a truly identical low-level helper emerges earlier.

## 13. Accessibility contract

The simulator must remain useful without motion or color.

Requirements:

- accessible scenario selector label;
- native controls for Step, Run, Reset, and scheduler choices;
- queue/source groups represented with semantic headings and lists;
- current work indicated textually, not only by color;
- visible step explanation;
- semantic output log;
- conservative `aria-live="polite"` only for concise step summaries if needed;
- keyboard operation for all controls and scheduler choices;
- no unexpected focus jumps during stepping;
- reduced-motion parity;
- no serious or critical axe violations;
- retain the site’s high-contrast syntax theme.

Horizontally scrollable panels, if any, follow the focusable-region pattern already proven in `AsyncWaterfallLab`.

## 14. Raw Markdown and agent compatibility

The simulator contains no unique knowledge.

Canonical MDX must independently state:

- deterministic scenario output and reasoning;
- microtask checkpoints drain until empty;
- timers are not exact deadlines;
- the browser does not have one universal FIFO macrotask queue;
- rendering opportunities are browser-controlled;
- `requestAnimationFrame()` belongs to rendering updates;
- browser and Node.js scheduling differ;
- the agent rule.

The clean `.md` route remains a complete technical lesson.

## 15. Node.js comparison boundary

The Node.js comparison is one focused section, not a second hidden lesson.

Required contrasts:

| Browser | Node.js |
| --- | --- |
| HTML task sources/task queues | Node/libuv runtime scheduling machinery |
| browser rendering pipeline | no browser rendering pipeline |
| `requestAnimationFrame()` is tied to rendering | no direct rendering equivalent; Node has different APIs such as `setImmediate()` for different scheduling needs |
| Promise microtasks integrated by browser host | Promise microtasks plus Node-specific mechanisms such as `process.nextTick()` |

Mention current Node guidance that `process.nextTick()` has its own next-tick queue and is marked Legacy, with `queueMicrotask()` preferred for most portable userland deferral.

Do not require CommonJS-versus-ESM ordering trivia in the main lesson. Include it only if a chosen Node example would otherwise be misleading.

Do not build a Node simulator.

## 16. Error and edge-case handling

Scenario definitions are repository-owned static data, so malformed definitions are developer errors.

The pure model should reject malformed definitions where practical, including:

- duplicate work-item IDs;
- scheduler choice with no options;
- transition references to unknown work;
- invalid step progression.

No arbitrary scenario JSON editing is exposed to readers.

Unexpected runtime state should render a readable component-level fallback rather than crash the whole docs page.

## 17. Testing strategy

### 17.1 Pure model unit tests

Cover at minimum:

1. Scenario 1 produces `A`, `B`, `promise`, `timer`;
2. microtask checkpoint drains a newly queued microtask before completing;
3. timer task followed by Promise reaction enters microtask processing before later regular task selection;
4. starvation scenario remains bounded;
5. scheduler-choice exposes both valid sources;
6. reset returns the exact initial state;
7. malformed static scenario definitions are rejected if validation exists at the model boundary.

### 17.2 Browser tests

Cover:

1. lesson is reachable through Programming → Asynchronous Programming navigation;
2. default scenario renders expected initial state;
3. Step reaches the expected microtask state;
4. Run reaches expected output for deterministic Scenario 1;
5. Reset restores the scenario;
6. changing scenarios resets state;
7. scheduler-choice exposes at least two valid choices and accepts keyboard activation;
8. reduced-motion mode still exposes state changes and explanations;
9. clean Markdown contains the essential standards explanation and Node boundary;
10. Edit-on-GitHub targets the canonical MDX file;
11. serious/critical axe scan is clean.

### 17.3 Existing gate

Permanent CI remains:

```text
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Do not permanently split CI into per-test diagnostic steps. Temporary branch-only diagnostics are allowed only when needed and must be removed before final verification.

## 18. Source verification requirements

Implementation-time factual claims are checked against current primary documentation.

Primary references:

- WHATWG HTML Standard — https://html.spec.whatwg.org/multipage/webappapis.html
- ECMAScript Jobs / host operations — https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html
- Node.js timers — https://nodejs.org/api/timers.html
- Node.js process / `process.nextTick()` — https://nodejs.org/api/process.html

Secondary references may supplement readability but cannot override primary behavior.

## 19. Zero-cost and portability constraints

No:

- LLM/model API;
- database;
- vector search;
- telemetry vendor;
- code-execution SaaS;
- Sandpack;
- WebContainers;
- remote simulator service;
- object storage.

All scenarios and simulation logic live in the repository and run locally in the browser.

## 20. Non-goals

This PR does not:

- execute arbitrary JavaScript;
- implement a JavaScript parser/interpreter;
- deeply teach Node.js event-loop phases;
- simulate real wall-clock timing;
- invent task-source ordering left implementation-defined;
- model workers in depth;
- model every rendering algorithm step;
- extract generic `ExecutionTimeline`, `LearningLab`, or queue framework components;
- add Sandpack/WebContainers;
- redesign the docs shell.

## 21. Definition of done

The lesson is ready when:

- written content accurately teaches the browser-first model;
- all six scenarios work deterministically where the standards give deterministic teaching constraints;
- multiple-task-source choice is represented explicitly rather than invented;
- rendering language never promises paint after every callback;
- browser and Node.js models are clearly separated;
- simulator knowledge remains available in canonical MDX/raw Markdown;
- keyboard, reduced-motion, and accessibility checks pass;
- docs/search/raw-Markdown/Edit-on-GitHub behavior remains intact;
- permanent CI is green on the exact final branch;
- no generic learning primitive is extracted without stronger evidence.

## 22. Post-lesson architectural question

After this lesson lands, record what actually repeated between `AsyncWaterfallLab` and `EventLoopLab`.

The expected next lesson remains **Promises**. After that third lesson, Phase 0.3 should decide whether to extract reusable primitives such as:

- execution/step timeline;
- code comparison;
- agent-rule presentation;
- challenge/exercise shell;
- freshness/source presentation.

The extraction decision must be based on repeated authored code and UX needs, not speculative component names.
