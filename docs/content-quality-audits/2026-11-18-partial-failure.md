# Wave 1 — Partial Failure full EN/VI audit (2026-11-18)

- Pair: `content/docs/distributed-systems/partial-failure.mdx` and `partial-failure.vi.mdx`
- Tracking: [master #116](https://github.com/thucne/software-development-atlas/issues/116), [Wave 1 #119](https://github.com/thucne/software-development-atlas/issues/119)
- **Review: completed for claims, EN/VI pedagogy and static examples. Certification: pending exact final PR-head and merged-main Actions.** This is not a claim of tests having run.

## Whole-pair audit and language parity

Read both complete EN/VI lessons from illustrative coffee-terminal opening, TL;DR, four Mermaid diagrams (caller/receiver path, timeline, retry decision and cascading dependency), three glossary boxes, all mechanism sections, cancellation and deadline guidance, observability, hypothetical checkout/payment case, self-check and answer, twelve-item production checklist, agent rule and all source links. Confirmed the same causal chains, numerical two-second example, failure boundaries, exercise solution and recommendation caveats in both languages. Improved Vietnamese explanations to remove literal English technical prose while retaining gRPC and protocol literals. Canonical concept `partial-failure`, learning depth `reason`, prerequisites and existing related routes remain unchanged.

## Source-backed technical review

1. **Caller/server independent local conclusions:** [gRPC Core Concepts](https://grpc.io/docs/what-is-grpc/core-concepts/) explicitly permits server success while caller sees deadline expiry. A timeout is local evidence, never proof of missing remote commit. The coffee POS and payment cases are *constructed* and make no incident-rate claims.
2. **Cancellation:** gRPC's [Core Concepts](https://grpc.io/docs/what-is-grpc/core-concepts/) says changes made before cancellation are not rolled back; [Cancellation Guide](https://grpc.io/docs/guides/cancellation/) requires application handlers to cooperate, and runtime/language propagation varies. An in-process exception does not universally stop a thread.
3. **Deadlines:** [gRPC Deadlines](https://grpc.io/docs/guides/deadlines/) recommends explicit realistic deadlines. Propagation may be automatic in Go/Java and require configuration for C++/other environments; budget is not restarted at each hop. This is provider/language-specific, not a universal RPC guarantee.
4. **Safe replay:** [Amazon Builders' Library — Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) requires stable client intent, parameter matching and an atomic authoritative boundary between deduplication state and business effects. The initial 'check if already committed then execute' flow can itself race under concurrent retries; revised both EN/VI to show atomic intent claim and emphasize the receiver's documented key retention and caller scope.
5. **Provider limits:** [Stripe Idempotent Requests](https://docs.stripe.com/api/idempotent_requests) is an example of implementation-specific retry semantics; it does not mean every payment API honors keys for arbitrary durations or mismatched payloads. Never infer guaranteed exactly-once external effects from a header alone.
6. **Failure isolation:** [Amazon Builders' Library — Timeouts, retries and backoff](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) and [Google SRE — Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/) support bounded retry/backoff, fail-fast/degradation when safe, propagation and dependency capacity constraints. Four diagrams are conceptual; no production timings or capacity metrics are asserted.
7. **Self-check and examples:** traced the lost-response-after-payment state in the timeline and retry flow. The right answer is query authoritative provider state or use a *provider-supported* stable idempotency identity, never retry with a new payment intent on local timeout alone. Local logs/correlation IDs alone are not evidence that a remote charge committed.

## Metadata and verification limits

- Updated both `lastVerified` values to `2026-11-18`, with one-to-one teaching parity; source list and existing related routes reviewed.
- Regression cases in `tests/partial-failure.test.ts` and `tests/content-quality-wave1-boundaries.test.ts` protect atomic intent, scoped retention, stable payload, authoritative reconciliation and new freshness without weakening other Wave 1 pair assertions.
- No real payment-provider call, network partition, gRPC two-process fixture, database transaction or fault injection was executed; the diagrams/pseudocode are static and source-verified. Complete GitHub Actions unit/content, inventory, lint, typecheck, build and Chromium E2E on exact PR SHA, followed by exact merged-main CI, are required before checklist certification.
