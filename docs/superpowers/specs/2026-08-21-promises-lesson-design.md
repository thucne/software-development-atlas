# Gold-Standard Lesson #3 — Promises: Resolution, Chaining, and Failure

Status: approved design; written spec awaiting approval  
Date: 2026-08-21  
Branch: `agent/promises`

## Purpose

Build the third gold-standard Software Development Atlas lesson: **Promises: Resolution, Chaining, and Failure**.

This lesson is the third evidence point before Phase 0.3 learning-primitive extraction. It must therefore do two things well:

1. teach modern JavaScript Promise semantics deeply and accurately; and
2. test whether interaction patterns from the first two lessons genuinely repeat without prematurely extracting a generic framework.

The canonical lesson remains Git-tracked MDX. The interactive experience is an enhancement, never the sole carrier of essential knowledge.

## Central mental model

The lesson teaches this rule:

> A Promise represents an eventual outcome. Calling `then`, `catch`, or `finally` creates a new Promise; the new Promise's outcome is determined by what the handler returns, throws, or adopts.

The lesson must explicitly correct a common terminology error:

> **Resolved does not necessarily mean fulfilled.**

A promise may be resolved to another still-pending promise or thenable. In that case it is already locked to that adopted outcome while still pending.

The learner should leave able to reason from handler behavior rather than memorize surface syntax.

## Scope

PR #7 adds:

- one canonical lesson under Programming → Asynchronous Programming;
- one specialized interactive `PromiseResolutionLab`;
- one pure TypeScript Promise-resolution teaching model;
- navigation metadata for the new lesson;
- unit tests for the model;
- Playwright coverage for the lesson, lab, raw Markdown, GitHub edit action, keyboard interaction, and accessibility;
- primary-source references and freshness metadata.

## Non-goals

PR #7 does **not** add:

- arbitrary JavaScript execution;
- Sandpack;
- WebContainers;
- a generic Promise polyfill or Promise implementation;
- a production scheduler;
- an async/await lesson;
- a cancellation framework;
- a generic `ScenarioLab`, `ExecutionTimeline`, `CodeComparison`, `AgentRule`, `Challenge`, or learning-component framework;
- analytics or user state;
- a database;
- hosted execution;
- an AI/model API;
- a new dependency unless implementation proves an unavoidable need, which is not expected.

## Information architecture

Canonical page:

```text
Programming
└── Asynchronous Programming
    ├── Avoiding Sequential Async Waterfalls
    ├── How the Browser Event Loop Actually Works
    └── Promises: Resolution, Chaining, and Failure
```

Canonical source path:

```text
content/docs/programming/async/promises.mdx
```

Canonical route:

```text
/docs/programming/async/promises
```

The existing async metadata should append `promises` after the first two lessons.

## Proposed frontmatter

```yaml
title: Promises: Resolution, Chaining, and Failure
description: Reason about Promise states, resolution, chaining, error recovery, adoption, combinators, and modern Promise APIs.
category: programming
level: intermediate
status: evolving
lastVerified: 2026-08-21
reviewAfterDays: 180
topics:
  - javascript
  - typescript
  - promises
  - async
  - errors
  - concurrency
prerequisites:
  - javascript-functions
  - callbacks
related:
  - avoiding-sequential-async-waterfalls
  - how-the-browser-event-loop-works
  - async-await
  - cancellation
  - bounded-concurrency
technologies:
  - javascript
  - typescript
```

Prerequisites are conceptual tags, so they do not need canonical Atlas pages yet. The Promise lesson must not list `promises` as its own prerequisite.

## Lesson outcomes

After the lesson, a learner should be able to:

1. distinguish pending, fulfilled, rejected, settled, and resolved;
2. explain why a resolved promise can remain pending;
3. explain that `then`, `catch`, and `finally` return new promises;
4. predict the downstream result when a handler returns a value;
5. predict the downstream result when a handler throws;
6. reason about adoption of promises and thenables;
7. explain how `catch` can recover a rejected chain;
8. explain `finally` transparency and its exceptions;
9. explain why two `then` calls on one source promise create independent downstream branches;
10. choose among `Promise.all`, `allSettled`, `any`, and `race` based on required success/failure semantics;
11. explain that Promise rejection does not inherently cancel underlying work;
12. know when `Promise.withResolvers()` and `Promise.try()` are appropriate;
13. connect Promise reactions to the browser event-loop lesson without re-teaching the event loop;
14. recognize that `async`/`await` builds on Promise semantics rather than replacing them.

## Lesson structure

The canonical lesson should follow this sequence.

### 1. TL;DR

State the central rule and the resolved-vs-fulfilled distinction.

### 2. The five terms that matter

Explain:

- **pending** — not yet fulfilled or rejected;
- **fulfilled** — completed successfully with a value;
- **rejected** — completed unsuccessfully with a reason;
- **settled** — fulfilled or rejected;
- **resolved** — locked to a final value/outcome path, possibly by adopting another still-pending promise or thenable.

Avoid presenting "resolved" as a third mutually exclusive Promise state next to fulfilled/rejected. The three observable states remain pending/fulfilled/rejected; resolution describes whether the promise has been locked to an outcome.

### 3. Promise construction

Teach two separate timing facts:

- the `new Promise(executor)` executor runs synchronously during construction;
- reactions registered with `then`/`catch`/`finally` do not run inline with the current synchronous stack.

Show why this is valid but often unnecessary:

```js
new Promise((resolve, reject) => {
  callbackStyleApi((error, value) => {
    if (error) reject(error);
    else resolve(value);
  });
});
```

And why wrapping an already-Promise-returning API in another `new Promise` is usually needless complexity.

Do not turn this section into a broad callback-conversion tutorial.

### 4. Every chain method creates a new Promise

Make the chain identity visually and textually explicit:

```text
P0 --then(...)--> P1 --catch(...)--> P2 --finally(...)--> P3
```

Do not describe a chain as one Promise "changing" through several states.

### 5. Return, throw, adopt

This is the lesson's core reasoning table.

| Handler result | Downstream Promise behavior |
| --- | --- |
| returns a plain value | fulfills with that value |
| returns normally with no value | fulfills with `undefined` |
| throws | rejects with the thrown reason |
| returns a fulfilled Promise/thenable | adopts and eventually fulfills with its outcome |
| returns a rejected Promise/thenable | adopts and eventually rejects with its outcome |
| returns a still-pending Promise/thenable | becomes resolved to/adopts it while remaining pending |

The table must be represented in raw Markdown, not only in the lab.

### 6. Promise Resolution Lab

Embed:

```mdx
<PromiseResolutionLab />
```

The lab is described below.

### 7. Error propagation and recovery

Teach that skipped handlers propagate the prior outcome until a matching handler exists.

Critical example:

```js
loadUser()
  .catch(() => ({ name: 'Guest' }))
  .then(renderUser);
```

Returning normally from `catch` fulfills the promise returned by `catch`, so downstream fulfillment handlers continue with the fallback value.

Contrast with rethrowing:

```js
loadUser()
  .catch((error) => {
    log(error);
    throw error;
  });
```

### 8. `finally()` semantics

Teach `finally` primarily as cleanup that is transparent to the prior fulfillment value or rejection reason.

Examples:

```js
Promise.resolve(2)
  .finally(() => cleanup())
  // still fulfills with 2 if cleanup succeeds
```

```js
Promise.reject(error)
  .finally(() => cleanup())
  // still rejects with error if cleanup succeeds
```

Then state the exceptions and timing nuance:

- if the `finally` callback throws, the downstream promise rejects with that thrown reason;
- if it returns a rejected promise/thenable, the downstream promise adopts that rejection;
- if it returns a still-pending promise/thenable that later fulfills, downstream propagation waits for it before preserving the original value/reason.

Do not teach `finally` as equivalent to `then(onFinally, onFinally)`; their value propagation semantics differ.

### 9. Branching is not sequencing

Show:

```js
const source = Promise.resolve(10);

const a = source.then((value) => value + 1);
const b = source.then((value) => value * 2);
```

`a` and `b` are distinct downstream promises. One handler does not automatically wait for the other merely because both were attached to the same source.

This section should connect to the async-waterfalls lesson: Promise chain shape and dependency shape are related, but calling `then` twice is not itself a serialization primitive.

### 10. Promise combinators by intent

Use a compact decision matrix.

| Need | API | Key failure behavior |
| --- | --- | --- |
| all inputs must fulfill | `Promise.all()` | rejects when an input rejects |
| observe every input outcome | `Promise.allSettled()` | fulfills with per-input result records |
| first fulfillment wins | `Promise.any()` | rejects with `AggregateError` if all reject |
| first settlement wins | `Promise.race()` | settles with the first settled input |

Include the important empty-input edge cases in text:

- `Promise.all([])` fulfills with `[]`;
- `Promise.allSettled([])` fulfills with `[]`;
- `Promise.any([])` rejects with an `AggregateError`;
- `Promise.race([])` remains pending.

Do not present these as memorization trivia; explain how each follows the combinator's contract.

Reinforce the lesson #1 rule:

> `Promise.all()` rejecting does not automatically cancel already-started operations.

### 11. Modern Promise APIs in 2026

#### `Promise.withResolvers()`

Teach that `Promise.withResolvers()` returns:

```js
const { promise, resolve, reject } = Promise.withResolvers();
```

Use case: when settlement functions must exist outside the constructor callback, especially event, queue, stream, or lifecycle integration.

Guardrails:

- do not make externally exposed settlement functions the default architecture;
- keep `resolve`/`reject` scoped to the lifecycle owner;
- prefer existing Promise-returning APIs when available.

#### `Promise.try()`

Teach:

```js
const result = Promise.try(fn, arg1, arg2);
```

Its callback is invoked synchronously. A returned value fulfills the result promise, a synchronous throw rejects it, and a returned promise/thenable is adopted.

Explicitly state:

> `Promise.try(fn)` is not timing-equivalent to `Promise.resolve().then(fn)` because the latter defers invocation of `fn` to Promise reaction processing.

The lesson should treat `Promise.try` as useful normalization at sync/async API boundaries, not as general-purpose replacement syntax for `async` functions.

### 12. Cancellation and ownership

Teach the separation:

- a Promise models an eventual result;
- a Promise does not inherently own or cancel the underlying operation;
- cancellation, where supported, comes from the operation/API, commonly through `AbortSignal` in Web APIs or another runtime-specific mechanism.

Do not implement cancellation in this lesson's lab.

### 13. `async` / `await` connection

Keep this intentionally short:

- `async` functions return promises;
- `await` consumes/adopts promise-like results and resumes later;
- error handling maps to Promise rejection/fulfillment semantics;
- `async`/`await` improves expression, but does not erase dependency or scheduling semantics.

A dedicated async/await lesson remains future work.

### 14. Production mistakes to avoid

Include concise guidance:

- do not wrap already-Promise-returning APIs in unnecessary `new Promise` constructors;
- do not forget to return a promise from a handler when downstream work depends on it;
- do not swallow errors accidentally in `catch`;
- do not assume rejection cancels underlying work;
- do not create unbounded concurrency merely because Promise combinators make aggregation easy;
- do not use guessed Promise timing as synchronization;
- do not leak `resolve`/`reject` ownership across unrelated modules;
- understand that unhandled rejection reporting/termination is host/runtime policy around Promise semantics, not the definition of rejection itself.

### 15. Exercise

Give a short chain and ask the reader to predict the states/outcomes of P0-P4 before revealing the answer.

The exercise should include:

- one plain return;
- one throw;
- one recovery;
- one returned pending/adopted promise.

The answer must explain each downstream promise, not merely list console output.

### 16. Agent rule

Canonical rule:

> Treat every `then`, `catch`, and `finally` call as creating a new Promise. Determine that new Promise's outcome from the handler: returning a value fulfills it, throwing rejects it, and returning a promise/thenable makes it adopt that outcome. Do not equate resolved with fulfilled, do not assume rejection cancels underlying work, and choose combinators according to required success/failure semantics.

### 17. Related lessons

Link to:

- Avoiding Sequential Async Waterfalls;
- How the Browser Event Loop Actually Works;
- future async/await;
- future cancellation;
- future bounded-concurrency material.

### 18. Primary sources and freshness

Prioritize:

1. ECMAScript 2026 specification for Promise algorithms and modern static methods;
2. MDN Promise reference pages for practical platform documentation and compatibility context;
3. WHATWG HTML only where connecting Promise Jobs to browser host scheduling is necessary;
4. Node.js docs only for a host-specific production note, if used.

Status remains `evolving`, review target 180 days.

## Interactive architecture

### Recommended approach

Use a deterministic, predefined **Promise Resolution Lab** rather than executing arbitrary JavaScript.

Files:

```text
lib/learning/promise-resolution.ts
components/learning/promise-resolution-lab.tsx
```

Potential registration change:

```text
components/mdx.tsx
```

The model owns semantics. React owns presentation and controls.

### Why not live execution

Live code execution would be weaker for this lesson because:

- the important concept is resolution/adoption state, which native Promises do not expose directly as a public inspector API;
- reconstructing internal states from console output would teach inference rather than the semantic model;
- sandboxing would add complexity without improving the core learning objective;
- deterministic state transitions are simpler to unit test and make accessible as text.

### Why no generic lab extraction yet

The Event Loop Lab and Promise Resolution Lab will share high-level interaction concepts:

- scenario selection;
- step;
- run;
- reset;
- current explanation;
- semantic state panels.

That repetition is valuable evidence, but PR #7 should still keep the implementation specialized. After PR #7, Phase 0.3 can compare all three lessons and decide whether a generic primitive would simplify the code without flattening domain semantics.

Do not create a generic wrapper merely because two components both contain buttons.

## Pure model

The pure teaching model should expose domain types similar to:

```ts
type PromiseState = 'pending' | 'fulfilled' | 'rejected';

type ResolutionKind =
  | 'unresolved'
  | 'fulfilled-value'
  | 'rejected-reason'
  | 'adopting';

type PromiseNode = {
  id: string;
  state: PromiseState;
  resolution: ResolutionKind;
  value?: string;
  reason?: string;
  adopts?: string;
};

type HandlerKind = 'then' | 'catch' | 'finally';

type HandlerStep = {
  id: string;
  sourcePromiseId: string;
  resultPromiseId: string;
  kind: HandlerKind;
  label: string;
};

type PromiseResolutionState = {
  scenarioId: PromiseScenarioId;
  promises: PromiseNode[];
  activeHandler: HandlerStep | null;
  output: string[];
  stepIndex: number;
  explanation: string;
  complete: boolean;
};
```

Exact type names may vary during implementation, but the following invariants are normative:

1. each chain method's result is modeled as a distinct promise node;
2. pending/fulfilled/rejected is separate from resolution/adoption metadata;
3. the adoption scenario must represent a promise that is resolved/adopting while still pending;
4. the model is pure and deterministic;
5. React must not reimplement resolution semantics;
6. the model is educational, not a drop-in Promise implementation.

## Required lab scenarios

### Scenario 1 — Return a plain value

Conceptual code:

```js
const p1 = Promise.resolve(10).then((value) => value * 2);
```

Teaching result:

```text
P0 fulfilled: 10
then returns 20
P1 fulfilled: 20
```

### Scenario 2 — Throw from a handler

Conceptual code:

```js
const p1 = Promise.resolve('start').then(() => {
  throw new Error('boom');
});
```

Teaching result:

```text
P0 fulfilled
handler throws Error('boom')
P1 rejected: Error('boom')
```

### Scenario 3 — Adopt a still-pending Promise

Conceptual code:

```js
let finish;
const inner = new Promise((resolve) => {
  finish = resolve;
});

const outer = Promise.resolve().then(() => inner);
```

The deterministic simulator should show an intermediate state equivalent to:

```text
inner: pending
outer: pending, resolved/adopting inner
```

Then a later simulator step settles `inner`, and `outer` adopts the same fulfillment/rejection outcome.

This scenario is mandatory because it proves the resolved-vs-fulfilled distinction visually.

The teaching simulator does not need to literally create native promises.

### Scenario 4 — `catch()` recovery

Conceptual code:

```js
const recovered = Promise.reject('network')
  .catch(() => 'fallback');
```

Teaching result:

```text
P0 rejected: network
catch returns fallback
P1 fulfilled: fallback
```

### Scenario 5 — `finally()` transparency

Conceptual code:

```js
const next = Promise.resolve(42)
  .finally(() => cleanup());
```

Default teaching path:

```text
P0 fulfilled: 42
finally succeeds
P1 fulfilled: 42
```

The scenario explanation must also state the throw/rejected-return exception, even if the interactive default path shows only transparent success.

### Scenario 6 — Independent branching

Conceptual code:

```js
const source = Promise.resolve(10);
const plusOne = source.then((value) => value + 1);
const doubled = source.then((value) => value * 2);
```

Teaching result:

```text
source fulfilled: 10
branch A fulfilled: 11
branch B fulfilled: 20
```

The visual must show two downstream nodes from one source rather than a single serial chain.

## Lab UI contract

The `PromiseResolutionLab` should include:

- heading: `Promise Resolution Lab`;
- scenario selector with six predefined scenarios;
- source/example panel;
- `Step` button;
- `Run`/`Pause` or `Run` control as appropriate;
- `Reset` button;
- current step/status label;
- promise-node visualization;
- active-handler explanation;
- text representation of every promise's state/resolution/value/reason;
- output/result list only when a scenario benefits from it;
- a persistent note that the simulator models semantics and does not execute arbitrary JavaScript.

### Promise-node representation

Each node must expose text such as:

```text
P1
State: pending
Resolution: adopting P-inner
```

or:

```text
P2
State: rejected
Reason: boom
```

Color may reinforce state but must never be the only carrier of meaning.

### Diagram structure

The visual can use CSS grid/flex and semantic HTML. Avoid a charting/graph dependency.

Simple arrows/connectors may be CSS or decorative SVG with `aria-hidden="true"` when all semantic relationships are also represented in text.

For the branch scenario, responsive layout must remain readable on narrow screens; do not require horizontal dragging to understand the result.

## Playback behavior

The model advances one deterministic transition per `Step`.

`Run` may use a short normalized interval to advance until the scenario completes. It is pedagogical playback, not real Promise timing.

Requirements:

- auto-run must stop at completion;
- reset restores the selected scenario to step 0;
- switching scenarios resets state;
- user interaction during auto-run must not corrupt model state;
- no playback should take more than a few seconds;
- labels must never imply wall-clock timing;
- respect reduced-motion preferences if animated transitions are used;
- animation is optional and must remain decorative.

## Accessibility contract

The lab must be understandable without animation, color, or spatial inference.

Requirements:

- native buttons/select controls;
- full keyboard operation;
- visible labels;
- visible focus states;
- semantic headings;
- text state for every Promise node;
- no color-only status encoding;
- serious/critical axe violations: zero on the lesson page;
- horizontally scrollable regions, if any, must be keyboard focusable and named;
- code/example panels must preserve accessible contrast;
- if `aria-live` is used, announce meaningful state changes only, not every decorative frame;
- the lab should not steal focus during Step/Run transitions.

## Raw Markdown and agent compatibility

The `.md` representation of the page must remain a complete lesson without React.

It must include, in text:

- pending / fulfilled / rejected / settled / resolved definitions;
- the statement that resolved does not necessarily mean fulfilled;
- the return/throw/adopt table;
- a resolved-but-pending adoption example;
- `catch` recovery behavior;
- `finally` transparency plus its failure exceptions;
- independent branching explanation;
- Promise combinator matrix and empty-input behavior;
- `Promise.all` no-auto-cancellation warning;
- `Promise.withResolvers()` and `Promise.try()` guidance;
- the timing difference between `Promise.try(fn)` and `Promise.resolve().then(fn)`;
- cancellation/AbortSignal separation;
- compact agent rule;
- primary sources and freshness metadata.

No essential concept may exist only inside `PromiseResolutionLab`.

## Current-standards requirements

### ECMAScript Promise semantics

Implementation and copy must be verified against current ECMAScript 2026 Promise algorithms, especially:

- Promise constructor/executor behavior;
- Promise resolving functions and thenable assimilation;
- `Promise.prototype.then` / reaction jobs;
- `Promise.prototype.catch`;
- `Promise.prototype.finally`;
- `Promise.all`;
- `Promise.allSettled`;
- `Promise.any`;
- `Promise.race`;
- `Promise.resolve`;
- `Promise.try`;
- `Promise.withResolvers`.

### Modern API claims

As of the design review on 2026-08-21:

- `Promise.withResolvers()` is a standardized modern Promise static method and is broadly available in current browsers;
- `Promise.try()` is present in ECMAScript 2026 and is broadly available in current browsers;
- `Promise.try()` calls its callback synchronously before resolving/rejecting the returned Promise capability;
- `Promise.withResolvers()` returns a new promise plus its associated resolve/reject functions.

The lesson should avoid hard-coding browser-version tables in prose. Compatibility changes more quickly than language semantics; link to current compatibility references instead.

## Error-handling boundaries

The simulator itself should not expose arbitrary user input, so error handling is intentionally narrow.

Model functions should:

- accept only known scenario IDs;
- reject or safely handle impossible transitions during development;
- remain deterministic;
- not silently invent states when the model invariant is violated.

UI should:

- disable impossible Step/Run actions where appropriate;
- recover cleanly on Reset/scenario change;
- never surface raw internal exceptions during ordinary supported interaction.

## Testing strategy

### Unit tests

Expected file:

```text
tests/promise-resolution.test.ts
```

Minimum behavioral coverage:

1. plain-value return fulfills the downstream promise;
2. thrown handler rejects the downstream promise;
3. adoption scenario reaches an intermediate `pending + adopting` state;
4. adoption later mirrors the inner fulfillment outcome;
5. rejection handler recovery fulfills downstream with the recovery value;
6. `finally` successful path preserves the original fulfillment value;
7. branching creates two independent downstream promises with separate outcomes;
8. impossible/unknown scenario transition behavior is safe and explicit if the public model API permits such input.

If the `finally` failure exception is modeled interactively, add direct unit coverage. If it is text-only in this PR, canonical copy/browser raw-Markdown coverage is sufficient.

### Browser tests

Expected file:

```text
tests/e2e/promises.spec.ts
```

Minimum coverage:

1. lesson is reachable through Programming → Asynchronous Programming navigation;
2. default plain-value scenario steps to the expected fulfilled downstream promise;
3. throw scenario reaches the expected rejected downstream promise;
4. adoption scenario visibly shows a resolved/adopting promise that is still pending before settlement;
5. catch recovery transitions rejected → fulfilled downstream;
6. finally success preserves the prior value;
7. branching visibly produces two independent downstream promises;
8. reset works and Step/Reset are keyboard-operable;
9. raw Markdown contains the essential semantic rules and modern API guidance;
10. Edit-on-GitHub targets `content/docs/programming/async/promises.mdx` on `main`;
11. no automatically detectable serious/critical axe accessibility violations.

### Existing suite

PR #7 must keep all existing tests green, including both previous gold-standard lessons.

## Expected implementation files

Likely changed/added files:

```text
components/learning/promise-resolution-lab.tsx
components/mdx.tsx
content/docs/programming/async/meta.json
content/docs/programming/async/promises.mdx
lib/learning/promise-resolution.ts
tests/promise-resolution.test.ts
tests/e2e/promises.spec.ts
```

Planning/spec documents are additional expected changes.

No package, lockfile, workflow, or deployment changes are expected.

## TDD implementation order

The future implementation plan should preserve this sequence:

1. write failing pure-model tests;
2. verify RED for missing/insufficient model behavior;
3. implement minimum pure resolution model;
4. verify GREEN;
5. add navigation/skeleton and register the missing lab to create a deliberate component-boundary RED state;
6. implement the specialized React lab;
7. verify lint/type/unit/build;
8. author the complete canonical lesson from current primary sources;
9. add browser/accessibility/raw-Markdown contracts;
10. fix evidence-driven integration issues without weakening assertions or axe rules;
11. run permanent full CI on the exact final branch head;
12. audit the diff for accidental dependency/workflow/framework changes;
13. mark PR ready for review only after fresh green evidence.

## Architecture evidence after lesson #3

After PR #7, compare the three gold-standard lesson implementations.

### Lesson #1 — Async Waterfalls

Domain model:

- durations;
- sequential vs concurrent schedules;
- critical-path latency.

Interaction:

- numeric input;
- derived timelines;
- play/replay/reset.

### Lesson #2 — Browser Event Loop

Domain model:

- deterministic scheduler transitions;
- tasks/microtasks/rendering;
- explicit scheduler choice.

Interaction:

- predefined scenarios;
- step/run/reset;
- semantic state panels.

### Lesson #3 — Promise Resolution

Domain model:

- deterministic resolution transitions;
- distinct promise nodes;
- handler return/throw/adoption semantics.

Interaction:

- predefined scenarios;
- step/run/reset;
- semantic state panels.

### Extraction decision deferred to PR #8

PR #8 should inspect actual code after all three lessons exist.

Likely candidates to evaluate, not promises to build:

- reusable scenario-playback controller;
- standardized accessible lab shell;
- code/example panel;
- semantic state panel;
- `AgentRule` presentation;
- freshness badge or lesson metadata surface.

Do **not** assume `ExecutionTimeline` is the first extraction merely because lesson #1 contains timelines. The Event Loop and Promise lessons may demonstrate that a scenario/state-machine shell is the more general repeated pattern.

The extraction PR should favor deletion of duplication over creation of abstractions with speculative configuration surfaces.

## Acceptance criteria

PR #7 is ready for review only when all are true:

- the lesson route exists and is in navigation;
- frontmatter validates;
- the canonical lesson teaches the required semantics accurately;
- raw Markdown is complete and agent-usable;
- six predefined lab scenarios work;
- adoption visibly demonstrates resolved-but-pending;
- the pure model owns semantics;
- React does not duplicate resolution logic;
- no generic learning framework is extracted;
- no arbitrary code execution is introduced;
- no new paid/cloud/runtime dependency is introduced;
- unit tests cover the required model transitions;
- browser tests cover all required user-facing behavior;
- keyboard interaction works;
- serious/critical axe violations are zero;
- `pnpm install --frozen-lockfile` passes;
- `pnpm lint` passes;
- `pnpm typecheck` passes;
- `pnpm test` passes;
- `pnpm build` passes;
- Chromium setup passes;
- `pnpm test:e2e` passes;
- final CI is green on the exact PR head;
- diff audit confirms no unintended package/lockfile/workflow changes.

## Primary references for implementation

Use current versions of these sources during implementation rather than relying solely on this design document:

- ECMAScript 2026 Language Specification — Promise objects, reactions, resolving functions, combinators, `Promise.try`, `Promise.withResolvers`;
- MDN — Promise reference, constructor, `then`, `catch`, `finally`, combinators, `Promise.try`, `Promise.withResolvers`;
- WHATWG HTML — only for host scheduling context where the Promise lesson links back to browser microtask processing.

## Self-review corrections applied

Before opening the spec for review, the draft was checked for placeholders, internal contradictions, scope creep, terminology ambiguity, and testability.

Corrections applied:

- removed the circular `promises` prerequisite and replaced it with lower-level `javascript-functions` and `callbacks` conceptual prerequisites;
- clarified that `resolved` is not an additional mutually exclusive Promise state;
- tightened `finally()` to cover the case where a returned pending promise delays downstream propagation before the original fulfillment/rejection is preserved;
- kept `Promise.try()` timing explicitly distinct from `Promise.resolve().then(fn)`;
- kept cancellation out of the lab and separated Promise outcome modeling from operation ownership;
- preserved the no-generic-framework boundary so PR #8, not PR #7, owns extraction decisions.

No implementation plan or production code is authorized by this spec until the written-spec review gate is approved.

## Final design rule

The lesson should make Promise behavior predictable from a small semantic rule set rather than from memorized snippets:

> Follow the newly created downstream Promise. A handler's normal return fulfills it, a throw rejects it, and a returned Promise/thenable makes it adopt that outcome. Resolution can happen before settlement, and the Promise object is not the underlying operation.
