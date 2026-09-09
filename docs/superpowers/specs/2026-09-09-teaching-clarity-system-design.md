# Atlas Teaching Clarity System Design

Date: 2026-09-09
Status: approved direction; written-spec review pending
Scope: all current substantive teaching content

## 1. Goal

Make every current substantive Atlas lesson easier for a working software developer to learn from without reducing technical depth or correctness.

The Atlas-wide learner baseline is:

> Assume the reader is a working software developer, but do not assume prior knowledge of the specific topic being taught beyond explicitly declared prerequisites.

A lesson may rely on ordinary programming vocabulary and on concepts named by its prerequisites. Topic-specific terminology must be explained in plain language before the lesson depends on it.

The primary teaching change is a reusable, always-visible terminology explanation box used near the first important occurrence of a potentially difficult term.

## 2. Why the current clarity contract is not enough

The existing Atlas Clarity Contract already requires authors to define formal terms before depending on them. That rule is correct but insufficient as a learning experience.

The current Event Loop lesson demonstrates the gap. It defines vocabulary, but the reader still encounters several abstract concepts in a short span: task, microtask, checkpoint, task source, rendering opportunity, user-agent scheduling freedom, ECMAScript Job, host, and starvation. The definitions exist, yet the lesson can still feel like a specification summary instead of a guided mental-model build.

The revised teaching contract therefore distinguishes two requirements:

1. **Editorial clarity:** the prose must define terms before depending on them.
2. **Learning support:** difficult topic-specific terms must be visually and locally explained at the point where the reader first needs them.

## 3. Scope

Revise all eight current substantive teaching pages:

### Programming / async

- `content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx`
- `content/docs/programming/async/how-the-browser-event-loop-works.mdx`
- `content/docs/programming/async/promises.mdx`

### Web platform

- `content/docs/web-platform/http-request-lifecycle.mdx`

### Engineering Judgment / decision guides

- `content/docs/engineering-judgment/decision-guides/csr-vs-ssr-vs-ssg.mdx`
- `content/docs/engineering-judgment/decision-guides/monolith-vs-modular-monolith-vs-microservices.mdx`
- `content/docs/engineering-judgment/decision-guides/containers-vs-serverless.mdx`

### Engineering Judgment / architecture walkthrough

- `content/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout.mdx`

Also update the reusable MDX layer and authoring rules:

- create `components/mdx/term-box.tsx`;
- expose `TermBox` from `components/mdx.tsx`;
- update `CONTENT_GUIDE.md`;
- update `AGENTS.md`.

Start Here, About, Freshness, Coverage, and learning-path overview pages are out of scope except where authoring guidance must describe the new teaching standard.

## 4. Non-goals

This pass must not:

- remove specification-level or production-level nuance merely to make a page shorter;
- turn the Atlas into beginner-programming material;
- explain ordinary working-developer vocabulary repeatedly;
- repeat definitions for concepts explicitly owned by a declared prerequisite unless the local use would otherwise be ambiguous;
- build a centralized glossary, concept database, automatic term-linking engine, tooltip system, or client-side term registry;
- make terminology boxes collapsible;
- add runtime services, analytics, databases, hosted AI, or new dependencies;
- change the canonical Atlas map or learning paths solely for prose clarity;
- replace existing labs, diagrams, matrices, source lists, or correctness tests;
- use an automated readability score or model-based prose judge.

## 5. Teaching contract

### 5.1 Progressive explanation order

For unfamiliar topic-specific material, prefer this order:

1. **Concrete problem or observable behavior** — show what the reader is trying to explain or decide.
2. **Plain-language rule** — state the useful mental model without specification jargon.
3. **Terminology box** — name and define the formal or potentially difficult term at the first point where it becomes useful.
4. **Small example** — show the rule operating on concrete code, data, or a system path.
5. **Deeper nuance** — add formal semantics, platform freedom, failure modes, exceptions, and production consequences.

A lesson does not need to mechanically repeat these five headings. This is an explanation order, not a required template.

### 5.2 What deserves a terminology box

Use a `TermBox` when a working software developer could plausibly know the surrounding domain but still be blocked by the term.

Good candidates include:

- specification vocabulary: `task source`, `microtask checkpoint`, `host`, `Promise adoption`;
- networking/runtime concepts: `revalidation`, `multiplexing`, `QUIC`, `execution environment`;
- architecture/reliability concepts: `transactional outbox`, `at-least-once delivery`, `reconciliation`, `backpressure`;
- rendering/deployment concepts: `hydration`, `request-time rendering`, `scale to zero`, `cold start`.

Do not box terms merely because they are technical. A box is unnecessary for ordinary syntax or baseline vocabulary such as function, object, array, HTTP request, database, API, client, server, or JavaScript unless the lesson gives the word a specialized meaning.

### 5.3 First-use rule

Place the box immediately before or after the first paragraph where the lesson materially relies on the term.

Do not define a difficult term several sections after using it as explanatory machinery.

If a term is introduced casually before it becomes important, the box belongs where the reader first needs the definition to reason correctly.

### 5.4 Box density

Boxes should lower cognitive load rather than interrupt every paragraph.

Prefer one box for one concept or a tightly coupled pair. Do not create a wall of boxes at the top of the page. If five terms depend on each other, introduce them incrementally as the lesson reaches each idea.

### 5.5 Prerequisite boundary

A lesson may assume concepts explicitly declared in `prerequisites`. For example, the event-loop lesson may assume basic Promise knowledge because `promises` is a prerequisite.

However, the lesson must still explain any *new role* that a prerequisite concept plays in the topic. Example: it need not re-teach what a Promise is, but it should explain that a Promise reaction participates in browser microtask processing when that scheduling relationship first matters.

### 5.6 Local completeness

A terminology box must make sense when retrieved by itself. Avoid definitions such as “the queue discussed above” or “this stage.” Name the actual concept and referent.

### 5.7 Depth preservation

Terminology support is not a substitute for rigorous prose. After the plain-language model is established, retain the distinctions that protect correctness:

- specification guarantee versus implementation freedom;
- latency versus throughput;
- concurrency versus CPU parallelism;
- Promise state versus resolution;
- HTTP semantics versus connection setup;
- local transaction atomicity versus cross-system recovery;
- provider-specific behavior versus a category label.

## 6. `TermBox` component

Create a small server-rendered MDX primitive at `components/mdx/term-box.tsx`.

### 6.1 Authoring interface

```tsx
<TermBox term="Microtask checkpoint">
A point where the browser runs queued microtasks until the microtask queue is empty.

**Why it matters here:** Promise reactions commonly run during this checkpoint before later regular task work continues.
</TermBox>
```

Interface:

```ts
type TermBoxProps = {
  term: string;
  children: React.ReactNode;
};
```

No other prop is required for the first version.

### 6.2 Rendering contract

The component must:

- render as a semantic `<aside>`;
- expose an accessible label containing the term;
- visibly render `What is <term>?` as the box heading;
- render authored child content without hiding or truncating it;
- require no client JavaScript;
- use existing Fumadocs/Tailwind design tokens rather than a new theme system;
- remain understandable in source/raw MDX because the full definition lives inside the authored component body.

The component must not:

- collapse behind a disclosure control;
- fetch data;
- link to a centralized glossary;
- infer definitions automatically;
- own canonical concept IDs.

## 7. Lesson-specific revision targets

### 7.1 How the Browser Event Loop Actually Works

This is the priority rewrite and the reference example for the other pages.

Reframe the opening around one concrete question: why does synchronous code finish, then an already-resolved Promise callback run, then a zero-delay timer run?

Build the mental model one layer at a time instead of presenting four abstract definitions together.

Required terminology support includes, at minimum:

- **task**;
- **microtask**;
- **microtask checkpoint**;
- **task source**;
- **rendering opportunity**;
- **microtask starvation**;
- **ECMAScript Job**;
- **host**.

Keep the standards-correct nuance that HTML does not define one universal FIFO macrotask queue, but move that nuance after the reader understands ordinary task → microtask-checkpoint → later-work behavior.

Keep browser-versus-Node distinctions, but introduce `Job` and `host` only in the formal boundary section.

### 7.2 Promises: Resolution, Chaining, and Failure

Reduce the initial terminology burden by starting from one small chain and tracing the downstream Promise outcome.

Required terminology support should cover the concepts that are easy to confuse:

- **settled**;
- **resolved**;
- **adoption**;
- **thenable**;
- **downstream Promise**;
- **Promise reaction**;
- **combinator** where the combinator section begins.

Do not create separate boxes for pending, fulfilled, and rejected if a single compact state-model explanation is clearer.

Preserve the verified identity/adoption distinction: `Promise.resolve(inner)` can return the same native Promise, while a separately constructed Promise can adopt it.

### 7.3 Avoiding Sequential Async Waterfalls

Start from a concrete three-request timeline, then name the scheduling concepts.

Required terminology support should cover:

- **async waterfall**;
- **dependency graph**;
- **concurrency** versus **parallelism**;
- **critical path**;
- **fan-out**;
- **backpressure**;
- **latency** versus **throughput** when production trade-offs are introduced.

Keep `Promise.all()` as an aggregation mechanism, not the definition of concurrency.

### 7.4 HTTP Request Lifecycle

Preserve the page's central separation between HTTP semantics and the network/setup path, but teach the path from common concrete cases first: fresh cache hit, reused connection, new connection, intermediary hit.

Terminology support should cover the terms most likely to block the walkthrough:

- **origin**;
- **intermediary**;
- **fresh** / **stale cache entry**;
- **revalidation**;
- **connection reuse**;
- **transport**;
- **secure session / TLS**;
- **multiplexing**;
- **QUIC**;
- **cache key**.

Avoid boxing every deployment component such as load balancer or reverse proxy unless its role becomes essential to a specific claim.

### 7.5 CSR vs SSR vs SSG

Introduce each model in one sentence of ordinary language before discussing operational trade-offs.

Terminology support should cover:

- **CSR**, **SSR**, and **SSG** as rendering locations/times, preferably one compact comparison box or closely spaced boxes;
- **hydration**;
- **request-time state**;
- **revalidation** in the static-generation context;
- **cache key** when shared-response reuse is discussed;
- **critical request path**.

Keep the decision guide constraint-driven rather than framework-driven.

### 7.6 Monolith vs Modular Monolith vs Microservices

The declared prerequisites own coupling/cohesion and domain-boundary fundamentals. Do not re-teach them generically.

Terminology support should focus on new decision consequences:

- **deployment unit / deployable**;
- **independent deployment**;
- **partial failure** in the network-boundary context;
- **eventual consistency**;
- **compensating workflow**;
- **blast radius**.

Keep the rule that microservices are not a maturity level and that a network boundary must earn its operational/correctness cost.

### 7.7 Containers vs Serverless

Teach packaging and operating model as two separate questions before provider examples.

Terminology support should cover:

- **container image**;
- **OCI**;
- **capacity provisioning**;
- **execution environment**;
- **autoscaling**;
- **cold start / startup latency**;
- **scale to zero**;
- **concurrency** in a managed-compute instance;
- **sidecar** only where the term is used as a real requirement.

Provider-specific examples remain examples of contracts, not definitions of the category.

### 7.8 Reliable Checkout Walkthrough

This page is advanced, but advanced does not mean unexplained vocabulary. The prerequisites cover API design, database transactions, and partial failure; the walkthrough must explain the additional distributed-systems machinery it introduces.

Terminology support should cover:

- **idempotency** in the application-command context;
- **ambiguous outcome**;
- **reconciliation**;
- **transactional outbox**;
- **message broker** and **consumer** where the asynchronous path begins;
- **at-least-once delivery**;
- **acknowledgement / redelivery**;
- **backoff and jitter**;
- **dead-letter path**;
- **correlation identifier**;
- **poison message/event** where operational recovery is discussed.

The happy path should remain understandable before the page dives into duplicate delivery and crash windows.

## 8. Authoring-guide changes

### 8.1 `CONTENT_GUIDE.md`

Add an **Atlas Teaching Contract** adjacent to the existing Clarity Contract.

It must state:

- the working-developer/no-topic-prior-knowledge baseline;
- the progressive explanation order;
- when to use `TermBox`;
- when not to use it;
- the first-use and prerequisite-boundary rules;
- that formal depth follows, rather than replaces, the plain-language mental model.

Add a short canonical `TermBox` example.

### 8.2 `AGENTS.md`

Extend the content-clarity checklist so automated contributors must check that:

- topic-specific difficult terms receive local plain-language explanation;
- `TermBox` is used when the term would otherwise create a learning barrier;
- boxes are placed near first substantive use and are not overused for baseline vocabulary.

Do not instruct agents to use an automated readability or jargon detector.

## 9. Testing strategy

### 9.1 Component unit test

Create `tests/term-box.test.ts` using React server rendering, following the existing `DecisionMatrix` test pattern.

Verify that `TermBox`:

- renders an `<aside>`;
- renders an accessible label containing the term;
- visibly includes `What is ...?`;
- preserves child explanation text;
- does not render a `<details>` disclosure.

### 9.2 MDX registration test

Verify `getMDXComponents()` exposes `TermBox` so authored MDX can use it without page-local imports.

### 9.3 Content migration tests

Extend `tests/content-clarity.test.ts` with narrow, mechanical migration checks rather than subjective prose scoring.

At minimum:

- all eight substantive pages contain at least one `TermBox`;
- the Event Loop page includes boxes for `Microtask checkpoint`, `Task source`, and `Rendering opportunity`;
- the Reliable Checkout page includes a `Transactional outbox` explanation;
- the Content Guide contains the working-developer baseline and `TermBox` rule.

These checks enforce the approved migration, not general prose quality.

### 9.4 Browser/E2E coverage

Add representative checks that:

- an Event Loop terminology box is visible and readable;
- a Reliable Checkout terminology box is visible and readable;
- the terminology box is exposed as an accessible complementary/aside region;
- raw Markdown for a representative lesson still contains the full explanation text;
- all existing lesson routes, labs, diagrams, matrices, and accessibility checks continue to pass.

### 9.5 Final validation

The exact final PR head must pass permanent CI:

- frozen dependency install;
- lint;
- typecheck;
- unit/content tests;
- production build;
- Chromium installation;
- full Playwright E2E suite;
- serious/critical accessibility checks;
- all-authored-route rendering/overflow audit.

No existing test or accessibility rule may be weakened to make the migration pass.

## 10. Freshness and factual verification

This is primarily a pedagogical rewrite, not a new technical-behavior release.

Do not change `lastVerified` merely because wording or ordering changed. Because all current substantive pages were already verified on 2026-09-09, retain that date unless implementation introduces a materially changed factual claim that requires a new verification event.

When rewriting a factual statement, preserve its existing source-backed meaning. If the rewrite changes the technical claim rather than merely clarifying it, re-check that claim against the primary/first-party sources already used by the lesson before committing it.

## 11. Review and merge contract

Implementation happens on a feature branch and is merged through a pull request.

Before merge:

1. review the diff for all eight target lessons and verify no substantive page was skipped;
2. verify terminology boxes are useful and not mechanically over-applied;
3. verify the Event Loop opening can be followed without knowing task-source or ECMAScript terminology in advance;
4. verify advanced sections still retain correctness caveats and platform boundaries;
5. verify full CI on the exact head is green;
6. inspect the PR scope for unrelated changes.

The user has authorized merging after the implementation is ready, but that authorization does not override the requirement for green final CI and a focused diff.