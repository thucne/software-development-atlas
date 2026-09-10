# Content Guide

This document defines the canonical authoring standard for Software Development Atlas.

## Content goals

Every content item should be:

- **Correct:** claims and examples are technically sound.
- **Deep enough for its purpose:** it teaches the intended mental model and trade-offs rather than merely restating syntax.
- **Scannable:** readers can quickly find the rule, example, caveat, or decision they need.
- **Practical:** examples connect concepts to real software engineering.
- **Verifiable:** evolving claims point to primary sources when possible.
- **Composable:** prerequisites, canonical concepts, and related content form a navigable knowledge graph.
- **Agent-friendly:** the core explanation remains useful when consumed as Markdown without the full visual UI.

## Atlas placement

`content/atlas-map.json` is the canonical map of broad software-engineering domains and stable concept IDs.

Every normal authored MDX page declares `concepts`, even when the correct value is an empty list for meta/start-here guides. A concept reference is not a loose tag: it is a stable coordinate in the Atlas and CI rejects unknown or duplicate IDs.

Use `topics` for flexible discovery labels. Use `concepts` only for the canonical ideas the page genuinely teaches or applies.

Before creating a new concept ID:

1. check whether the idea already exists under another canonical name;
2. choose the domain that best represents the concept's durable home;
3. use a lowercase kebab-case ID that remains understandable without the page title;
4. add the concept deliberately to the canonical map before referencing it from content.

A concept may exist in the map before a dedicated content page exists. That is intentional: uncovered territory should remain visible.

### Bilingual and localization contract

Atlas supports bilingual documentation with Fumadocs native internationalization:

- **English is default:** `content/docs/**/<slug>.mdx` files are rendered at `/docs/<slug>`. English lessons must be written in **100% technical English**. No Vietnamese placeholder text, section headers, or commentary may appear in English files.
- **Vietnamese companion files:** `content/docs/**/<slug>.vi.mdx` files are rendered at `/vi/docs/<slug>`. Vietnamese companion lessons must be written in **100% natural, idiomatic Vietnamese**.
- **Canonical concept mapping:** Companion `.vi.mdx` files must declare the identical `concepts: [...]` array as their English sibling.
- **Coverage accounting:** Coverage calculations use the canonical English content tree (`source.getPages('en')`). Translated companion files provide localized accessibility without skewing coverage metrics or duplicating concept nodes.

## Coverage semantics

Atlas coverage is deliberately narrow. A canonical concept is **covered** when at least one substantive authored page references it in validated `concepts` frontmatter. Otherwise it is **uncovered**.

Coverage does not measure:

- learner completion or mastery;
- content importance;
- content quality;
- freshness health;
- how deeply every page treats the concept.

Do not attach a concept ID merely because a page mentions the term. Incidental placement makes the knowledge graph less truthful and artificially inflates domain and learning-path coverage.

## Learning paths

`content/learning-paths.json` defines curated sequences through the canonical map. A path is an opinionated learning order for a particular outcome, not a second taxonomy.

Path data owns:

- a stable path ID;
- title, description, audience, and intended target depth;
- learning outcomes;
- an ordered list of existing canonical concept IDs.

Path data does **not** own authored page URLs or duplicate lesson mappings. Available content is derived from each page's canonical `concepts` frontmatter.

Important concepts may remain in a path even when the Atlas has no authored content for them yet. Uncovered steps should stay visible; do not remove them merely to improve the displayed coverage ratio.

Path overview/orientation pages normally use `contentType: guide`, `learningDepth: recognize`, and `concepts: []` unless their authored prose itself materially teaches a canonical concept. Embedding a learning-path component does not automatically make that page substantive coverage for every step it displays.

## Engineering judgment content

Engineering Judgment is a presentation section, not a second knowledge registry. Decision guides and architecture walkthroughs remain canonical MDX content and use the same Atlas placement metadata as every other substantive page.

A `decision-guide` should begin with a decision under explicit constraints, not with a framework or product tour. A strong guide:

- names the alternatives being compared;
- states the forces that materially change the choice;
- compares trade-offs in authored order;
- explains failure modes and operational consequences;
- gives conditional heuristics rather than a universal winner;
- separates durable concepts from version-specific implementation details.

Use `DecisionMatrix` when a semantic table makes a repeated comparison easier to scan. The matrix is a static presentation primitive, not a scoring engine and not a second source of truth. The prose must still explain why each criterion matters and where the comparison stops applying.

A recommended decision-guide anatomy is:

1. **TL;DR** — frame the decision and the central trade-off.
2. **Decision frame** — list the constraints that materially change the choice.
3. **Options** — describe each alternative in durable, technology-independent terms first.
4. **Decision matrix** — compare explicit criteria when a table improves scanning.
5. **Strong-fit / weak-fit scenarios** — show when each alternative becomes attractive or risky.
6. **Trade-offs and failure modes** — include operational consequences, not only features.
7. **Practical heuristic** — provide a conditional sequence of questions rather than a winner.
8. **Questions to ask before choosing** — make the reasoning reusable in review/design work.
9. **Related concepts** — connect the decision back to the canonical map and learning paths.
10. **Sources** — prefer primary sources for evolving product/framework behavior.

An `architecture-walkthrough` should trace one realistic vertical slice across boundaries. It should make the happy path understandable, then spend substantial attention on partial failure, recovery, security, observability, scaling/cost, and credible alternatives. A walkthrough is a reasoning aid, not a claim that every system should adopt the illustrated topology.

A recommended architecture-walkthrough anatomy is:

1. **System goal and constraints** — define the scenario and assumptions.
2. **High-level flow** — use existing Mermaid support when a static system diagram helps.
3. **Boundary-by-boundary walkthrough** — trace request, data, trust, and async boundaries.
4. **State and transaction boundaries** — state what can be atomic and what requires recovery.
5. **Failure modes** — cover timeouts, duplicates, retries/redelivery, partial failure, and recovery where relevant.
6. **Security and trust boundaries** — identify identities, authorization, secrets, and sensitive data.
7. **Observability** — show correlation identifiers, logs, metrics, traces, and recovery signals.
8. **Scaling and cost** — explain bottlenecks, backpressure, operational ownership, and economics.
9. **Alternatives** — name simpler or differently optimized shapes and when they fit.
10. **Review checklist** — turn the walkthrough into reusable design-review questions.
11. **Related concepts** — connect the system reasoning back to the map and learning paths.
12. **Sources** — use authoritative references for protocols, provider behavior, and evolving operational claims.

For judgment content, attach only the canonical concepts the page genuinely teaches or applies. Cross-domain pages may cover several concepts, but mentioning a subsystem is not sufficient reason to claim its concept ID.

## Canonical frontmatter

A normal content item follows this shape:

```yaml
---
title: Parallel Async Operations
description: Run independent asynchronous operations concurrently.
category: programming
level: intermediate
status: evolving
lastVerified: 2026-09-09
reviewAfterDays: 180
topics:
  - javascript
  - async
  - performance
prerequisites:
  - promises
related:
  - async-waterfalls
technologies:
  - javascript
  - typescript
contentType: deep-dive
learningDepth: reason
concepts:
  - async-dependency-scheduling
---
```

Required fields for normal content are `title`, `description`, `category`, `level`, `status`, `lastVerified`, `reviewAfterDays`, `topics`, `prerequisites`, `related`, `technologies`, `contentType`, `learningDepth`, and `concepts`.

## Content types

Choose the smallest type that teaches the intended outcome well.

### `guide`

Project/meta guidance such as Start Here pages. Guides may legitimately have `concepts: []` when they explain how to use the Atlas rather than teach a software-engineering concept.

### `concept`

A focused mental model or reference-sized explanation, often readable in roughly 5-10 minutes. A concept page does not need an interactive lab merely to qualify as first-class Atlas content.

### `deep-dive`

A rigorous treatment of a concept or tightly related set of concepts. Deep dives may include richer examples, exercises, visualizations, and production reasoning when those materially improve understanding.

### `decision-guide`

Helps an engineer choose among approaches under explicit constraints. It should compare alternatives, expose trade-offs and failure modes, and avoid declaring one technology universally best.

### `field-guide`

Operational or practical guidance for applying, diagnosing, reviewing, or running a concept in real engineering work.

### `architecture-walkthrough`

Traces a system or vertical slice across multiple components and concepts, showing boundaries, data flow, failure modes, security, observability, and trade-offs.

Not every concept deserves a deep interactive lesson. Content depth should follow the learner need, not a page-count or UI-complexity target.

## Learning depth

`learningDepth` states the intended capability after studying the content. It is separate from prerequisite difficulty.

- `recognize` — identify the concept, vocabulary, role, and place in a larger system.
- `reason` — explain behavior, alternatives, trade-offs, constraints, and common failure modes.
- `operate` — design, debug, verify, review, or run the concept in realistic engineering work.

For example, an `intermediate` page may target `reason`: it assumes some prior knowledge but does not claim to make the reader a production specialist.

## Difficulty

Use one of:

- `beginner` — no specialized prior knowledge beyond declared prerequisites;
- `intermediate` — assumes working development experience;
- `advanced` — requires substantial domain knowledge or combines several non-trivial concepts.

Difficulty is about prerequisite knowledge, not importance or learning depth.

## Freshness categories

### `evergreen`

Fundamentals whose essential truth changes slowly, such as algorithmic complexity, basic operating-system concepts, or established protocol semantics.

Typical `reviewAfterDays`: `365`.

### `evolving`

Technology or practice that changes materially over time, such as framework behavior, database features, cloud runtime behavior, or library recommendations.

Typical `reviewAfterDays`: `180`.

### `frontier`

Rapidly changing material such as coding-agent patterns, model capabilities, emerging AI protocols, and new agentic-development workflows.

Typical `reviewAfterDays`: `90`.

`lastVerified` means a contributor intentionally checked that the material remained correct on that date. It is not simply the last edit date.

### Updating dates after an edit

When your change finishes, update dates only where they apply:

| Marker | Where | Bump when | Do not bump when |
| --- | --- | --- | --- |
| `lastVerified` | lesson frontmatter (and any body sentence that restates it) | intentional re-verification or material teaching/factual change; keep EN/VI pairs identical | typo-only, formatting-only, or unrelated wording |
| `atlasLastUpdated` | `lib/site-metadata.ts` (docs footer) | site/content maintenance that should show as “Atlas last updated”; sync tests that hard-code the footer string | every tiny edit; do not use it as a substitute for per-lesson `lastVerified` |

Use today's calendar date in ISO form (`YYYY-MM-DD`). Never mass-reset every lesson's `lastVerified` just because the site footer date moved.

## Recommended deep-dive anatomy

Not every content type needs every section. For a `deep-dive`, this is the default order:

1. **TL;DR** — the practical rule in a few sentences.
2. **Mental model** — the simplest model that explains the behavior.
3. **Why it matters** — consequences in real systems.
4. **Core explanation** — rigorous conceptual detail.
5. **Bad / better** — contrasting approaches when meaningful.
6. **Interactive example** — only when interaction improves understanding.
7. **Production considerations** — scaling, operability, compatibility, or failure modes.
8. **Testing / performance / security** — include relevant dimensions, omit irrelevant boilerplate.
9. **Exercise or challenge** — a way to apply the concept.
10. **Agent rule** — concise guidance suitable for agent context when the concept maps cleanly to a coding rule.
11. **Related concepts** — graph edges to continue learning.
12. **Sources** — primary references and useful supporting material.

Decision guides should emphasize constraints and comparison. Architecture walkthroughs should emphasize boundaries, flow, and system-level failure modes. Concept pages can be much shorter.

## Writing style

- Lead with the useful rule, then explain why.
- Prefer concrete nouns and verbs over jargon.
- Define terms before depending on them.
- Distinguish facts, recommendations, and trade-offs.
- State version-specific behavior explicitly.
- Avoid absolute rules when the real answer is conditional.
- Explain why an incorrect example fails.
- Keep paragraphs and sections focused enough to reference directly.

## Atlas Teaching Contract

Atlas lessons assume the reader is a **working software developer**, but do not assume prior knowledge of the specific topic beyond the page's explicitly declared prerequisites.

The goal is not to remove advanced terminology. The goal is to make each new term useful before the lesson asks the reader to reason with it.

### Teach from concrete behavior to formal depth

For unfamiliar topic-specific material, prefer this progression:

1. show the concrete problem, decision, or observable behavior;
2. state the useful rule in plain language;
3. explain difficult terminology visibly and locally;
4. walk through a small example;
5. add specification detail, platform boundaries, failure modes, and production nuance.

This is an explanation order, not a requirement to create five headings in every lesson.

### Use `TermBox` for learning barriers

Use `<TermBox>` when a topic-specific term could plausibly block a working developer who knows the declared prerequisites. Good candidates include specification terms such as *microtask checkpoint*, architecture terms such as *transactional outbox*, or platform terms such as *hydration* and *execution environment*.

Place the box near the **first substantive use** of the term—the first point where understanding the term matters to the reasoning. Do not define important vocabulary several sections after it has already become explanatory machinery.

Do not box ordinary working-developer vocabulary merely because it is technical. Functions, objects, arrays, ordinary HTTP requests, databases, APIs, clients, servers, and similar baseline terms normally need no box unless the lesson gives the word a specialized meaning.

A lesson may assume concepts explicitly named by its prerequisites, but it still needs to explain a **new role** that prerequisite knowledge plays in the current topic. For example, an event-loop lesson need not re-teach what a Promise is, but it should explain how a Promise reaction participates in browser microtask processing.

Keep box density low enough that the lesson still flows. If several terms depend on one another, introduce them incrementally instead of creating a wall of definitions at the top of the page.

Canonical example:

```mdx
<TermBox term="Microtask checkpoint">
A point where the browser runs queued microtasks until the microtask queue is empty.

**Why it matters here:** Promise reactions commonly run during this checkpoint before later regular task work continues.
</TermBox>
```

The full definition belongs in authored MDX so the essential explanation remains useful in raw Markdown and agent retrieval. `TermBox` is presentation support, not a centralized glossary or second concept registry.

## Atlas Clarity Contract

Atlas content is designed to be read in a full page, reached through search at a specific heading, copied as raw Markdown, or retrieved as context by an agent. A paragraph that is understandable only when the reader remembers a previous visual is therefore not sufficiently referenceable.

The rules below are editorial requirements. They are not a mandate to build a prose linter, ban ordinary pronouns, or make every sentence simplistic.

### Local completeness

A section should remain understandable when a reader lands on it directly. Use a pronoun or shorthand only when its referent is locally obvious.

Weak:

> Do not carry this diagram into Node.js.

The reader may not know which diagram was meant if the section was retrieved alone.

Prefer:

> Do not treat the browser scheduling model on this page as a Node.js event-loop model.

The goal is not to ban words such as “this,” “that,” “above,” or “here.” The goal is to make the referenced noun unambiguous without requiring hidden page context.

### Define before depending

Introduce the plain-language idea before making formal terminology carry explanatory weight.

A strong progression is:

1. show observable behavior or the concrete engineering problem;
2. state the useful rule in ordinary language;
3. walk through a small example;
4. name the formal term or abstraction;
5. add specification details, platform boundaries, and edge cases.

Formal vocabulary matters. Terms such as *task source*, *MVCC*, *linearizability*, or *host hook* should be defined when they become useful rather than dropped into the TL;DR before the reader can use them.

### Scope guarantees and recommendations

Make clear what kind of statement the reader is seeing:

- **Language / specification / API guarantee:** behavior defined by the relevant language, protocol, standard, or documented API contract.
- **Runtime / implementation / provider freedom:** behavior the specification or product intentionally leaves variable.
- **Engineering recommendation or heuristic:** guidance that depends on workload, constraints, costs, or team capabilities.

Name the scope in the sentence when confusion is plausible. “Browsers may choose among runnable task queues where HTML leaves the choice implementation-defined” is more reliable than “the scheduler can choose.” “For latency-sensitive independent I/O, start the operations before awaiting them” is more reliable than “parallel is faster.”

Do not turn an observed implementation behavior into a platform guarantee, or a useful heuristic into a universal rule.

### Conditions over vague ranking words

Words such as *better*, *cheap*, *fast*, *simple*, *strong fit*, *usually*, or *scalable* can hide the dimension that actually changes the decision.

Weak:

> SSR is a strong fit.

Prefer:

> SSR is useful when the initial HTML must incorporate request-time state and rendering can remain on the latency-sensitive request path.

Weak:

> Choose the cheapest option.

Prefer the dimension that matters: request-time compute cost, client JavaScript, infrastructure ownership, operational effort, latency, or another explicit constraint.

Concise adjectives are fine when the comparison dimension is already explicit in the same sentence, table row, or decision frame.

### One main claim per sentence

Avoid sentences that simultaneously define a term, introduce an exception, compare another runtime, and give a recommendation. Split independent claims so each one can be checked and understood on its own.

A caveat can follow immediately after a rule without being packed into the same sentence.

### Examples are factual claims

Treat code, diagrams, timelines, output traces, and decision matrices as technical claims, not decoration.

When practical:

- execute examples;
- protect important semantics with tests;
- trace non-executable examples against primary or first-party sources;
- verify that comments and expected output match the real runtime/API behavior;
- state when an example intentionally simplifies production error handling or platform detail.

A plausible-looking example that teaches the wrong object identity or ordering is a correctness bug even when the prose around it sounds reasonable.

### TL;DR discipline

A TL;DR should normally answer three questions:

1. What concept, problem, or decision is this page about?
2. What practical rule should the reader retain?
3. What important mistake should the reader avoid?

Do not front-load specification vocabulary, provider trivia, or edge cases that the reader does not need in order to apply the central rule correctly. Put rigorous detail in the body, after the usable mental model has been established.

### Put caveats beside the claim they qualify

Do not collect every possible exception in the opening paragraph. Teach the simplest model that is correct for the stated scope, then put the limitation next to the statement or example it constrains.

For example, explain that a timer is later scheduling before discussing nested-timer minimum delays; explain the common Promise chain rule before discussing thenable assimilation; explain a rendering strategy before listing framework-specific cache behavior.

This keeps the first model usable without hiding important boundaries.

## Visual Cadence & Pedagogical Engagement

Visuals are teaching tools, not decoration. Substantive lessons (`deep-dive`, `decision-guide`, `architecture-walkthrough`) should usually target **3–4 meaningful visual anchors**, with a visual break roughly every **1–2 conceptual sections** when that improves comprehension.

**Visual anchors are not image quotas.** A strong lesson may contain one static teaching illustration, one exact programmatic diagram, one Mermaid graph, and one interactive lab. Another may contain only exact diagrams. Do not add generated artwork merely to satisfy cadence.

### Choose the visual medium from the learning objective

Before creating a visual, state the learner misunderstanding it should prevent, then choose the medium whose strengths match that teaching need.

- **Programmatic diagram:** prefer when correctness depends on exact state, ordering, timing, values, protocol layering, dependency graphs, transaction boundaries, editable labels, or numeric relationships.
- **Static teaching illustration:** prefer when the main goal is spatial or operational intuition: bottlenecks, resource pressure, fan-out/backpressure, blast radius, lifecycle/cold starts, overloaded dependencies, ambiguous distributed outcomes, ownership boundaries, retry storms, or cascading failure.
- **Mermaid:** prefer textual/diffable decision trees, sequence diagrams, state graphs, and structural flows that benefit from straightforward source edits.
- **Interactive lab/explorer:** use only when changing inputs, stepping through behavior, making predictions, or exploring multiple scenarios materially improves the mental model.

Do not replace an exact diagram with generated artwork merely for visual novelty.

### Static teaching illustration contract

The existing semantic authoring boundary remains stable:

```mdx
<AtlasIllustration id="bounded-concurrency" />
```

Lesson MDX should not need to know whether that semantic ID is rendered by a programmatic diagram or a static teaching asset.

For static teaching illustrations:

1. store the shared asset at `public/illustrations/<domain>/<illustration-id>.webp`;
2. use the semantic illustration ID as the filename;
3. reuse the same asset across English and Vietnamese by default;
4. keep localized title, caption, and accessible description in HTML/component metadata;
5. keep exact labels, numbers, state names, and protocol guarantees outside image pixels when they matter to reasoning;
6. use little or no meaningful baked-in prose;
7. keep the surrounding lesson technically understandable without the image;
8. do not use color as the only carrier of meaning;
9. ensure the visual is understandable at normal article width without accidental horizontal scrolling;
10. update or revert the image if later technical corrections make its implication misleading.

The default first-generation canvas is 16:9 landscape, normally **1600×900**, delivered as compressed WebP with a target payload below roughly **300 KB** where practical.

Published substantive lessons must not contain illustration-placeholder blocks. A temporary draft placeholder may be used while work is in progress, but it must be explicit, language-pure, and replaced before publication.

### Atlas teaching-illustration art direction

Generated/static teaching illustrations should look recognizably like one Atlas family:

- dark-native charcoal, graphite, and deep-navy canvas;
- restrained semantic accents;
- emerald/cyan for healthy or allowed flow;
- amber for pressure, delay, uncertainty, or constrained capacity;
- red only for failure or dangerous overload;
- simplified infrastructure/runtime objects;
- subtle depth or isometric perspective only when it clarifies relationships;
- strong negative space and a clear reading direction, usually left-to-right;
- minimal ornament;
- no stock-photo aesthetic or product logos;
- no decorative people unless human behavior is essential to the concept.

### Stable generation prompt recipe

A teaching-illustration generation brief should specify:

1. the exact learner misconception or mental model;
2. the primary spatial relationship;
3. required objects or system boundaries;
4. flow direction;
5. which conditions are healthy, constrained, ambiguous, or failed;
6. the Atlas technical-editorial art direction;
7. minimal/no baked text;
8. 16:9 landscape composition;
9. sufficient negative space for responsive framing;
10. semantic implications the image must avoid.

Example:

```text
Create a Software Development Atlas teaching illustration for bounded concurrency.
Teaching goal: make it immediately clear that a large queue of independent jobs is intentionally narrowed through five active workers to protect a finite downstream database/API.
Composition: left-to-right 16:9 technical editorial scene. Large dense waiting queue on the left, narrow five-lane worker gate in the center, finite downstream service on the right. Queued work must look waiting rather than active. Healthy flow uses restrained emerald/cyan; pressure uses amber. Dark charcoal/navy self-contained canvas, subtle depth, minimal ornament, no people, no logos, no paragraph text, no important labels or numbers baked into pixels.
Do not imply that only five jobs exist; the limit applies to active work while the larger backlog waits.
```

Prompts must come from verified lesson semantics, not from aesthetics alone.

### Visual review checklist

Review every new or materially revised visual anchor:

- [ ] **Teaching purpose:** What misunderstanding does this visual prevent?
- [ ] **Medium:** Is programmatic diagram, static teaching illustration, Mermaid, or interaction the best medium?
- [ ] **Accuracy:** Does the visual imply anything stronger than verified prose supports?
- [ ] **Redundancy:** Is another nearby visual already teaching the same relationship?
- [ ] **Localization:** Can English and Vietnamese reuse the same semantic asset?
- [ ] **Embedded text:** Can required labels and numbers remain outside image pixels?
- [ ] **Accessibility:** Is the teaching point available without interpreting pixels alone?
- [ ] **Responsive behavior:** Is the visual understandable at normal article width without accidental overflow?
- [ ] **Durability:** Will minor terminology or numeric corrections avoid unnecessary image regeneration?
- [ ] **Consistency:** Does the visual follow the Atlas art direction rather than introducing a new style?

### Production micro-scenarios

Abstract architecture and language specs can feel detached from daily work unless anchored to real production consequences. Every substantive guide or deep dive should feature at least one realistic micro-scenario structured with three parts matching the file's language:

- **For English (`*.mdx`):**
  1. **Impact:** The real-world symptom (e.g. 504 gateway timeout, unhandled rejection in background task causing phantom orders, 1.2s UI freeze causing INP failure).
  2. **Root cause:** The exact conceptual misunderstanding (e.g. confusing microtasks with yielding, assuming client-side cache always touches network).
  3. **Correct pattern:** The recommended code or architectural solution.

- **For Vietnamese (`*.vi.mdx`):**
  1. **Hậu quả:** Triệu chứng thực tế trên production (ví dụ: lỗi 504 gateway timeout, unhandled rejection trong task nền tạo đơn hàng ma, đóng băng UI 1.2s khiến chỉ số INP báo đỏ).
  2. **Nguyên nhân cốt lõi:** Lỗ hổng trong mô hình tư duy (ví dụ: nhầm lẫn microtask với yielding, lầm tưởng client cache luôn gọi network).
  3. **Cách khắc phục chuẩn:** Đoạn code chuẩn hoặc giải pháp kiến trúc khắc phục triệt để.

### Active mental-model checks with `<details>`

Exercises, quizzes, and scenario reasoning questions should give the reader an opportunity to test their intuition before seeing the answer:

```markdown
<details>
<summary>Show the reasoning</summary>

- Concise bullet points explaining the step-by-step resolution, state transition, or failure diagnosis.

</details>
```

Use `<summary>Xem giải thích chi tiết</summary>` in Vietnamese companion files.

### Actionable review checklists

At the end of decision guides, walkthroughs, or agent rules, replace open-ended narrative questions with markdown task lists (`- [ ]`). The repository's CSS (`app/globals.css`) provides custom hanging indent styling for checklist items:

```markdown
- [ ] **Keyword / Criterion:** Concrete check or constraint to evaluate.
```

## Code examples

Code should be minimal enough to understand but realistic enough not to teach dangerous habits.

When relevant:

- show incorrect and corrected code side by side;
- include error handling or explicitly state that it is omitted for teaching focus;
- avoid secrets, real credentials, or unsafe defaults;
- identify version-sensitive APIs;
- prefer executable examples where correctness can be automatically tested.

## Interactive content

Interactivity must earn its complexity. Good uses include execution timelines, state transitions, request waterfalls, memory diagrams, query-plan exploration, benchmarks, and runnable code.

Do not add an interactive component when a static diagram or ten-line example communicates the concept more clearly. Interactive components must work with keyboard input and expose an understandable non-visual representation where practical.

## Agent compatibility

A content item's essential information must remain available in its textual/Markdown representation. Interactive UI may enhance the page, but must not contain the only explanation of an important rule.

Agent-oriented exports may eventually include raw Markdown, `llms.txt`, `SKILL.md`, `AGENTS.md`, and generated rule files. These representations should derive from canonical content rather than becoming divergent hand-maintained copies when automation is practical.

## Sources and citations

Rapidly evolving claims should cite primary sources whenever possible. Prefer official documentation, standards, original research, and upstream repositories.

Avoid citations that only repeat the author's opinion. A source should support a factual claim or provide meaningful further depth.

## Content that does not belong

- SEO filler or keyword-targeted articles with no learning value;
- unverified bulk AI-generated content;
- promotional content disguised as guidance;
- copied documentation or substantial copyrighted excerpts;
- advice that depends on an undisclosed paid service;
- examples whose only purpose is showing syntax already documented better upstream.