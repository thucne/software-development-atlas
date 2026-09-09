# Engineering Judgment Content Design

**Date:** 2026-09-09  
**Status:** Approved implementation scope following PR #10  
**Extends:** `docs/superpowers/specs/2026-09-09-learning-paths-coverage-design.md`

## 1. Purpose

PR #9 established the canonical Software Engineering Map. PR #10 added curated learning paths and truthful coverage. PR #11 adds the next layer: first-class content for engineering judgment.

The goal is to help an experienced engineer answer two different classes of questions:

1. **Decision question:** given explicit constraints, which approach is the best fit and what trade-offs am I accepting?
2. **Architecture question:** how do concepts interact across a realistic system boundary, especially under failure, security, observability, and cost constraints?

This layer should teach reusable reasoning rather than framework popularity or universal "best practices".

## 2. Approaches considered

### A. Put judgment content inside each technical domain

This keeps related content physically close to its concepts, but makes decision guides and cross-domain walkthroughs difficult to discover as a distinct learning mode.

### B. Create a separate machine-readable decision/walkthrough registry

This could support generated indexes, but it would introduce another source of truth before the content base demonstrates that such a registry is needed.

### C. Add a top-level Engineering Judgment section backed by ordinary canonical MDX content

This preserves the existing content model, uses `contentType` as the classification mechanism, and makes senior-level reasoning visibly first-class without introducing a second registry.

**Decision:** use approach C. Decision guides and architecture walkthroughs remain ordinary validated MDX pages with canonical concept placement. Navigation gives them a first-class home; no new JSON registry is added.

## 3. Scope

This PR includes:

- a top-level **Engineering Judgment** documentation section;
- a **Decision Guides** subsection;
- an **Architecture Walkthroughs** subsection;
- three representative decision guides:
  - CSR vs SSR vs SSG;
  - monolith vs modular monolith vs microservices;
  - containers vs serverless;
- one representative architecture walkthrough:
  - reliable checkout flow;
- one small static `DecisionMatrix` MDX primitive, extracted because all three decision guides need the same comparison pattern;
- unit/render-contract and E2E/accessibility coverage for the primitive and new routes;
- narrow updates to authoring, contributor, agent, README, and roadmap guidance.

This PR intentionally excludes:

- Java vs Node.js vs Go vs Rust comparison content;
- queue vs event stream content;
- personalized recommendation engines;
- a decision-tree engine or rules DSL;
- a machine-readable decision catalog;
- an architecture-diagram editor;
- interactive/client-heavy comparison widgets;
- bulk-generated decision guides or walkthroughs;
- paid/runtime infrastructure.

The excluded candidate guides remain future content once the first-class format is proven.

## 4. Information architecture

Add:

```text
content/docs/engineering-judgment/
├── index.mdx
├── meta.json
├── decision-guides/
│   ├── meta.json
│   ├── csr-vs-ssr-vs-ssg.mdx
│   ├── monolith-vs-modular-monolith-vs-microservices.mdx
│   └── containers-vs-serverless.mdx
└── architecture-walkthroughs/
    ├── meta.json
    └── reliable-checkout.mdx
```

`content/docs/meta.json` exposes `engineering-judgment` as a top-level section.

No page URL or content relationship is duplicated in a new registry. Existing MDX frontmatter remains canonical for content type, learning depth, and concept placement.

## 5. Decision-guide contract

A decision guide must:

1. state the decision and the constraints that materially affect it;
2. describe each option in technology-independent terms before discussing ecosystem-specific details;
3. compare options across explicit criteria;
4. identify strong-fit and weak-fit scenarios;
5. expose operational costs and failure modes;
6. give a conditional recommendation rather than a universal winner;
7. distinguish durable reasoning from version-sensitive implementation details;
8. map only to canonical concepts it materially teaches or applies.

Recommended anatomy:

```text
TL;DR
Decision frame
Options
Decision matrix
Strong-fit scenarios
Trade-offs and failure modes
Practical heuristics
Questions to ask before choosing
Related concepts
Sources
```

Decision guides normally target `learningDepth: reason` unless they genuinely teach an operational review workflow.

## 6. Architecture-walkthrough contract

An architecture walkthrough must trace one realistic system or vertical slice across boundaries. It should cover, where relevant:

- request/data flow;
- trust boundaries;
- transaction boundaries;
- synchronous vs asynchronous work;
- partial failure and retry behavior;
- idempotency or duplicate-delivery implications;
- observability;
- scaling/cost considerations;
- explicit alternatives and trade-offs.

Recommended anatomy:

```text
System goal and constraints
High-level flow
Boundary-by-boundary walkthrough
State and transaction boundaries
Failure modes
Security and trust boundaries
Observability
Scaling and cost
Alternatives
Review checklist
Related concepts
Sources
```

Walkthroughs should prefer existing Mermaid support for system flow rather than introduce a new diagram framework.

## 7. Reusable DecisionMatrix primitive

Create `components/judgment/decision-matrix.tsx`.

The component is static/server-compatible and renders a semantic HTML table. It accepts:

```ts
export type DecisionMatrixRow = {
  criterion: string;
  values: readonly string[];
};

export function DecisionMatrix({
  options,
  rows,
  caption,
}: {
  options: readonly string[];
  rows: readonly DecisionMatrixRow[];
  caption: string;
})
```

Runtime validation inside the component must reject rows whose `values.length` does not match `options.length`, because malformed matrices are otherwise easy to author in MDX.

The component must:

- render `<table>` with `<caption>`, column headers, and row headers;
- require no client JavaScript;
- keep all visible comparison text in MDX source props, so the source remains agent-readable;
- avoid rating scales, color semantics, or scoring algorithms that imply false precision.

Register `DecisionMatrix` in `components/mdx.tsx`.

No second reusable primitive is added in this PR. Mermaid plus ordinary headings/lists are sufficient for the first walkthrough; further extraction should wait for repeated evidence.

## 8. Representative decision guides

### CSR vs SSR vs SSG

Primary canonical concepts:

- `csr-ssr-ssg`
- `hydration`
- `frontend-data-fetching`
- `http-caching`
- `cdn-behavior`

Decision criteria should include personalization, freshness, interactivity, initial response, CDN/cache fit, server cost, and operational complexity.

The guide must avoid treating modern frameworks as a one-to-one mapping to a single rendering model; frameworks can combine strategies per route or component.

### Monolith vs modular monolith vs microservices

Primary canonical concepts:

- `monolith-architecture`
- `modular-monolith`
- `microservices`
- `domain-boundaries`
- `coupling-and-cohesion`
- `partial-failure`

Decision criteria should include deployment independence, transaction simplicity, team ownership, failure isolation, operational complexity, scaling boundaries, and debugging cost.

The guide must explicitly communicate that microservices introduce distributed-systems costs rather than being a default maturity upgrade.

### Containers vs serverless

Primary canonical concepts:

- `containers`
- `serverless-compute`
- `cloud-compute`
- `autoscaling`
- `deployment-strategies`

Decision criteria should include workload duration, traffic shape, startup sensitivity, runtime control, scaling model, local parity, operational ownership, and cost predictability.

The guide should remain provider-independent and distinguish the compute model from any specific vendor product.

## 9. Reliable checkout walkthrough

The walkthrough models a generic checkout request with payment, order state, inventory or fulfillment side effects, and asynchronous notification/processing.

Primary canonical concepts:

- `api-design`
- `idempotency`
- `database-transactions`
- `background-jobs`
- `message-queues`
- `transactional-outbox`
- `partial-failure`
- `retries-and-backoff`
- `delivery-semantics`
- `logs-metrics-traces`
- `threat-modeling`

The walkthrough must not pretend one architecture is mandatory. Its reference flow should demonstrate one robust shape and explicitly show alternatives.

The core teaching sequence is:

```text
Client
  -> Checkout API
  -> local transaction: order state + outbox
  -> external payment boundary with idempotency
  -> durable event publication
  -> asynchronous fulfillment / notification consumers
```

The text must examine ambiguous outcomes such as payment success followed by application timeout, duplicate requests, message redelivery, consumer failure, and observability across asynchronous boundaries.

No real payment-provider API or vendor-specific integration is required.

## 10. Testing strategy

Follow TDD for code behavior.

Add tests for `DecisionMatrix` that prove:

- semantic table/caption/headers render correctly;
- options and criteria preserve authored order;
- mismatched row widths throw a clear error;
- no client-only behavior is required.

Add Playwright coverage that proves:

- Engineering Judgment is discoverable in docs navigation;
- one representative decision guide renders its decision matrix;
- the reliable checkout walkthrough renders its system-flow content;
- representative decision-guide and walkthrough pages have no serious/critical axe violations.

Existing content-schema and concept-reference validation remains authoritative for the new MDX pages.

Final verification remains:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## 11. Documentation and agent rules

Update `CONTENT_GUIDE.md` with explicit decision-guide and architecture-walkthrough anatomy and source expectations.

Update `AGENTS.md` so an agent creating judgment content must:

- start from an explicit decision/system question;
- map only genuinely taught concepts;
- avoid universal winners and framework popularity rankings;
- distinguish durable reasoning from evolving implementation behavior;
- prefer primary sources for evolving claims;
- reuse `DecisionMatrix` only when a comparison table materially improves clarity;
- use Mermaid for walkthrough flow before inventing new diagram components.

Update `CONTRIBUTING.md`, `README.md`, and `docs/roadmap.md` narrowly to reflect that Phase 0.6 is now implemented as a first-class content mode.

## 12. Acceptance criteria

- [ ] Engineering Judgment is a discoverable top-level docs section.
- [ ] Decision Guides and Architecture Walkthroughs are separate discoverable subsections.
- [ ] Three representative decision guides exist with valid canonical metadata.
- [ ] Reliable Checkout exists as an architecture walkthrough with valid canonical metadata.
- [ ] `DecisionMatrix` is server/static friendly and semantically accessible.
- [ ] `DecisionMatrix` rejects malformed row widths.
- [ ] Decision guides use explicit criteria and conditional recommendations rather than universal winners.
- [ ] Walkthrough covers data flow, transaction boundaries, async work, partial failure, security, observability, and alternatives.
- [ ] No new content registry or runtime service is introduced.
- [ ] No client-heavy comparison/diagram framework is introduced.
- [ ] Contributor/agent guidance matches the implemented content mode.
- [ ] Full CI passes on the current PR head.
- [ ] Final whole-branch review has no blocking findings.
- [ ] Post-merge CI on `main` passes.

## 13. Autonomous iteration rule

The implementing agent must iterate until all acceptance criteria are satisfied and current-head CI is green. Any failed test, content validation error, accessibility issue, or review finding requires a root-cause fix, narrow re-verification, then a fresh full CI run. Do not weaken content validation or remove important trade-offs merely to make a test or build pass.