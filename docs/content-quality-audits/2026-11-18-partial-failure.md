# Wave 1 full bilingual article audit — Partial Failure (2026-11-18)

- EN/VI pair: `content/docs/distributed-systems/partial-failure.mdx`, `partial-failure.vi.mdx`
- Tracking: [#116](https://github.com/thucne/software-development-atlas/issues/116), [Wave 1 #119](https://github.com/thucne/software-development-atlas/issues/119)
- Decision: **complete source/teaching/article-level review, pending exact PR-head and merged-main CI before certification**.

## Full article / parity / teaching review

Read both EN and VI end-to-end, not only edited paragraphs: constructed payment-terminal opening, TL;DR, 4 Mermaid diagrams (lost response, caller/callee sequence, replay decision flow, dependency blast radius), 3 TermBoxes, failure modes and observation model, gRPC outcome/timeout/cancellation, retries and request identity, deadline propagation, dependency isolation, observability, invented checkout example with Impact/Cause/Correct pattern, self-check and revealed answer, 12-item production checklist, agent rule and source/crosslink list. Both versions preserve the same learning outcomes, scenario assumptions, diagrams, self-check and related content. Canonical concept `partial-failure`, depth `reason`, prerequisites and routes remain unchanged. Naturalized VI headings and key paragraphs instead of literal untranslated English.

## Claims, examples and risk review

1. **Local observations, not remote verdicts:** Official [gRPC Core Concepts](https://grpc.io/docs/what-is-grpc/core-concepts/) and [Status Codes](https://grpc.io/docs/guides/status-codes/) describe independent local success/failure decisions; `DEADLINE_EXCEEDED` can be returned even when a state-changing RPC succeeded. The old EN text said timeout **often** coincides with a committed DB transaction; no frequency evidence exists. Both versions now correctly say **may**. The three illustrated outcomes (request lost, server still running, commit + response lost) are possible states rather than guarantees.
2. **Cancellation and deadlines:** gRPC cancellation is cooperative at application handler/child-work level and does not roll back committed database/provider changes. A deadline bounds the caller's waiting, not authoritative completion. Backend dependencies need a shared remaining budget as described in the [gRPC deadline guide](https://grpc.io/docs/guides/deadlines/); the article does not claim all runtimes auto-propagate deadlines.
3. **State-changing retries:** A client timeout alone cannot establish whether a payment committed or is still running. Merely adding an `Idempotency-Key` header offers no safeguard without server/provider enforcement. Stable business operation identity, provider-specific idempotency or authoritative reconciliation must protect the retry. A local correlation ID is tracing evidence, not an effect-dedup guarantee.
4. **Invented checkout incident:** Both versions explicitly label the example hypothetical. The old EN/VI Impact sentence asserted a customer **was** double-charged. Updated to **may be** double-charged if the second attempt is treated as distinct; no actual provider incident, debit rate or latency measure is cited. The self-check correctly concludes "unknown", not "definitely failed".
5. **Blast radius / operational heuristics:** The original TL;DR described dependency waits as inevitably exhausting workers/pools and called unprotected retries the "fastest way" to corrupt money. Those were unsupported universal/frequency claims. Replaced with capacity- and load-conditional risks; fail-fast/degrade/fallback is appropriate only when the dependency is optional or business correctness tolerates it.
6. **Examples and diagrams:** Traced all four Mermaid flows, event order and decision branches against source semantics. Corrected all comments that implied a particular provider must repeat a charge. The examples are conceptual diagrams and strings, not executable network tests; no live gRPC/database/payment fault-injection or production sampling was run.

## Primary sources rechecked 2026-11-18

- [gRPC Core Concepts](https://grpc.io/docs/what-is-grpc/core-concepts/) — independent caller/server judgments, cancellation not rollback
- [gRPC Deadlines](https://grpc.io/docs/guides/deadlines/) and [gRPC status codes](https://grpc.io/docs/guides/status-codes/) — timeout outcome semantics
- [gRPC Cancellation](https://grpc.io/docs/guides/cancellation/) — cooperative server cleanup
- [Amazon Builders' Library — Timeouts/retries](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) and [Safe idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
- [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests/) — provider-specific protection, not a universal header guarantee
- [Google SRE Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)

## Bilingual and release gate

- [x] Full claim/examples/diagram/exercise/parity/idiomatic Vietnamese/crosslink review and source evidence recorded. Paired `lastVerified: 2026-11-18` and EN/VI rolling changelog updated; targeted `tests/partial-failure.test.ts` and scoped `tests/content-quality-wave1-boundaries.test.ts` date assertions updated to preserve old expectations for unrelated lessons.
- [ ] Unit/content, inventory, lint, typecheck, MDX build and Chromium E2E **on exact final PR head**.
- [ ] Same full green gate on exact **merged-main SHA**, then update #116 and #119. This report alone is not a certificate.
