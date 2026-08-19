# Roadmap

Software Development Atlas will grow through vertical slices rather than broad scaffolding followed by bulk content generation.

## Phase 0 — Foundation

**Goal:** agree on the product contract before framework implementation.

- mission and principles
- zero-cost guarantee
- content/freshness model
- contribution standard
- agent instructions
- issue and pull-request templates
- written foundation design

**Exit:** foundation design is reviewed and approved.

## Phase 0.1 — Documentation shell

**Goal:** create the smallest production-quality site capable of hosting the first lesson.

Planned capabilities:

- Next.js + TypeScript + Fumadocs + MDX
- responsive documentation layout
- sidebar and table of contents
- previous/next navigation
- theme support
- code highlighting
- Mermaid support
- local/build-time search
- Edit this page on GitHub
- raw/clean Markdown path where supported by the selected implementation
- content frontmatter validation
- baseline tests, accessibility checks, and build CI

**Exit:** an empty/sample lesson renders correctly and the core navigation/search/build pipeline is validated.

## Phase 0.2 — Gold-standard vertical slice

**Goal:** define the real lesson quality bar with one complete topic.

Recommended first lesson: **Avoiding sequential async waterfalls**.

It should include a mental model, bad/better code, execution visualization, practical trade-offs, exercise, agent rule, primary sources, related topics, and freshness metadata.

**Exit:** the lesson is good enough to serve as the canonical contributor example.

## Phase 0.3 — Learning primitives

**Goal:** extract only the reusable components proven useful by the vertical slice and next few lessons.

Likely candidates:

- code comparison
- execution timeline
- quiz/challenge
- benchmark visualization
- agent rule
- freshness badge
- source list

Add Sandpack only when a lesson demonstrates a clear need for runnable code. Add WebContainers later and only for lessons that need an actual in-browser Node.js environment.

**Exit:** repeated teaching patterns are easy to author without creating a large speculative component framework.

## Phase 0.4 — First content collection

**Goal:** roughly 25 exceptional lessons.

Initial clusters:

### Foundations
- processes vs. threads
- stack vs. heap
- HTTP request lifecycle
- DNS
- database indexes
- transactions

### JavaScript / TypeScript
- event loop
- promises
- async waterfalls
- closures
- type narrowing

### React / Web
- rendering model
- Server vs. Client Components
- Suspense
- hydration
- bundle optimization

### Backend / Distributed Systems
- idempotency
- caching
- queues
- race conditions
- distributed locks

### AI-era Engineering
- coding agents
- context engineering
- tool calling
- MCP
- verification-driven development

The exact set may shift as prerequisite relationships become clearer; the quality target does not.

## Phase 1 — Community launch

**Goal:** make contribution and discovery good enough that external contributors can extend the Atlas safely.

Potential work after the initial content base exists:

- generated freshness dashboard
- contributor-facing content preview improvements
- richer local search/ranking
- automated machine-readable exports such as `llms.txt`
- derived agent skill/rule bundles
- translation strategy
- community governance refinement

Paid infrastructure remains optional and must never become a silent requirement for the core site.
