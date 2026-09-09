# HTTP Request Lifecycle Lesson Design

## Goal

Add the first Phase 0.4 cross-domain vertical slice: an `operate`-depth Web Platform deep dive that teaches engineers how to trace a real HTTP request from application intent to response consumption without implying that every request repeats DNS, transport, TLS, or origin work.

## Central rule

An HTTP request is a request/response exchange, not necessarily a brand-new network connection. A request may be satisfied by a cache, routed through intermediaries, reuse an existing connection, or require new transport setup. DNS, transport, and TLS affect end-to-end latency, but they are adjacent layers rather than HTTP semantics themselves.

## Canonical placement

- Path: `content/docs/web-platform/http-request-lifecycle.mdx`
- Category: `web-platform`
- Content type: `deep-dive`
- Learning depth: `operate`
- Level: `intermediate`
- Status: `evolving`
- `lastVerified`: `2026-09-09`
- `reviewAfterDays`: `180`
- Canonical concepts:
  - `http-request-lifecycle`
- Related concepts should point readers toward `dns-resolution`, `tls-and-https`, `http-caching`, `cdn-behavior`, `backend-request-lifecycle`, and `idempotency` without falsely claiming coverage for those concepts on this page.

The root docs navigation gains a `web-platform` section. The page should become available to the existing Modern Web Systems learning path automatically through canonical concept placement; no duplicate lesson URL is added to learning-path data.

## Standards model

Primary sources:

1. RFC 9110 — HTTP Semantics.
2. RFC 9111 — HTTP Caching.
3. RFC 9113 — HTTP/2.
4. RFC 9114 — HTTP/3.
5. WHATWG Fetch Living Standard, verified 2026-09-09.

The lesson must preserve these boundaries:

- RFC 9110 defines semantics shared across HTTP versions.
- HTTP/2 and HTTP/3 change message transport/framing and connection behavior without replacing the shared semantics.
- HTTP/2 allows multiple concurrent exchanges on one connection.
- HTTP/3 maps HTTP semantics over QUIC.
- HTTP caches can shorten a request/response chain by satisfying a request before later participants are contacted.
- Browser Fetch may inspect the HTTP cache before performing a network fetch.
- A `0 ms`-style deterministic latency model is forbidden. The explorer teaches causal stages, not representative timings.
- Do not teach `DNS -> TCP -> TLS -> HTTP` as a mandatory sequence for every request.
- Do not imply that a cache hit, connection reuse, redirect path, intermediary, or origin selection is universal.

## Lesson flow

1. **TL;DR** — what an HTTP exchange is, the practical tracing rule, and the mistake to avoid.
2. **Mental model** — separate semantic exchange from optional network/setup stages.
3. **One request, several possible paths** — explain why a request can stop at a cache, reuse a connection, or reach an origin through intermediaries.
4. **Request construction** — method, target, headers, body, credentials/policy context at a useful level without reproducing Fetch internals.
5. **Cache before network** — fresh hit, stale entry, validation, cache miss; distinguish browser/private cache from shared intermediaries.
6. **Connection reuse and setup** — when DNS, transport, and TLS are relevant; explicitly state that established connections skip new setup for that exchange.
7. **HTTP/1.1, HTTP/2, and HTTP/3** — same semantics, different carriage; explain multiplexing only to the depth needed for request tracing.
8. **Intermediaries and origin** — proxies, CDNs, gateways/load balancers as possible participants, not a mandatory topology.
9. **Response processing** — status, headers, body, streaming, cache updates, redirects; transport success is not application success.
10. **Try it: Request Path Explorer** — deterministic scenario explorer.
11. **How to debug a slow or surprising request** — operating checklist using browser/network tooling concepts rather than vendor-specific screenshots.
12. **Failure boundaries** — DNS/connect/TLS/network failure versus HTTP response status versus application-level failure.
13. **Retries and semantics** — point to idempotency; do not turn the page into a retry guide.
14. **Exercise** — trace a request from evidence and identify which stages definitely occurred, might have occurred, or were skipped.
15. **Agent rule** — locally complete tracing guidance suitable for raw Markdown context.
16. **Related concepts**.
17. **Sources**.

## Request Path Explorer

### Purpose

Make skipped work visible. The learner should be able to answer: “For this scenario, which stages happen, which do not, and why?”

### Architecture

Use a pure TypeScript scenario model in `lib/learning/http-request-path.ts` and a specialized client component in `components/learning/http-request-path-explorer.tsx`.

The explorer is deterministic and does not execute arbitrary network requests.

It may reuse the Phase 0.3 presentation primitives (`LabShell`, `LabPanel`, `LabControls`, `ScenarioSelect`, `LiveStatus`) where they fit, but no generic network-simulator abstraction is introduced.

### Data model

```ts
export type RequestPathScenarioId =
  | 'cold-request'
  | 'warm-connection'
  | 'fresh-cache-hit'
  | 'stale-cache-revalidation'
  | 'intermediary-cache-hit'
  | 'redirect';

export type RequestStageId =
  | 'construct-request'
  | 'http-cache'
  | 'dns'
  | 'transport-connect'
  | 'tls'
  | 'send-http'
  | 'intermediary'
  | 'origin'
  | 'receive-response'
  | 'follow-redirect';

export type RequestStageState = 'performed' | 'skipped' | 'conditional';

export type RequestPathStage = {
  id: RequestStageId;
  state: RequestStageState;
  label: string;
  explanation: string;
};

export type RequestPathScenario = {
  id: RequestPathScenarioId;
  title: string;
  summary: string;
  stages: RequestPathStage[];
};
```

The pure module exports the scenario list and a lookup function. It contains no browser APIs, timing, React state, or fetch calls.

### Required scenarios

#### 1. Cold request

Show request construction, cache miss, possible name resolution, new transport/secure-session setup, HTTP exchange, intermediary possibility, origin handling, and response. DNS/transport/TLS wording must remain scoped to a new connection rather than presented as HTTP semantics.

#### 2. Warm connection

Show cache miss followed by connection reuse. Mark DNS, new transport connection, and new TLS setup as skipped for this exchange because an already suitable connection is being reused.

#### 3. Fresh cache hit

Show request construction and cache lookup returning a fresh stored response. Mark DNS, new connection, TLS setup, network send, intermediaries, and origin as skipped for this request path.

#### 4. Stale cache revalidation

Show a stale cached response leading to a conditional network request and validation. The explorer may describe a `304 Not Modified` path but must not imply that every stale response produces 304; the scenario is one standards-valid case.

#### 5. Intermediary cache hit

Show the request leaving the client but being satisfied by a shared/intermediary cache before the origin. This demonstrates that an origin does not have to process every network request.

#### 6. Redirect

Show one HTTP exchange returning a redirect response and a subsequent request being constructed. Do not imply the second request automatically reuses every aspect of the first request; describe the follow-up as a new request whose cache/connection path is evaluated again.

### Interaction

- native scenario select;
- complete scenario stage list always visible;
- selecting a scenario updates the explanatory status immediately;
- no autoplay is required;
- reset returns to `cold-request`;
- visual treatment may distinguish performed/skipped/conditional, but text labels must expose the same distinction;
- no color-only semantics;
- keyboard-complete controls;
- concise `aria-live="polite"` status when the scenario changes;
- stable test selectors for selected scenario and stage states are acceptable where semantic selectors are insufficient.

## Writing contract

This lesson must follow the Atlas Clarity Contract particularly strictly because network diagrams often encourage false universal sequences.

- Use concrete nouns: “this request”, “the existing HTTP/2 connection”, “the browser HTTP cache”.
- Define “origin”, “intermediary”, “fresh”, “stale”, and “revalidation” before depending on them.
- Distinguish standard guarantees from implementation/runtime choices.
- Put protocol-version caveats beside the claim they qualify.
- Avoid “the browser does X” when the statement is specifically Fetch behavior or an implementation choice.
- Avoid unexplained arrows that imply mandatory ordering.
- Keep the essential scenario explanations in Markdown; the explorer is supplementary.

## Testing contract

### Unit tests

Create `tests/http-request-path.test.ts` and protect at least:

- exactly six required scenario IDs exist;
- fresh cache hit skips DNS/connect/TLS/network/origin stages;
- warm connection skips new DNS/connect/TLS setup while still sends the HTTP request;
- stale-cache revalidation performs a cache lookup and network exchange and describes the 304 path as scenario-specific rather than universal;
- intermediary cache hit skips origin processing;
- redirect includes a follow-up request stage and explains that the next request is evaluated again;
- no scenario contains invented duration fields.

### Browser/E2E tests

Create `tests/e2e/http-request-lifecycle.spec.ts` and protect:

- `/learn/docs/web-platform/http-request-lifecycle` renders;
- navigation exposes the Web Platform section and lesson;
- explorer defaults to cold request;
- selecting fresh cache hit visibly marks origin/network setup as skipped;
- selecting warm connection marks connection setup skipped but HTTP send performed;
- reset returns to cold request;
- keyboard use works;
- raw Markdown exists under the `/learn` basePath and contains the central rule plus source links;
- Edit on GitHub points to the canonical MDX path;
- axe reports zero serious/critical violations.

Existing all-authored-route rendering and MDX fence audits remain unchanged and must pass.

## Non-goals

PR #17 does not:

- deeply teach DNS resolution;
- deeply teach TLS handshakes;
- teach TCP or QUIC internals;
- reproduce the Fetch specification algorithm;
- become an HTTP caching reference;
- add live network execution, Sandpack, or WebContainers;
- add external APIs or services;
- add new dependencies;
- change the `/learn` basePath deployment architecture;
- introduce generic network simulation primitives;
- claim canonical coverage for adjacent concepts merely because they are mentioned.

## Exit criteria

PR #17 is ready to merge when:

1. the canonical `http-request-lifecycle` concept is covered by one substantive `operate`-depth page;
2. the deterministic explorer correctly differentiates cold, reused-connection, cache, intermediary, and redirect paths;
3. all critical teaching remains understandable in raw Markdown;
4. primary-source claims are verified against current RFC/WHATWG material;
5. lint, typecheck, unit tests, production build, rendered-route audit, Playwright, and axe all pass on the exact review head;
6. no unrelated map, deployment, dependency, or framework change appears in the diff.
