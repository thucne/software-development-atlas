# Wave 1 full bilingual article audit — Delivery Semantics (2026-11-18)

- EN/VI pair: `content/docs/distributed-systems/delivery-semantics.mdx`, `delivery-semantics.vi.mdx`
- Tracking: [master #116](https://github.com/thucne/software-development-atlas/issues/116), [Wave 1 #119](https://github.com/thucne/software-development-atlas/issues/119)
- Decision: **whole-pair article/source/teaching audit completed; certification remains conditional on exact PR-head and merged-main successful full CI.**

## Complete article-level read, bilingual learning and editorial parity

Read and compared both entire lessons: invented payment event and lost ACK introduction, TL;DR and 3 TermBoxes, three Mermaid diagrams (producer/broker/consumer ACK flow, failure window around DB commit, local inbox/outbox transaction), at-most-once versus at-least-once versus scoped exactly-once table, provider examples, stable event ID/inbox and downstream effects, ordering and poison-message/DLQ failure handling, constructed shipment scenario (Impact/Root cause/Correct pattern), seven-question reasoning exercise, card-charge self-check and reasoning, actionable checklist, agent rule and references. The two versions teach matching constraints with no hidden EN-only caveat; Vietnamese was substantially edited to remove dramatic and absolute claims while keeping technical vocabulary understandable. Canonical concept `delivery-semantics`, `reason` depth, technologies and navigational crosslinks remain unchanged.

## Technical and reproducible-example review

1. **At-most/at-least once:** Acknowledging or committing progress before effect can lose the work; acknowledging after effect leaves a redelivery window. This describes the declared broker/consumer handoff boundary, not unconditional external business completion. At-least-once allows duplicate delivery; it **does not mean that every message is certainly redelivered**. VI had several "chắc chắn phát lại" claims, all replaced with conditional wording.
2. **SQS visibility:** Official [SQS Visibility Timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html) documents that standard messages can be received more than once **even within the invisibility period** and that after expiry a message becomes visible/eligible for reception, **not guaranteed to reach another worker instantly**. Old VI incorrectly said visibility expiry *certainly* triggers delivery to a specific consumer.
3. **RabbitMQ ACK:** Official [RabbitMQ confirmations](https://www.rabbitmq.com/docs/confirms) documents unacknowledged manual-ACK deliveries being requeued on channel/connection close; this is distinct from publisher confirms and not a global exactly-once claim. The ACK sequence diagram is a constructed possibility, not a universal runtime sequence.
4. **Kafka transactional scope:** [Apache Kafka **4.0** Design](https://kafka.apache.org/40/design/design/) permits atomic transaction coordination of produced Kafka records and consumed offsets in Kafka. Non-Kafka datastores and external payment/email APIs need their own coordination. Scoped version explicitly stated rather than presenting versioned Kafka docs as an unbounded provider guarantee.
5. **SQS FIFO deduplication:** Official [SQS FIFO key terms](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-key-terms.html) applies deduplication IDs to producer sends within a **five-minute** window under the stated configuration; this is not eternal deduplication or a guarantee of exactly one shipment/credit-card charge.
6. **Inbox transaction / uniqueness:** A standalone `event_id` insert in another transaction is insufficient. Identity reservation, local business mutation and outbox intent must commit in the **same local transaction**. Subsequent broker publication and external effects remain at-least-once unless those destinations enforce their own idempotency/reconciliation. A duplicate-key conflict proves earlier committed handling only when the protocol establishes that fact; do not unconditionally ACK an in-progress, unknown result.
7. **Poison messages:** Earlier VI asserted malformed-schema failures recur "100%" and that unlimited retry necessarily blocks *all* useful traffic. Those overclaims were removed. Retry classification depends on whether missing reference data, provider errors or schema migration are permanent; DLQ diagnostics must exclude sensitive personal/secret data.
8. **Hypothetical fulfillment and card scenario:** Previously VI introduced vivid "few milliseconds", Kubernetes eviction and definitely duplicated shipment without a real incident. The revised scenario is explicitly constructed with duplicates **possible** for a naive consumer; any external charge uses a **provider-enforced** stable payment identity or authoritative reconciliation after an ambiguous result. No measured timings or production incident is claimed.
9. **Static examples / answer:** Traced all three Mermaid paths and self-check lost-checkpoint/charge sequence by hand. Code is conceptual Markdown and diagrams, not broker/payment runnable examples. No live Kafka/SQS/RabbitMQ service, data-plane fault injection, charging integration or chaos run was available/performed.

## Primary sources reviewed on 2026-11-18

- [Apache Kafka 4.0 — Design / Message Delivery Semantics](https://kafka.apache.org/40/design/design/)
- [RabbitMQ — Consumer ACK and Publisher Confirms](https://www.rabbitmq.com/docs/confirms)
- [Amazon SQS — At-least-once standard queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html)
- [Amazon SQS — Visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html)
- [Amazon SQS — FIFO deduplication identifiers](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-key-terms.html)

## Metadata, regression and certification gate

- [x] Whole EN/VI content, learning outcomes, technical claims, diagrams, examples, exercises, crosslinks and editorial pass. Both `lastVerified: 2026-11-18`, source-review body date, EN/VI rolling changelog and targeted `tests/delivery-semantics.test.ts` assertions synchronized.
- [ ] Exact new PR-head content/unit test, content inventory, lint, typecheck, build and Chromium E2E success.
- [ ] Same full success on exact merge-commit **main push**; only then certify by checking #116 and #119. Keep issues open.
