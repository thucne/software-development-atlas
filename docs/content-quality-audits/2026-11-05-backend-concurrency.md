# Wave 1 EN/VI source review — Backend Concurrency

- Review date: 2026-11-05
- Primary tracker: [#116](https://github.com/thucne/software-development-atlas/issues/116), [Wave 1 #119](https://github.com/thucne/software-development-atlas/issues/119)
- Exact lesson pair: `content/docs/backend-engineering/backend-concurrency.mdx` and `.vi.mdx`
- Rubric status: **full article-level review performed, provisional until PR-head CI, merged-main CI and tracker reconciliation**. A targeted edit alone does not count as certified.

## Claim and technical review

1. **Opening incident and arithmetic:** the original story asserted two successful $50 withdrawals from a $100 balance yet described a persisted $50 balance as money disappearing. If both payouts occur, the *stored balance is overstated* by $50, because $0 is expected. Replaced both EN/VI narratives with a clearly constructed counterexample, scoped to PostgreSQL READ COMMITTED-like stale overwrites; no real incident or timing metrics claimed.
2. **Single-row atomic transition:** PostgreSQL `UPDATE ... WHERE balance >= amount RETURNING balance` makes the balance decrement and predicate one datastore-owned state transition. A zero-row response is not success. Authorization, amount validation, actual payout and transactional business intent are separate obligations; remote effects are not rolled back by SQL rollback.
3. **Other atomicity snippet:** original inventory `UPDATE ... RETURNING remaining` retained, with explicit zero-row meaning. Read/modify/write gap and optimistic document version checks reviewed; a zero-row optimistic update may also mean a missing target.
4. **Transaction retry:** PostgreSQL 18 documentation distinguishes `40001` serialization_failure from `40P01` deadlock_detected, and requires recomputing the entire transaction with bounded retries. External already-completed effects must not be blindly replayed.
5. **Distributed coordination:** a process mutex is not a cross-replica guard. Kept diagrams for quota lost update, scope across replicas and deadlock; verified their matching EN/VI structure. Six-replica export example is explicitly hypothetical.
6. **Worked enforceable export boundary:** illustrated PostgreSQL partial unique index `(tenant_id, report_id) WHERE status IN ('queued', 'running')` and documented the effect on concurrent inserts/transitions. This is provider-specific, and correctness also requires well-defined status lifecycle and scheduling from committed durable state.
7. **Scope/wording:** qualified the 500-request exclusive-section queue as simultaneous arrivals with possible reject/backpressure; replaced alarmist language and preserved useful explanations of contention, optimistic vs pessimistic trade-offs, critical-section sizing, lease/fencing and deadlocks.

## Full EN/VI parity and teaching pass

- Read the introductions, TL;DR, all numbered sections 1–10, every SQL/text/diagram example, production scenario and root-cause/correction sections, all common mistakes, self-check with its answer, operational checklist, agent rule, related concepts and source list in both languages.
- Confirmed the three Mermaid diagrams' count and logical flow match, exercises match conceptually, the SQL statements remain equivalent, and technical limits are expressed in natural developer-facing Vietnamese.
- Navigational links to Backend Systems, related concepts and prerequisite frontmatter remain unchanged; no unnecessary additional canonical concepts claimed.
- Updated `lastVerified` and bilingual changelogs only after the technical review.

## Primary evidence (as of 2026-11-05)

- [PostgreSQL 18 — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html): READ COMMITTED, row locking and stronger isolation abort semantics.
- [PostgreSQL 18 — UPDATE](https://www.postgresql.org/docs/current/sql-update.html): `WHERE`, `RETURNING` and affected rows.
- [PostgreSQL 18 — Partial Indexes](https://www.postgresql.org/docs/current/indexes-partial.html): predicate-specific indexes, constraints and provider-specific behavior.
- [PostgreSQL 18 — Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html): `FOR UPDATE`, lock scope and deadlocks.
- [PostgreSQL 18 — Serialization Failure Handling](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html): SQLSTATE and retry full transaction.
- [Go Memory Model](https://go.dev/ref/mem): process-local synchronization is not an inter-process correctness boundary.

## Verification and limitations

- Article-level reasoning, code-example static review, diagrams, bilingual parity and source verification: performed.
- Regression test added in `tests/backend-concurrency.test.ts` to preserve key SQL/pseudocode and source parity claims.
- Required: passing PR-head `pnpm test`, `pnpm audit:content`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, Chromium `pnpm test:e2e`; also recheck exact merged-main gate before final certification.
- No PostgreSQL service fixture was available for a live concurrent two-session isolation reproduction. SQL snippets were checked against PostgreSQL 18 syntax and semantics; a live database race test is a recommended non-blocking future extension, not falsely claimed as performed.
