# Browser Event Loop Lesson Design

**Status:** Proposed for Phase 0.3 evidence-building / gold-standard lesson #2  
**Date:** 2026-08-20  
**Branch:** `agent/event-loop`  
**Intended lesson title:** **How the Browser Event Loop Actually Works**

## 1. Purpose

This specification defines the second gold-standard interactive lesson for Software Development Atlas.

The lesson teaches the browser event loop accurately enough to survive common interview diagrams and runtime myths, while remaining approachable enough to build a durable mental model.

It is also an architecture probe for Phase 0.3. The first interactive lesson, **Avoiding Sequential Async Waterfalls**, introduced a purpose-built timeline. This lesson must deliberately test whether timeline/step concepts repeat without prematurely extracting a generic `ExecutionTimeline` component.

The result must be useful to:

- human readers learning or correcting their browser scheduling mental model;
- experienced engineers diagnosing ordering, responsiveness, or rendering problems;
- coding agents that need concise, machine-readable scheduling rules;
- future Atlas contributors deciding whether repeated learning primitives are now proven.

## 2. Scope classification

This work is architectural rather than a bounded content edit because it introduces a second interactive teaching model and intentionally tests cross-lesson reuse boundaries.

The implementation remains one lesson plus one specialized simulator and a pure scheduling model. It must not become a generic visualization framework.

## 3. Primary teaching decision

The canonical model is the **browser / HTML event loop**.

Node.js appears later as a deliberately separate comparison. The lesson must not mix browser rendering, Node/libuv phases, and Node-specific queues into one universal diagram.

The title therefore uses **Browser Event Loop**, not a universal “JavaScript Event Loop” claim.

## 4. Central rule

The lesson should leave readers with this durable rule:

> JavaScript runs the currently selected work to completion. Browser event-loop scheduling then coordinates later tasks, microtask checkpoints, and rendering-related work. Do not model the browser as one universal FIFO “macrotask queue,” and do not assume rendering happens after every callback.

A shorter agent-facing version appears near the end of the lesson.

## 5. Standards model to teach

The lesson should be grounded primarily in the current WHATWG HTML Standard and ECMAScript specification.

### 5.1 Tasks are not one universal queue

HTML event loops have one or more **task queues**. Tasks have **task sources** used to preserve ordering relationships and group logically related work.

The event loop may choose among runnable task queues in an implementation-defined manner while preserving the ordering requirements that apply within a task source.

Therefore the lesson must not teach:

```text
macrotask queue = [everything FIFO]
```

as a platform guarantee.

For beginner-friendly prose, the term **task** is preferred. “Macrotask” may be mentioned only as common informal terminology, with a note that HTML standard terminology is “task.”

### 5.2 Microtasks are a distinct queue

Each event loop has a **microtask queue** separate from its regular task queues.

After a selected task finishes, the HTML event loop performs a microtask checkpoint. During that checkpoint, microtasks are dequeued until the microtask queue is empty.

If a running microtask queues another microtask, the new microtask can run during the same checkpoint before the queue becomes empty.

This property is central to the starvation scenario.

### 5.3 Promise reactions are language jobs integrated by the host

ECMAScript defines Promise-related Jobs and host hooks such as `HostEnqueuePromiseJob`. The browser host integrates those jobs with its scheduling model.

The lesson should explain this boundary without turning into an ECMAScript execution-agent deep dive:

- ECMAScript defines Promise Jobs;
- the host schedules them;
- in the browser mental model relevant to application authors, Promise reactions participate in microtask processing.

### 5.4 Run-to-completion

When JavaScript callback/script work is currently executing, unrelated later callbacks do not preempt it halfway through normal execution.

The lesson can use “run-to-completion” as the practical mental model, while avoiding claims about OS-level preemption or workers that are outside this page’s scope.

### 5.5 Timers establish eligibility, not exact execution time

A timer delay does not mean “run exactly N milliseconds later.” It controls when timer-related work can become eligible/runnable; actual callback execution depends on the event loop and other work.

The simulator therefore must not present a `0ms` timer as immediate execution.

### 5.6 Rendering is browser-controlled

The lesson must use the phrase **rendering opportunity** and avoid the outdated oversimplification:

```text
one task -> all microtasks -> guaranteed paint -> next task
```

The current HTML processing model allows the browser to decide when rendering opportunities occur. Rendering-related work is scheduled through the rendering task source and the rendering update algorithm. A user agent may also skip unnecessary rendering or coalesce work.

`requestAnimationFrame()` callbacks run as part of the rendering update process when that rendering work occurs. They are not a generic “queue that always runs after microtasks.”

### 5.7 Multiple task-source ordering can be intentionally unspecified

The simulator must distinguish:

- ordering that is guaranteed by the model; and
- ordering that is one valid browser scheduling choice but not a universal guarantee.

When unrelated task sources are simultaneously runnable, the lesson must not invent a standard-mandated ordering.

## 6. Lesson location and metadata

Recommended canonical file:

```text
content/docs/programming/async/how-the-browser-event-loop-works.mdx
```

It remains under:

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

Exact metadata values may be adjusted only to satisfy the existing schema or established Atlas naming conventions. The teaching scope must not change during such cleanup.

## 7. Lesson anatomy

The page follows the established Atlas lesson anatomy, adapted to this topic.

### 7.1 TL;DR

State the practical ordering rule and immediately reject the universal “macrotask FIFO” myth.

### 7.2 Mental model

Introduce four conceptual surfaces:

1. currently running JavaScript;
2. microtask queue;
3. regular task queues / task sources;
4. browser rendering-related work.

The diagram must clearly label the browser model rather than a universal JavaScript runtime.

### 7.3 Why this matters

Connect the model to real engineering symptoms:

- “Why did my Promise callback run before my `setTimeout(..., 0)`?”
- UI freezes and long synchronous tasks;
- microtask-heavy code delaying other work;
- animation/rendering misconceptions;
- ordering bugs caused by assuming one FIFO callback queue;
- code copied between browser and Node.js with incorrect scheduling assumptions.

### 7.4 Run-to-completion

Use a tiny synchronous example and show that the current task finishes before later callbacks run.

### 7.5 Tasks versus microtasks

Introduce HTML-standard task terminology, Promise reactions, and `queueMicrotask()`.

### 7.6 Microtask checkpoints

Explain draining until empty, including newly queued microtasks.

### 7.7 Timers

Explain timer eligibility and why `setTimeout(fn, 0)` means “later task,” not “immediately after this line.”

### 7.8 Rendering opportunities

Explain that rendering timing is browser-controlled and that `requestAnimationFrame()` belongs to rendering updates, not a simplistic post-microtask queue.

### 7.9 Event Loop Lab

Embed the deterministic simulator defined below.

### 7.10 Multiple task sources

Use the simulator’s scheduler-choice scenario to demonstrate that not every cross-source ordering is standardized.

### 7.11 Starvation and responsiveness

Cover both:

- long synchronous tasks blocking later event-loop progress;
- microtasks recursively producing more microtasks and delaying later work.

The lesson should not suggest that microtasks are inherently bad; the issue is unbounded or excessive work before progress can continue.

### 7.12 Browser versus Node.js

Keep this section intentionally bounded. Explain that Node.js has different runtime scheduling machinery, no browser rendering pipeline, APIs such as `setImmediate()`, and Node-specific `process.nextTick()` behavior.

Current Node.js documentation marks `process.nextTick()` as legacy in favor of `queueMicrotask()` for most userland deferral needs. The lesson may mention this as a contemporary runtime distinction, but must not turn into a Node phase tutorial.

A future dedicated Node event-loop lesson can go deeper.

### 7.13 Production considerations

Include:

- break up long CPU work or move appropriate work off the main thread;
- avoid unbounded recursive microtask production;
- do not rely on timer precision for correctness;
- do not use guessed scheduling order as synchronization;
- profile real browser behavior when responsiveness matters;
- remember workers have their own event-loop contexts and are outside this page’s primary model.

### 7.14 Exercise

Give a code-ordering problem that includes:

- synchronous logs;
- one timer;
- one Promise reaction;
- one `queueMicrotask()`;
- a microtask that queues another microtask.

Ask readers to predict the guaranteed portion of the output, then explain it in terms of the current task and one microtask checkpoint.

A second mini-question should ask whether a paint is guaranteed between two callbacks; the correct answer is no.

### 7.15 Agent rule

Recommended rule:

> In browser JavaScript, let the current work run to completion, then reason about microtask checkpoints separately from regular task queues. Promise reactions and `queueMicrotask()` run as microtasks; timers queue later tasks and are not precise deadlines. Do not assume one global FIFO task queue, guaranteed rendering between callbacks, or browser scheduling rules in Node.js.

### 7.16 Sources and freshness

Primary sources should include:

- WHATWG HTML Standard — event loops, task queues, microtask checkpoints, rendering update processing;
- ECMAScript — Jobs and `HostEnqueuePromiseJob`;
- MDN only where a more approachable secondary explanation materially helps;
- current Node.js official documentation for the comparison section.

The lesson remains `evolving` with a 180-day review target because browser scheduling specification details and Node runtime guidance can change.

## 8. Interactive architecture

### 8.1 Chosen approach

Use a **deterministic scenario simulator**, not arbitrary JavaScript execution.

Why:

- deterministic tests;
- no Sandpack/WebContainer dependency;
- no accidental reliance on one browser implementation for teaching output;
- allows explicit representation of guaranteed versus implementation-defined choices;
- preserves the zero-cost boundary;
- keeps the visualization explainable and accessible.

### 8.2 Explicit non-goal: JavaScript interpreter

The simulator does not parse or execute arbitrary code.

It models predefined scenarios using a small typed event-loop state machine. Code snippets shown beside scenarios are explanatory source examples whose expected scheduling behavior is encoded in the scenario definition.

This avoids building an interpreter, instrumentation runtime, or sandbox inside the lesson.

### 8.3 Proposed files

```text
lib/learning/browser-event-loop.ts
components/learning/event-loop-lab.tsx
tests/browser-event-loop.test.ts
tests/e2e/browser-event-loop.spec.ts
```

The existing `AsyncWaterfallLab` stays unchanged unless a tiny proven accessibility/style helper is shared naturally. No generic timeline component should be extracted in this PR.

## 9. Pure simulator model

The pure TypeScript module owns scenario state and transitions.

A representative shape:

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
  taskQueues: Partial<Record<TaskSource, WorkItem[]>>;
  animationFrameCallbacks: WorkItem[];
  output: string[];
  stepIndex: number;
  status:
    | 'running-task'
    | 'microtask-checkpoint'
    | 'scheduler-choice'
    | 'rendering-opportunity'
    | 'rendering-update'
    | 'idle';
};
```

This is illustrative, not an API freeze. The implementation plan may refine names while preserving the boundaries below.

### 9.1 Transition granularity

A simulator **Step** represents one pedagogically meaningful scheduling transition, not one line of specification pseudocode.

Examples:

- start the current script task;
- queue a timer task;
- queue a Promise microtask;
- finish current task;
- begin microtask checkpoint;
- run one microtask;
- finish checkpoint;
- choose one runnable task source;
- expose a rendering opportunity;
- run rendering update / animation-frame callbacks;
- become idle.

The explanation panel must say what changed and why.

### 9.2 Determinism rule

Scenarios that teach guaranteed ordering must be deterministic because only one standard-valid next choice matters for the concept.

The one scenario specifically about multiple task sources must **not hide implementation-defined choice**. It should enter `scheduler-choice` state and allow the learner to select between at least two valid runnable task sources.

The UI then explains that both paths are valid under the simplified scenario because the platform does not guarantee a universal ordering between those unrelated sources.

This is preferable to hard-coding an arbitrary scheduler and accidentally teaching it as a rule.

### 9.3 No wall-clock simulation

The model does not simulate real milliseconds.

For timer scenarios, a transition may say “timer becomes runnable” after its threshold. The simulator teaches ordering/eligibility, not timer precision.

### 9.4 Bounded starvation model

The starvation scenario must never create an actual infinite loop or recursive browser microtask chain.

Use a bounded sequence, for example five self-enqueuing microtasks, then enter a pedagogical warning state:

```text
More microtasks keep being produced.
Later tasks/rendering cannot make progress in this model until the checkpoint can finish.
```

The simulator may offer “Stop chain” or simply end the scenario with the explanation. It must not freeze the actual Atlas page.

## 10. Event Loop Lab UI

The specialized component should be named:

```tsx
<EventLoopLab />
```

### 10.1 Core layout

Desktop layout can use two columns; mobile stacks vertically.

The component contains:

- scenario selector;
- short scenario source snippet or description;
- Step, Run, and Reset controls;
- currently running work panel;
- microtask queue panel;
- regular task-source queues panel;
- rendering / animation-frame panel;
- output log;
- “Why this step?” explanation panel;
- progress indicator such as `Step 4 of 11` where the scenario has a fixed path.

### 10.2 Queue visual design

Queues should be rendered as semantic lists first and visual lanes second.

Possible presentation:

```text
Running JavaScript
┌────────────────────────────┐
│ initial script             │
└────────────────────────────┘

Microtasks
[ promise.then ] [ qMT #1 ]

Tasks
Timer            [ timeout ]
User interaction [ click ]
Networking       [ response ]

Rendering
rAF callbacks    [ animate ]
```

Do not visually imply that every task source always has its own browser queue; the UI is a pedagogical grouping of task sources/runnable work. Copy must explain that browsers can coalesce task sources into task queues.

### 10.3 Step control

`Step` advances one transition.

When the next state is a scheduler choice, Step should not silently choose. The UI presents the valid choices as buttons, for example:

```text
Choose one valid runnable source:
[ Timer task ] [ User-interaction task ]
```

### 10.4 Run control

For deterministic scenarios, `Run` advances through the remaining transitions at a readable pace.

If execution reaches a scheduler-choice state, auto-run pauses and requires a learner choice.

Under `prefers-reduced-motion: reduce`, automatic animated transitions should be disabled or effectively instantaneous while all state changes remain available through semantic content.

### 10.5 Reset

Reset restores the selected scenario’s initial state and output.

Changing scenarios also resets state.

### 10.6 Explanation panel

Every transition includes a concise explanation such as:

```text
The initial script task finished. The browser now performs a microtask checkpoint before selecting later task work.
```

or:

```text
Both the timer and interaction task sources are runnable. The HTML Standard does not define one universal FIFO order across unrelated task queues, so either selection can be valid here.
```

This explanation is part of the accessible experience, not hover-only UI.

## 11. Required scenarios

Ship six scenarios. Do not add more unless one is required to clarify a standards ambiguity during implementation.

### Scenario 1 — Promise reaction versus timer

Source concept:

```js
console.log('A');
setTimeout(() => console.log('timer'), 0);
Promise.resolve().then(() => console.log('promise'));
console.log('B');
```

Teaching outcome:

```text
A
B
promise
timer
```

within this controlled scenario.

Reasoning:

- synchronous script runs to completion;
- the Promise reaction is a microtask;
- the timer callback is later regular task work;
- the microtask checkpoint happens after the current task finishes.

### Scenario 2 — A microtask queues another microtask

Teach that the checkpoint drains until empty, so newly queued microtasks can execute during the same checkpoint.

### Scenario 3 — Timer task queues a Promise reaction

Teach that once the timer task starts and finishes, its newly queued Promise reaction participates in the following microtask checkpoint before later regular task work is selected.

### Scenario 4 — Rendering opportunity and `requestAnimationFrame()`

Teach:

- a rendering opportunity is controlled by the browser;
- rendering-related work can be scheduled when an opportunity occurs;
- `requestAnimationFrame()` callbacks run during the rendering update process;
- no rule says every ordinary task is followed by a paint.

The scenario should show at least one path where two ordinary tasks can occur without an intervening rendering update, to break the “task -> paint” myth.

### Scenario 5 — Microtask starvation

Teach that continuously producing microtasks can prevent the checkpoint from becoming empty and therefore delay later event-loop progress.

Use a bounded simulation only.

### Scenario 6 — Multiple task sources and scheduler choice

Provide simultaneously runnable tasks from two unrelated sources such as timer and user interaction.

Pause at a scheduler-choice state and allow either path.

Copy must distinguish:

- source-local ordering constraints; and
- cross-queue selection freedom.

## 12. Relationship to AsyncWaterfallLab

This PR intentionally does **not** refactor `AsyncWaterfallLab` into a generic primitive.

After implementation, compare the two lessons for repeated patterns:

- bordered interactive lesson card;
- play/step/reset controls;
- reduced-motion behavior;
- semantic fallback data;
- active-step/timeline visualization;
- explanation/output areas.

Only after the Promises lesson or another third example should Phase 0.3 extract a generic primitive unless a truly identical low-level helper emerges naturally.

This is the architectural experiment the lesson is supposed to support.

## 13. Accessibility contract

The component must remain useful without interpreting motion or color.

Requirements:

- scenario selector has an accessible label;
- Step, Run, Reset, and scheduler-choice controls are native buttons/select controls where appropriate;
- each queue is represented by semantic headings and lists;
- the active/current work item is indicated textually, not only by color;
- step explanation is visible text;
- output log is semantic text and not solely an animation;
- live announcements should be conservative; use `aria-live="polite"` only for a concise step summary rather than re-announcing the entire simulator;
- keyboard operation covers all controls and scheduler choices;
- focus must not jump unexpectedly when stepping;
- reduced-motion users receive the same state transitions without required animation;
- no serious or critical axe violations;
- syntax highlighting must retain the high-contrast theme established by the previous lesson.

If panels become horizontally scrollable, they must follow the established focusable-region pattern already proven by `AsyncWaterfallLab`.

## 14. Raw Markdown and agent compatibility

The simulator must not contain unique knowledge.

The MDX lesson must independently state:

- the expected output of deterministic scenarios;
- why Promise reactions beat the timer in the introductory scenario;
- that microtask checkpoints drain until empty;
- that timers are not exact deadlines;
- that the browser has multiple task queues/task sources rather than one universal FIFO macrotask queue;
- that rendering opportunities are browser-controlled;
- that `requestAnimationFrame()` belongs to rendering work;
- that browser and Node.js scheduling models differ;
- the agent rule.

The clean `.md` route must therefore remain a complete technical lesson for agents and non-interactive consumers.

## 15. Node.js comparison boundary

The Node.js section should be approximately one focused section, not a second lesson hidden inside this one.

Required contrasts:

| Browser model | Node.js comparison |
| --- | --- |
| HTML event loop/task sources | Node/libuv event-loop runtime machinery |
| rendering opportunities | no browser rendering pipeline |
| `requestAnimationFrame()` | `setImmediate()` and Node timer/I/O APIs instead |
| browser-hosted Promise microtasks | Promise microtasks plus Node-specific scheduling such as `process.nextTick()` |

The section should mention contemporary Node guidance:

- `process.nextTick()` has a separate next-tick queue;
- current Node documentation marks it Legacy and recommends `queueMicrotask()` for most portable userland deferral needs;
- CommonJS versus ESM can affect simple `nextTick`/microtask ordering examples because ESM evaluation itself participates in microtask processing.

Do not create a Node simulator in this PR.

## 16. Error and edge-case handling

Because scenarios are static data owned by the repository, invalid scenario definitions are developer errors rather than user input errors.

The pure model should fail clearly in tests for malformed definitions such as:

- duplicate work-item IDs;
- scheduler choice with no valid options;
- unknown work item referenced by a transition;
- negative or impossible step index if such values are representable.

The UI should not expose arbitrary scenario JSON editing.

If an unexpected state still occurs in production, render a readable fallback message rather than crashing the entire docs page.

## 17. Testing strategy

### 17.1 Pure model unit tests

Cover at minimum:

1. introductory scenario produces `A`, `B`, `promise`, `timer`;
2. microtask checkpoint drains a newly queued microtask before completing;
3. timer task followed by Promise reaction enters microtask processing before later task selection;
4. starvation scenario remains bounded and never creates an infinite transition loop;
5. scheduler-choice state exposes both valid task-source choices;
6. reset returns the exact initial state;
7. invalid static scenario definitions are rejected if validation is implemented in the model boundary.

### 17.2 Browser tests

Add Playwright coverage for:

1. lesson appears under Programming → Asynchronous Programming navigation;
2. default scenario renders expected initial state;
3. Step moves from script completion into the expected microtask state;
4. Run reaches expected output for deterministic Scenario 1;
5. Reset restores the scenario;
6. changing scenarios resets state;
7. scheduler-choice scenario exposes at least two valid choices and accepts keyboard activation;
8. reduced-motion mode still allows all state changes and exposes text explanations;
9. clean Markdown contains the essential standards explanation and Node boundary;
10. Edit-on-GitHub targets the canonical MDX file;
11. serious/critical axe scan is clean.

### 17.3 Existing gate

The permanent CI gate remains:

```text
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Do not split permanent CI into per-test diagnostic steps. Temporary diagnostics may be used on the feature branch only if a failure cannot otherwise be isolated, and must be removed before final verification.

## 18. Source verification requirements

Implementation-time factual claims must be checked against current primary documentation rather than recalled from common event-loop diagrams.

Primary references for this design:

- WHATWG HTML Standard, Web application APIs / event loops: https://html.spec.whatwg.org/multipage/webappapis.html
- ECMAScript, Jobs and host enqueue operations: https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html
- Node.js current timers documentation: https://nodejs.org/api/timers.html
- Node.js current process / `process.nextTick()` documentation: https://nodejs.org/api/process.html

Secondary references such as MDN may be added for readability, but must not override primary-standard behavior.

## 19. Zero-cost and portability constraints

This lesson introduces no paid or runtime hosted dependency.

Specifically, it requires no:

- LLM/model API;
- database;
- vector search;
- telemetry vendor;
- code-execution SaaS;
- Sandpack dependency;
- WebContainers dependency;
- remote simulator service;
- object storage.

All scenarios and simulation logic ship in the repository and run locally in the browser.

## 20. Non-goals

This PR does not:

- implement arbitrary JavaScript execution;
- implement a JavaScript parser/interpreter;
- implement Node.js event-loop phases in depth;
- simulate actual wall-clock timing;
- guarantee browser task-source ordering the standard leaves implementation-defined;
- model workers in depth;
- model every rendering step in the HTML specification;
- teach networking internals;
- extract generic `ExecutionTimeline`, `LearningLab`, `QueueVisualizer`, or similar framework components;
- add Sandpack or WebContainers;
- redesign the docs shell.

## 21. Definition of done

The phase is complete when:

- the written lesson accurately teaches the browser-first model;
- all six simulator scenarios work deterministically where the standard gives deterministic teaching constraints;
- the multiple-task-source scenario explicitly represents implementation-defined choice instead of inventing a guarantee;
- rendering language avoids promising paint after every callback;
- browser and Node.js models are clearly separated;
- simulator knowledge is duplicated in readable canonical MDX rather than trapped in UI state;
- accessibility and reduced-motion requirements pass automated checks and keyboard verification;
- existing docs/search/raw-Markdown/Edit-on-GitHub behavior remains intact;
- permanent CI is green on the exact final branch;
- no generic learning primitive is extracted without evidence from a third lesson.

## 22. Post-lesson architectural question

After this lesson lands, record what actually repeated between `AsyncWaterfallLab` and `EventLoopLab`.

The expected next lesson remains **Promises**. After that third gold-standard lesson, Phase 0.3 should make an evidence-based decision about extracting reusable primitives such as:

- execution/step timeline;
- code comparison;
- agent rule presentation;
- challenge/exercise shell;
- freshness/source presentation.

The extraction decision must be based on repeated authored code and UX needs, not on names that sounded reusable in the roadmap.
