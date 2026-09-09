# Atlas Content Reliability and Clarity Design

Date: 2026-09-09
Status: approved direction; implementation governed by this document
Scope: PR #14

## 1. Goal

Raise the first three gold-standard deep dives to a stricter content standard before expanding Phase 0.4 coverage.

A successful PR makes the canonical async deep dives:

- technically re-verified against current primary/authoritative sources;
- locally understandable when a reader lands on a section through search, a raw Markdown route, or agent retrieval;
- progressively taught from observable behavior to mental model to formal platform terminology;
- explicit about the scope of guarantees, implementation freedom, and engineering recommendations;
- supported by executable regression coverage where a concrete JavaScript example can protect an important factual boundary.

The same PR adds an explicit authoring contract so future content does not reproduce the ambiguity being corrected.

## 2. Why this work is necessary

The platform and knowledge model have grown substantially through PRs #9-#13, but PR #13 explicitly audited rendering rather than lesson prose or technical claims.

The current deep dives contain two classes of issue:

1. **Pedagogical ambiguity.** Example: the Event Loop TL;DR says not to carry “this browser diagram” into Node.js before any diagram has been introduced. It also uses formal terms such as Jobs and hosts before defining them.
2. **Technical correctness risk.** The Promise lesson uses `Promise.resolve(inner)` as though it necessarily creates a distinct outer Promise. For a native Promise whose constructor is the same `Promise`, ECMAScript `PromiseResolve` returns the input Promise itself. The example therefore does not demonstrate the distinct adopting-Promise identity that the prose claims.

These problems matter for both humans and coding agents because Atlas sections are intentionally referenceable and consumable outside the full page context.

## 3. Scope

### 3.1 Canonical deep dives

Review and revise:

- `content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx`
- `content/docs/programming/async/how-the-browser-event-loop-works.mdx`
- `content/docs/programming/async/promises.mdx`

### 3.2 Authoring contract

Update:

- `CONTENT_GUIDE.md`
- `AGENTS.md`

The Content Guide owns the human authoring rule. AGENTS mirrors the subset that automated contributors must actively check.

### 3.3 Verification

Add focused regression coverage for important factual examples and content contracts where automation is reliable. Preserve all current unit, build, rendered-route, browser, and accessibility checks.

## 4. Non-goals

PR #14 must not:

- add a generic prose linter, readability score, LLM judge, or hosted model call;
- enforce banned-word lists for normal English pronouns such as “this” or “that” across all prose;
- rewrite every authored Atlas page;
- change the canonical Software Engineering Map or learning paths solely for this pass;
- add new UI primitives or interactive labs;
- change the three existing learning-model state machines unless a verified content/model contradiction is found;
- add dependencies, runtime services, analytics, databases, Sandpack, or WebContainers;
- use wording-only edits as a reason to bump `lastVerified` on unrelated content.

## 5. Atlas Clarity Contract

Add the following principles to the canonical authoring guidance.

### 5.1 Local completeness

A section should remain understandable when reached directly. Avoid references whose noun exists only in a previous visual or paragraph.

Weak:

> Do not carry this diagram into Node.js.

Strong:

> Do not treat the browser scheduling model on this page as a Node.js event-loop model.

Pronouns are not forbidden. The requirement is that the referent be locally obvious.

### 5.2 Define before depending

Do not require a reader to understand a formal term before it has been defined in plain language.

Prefer:

1. observable behavior;
2. plain-language rule;
3. concrete example;
4. formal/platform term;
5. specification nuance and edge cases.

Formal terminology remains important, but it should answer a question the reader can already formulate.

### 5.3 Scope every guarantee

Distinguish three kinds of statements:

- **platform/language guarantee** — behavior defined by a relevant specification or stable API contract;
- **implementation freedom** — behavior the platform intentionally leaves to the runtime/user agent/provider;
- **engineering heuristic** — a recommendation that depends on workload or constraints.

Do not phrase implementation freedom or heuristics as universal guarantees.

### 5.4 Conditions over vague ranking words

Avoid words such as “better,” “cheap,” “fast,” “strong fit,” or “usually” when the sentence does not identify the dimension or conditions that make the statement true.

Prefer explicit conditions:

> SSR is useful when useful initial HTML must incorporate request-time state.

rather than:

> SSR is a strong fit.

This rule does not prohibit concise adjectives when the comparison dimension is explicit in the same sentence or table criterion.

### 5.5 One main claim per sentence

Split sentences that simultaneously define a term, add an exception, introduce another runtime, and recommend an action. Dense correctness caveats should not force readers to unpack several independent claims at once.

### 5.6 Examples are factual claims

A code example is part of the technical contract. Where practical, important examples should be executable or protected by tests. When execution is not practical, trace the example against a primary specification or authoritative source during verification.

### 5.7 TL;DR discipline

A TL;DR should answer:

1. what the concept is or what decision is being made;
2. the practical rule the reader should retain;
3. the most important mistake to avoid.

Do not front-load specification vocabulary or edge cases that are not necessary to use the rule correctly.

### 5.8 Caveats beside the claim they qualify

Do not front-load every edge case into the opening paragraph. Establish the useful model first, then place limitations immediately beside the claim or example they constrain.

## 6. Deep-dive revision requirements

### 6.1 Avoiding Sequential Async Waterfalls

Keep its central rule:

> Start independent asynchronous work as early as possible. Await only where a real dependency requires ordering.

Required revisions:

- replace wording that can imply `await` blocks the JavaScript thread;
- say that `await` suspends the continuation of the surrounding async function while unrelated work may continue;
- define **critical path** at first substantive use as the longest chain of dependent operations that determines best-case completion time;
- keep concurrency/overlap distinct from CPU parallelism;
- preserve the rule that `Promise.all()` is an aggregation tool rather than the definition of concurrency;
- re-verify rejection/cancellation, input-order result semantics, and empty/edge claims that remain in scope;
- update `lastVerified` to 2026-09-09 only after this verification is complete.

The existing lab arithmetic and domain model remain unchanged unless verification finds a contradiction.

### 6.2 How the Browser Event Loop Actually Works

The page remains browser-first and standards-aligned.

Required opening order:

1. run-to-completion in ordinary browser application code;
2. microtasks after the current task;
3. later task work such as timers;
4. rendering as browser-controlled work;
5. explicit statement that the page describes browser scheduling, not Node.js scheduling.

The TL;DR must not refer to a diagram that has not yet appeared and must not require the reader to know ECMAScript Jobs or the formal meaning of host.

The mental model must define its vocabulary before relying on it:

- **task** — one unit of regular browser event-loop work, such as executing a timer callback or dispatching certain events;
- **microtask** — higher-priority checkpoint work used by Promise reactions and `queueMicrotask()` in browsers;
- **task source** — the specification category that produced a task and participates in ordering rules;
- **user agent/browser scheduling freedom** — browsers may choose among runnable task queues where the platform does not define one cross-source order;
- **host** — the environment integrating ECMAScript with platform APIs; introduce this only in the formal browser-vs-Node section.

Keep the important standards nuance that HTML does not define one universal FIFO “macrotask queue,” but move that nuance after the reader has a working observable model.

Node.js comparison requirements:

- state plainly that Node has its own event-loop/runtime scheduling rules and no browser rendering pipeline;
- retain that `setImmediate()` is not an analogue of `requestAnimationFrame()`;
- retain current Node guidance that `process.nextTick()` is Legacy and `queueMicrotask()` is preferred for most userland deferral;
- do not turn the browser page into a full Node event-loop lesson.

Rendering requirements:

- preserve “rendering opportunity” rather than claiming a paint after every callback;
- keep `requestAnimationFrame()` associated with rendering updates, not a generic post-microtask queue.

Update `lastVerified` to 2026-09-09 after source verification.

### 6.3 Promises: Resolution, Chaining, and Failure

Preserve the central distinctions:

- pending / fulfilled / rejected are states;
- settled means fulfilled or rejected;
- resolved is not a fourth mutually exclusive state;
- a resolved Promise may remain pending while it adopts another Promise/thenable;
- each standard chain call produces a distinct downstream Promise;
- returning / throwing / adopting determines that downstream outcome;
- rejection does not inherently cancel the underlying operation.

P0 correctness fix:

Replace the current distinct-adoption example based on `Promise.resolve(inner)`. The corrected teaching must explicitly show both facts:

```js
const same = Promise.resolve(inner);
console.log(same === inner); // true for a native Promise from the same constructor
```

and a genuinely distinct adopting Promise:

```js
const outer = new Promise((resolve) => {
  resolve(inner);
});
console.log(outer === inner); // false
```

While `inner` is pending, `outer` can be pending while already resolved to/adopting `inner`.

Constructor-throw correction:

Do not say merely “if the executor throws before settlement.” Explain the first-resolution behavior: the constructor attempts to reject on an executor throw, but the Promise resolving functions ignore later attempts after one of them has already taken effect. This matters when `resolve(pendingPromise)` has already resolved the Promise while it is still pending.

Re-verify:

- Promise state/resolution terminology;
- `then` / `catch` / `finally` downstream behavior;
- combinators including empty-input behavior;
- `Promise.try()` synchronous callback invocation;
- `Promise.withResolvers()` shape and ownership guidance;
- cancellation boundary;
- `async` / `await` connection.

Update `lastVerified` to 2026-09-09 after verification.

## 7. Source policy for this pass

Use primary sources for normative behavior wherever available:

- ECMAScript 2026 for Promise semantics and Promise APIs;
- WHATWG HTML Living Standard for browser event-loop, task, microtask, timer, and rendering behavior;
- current Node.js documentation for Node-specific guidance;
- MDN as a supporting readable reference, especially for developer-facing explanations and compatibility context.

Do not cite a secondary article when a normative or first-party source directly supports the claim.

## 8. Test and validation strategy

### 8.1 Focused executable regression

Extend existing Promise tests with native-runtime checks for the identity/adoption boundary:

- `Promise.resolve(inner) === inner` for a native same-constructor Promise;
- `new Promise(resolve => resolve(inner)) !== inner`;
- the distinct outer Promise does not fulfill until the adopted inner Promise settles;
- a throw after calling `resolve(inner)` does not replace the adopted outcome.

These tests protect the exact semantics that the old prose got wrong.

### 8.2 Content-contract regression

Add focused authored-content tests only for durable, mechanically checkable requirements introduced by this PR. Avoid a broad prose style linter.

Good candidates:

- the three deep dives have `lastVerified: 2026-09-09` after successful re-verification;
- the Event Loop TL;DR no longer contains the known dangling “this browser diagram” reference;
- the Promise lesson no longer presents `Promise.resolve(inner)` as a distinct outer Promise;
- the Content Guide contains the named Clarity Contract principles.

These are migration/guardrail checks, not attempts to automate editorial judgment.

### 8.3 Existing gates

The exact final head must pass the repository's permanent CI:

- frozen install;
- lint;
- typecheck;
- unit tests;
- production build;
- Chromium setup;
- all browser/E2E tests;
- accessibility checks;
- repository-wide authored MDX fence audit;
- all-authored-route rendering/overflow audit.

No axe rule or existing content validation may be weakened.

## 9. Review method

Before merge, perform two distinct reviews.

### Technical review

For each changed factual claim/example, record the source used to verify it. Check especially:

- exact Promise object identity and resolution semantics;
- task/microtask/rendering guarantees versus browser freedom;
- Node-specific statements;
- `await` suspension wording and concurrency implications.

### Editorial review

Read each changed section as if it were retrieved alone. Ask:

- Can the reader identify every noun referred to by “this,” “that,” “above,” or “here”?
- Is every formal term defined before it carries explanatory weight?
- Is a guarantee explicitly scoped to browser, Node, ECMAScript, a provider, or application design as appropriate?
- Does any adjective hide the comparison dimension?
- Does the paragraph teach one main idea before adding caveats?

Record the final review in `docs/superpowers/plans/2026-09-09-content-reliability-clarity-self-review.md`.

## 10. PR and merge contract

PR #14 should be titled:

`fix: harden deep-dive reliability and clarity`

The PR body must distinguish:

- correctness fixes;
- pedagogical clarity revisions;
- authoring-contract changes;
- executable regression coverage;
- source re-verification.

The branch may be squash-merged only after exact-head CI succeeds and the final diff audit confirms no unrelated knowledge-map, learning-path, dependency, workflow, or UI-framework drift.
