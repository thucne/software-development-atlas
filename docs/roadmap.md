# Roadmap

Software Development Atlas grows through vertical slices and deliberate map coverage rather than broad scaffolding followed by bulk content generation.

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

**Goal:** create the smallest production-quality site capable of hosting the first content.

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

**Exit:** an empty/sample page renders correctly and the core navigation/search/build pipeline is validated.

## Phase 0.2 — Gold-standard vertical slice

**Goal:** define the deep-dive quality bar with one complete topic.

Recommended first deep dive: **Avoiding sequential async waterfalls**.

It should include a mental model, bad/better code, execution visualization, practical trade-offs, exercise, agent rule, primary sources, related topics, and freshness metadata.

**Exit:** the content is good enough to serve as the canonical deep-dive contributor example.

## Phase 0.3 — Learning primitives

**Goal:** extract only reusable components proven useful by the vertical slice and next few deep dives.

Likely candidates:

- code comparison
- execution timeline
- quiz/challenge
- benchmark visualization
- agent rule
- freshness badge
- source list

Add Sandpack only when content demonstrates a clear need for runnable code. Add WebContainers later and only for content that needs an actual in-browser Node.js environment.

**Exit:** repeated teaching patterns are easy to author without creating a large speculative component framework.

## Phase 0.4 — Knowledge map and representative coverage

**Goal:** make the Atlas visibly broader than its first content cluster and grow it by important software-engineering coverage rather than raw page count.

The canonical Software Engineering Map defines durable domains and major concepts. New content should fill high-value gaps, strengthen prerequisite connections, or add engineering judgment where reference material alone is insufficient.

Initial high-value coverage includes:

### Computing foundations
- processes and threads
- stack and heap
- I/O models
- filesystems

### Web platform and frontend
- HTTP request lifecycle
- DNS and TLS
- browser rendering
- CSR / SSR / SSG
- hydration

### Backend and data
- backend request lifecycle
- API design
- idempotency
- database indexes and query plans
- transactions and isolation
- queues and background jobs

### Architecture and distributed systems
- coupling and cohesion
- modular monoliths
- microservices trade-offs
- partial failure
- timeouts, retries, and backoff
- delivery semantics
- transactional outbox

### Cloud, operations, and security
- cloud networking
- containers and serverless
- IAM and secrets
- logs, metrics, and traces
- deployment strategies
- threat modeling and least privilege

### AI-native engineering
- coding agents
- context engineering
- agent-friendly repositories
- specs and plans
- verification loops
- machine-checkable guardrails
- agent review and evals

Roughly 25 excellent content items remains a useful first public milestone, but page count is not the primary success metric. Representative cross-domain coverage, correct concept placement, prerequisite connectivity, and quality matter more.

**Exit:** the Atlas has meaningful coverage across multiple major domains, not only a dense cluster in one technology area.

## Phase 0.5 — Curated learning paths

**Goal:** add opinionated sequences through subsets of the map without turning the map itself into one mandatory curriculum.

Candidate paths include:

- Modern Web Systems
- Backend Systems
- Cloud Architecture for Software Engineers
- AI-Native Software Engineering

Paths should order canonical concepts and recommend existing content; they should not duplicate the canonical explanations.

## Phase 0.6 — Decision guides and architecture walkthroughs

**Goal:** make senior-level engineering judgment a first-class Atlas experience.

Candidate decision guides include:

- CSR vs SSR vs SSG
- monolith vs modular monolith vs microservices
- Java vs Node.js vs Go vs Rust for backend workloads
- queue vs event stream
- containers vs serverless

Architecture walkthroughs should connect concepts across request flow, data, async boundaries, reliability, security, observability, and cost.

## Phase 1 — Community launch

**Goal:** make contribution and discovery good enough that external contributors can extend the Atlas safely.

Potential work after representative content coverage exists:

- generated coverage/freshness dashboard
- contributor-facing content preview improvements
- richer local search/ranking
- automated machine-readable exports such as `llms.txt`
- derived agent skill/rule bundles
- translation strategy
- community governance refinement

Paid infrastructure remains optional and must never become a silent requirement for the core site.
