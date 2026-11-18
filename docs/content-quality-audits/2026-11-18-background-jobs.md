# Wave 1 complete EN/VI lesson audit — Background Jobs (2026-11-18)

- Exact scope: `content/docs/backend-engineering/background-jobs.mdx` and `background-jobs.vi.mdx`
- Tracking: [master #116](https://github.com/thucne/software-development-atlas/issues/116), [Wave 1 #119](https://github.com/thucne/software-development-atlas/issues/119)
- Review state: **full article-level EN/VI teaching, claims, examples and source review complete**; **not certified until exact PR-head and merged-main CI green**.

## Whole-pair inspection and language parity

Read both complete 500-line lessons and compared opening hypothetical campaign failure, practical model and TL;DR, two Mermaid diagrams (job-state machine, worker claim sequence), record/pseudocode examples, every substantive section 1–12 (durable acceptance, identity/attempt, ownership, ACK policy, at-least-once effects, retries, poison work, cancellation, progress, crash recovery, backlog and queue/job boundaries), thumbnail/email scenario with Impact/Cause/Correct pattern, six common mistakes, partner-payment self-check/answer, 14-item operational checklist, agent rule, primary reference links and prerequisite/related topic routes. Both locales preserve the same learning outcomes, caveats and numeric examples; awkward literal-English Vietnamese headings and glossary language were improved. Canonical `background-jobs` concept and `reason` depth are unchanged.

## Primary-source accuracy and executable example boundaries

1. **Fabricated incident and OOM semantics:** original intro presented a real-seeming 9 AM, 100,000-user, 45-minute, 60,000-success, cascading mass-mailing disaster with an `OOMKilled` “signal.” This was unsupported. Both EN/VI now use a **constructed** 100-recipient example (60 completed) with duplicate messages **possible** only if the broker actually redelivers and the external mail system lacks duplicate protection. Kubernetes documents `OOMKilled` as a **container termination reason**, not a Unix signal; Linux OOM termination should not be mislabeled.
2. **Provider-specific claim/ACK semantics:** An expiring lease or heartbeat is one possible ownership mechanism, not universal to all job transports. Celery `task_acks_late` acknowledges after normal execution, but current Celery docs say abrupt **child-process loss** may still ACK by default even with late ACK, unless `task_reject_on_worker_lost` changes policy. Requeueing repeated failures can also create hot loops. A whole worker/broker connection loss is a separate failure mode; the article now avoids universal auto-redelivery claims.
3. **Durable acceptance and transactional boundary:** Returning HTTP 202 alone is not durable acceptance; the system must persist recoverable job intent according to its API promise. A local DB transaction plus outbox can record a business mutation and publication intent; broker ACK and remote external effects still have different atomicity boundaries.
4. **Retry bounds — Cloud Tasks nuance:** `maxAttempts` **includes the first attempt**; Cloud Tasks documentation describes stopping retries when the configured attempt and retry-duration criteria are both met (or task succeeds), subject to maximum retention. Consequently a setting named `maxAttempts` cannot be taken as a universal hard cap in every product. The three-attempt example remains a conceptual bounded backoff exercise, not provider-measured behavior.
5. **Long-running progress and cancellation:** durable progress is essential for workloads requiring resumability or status, but reporting 47/120 is a constructed numerator/denominator, not a universal percentage requirement. Cooperative cancellation is a best-effort state transition and cannot reverse external effects. Celery worker `terminate` can kill the executing process and is not a normal cancel API.
6. **External email exact-once gap:** Earlier advice suggested a local `(job_id, notification_type)` uniqueness record could by itself permit exactly one email. The revised constructed thumbnail scenario distinguishes atomic local scheduling from uncertain remote send after a crash. If a provider supports idempotency keys, reuse a stable one; otherwise accept/reconcile a possible repeated send. The worker/broker cannot atomically commit a third-party email as part of its own DB transaction.
7. **Crash-boundary trace:** Reviewed the job state machine, lease sequence and the six crash points (before/after claim, computation, remote effect, local commit and ACK); each needs an explicit redelivery/success/reconciliation/terminal outcome, not worker memory. The partner-payment self-check correctly rejects a blind retry after an ambiguous timeout.

## Primary references checked on 2026-11-18

- [Celery — Tasks / acknowledgement timing](https://docs.celeryq.dev/en/stable/userguide/tasks.html)
- [Celery — Configuration, `task_acks_late` and `task_reject_on_worker_lost`](https://docs.celeryq.dev/en/stable/userguide/configuration.html)
- [Celery — Worker administration / terminate cautions](https://docs.celeryq.dev/en/main/userguide/workers.html)
- [Amazon SQS — Visibility timeout and redelivery](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html)
- [Google Cloud Tasks — Configure retries](https://docs.cloud.google.com/tasks/docs/configure-retry-task)
- [Google Cloud Tasks — RetryConfig](https://docs.cloud.google.com/tasks/docs/reference/rest/v2/RetryConfig)
- [Kubernetes — Out-of-memory container termination](https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/)

## Editorial/metadata and limitations

- Synchronized EN/VI `lastVerified: 2026-11-18`, in-body source date and rolling changelog entries; added source-bound technical assertions in `tests/background-jobs.test.ts`. Site footer already displayed `2026-11-18`.
- The two diagrams and all examples were traced statically against provider docs and the described state transitions. No Celery/SQS cluster, Kubernetes OOM workload, payment provider call, mail provider integration or live failure injection was run; do not present those as tested.
- [x] Complete EN and VI article review; primary-source correctness, numeric examples, diagrams, related links, self-check, idiomatic prose and exact metadata reviewed.
- [ ] Exact final PR-head full unit/content tests, inventory, lint, typecheck, MDX build and Chromium Playwright E2E.
- [ ] Exact merged-main CI success and both issue checkboxes reconciled only afterward. Keep #116 and #119 open.
