# Wave 1 complete EN/VI article audit — Message Queues (2026-11-18)

- Scope: `content/docs/backend-engineering/message-queues.mdx` and `message-queues.vi.mdx`
- Trackers: [#116](https://github.com/thucne/software-development-atlas/issues/116) · [Wave 1 #119](https://github.com/thucne/software-development-atlas/issues/119)
- Editorial/technical verdict: **full EN/VI article-level review completed, final certification conditional on exact PR-head and merged-main CI**.

## Entire-lesson and parity review

Read and compared every section in both languages: formerly unverified poison-message incident, TL;DR, two Mermaid diagrams (producer/consumer delivery flow and SQS visibility/redelivery sequence), publisher confirmation example, worker distribution, acknowledge/delete ordering, SQS and RabbitMQ in-flight semantics, redelivery, per-business-key ordering, dead-lettering, backpressure and backlog measures, producer/database outbox gap, constructed fulfillment scenario and Impact/Root cause/Correct pattern, publish ambiguity and payment-charge self-check/answer, checklist, agent rule, related articles and original source URLs. The two versions still teach the same claims, limitations, exercises, messages, recovery choices and routes. Preserved canonical `message-queues` placement and `reason` depth. Revised prominent Vietnamese labels and absolute language without removing depth.

## Source-to-claim matrix and example review

1. **Unreported 'poison pill outage' removed:** original intro asserted a 3 PM attack, cascading fleet crashes, hundreds of thousands of queued orders, hours of backlog and zero throughput as if observed. Replaced with clearly **constructed** malformed-message/redelivery scenario in both languages; the actual outcome is conditional on crash handling, broker policy, error classification and capacity. No real incident measurements are claimed.
2. **Broker completion vs business completion:** RabbitMQ publisher confirms are separate from consumer acknowledgements, and neither atomically covers an external DB/payment effect. Transport success can mean local send accepted, confirmed broker responsibility or other provider-specific level. Retries of ambiguous publication need stable logical operation identity.
3. **P1 correctness correction — RabbitMQ prefetch is not a lease:** original TL;DR equated SQS visibility timeout and RabbitMQ prefetch windows as expiring leases. RabbitMQ **prefetch** limits outstanding, unacknowledged deliveries, with no per-delivery expiration timer implied by the count. Unacked deliveries normally requeue when channel/connection closes. RabbitMQ acknowledgement timeouts are a separate setting, version and queue type sensitive: current RabbitMQ 4.3 docs limit that mechanism to quorum queues. This distinction was restored across EN and VI.
4. **SQS visibility:** receipt makes a message temporarily invisible, but at-least-once SQS standard queues can still redeliver even while invisible. If processing exceeds the visibility window, another consumer may start concurrently. Extend visibility where supported and protect downstream effects separately. The diagram's 30s and 120s timings are **constructed**; 30s also happens to be SQS default in many contexts, but not a fixed universal lease duration.
5. **Deliveries, ordering and redelivery:** One competing-consumer queue shares work, not broadcast to independent fraud/email/analytics subscribers. FIFO delivery alone does not prove ordered completion across parallel workers and external effects. Restrict ordering to the actual business key. RabbitMQ and SQS differ in ACK/deletion behavior; the article does not claim exactly-once business execution.
6. **Dead letters and retries:** A malformed schema should not retry indefinitely. A DLQ/dead-letter path needs a terminal policy, observability, stable identifiers and a controlled repair/replay process. RabbitMQ basic.nack with requeue can create an immediate redelivery loop; retry delay/jitter require explicit scheduling by broker/application and are not intrinsic to the basic ack flag.
7. **Backpressure/dual writes:** Queue depth, age, in-flight count, completion rate and downstream saturation are separate metrics; a dashboard does not enforce admission policy. Publisher confirms cannot make database commit plus enqueue atomic. An outbox can preserve intent in one local DB transaction while still requiring duplicate-safe publication and consumers.
8. **Hypothetical fulfillment and self-check:** Previously stated concrete 10s / 30s / 70–90s durations and double-packed order as observed; now labeled a constructed SQS-style scenario and duplicate effects **possible, not inevitable**. In the publisher-confirmation self-check, reusing the same logical billing job identity and provider charge dedupe protects business effects; whether two different transport message IDs exist does not by itself make the broker incorrect. All SQL/text/sequence examples were statically traced for order and correctness; no live broker or shipping-label service was run.

## Primary source evidence checked 2026-11-18

- [RabbitMQ — Consumer acknowledgements & publisher confirms](https://www.rabbitmq.com/docs/confirms)
- [RabbitMQ — Consumers: prefetch and acknowledgement timeout](https://www.rabbitmq.com/docs/consumers)
- [RabbitMQ — Dead Letter Exchanges](https://www.rabbitmq.com/docs/dlx)
- [AWS SQS — Visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html)
- [AWS SQS — Recovering from outages and FIFO duplicate limits](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/designing-for-outage-recovery-scenarios.html)

## Teaching, metadata and release gates

- Compared all EN/VI Mermaid flows, code/example fences, operational 12-item checklist, self-check and canonical crosslinks. Improved Vietnamese naturalness, removed fabricated precision, qualified provider-specific timer semantics; kept English and Vietnamese learning outcomes equivalent.
- Synchronized both `lastVerified: 2026-11-18` and body source-review dates, reconciled EN/VI rolling changelogs and added `tests/message-queues.test.ts` regression assertions for the broker-specific invariants and hypothetical labels. The Atlas footer was already dated 2026-11-18.
- **No live RabbitMQ/SQS, retry load simulation, poison-message chaos test or API provider call** was available or executed. The code and examples are reviewed against primary specifications and traced as conceptual sequences, with operational fixture verification explicitly unclaimed.
- [x] Full article/content, source assertions, diagrams/examples, bilingual parity and editorial review.
- [ ] Exact final PR-head full unit/content, inventory, lint, typecheck, MDX build and Chromium E2E CI.
- [ ] Exact merged-main push CI and then, only then, check #116/#119. Do not certify from a targeted edit alone.
