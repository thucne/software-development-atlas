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

An `architecture-walkthrough` should trace one realistic vertical slice across boundaries. It should make the happy path understandable, then spend substantial attention on partial failure, recovery, security, observability, scaling/cost, and credible alternatives. A walkthrough is a reasoning aid, not a claim that every system should adopt the illustrated topology.

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
