# Distributed Replication — full EN/VI Wave 1 audit (2026-11-27)

- Pair: `content/docs/distributed-systems/distributed-replication.mdx` + `.vi.mdx`
- Tracker: [#116](https://github.com/thucne/software-development-atlas/issues/116), [Wave 1 #119](https://github.com/thucne/software-development-atlas/issues/119)
- Status: full content review and paired corrections submitted; **not certified until exact PR-head and merged-main CI pass**.

## Whole-pair review
Read both complete lessons: hypothetical stale-read/failover opening, TL;DR, replication factor glossary, database-vs-general replication boundary, ordered-writer model, PostgreSQL acknowledgment example, sync/async commit boundary, lag stages, snapshot bootstrap/catch-up, fencing term box and failover diagram, multi-leader/leaderless reconciliation, fault-domain placement, partitioning vs replication, consensus distinction, hypothetical split-writer incident, self-check, checklist, agent rule, related routes and sources. EN/VI retain equivalent guarantees, conditions, examples and exercises.

## Technical claims checked
- Replication factor alone does not establish acknowledgment durability, fault-domain independence, or survivability of correlated failures.
- PostgreSQL synchronous commit semantics were checked against current official docs: `remote_write` waits for OS-level write (not necessarily durable flush); `on` waits for configured synchronous-standby WAL flush; `remote_apply` waits for replay/visibility. This is configuration-dependent, not a generic promise for every database.
- Replica lag is stage-specific (received, durable, applied, visible); asynchronous acknowledgment can lose a recent write on failover depending on the protocol and lag.
- A fencing epoch/term only protects writes when the downstream resource actually rejects stale generations. The paired EN/VI text now states this enforcement requirement and notes that some topologies use out-of-band isolation such as storage/power fencing.
- Multi-leader/leaderless reconciliation, read repair and anti-entropy are not presented as a single linearizable consensus history. Partitioning and replication are distinct dimensions.
- All incident-style examples and numeric values remain explicitly hypothetical/illustrative; no real customer incident or measured outage is asserted.

## Primary references
- [PostgreSQL current synchronous replication](https://www.postgresql.org/docs/current/warm-standby.html) — `remote_write`, flush and `remote_apply` distinctions.
- [PostgreSQL current failover](https://www.postgresql.org/docs/current/warm-standby-failover.html) — old-primary isolation and split-brain prevention.
- [etcd v3.7 failure modes](https://etcd.io/docs/v3.7/op-guide/failures/) and [recovery](https://etcd.io/docs/v3.7/op-guide/recovery/) — quorum, committed/uncommitted writes and recovery boundary.
- [Raft extended paper](https://pdos.csail.mit.edu/6.824/papers/raft-extended.pdf) — committed-log safety boundary.

## Freshness and validation
- Updated both lesson `lastVerified` and source-review dates to 2026-11-27.
- Added regression assertions for downstream fencing enforcement and hypothetical scenario labeling; updated the existing paired-date assertion.
- No live PostgreSQL failover, storage-fencing, replica-lag or multi-writer conflict test was run. Exact-SHA GitHub Actions must validate the changes.


## Vietnamese editorial follow-up — 2026-11-27

- Re-read the paired EN/VI copy and refined Vietnamese prose for the acknowledgment boundary, lag stages, snapshot bootstrap/catch-up, fencing, failover, multi-writer reconciliation, fault-domain placement, partitioning distinction, self-check and review checklist. Exact configuration names and protocol fields such as `remote_write`, `remote_apply`, WAL, epoch and lease remain unchanged where precision requires them.
- Rechecked the official PostgreSQL [synchronous replication documentation](https://www.postgresql.org/docs/current/warm-standby.html): `remote_write` waits for OS-level write but not standby disk flush; `remote_apply` waits until replay makes the transaction visible. The `on` mode waits for configured synchronous-standby WAL flush, subject to configuration.
- Rechecked PostgreSQL's [failover guidance](https://www.postgresql.org/docs/current/warm-standby-failover.html): the old primary must be informed/fenced after standby promotion to prevent both systems believing they are primary. Rechecked Amazon's original [Dynamo paper](https://www.amazon.science/publications/dynamo-amazons-highly-available-key-value-store) for versioning and application-assisted conflict resolution.
- A paired regression test continues to assert the critical `remote_write`, `remote_apply` and remote-fsync caveat while keeping the 2026-11-27 date assertion. No assertion was removed or weakened.
- The earlier green Actions run #45924532225 validated SHA `4fdb4097d2831cbb8b1d8deb1b25dd744f7d59a`, before the new VI editorial commits. **That run does not validate the current PR head.** Require full exact-head Actions and merged-main Actions after merge. No live PostgreSQL failover, storage-fencing or multi-writer integration test is claimed.
