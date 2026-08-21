# Gold-Standard Lesson #3 — Promises: Resolution, Chaining, and Failure

Status: approved design and written spec  
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
title: "Promises: Resolution, Chaining, and Failure"
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
4. an adopted promise must be separately identifiable;
5. `catch` recovery must produce a fulfilled downstream promise;
6. successful `finally` must preserve the prior value/reason rather than replace it with the callback's ordinary return value;
7. branching must produce two distinct downstream promise nodes;
8. the model is deterministic and finite;
9. the model must not attempt arbitrary user-defined Promise execution.

## Required simulator scenarios

### Scenario 1 — Handler returns a value

Conceptual chain:

```text
P0 fulfilled: 10
  └─ then(value => value * 2)
       ↓
P1 fulfilled: 20
```

The simulator should visibly create P1 as distinct from P0.

### Scenario 2 — Handler throws

```text
P0 fulfilled
  └─ then(() => { throw Error('boom') })
       ↓
P1 rejected: Error('boom')
```

### Scenario 3 — Adopt a still-pending Promise

Conceptual phases:

```text
P0 fulfilled
  ↓ handler returns P2
P1 pending + resolved/adopting P2
P2 pending

later:
P2 fulfilled: 42
P1 fulfilled: 42
```

This is the most important scenario for the terminology correction. The UI must make the intermediate `P1 pending + adopting P2` state visible in text.

### Scenario 4 — `catch()` recovery

```text
P0 rejected: network error
  └─ catch(() => 'Guest')
       ↓
P1 fulfilled: Guest
```

The explanation must say that a rejection handler that returns normally can put the downstream chain back on the fulfillment path.

### Scenario 5 — Successful `finally()` preserves outcome

```text
P0 fulfilled: 7
  └─ finally(() => cleanup())
       ↓
P1 fulfilled: 7
```

The callback's successful ordinary return value must not replace 7.

The canonical lesson text, not necessarily the simulator scenario, covers throwing/rejected/pending cleanup edge cases.

### Scenario 6 — Two branches from one source

```text
         ┌─ then(value => value + 1) → P1 fulfilled: 11
P0 = 10 ─┤
         └─ then(value => value * 2) → P2 fulfilled: 20
```

Do not draw one branch as depending on the other.

## Lab UI contract

### Controls

Required:

- scenario selector;
- `Step`;
- `Run` / `Pause`;
- `Reset`;
- visible step count.

Use native controls where possible.

### State display

Required textual state:

- promise nodes;
- promise state;
- resolution/adoption metadata;
- active handler;
- output/log only where useful;
- current explanation.

The adoption state must not rely on color or animation.

### Playback

The simulator's exact state must always be visible. Playback is convenience, not knowledge.

Run/replay may use short transitions, but the lab must remain understandable if all animation is disabled.

Reduced-motion users must receive the same state transitions without meaningful information being encoded in decorative movement.

### Accessibility

Required:

- native select/buttons;
- keyboard operation;
- visible labels;
- unique IDs via React `useId()`;
- no color-only state distinction;
- semantic text for pending/fulfilled/rejected/adopting;
- named/focusable overflow regions if horizontal scrolling exists;
- meaningful live announcements only for semantic step/result changes, never animation frames;
- serious/critical axe violations must be zero on the lesson page.

## Raw Markdown / agent compatibility

The cleaned Markdown route must include the complete reasoning model without requiring the React lab.

It must contain:

- resolved-vs-fulfilled distinction;
- return/throw/adopt table;
- examples for `then`, `catch`, `finally`;
- branching example;
- Promise combinator matrix;
- empty combinator behavior;
- `Promise.withResolvers()` explanation;
- `Promise.try()` synchronous invocation and timing distinction;
- cancellation/ownership rule;
- production mistakes;
- exercise and answer;
- agent rule;
- primary sources.

The raw Markdown should not attempt to serialize React lab state. It should explain the same ideas textually.

## Testing contract

### Unit tests

Create:

```text
tests/promise-resolution.test.ts
```

At minimum verify:

1. plain return fulfills downstream P1;
2. throw rejects downstream P1;
3. adoption has an intermediate `P1.state === 'pending'` and `P1.resolution === 'adopting'` state;
4. adopted P2 fulfillment eventually fulfills P1 with the same outcome;
5. catch recovery fulfills downstream;
6. successful finally preserves original fulfillment value;
7. branching creates two distinct downstream promises and both settle correctly;
8. every scenario terminates within a bounded transition count.

### Browser tests

Create:

```text
tests/e2e/promises.spec.ts
```

Cover:

1. lesson appears through Programming → Asynchronous Programming navigation;
2. lab renders default scenario;
3. Step reaches expected states;
4. adoption scenario visibly shows resolved/adopting while pending;
5. catch recovery shows downstream fulfillment;
6. branching shows two distinct downstream outcomes;
7. reset restores the initial state;
8. controls are keyboard operable;
9. raw Markdown preserves essential Promise rules and modern APIs;
10. GitHub edit action targets `content/docs/programming/async/promises.mdx`;
11. no serious/critical axe violations.

### Full quality gate

Final branch head must pass the permanent CI sequence:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Do not modify the permanent workflow or lockfile unless an unrelated repository defect genuinely requires it and is separately justified. No dependency change is expected.

## Implementation sequence

1. pure model tests RED;
2. pure model minimal implementation GREEN;
3. navigation + MDX skeleton;
4. MDX registration RED on missing component;
5. `PromiseResolutionLab` GREEN;
6. primary-source verification;
7. complete lesson prose;
8. browser/accessibility tests;
9. debug only from concrete failures;
10. final full CI on exact branch head;
11. update PR #7 description and mark ready for review;
12. do not merge without explicit user approval.

## Phase 0.3 boundary

After PR #7 is implemented and, if approved, merged, compare:

- `AsyncWaterfallLab`;
- `EventLoopLab`;
- `PromiseResolutionLab`.

PR #8 should then decide whether repeated patterns justify extraction. Candidate evidence includes scenario selectors, Step/Run/Reset controllers, semantic state panels, code/source regions, accessibility behavior, and agent-rule presentation. Extraction is not authorized merely because a candidate is listed here.

## Self-review result

- No circular `promises` prerequisite remains.
- `resolved` is not modeled as a fourth mutually exclusive Promise state.
- The still-pending adoption phase is normative and tested.
- `finally()` includes transparency, failure, and pending-cleanup delay semantics.
- Promise cancellation remains separate from underlying operation cancellation.
- `Promise.try()` is explicitly distinguished from `Promise.resolve().then(fn)` by synchronous callback invocation.
- The lesson remains one cohesive implementation slice.
- No generic learning framework is included.
- Frontmatter title is quoted because it contains a colon followed by a space, avoiding YAML ambiguity.
