# Phase 0.2 Design — Avoiding Sequential Async Waterfalls

Status: approved in chat on 2026-08-20; written specification pending repository review before implementation planning.

## Purpose

Phase 0.2 creates the first gold-standard interactive lesson for Software Development Atlas. The goal is not merely to publish one useful JavaScript lesson. This lesson establishes the quality bar, information architecture, accessibility expectations, interaction model, testing standard, and agent-compatible authoring pattern that later contributors can follow.

The lesson topic is **Avoiding Sequential Async Waterfalls**.

The central rule is:

> Start independent work as early as possible. Await only where a real dependency requires ordering.

The lesson must explicitly avoid teaching the inaccurate shortcut “always use `Promise.all`.” It should distinguish truly independent operations from required sequencing, bounded concurrency, rate limits, error semantics, cancellation concerns, and cases where serial execution is intentionally correct.

The lesson must also distinguish **concurrency** from **CPU parallelism**. The visualization models asynchronous operations whose waiting time can overlap. It does not claim that JavaScript executes the underlying work simultaneously on multiple CPU cores.

## Success criteria

The phase is successful when a reader can:

1. recognize an accidental async waterfall in realistic JavaScript/TypeScript code;
2. explain why independent asynchronous operations can overlap while dependent operations cannot;
3. estimate sequential and fully overlapped latency from task durations;
4. refactor a simple sequential waterfall without introducing incorrect concurrency;
5. understand important production caveats around `Promise.all`, failure behavior, fan-out, resource limits, and rate limits;
6. use the lesson without JavaScript-enabled interaction because all essential knowledge remains present in canonical MDX and clean Markdown output;
7. interact with an accessible visualization that makes timing differences easier to understand rather than merely decorating the page;
8. use the lesson as a credible reference page after the initial learning pass.

The implementation is also successful when it introduces no paid service, no runtime database, no project-owned AI API, no hosted code-execution service, and no object-storage dependency.

## Scope

Phase 0.2 includes:

- a new Programming → Asynchronous Programming section in the documentation tree;
- one canonical lesson: `Avoiding Sequential Async Waterfalls`;
- one focused interactive component: `AsyncWaterfallLab`;
- a small pure TypeScript scheduling model that powers the visualization and is unit tested independently;
- browser tests for the lesson and interaction;
- accessibility coverage for the new interactive surface;
- source and freshness metadata consistent with the existing Atlas content contract.

### Non-goals

This phase does **not** include:

- Sandpack or WebContainers;
- an editable browser IDE;
- arbitrary code execution;
- a generic benchmark framework;
- a generic quiz/challenge engine;
- a reusable graph editor;
- a full learning-component design system;
- user accounts, saved progress, or analytics;
- AI-generated explanations or any model API;
- a generic concurrency scheduler for production applications.

If a second or third lesson later proves that a specialized piece should become generic, it can be extracted then.

## Information architecture

The canonical content path should be:

```text
content/docs/programming/
  meta.json
  async/
    meta.json
    avoiding-sequential-async-waterfalls.mdx
```

The resulting navigation should read approximately:

```text
Programming
└── Asynchronous Programming
    └── Avoiding Sequential Async Waterfalls
```

The lesson should use the existing Atlas frontmatter schema. Proposed metadata:

```yaml
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
```

The exact prerequisite and related slugs may point to future lessons. They are knowledge-graph intent, not a requirement to implement those lessons in this phase.

## Lesson learning model

The lesson should proceed from useful rule → mental model → diagnosis → refactoring → production nuance → practice → concise agent guidance.

Recommended narrative order:

1. **TL;DR** — independent work should overlap; dependencies determine ordering.
2. **Mental model** — compare a serial timeline with a concurrent/overlapped timeline.
3. **Why it matters** — latency compounds in request handlers, server components, loaders, build steps, CLI workflows, and service-to-service calls.
4. **A real accidental waterfall** — show several awaits that look harmless but serialize independent operations.
5. **Better scheduling** — start independent promises first, then await them at the point their results are needed.
6. **Interactive Async Waterfall Lab** — manipulate durations and compare schedules.
7. **Dependencies change the answer** — show a case where B genuinely needs A and therefore cannot begin early.
8. **`Promise.all` is a tool, not the rule** — explain fail-fast rejection behavior, the fact that already-started operations are not automatically cancelled, and where the combinator fits.
9. **Production considerations** — bounded concurrency, rate limits, resource pressure, error handling, cancellation, latency versus throughput.
10. **When sequential is correct** — ordered writes, transactions, dependent computation, deliberate backpressure, and other genuine constraints.
11. **Exercise** — ask the reader to identify which operations may overlap and estimate the latency improvement before revealing an explanation.
12. **Agent rule** — compact guidance suitable for coding-agent context.
13. **Related concepts** — future graph edges.
14. **Sources** — primary language/runtime references and carefully chosen supporting references.

## Core technical examples

The lesson should contrast at least three cases.

### Case A — accidental serialization

Conceptually:

```ts
const user = await getUser(id);
const flags = await getFeatureFlags(id);
const recommendations = await getRecommendations(id);
```

If these operations are actually independent, the total latency approaches the sum of their durations plus runtime/transport overhead.

### Case B — independent work overlapped

Conceptually:

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

The key teaching point is **when the operations start**, not the presence of `Promise.all` by itself. The operations are concurrent from the JavaScript program's point of view because their waiting periods overlap; this does not imply CPU-parallel execution of JavaScript code.

### Case C — genuine dependency

Conceptually:

```ts
const user = await getUser(id);
const organization = await getOrganization(user.organizationId);
```

The second operation cannot start until data from the first operation exists. The lesson must clearly explain that concurrency is constrained by the dependency graph, not by stylistic preference.

Examples may be refined for clarity during implementation, but the three conceptual cases are required.

## Async Waterfall Lab

### Purpose

The lab is the only new specialized interactive component required by this phase. It exists to make elapsed time and scheduling visible.

The initial model contains three tasks: A, B, and C. The reader can edit each duration. The UI compares two idealized schedules:

- **Sequential:** A then B then C;
- **Concurrent:** A, B, and C start at the same logical time because they are independent.

For durations A=800ms, B=400ms, C=300ms:

```text
Sequential                         Concurrent

A █████████ 800ms                 A █████████ 800ms
          B █████ 400ms           B █████     400ms
                C ███ 300ms       C ███       300ms

Total: 1500ms                     Total: 800ms
```

The lab is a latency model, not a benchmark. The values are controlled teaching inputs and should never be presented as measured network/runtime performance.

### State model

The first version should intentionally remain small:

```ts
type TaskId = 'A' | 'B' | 'C';

type TaskDurations = Record<TaskId, number>;

type TimelineSegment = {
  id: TaskId;
  startMs: number;
  durationMs: number;
  endMs: number;
};

type Schedule = {
  segments: TimelineSegment[];
  totalMs: number;
};
```

The pure scheduling module should expose behavior equivalent to:

```ts
buildSequentialSchedule(durations): Schedule
buildConcurrentSchedule(durations): Schedule
```

The sequential total is the sum of durations. The fully overlapped concurrent total is the maximum duration.

The implementation should not over-generalize into arbitrary DAG scheduling in this phase.

### Input contract

The default values are:

```text
A = 800ms
B = 400ms
C = 300ms
```

Each task duration uses a native numeric control with:

```text
minimum = 100ms
maximum = 2000ms
step = 100ms
```

These values keep the teaching model readable and provide deterministic boundaries for tests. They are not statements about realistic production latency distributions.

### Interaction

The lab should support:

- visible numeric controls for A/B/C duration;
- immediate recalculation of both schedules;
- a reset action that restores 800/400/300ms;
- a play/replay action that animates elapsed progress;
- a textual total for each schedule;
- a clear statement of the amount of modeled time saved for the current inputs.

Playback should preserve the relative timing model but be visually normalized so one replay never takes longer than about two seconds, even when the conceptual sequential total is larger. Labels always show the real modeled milliseconds. With reduced motion enabled, replay should skip progressive animation and present the completed state directly.

Interaction must remain understandable without animation.

### Accessibility

Accessibility is a release requirement, not a follow-up.

The lab should:

- be fully operable by keyboard;
- use native form controls where practical;
- associate every duration control with a visible label;
- expose exact start/end/total timing in text or table form, not only through bar length;
- respect `prefers-reduced-motion` and avoid requiring animation to understand the result;
- avoid relying on color alone to distinguish states;
- preserve readable contrast in both light and dark themes;
- provide meaningful accessible names for controls;
- pass the existing serious/critical axe gate on the lesson page.

A screen-reader user must be able to understand that sequential A/B/C total 1500ms while concurrent A/B/C total 800ms without interpreting the visual bars.

If an `aria-live` summary is used, it should announce meaningful input/result changes only. Animation frames must not generate repeated live-region announcements.

## Pure scheduling module

The timing calculation belongs outside the React component:

```text
lib/learning/async-schedule.ts
```

Reasons:

- the mental model becomes directly unit-testable;
- the React component remains focused on presentation and interaction;
- later lessons can reuse the model only if reuse actually emerges;
- implementation errors in the visualization are less likely to distort the educational claim.

Required invariants include:

- no negative start times;
- `endMs = startMs + durationMs`;
- sequential task N starts when task N-1 ends;
- concurrent independent tasks all start at zero;
- sequential total equals the sum of durations;
- concurrent total equals the maximum duration;
- input validation or UI constraints prevent nonsensical durations.

## Agent and raw-Markdown compatibility

The interactive lab is an enhancement, not the canonical explanation.

The MDX must explicitly contain the key example and arithmetic in text so the existing clean-Markdown route remains complete for agents and non-interactive consumers.

The raw representation should include information equivalent to:

```text
Sequential example:
800ms + 400ms + 300ms = 1500ms

Concurrent independent example:
max(800ms, 400ms, 300ms) = 800ms
```

The lesson must include a compact agent rule similar in intent to:

> When asynchronous operations are independent, start them before awaiting earlier results. Preserve sequential awaits when a later operation depends on an earlier result or when ordering/backpressure is intentional. Do not introduce unbounded concurrency merely to reduce latency.

The exact wording can be refined during authoring.

## Source and freshness strategy

Because this lesson combines stable language semantics with evolving engineering guidance, its status is `evolving` with a 180-day review cycle.

Sources should prioritize:

- the ECMAScript specification for promise combinator semantics where appropriate;
- authoritative JavaScript platform documentation for `Promise.all` behavior;
- current framework/runtime guidance only when making a framework-specific claim;
- original or upstream sources instead of SEO tutorials.

The lesson should clearly separate stable facts from recommendations. For example, the semantics of `Promise.all` are language-level behavior, while advice about whether a particular backend should run 500 operations concurrently is workload-specific engineering judgment.

No source should be copied at length; the Atlas explanation must be original and source-backed.

## Error handling and production nuance

The lesson must teach that reducing latency can create new operational risks if applied mechanically.

Required nuances:

- `Promise.all` rejects when one input promise rejects;
- rejection of the aggregate promise does not automatically cancel the other already-started operations;
- independent failures are not automatically collected; APIs such as `Promise.allSettled` have different semantics and belong in related/future material;
- starting many operations concurrently can overwhelm connection pools, remote APIs, memory, file descriptors, or rate limits;
- some operations need bounded concurrency rather than full fan-out;
- cancellation/abort behavior is related but does not need a complete implementation in this lesson;
- latency improvement and throughput improvement are different concepts;
- serial ordering may encode correctness requirements;
- examples should not encourage retry storms or hidden duplicate side effects.

These should remain concise enough that the main concept stays easy to reference.

## Component strategy

Only one new specialized learning component is planned:

```text
components/learning/async-waterfall-lab.tsx
```

Do not pre-create generic abstractions such as:

```text
Benchmark
MentalModel
TradeoffMatrix
Challenge
ExecutionTimeline
```

unless implementation reveals at least two genuinely distinct uses in this same phase that require the same API. Otherwise, wait for later lessons.

The component should have a small public surface. Prefer the lesson to render `<AsyncWaterfallLab />` with sensible built-in defaults rather than exposing every styling and behavior decision as props.

## Testing strategy

The existing Phase 0.1 gate remains mandatory:

- frozen dependency install;
- lint;
- Next.js type generation and TypeScript checking;
- unit tests;
- production build;
- Playwright browser tests;
- axe serious/critical accessibility gate.

Phase 0.2 adds unit tests for the scheduling model and browser tests for the lesson.

Required unit coverage:

- sequential start/end calculations;
- sequential total;
- concurrent start/end calculations;
- concurrent total;
- default 800/400/300ms example;
- allowed boundary values at 100ms and 2000ms.

Required browser coverage:

- lesson is reachable through documentation navigation;
- the Async Waterfall Lab renders;
- default sequential total is 1500ms and concurrent total is 800ms;
- changing a duration updates totals;
- reset restores 800/400/300ms;
- play/replay control is keyboard operable;
- reduced-motion mode does not require progressive animation to reveal results;
- essential timing information is present as text;
- clean Markdown contains the essential non-interactive explanation;
- Edit on GitHub points to the canonical lesson source;
- the lesson page has no automatically detectable serious/critical axe violations.

Tests should verify behavior rather than animation frame timing. Avoid brittle pixel assertions.

## Performance and zero-cost requirements

The lesson must preserve the repository's zero-cost architecture.

- All schedule calculations run locally in the browser.
- No server request is required to use the lab after the page loads.
- No database is introduced.
- No paid API is introduced.
- No telemetry vendor is introduced.
- No hosted sandbox is introduced.
- No binary media is required.

The component should be small enough that it does not justify a separate runtime service or heavy visualization framework.

The implementation should avoid a large charting dependency for three horizontal timelines. CSS/React primitives are preferred.

## Expected repository surface

The implementation is expected to touch approximately:

```text
content/docs/programming/meta.json
content/docs/programming/async/meta.json
content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx
components/learning/async-waterfall-lab.tsx
lib/learning/async-schedule.ts
tests/async-schedule.test.ts
tests/e2e/async-waterfalls.spec.ts
components/mdx.tsx                 # only if explicit MDX registration is needed
```

The implementation plan may refine filenames when current repository conventions require it, but scope should remain equivalent.

## Acceptance criteria

Phase 0.2 is ready to merge only when all of the following are true:

1. the lesson reads well as a standalone reference without interacting with the lab;
2. the lab makes the timing model materially easier to understand;
3. independent versus dependent work is explained accurately;
4. concurrency is not conflated with JavaScript CPU parallelism;
5. the page avoids “always use `Promise.all`” advice;
6. production caveats include failure behavior, lack of automatic cancellation, and concurrency/resource limits;
7. clean Markdown preserves all essential knowledge;
8. the lesson is integrated into navigation and Edit-on-GitHub behavior;
9. unit tests validate schedule arithmetic;
10. browser tests validate the key interaction and accessibility behavior;
11. the existing full CI gate is green;
12. no paid or billable infrastructure dependency is introduced;
13. no speculative generic learning-component framework is added.

## Deferred follow-ups

Potential later lessons or components include:

- Promise combinators (`all`, `allSettled`, `race`, `any`);
- bounded concurrency;
- cancellation with `AbortController`;
- dependency-graph scheduling;
- request waterfalls in React/Next.js data fetching;
- database/service fan-out and connection-pool pressure;
- reusable timeline visualization primitives if multiple lessons prove the need;
- runnable playgrounds if a future lesson demonstrates clear educational value from editable execution.

These are explicitly outside Phase 0.2.

## Decision summary

Phase 0.2 will create one exceptional lesson and one purpose-built interactive visualization. The lesson remains Git/MDX-first, agent-friendly, accessible, testable, and zero-cost. The implementation will model only the scheduling behavior necessary to teach accidental async waterfalls and will resist generalizing the component system until later lessons provide evidence for reusable abstractions.
