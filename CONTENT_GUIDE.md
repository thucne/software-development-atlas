# Content Guide

This document defines the canonical authoring standard for Software Development Atlas.

## Content goals

Every lesson should be:

- **Correct:** claims and examples are technically sound.
- **Deep:** it explains the mental model and trade-offs, not just syntax.
- **Scannable:** readers can quickly find the rule, example, or caveat they need.
- **Practical:** examples connect concepts to real software engineering.
- **Verifiable:** evolving claims point to primary sources when possible.
- **Composable:** prerequisites and related lessons form a navigable knowledge graph.
- **Agent-friendly:** the core explanation remains useful when consumed as Markdown without the full visual UI.

## Canonical frontmatter

The initial content schema is:

```yaml
---
title: Parallel Async Operations
description: Run independent asynchronous operations concurrently.
category: programming
level: intermediate
status: evolving
lastVerified: 2026-08-19
reviewAfterDays: 180
topics:
  - javascript
  - async
  - performance
prerequisites:
  - promises
related:
  - async-waterfalls
  - promise-all
technologies:
  - javascript
  - typescript
---
```

Required fields for normal lessons are `title`, `description`, `category`, `level`, `status`, `lastVerified`, `reviewAfterDays`, and `topics`. The application implementation will validate the schema in CI/build tooling before the first public content release.

## Difficulty

Use one of:

- `beginner` — no specialized prior knowledge beyond declared prerequisites;
- `intermediate` — assumes working development experience;
- `advanced` — requires substantial domain knowledge or combines several non-trivial concepts.

Difficulty is about prerequisite knowledge, not how important a topic is.

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

## Recommended lesson anatomy

Not every section is mandatory, but this is the default order:

1. **TL;DR** — the practical rule in a few sentences.
2. **Mental model** — the simplest model that explains the behavior.
3. **Why it matters** — consequences in real systems.
4. **Core explanation** — rigorous conceptual detail.
5. **Bad / better** — contrasting approaches when meaningful.
6. **Interactive example** — only when interaction improves understanding.
7. **Production considerations** — scaling, operability, compatibility, or failure modes.
8. **Testing / performance / security** — include the relevant dimensions, omit irrelevant boilerplate.
9. **Exercise or challenge** — a way to apply the concept.
10. **Agent rule** — concise guidance suitable for agent context when the concept maps cleanly to a coding rule.
11. **Related concepts** — graph edges to continue learning.
12. **Sources** — primary references and useful supporting material.

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

Do not add an interactive component when a static diagram or ten-line example communicates the concept more clearly.

Interactive components must work with keyboard input and expose an understandable non-visual representation where practical.

## Agent compatibility

A lesson's essential information must remain available in its textual/Markdown representation. Interactive UI may enhance the lesson, but must not contain the only explanation of an important rule.

Agent-oriented exports may eventually include raw Markdown, `llms.txt`, `SKILL.md`, `AGENTS.md`, and generated rule files. These representations should derive from canonical content rather than becoming divergent hand-maintained copies when automation is practical.

## Sources and citations

Rapidly evolving claims should cite primary sources whenever possible. Prefer official documentation, standards, original research, and upstream repositories.

Avoid citations that only repeat the author's opinion. A source should support a factual claim or provide meaningful further depth.

## Content that does not belong

- SEO filler or keyword-targeted articles with no learning value;
- unverified bulk AI-generated lessons;
- promotional content disguised as guidance;
- copied documentation or substantial copyrighted excerpts;
- advice that depends on an undisclosed paid service;
- examples whose only purpose is showing syntax already documented better upstream.
