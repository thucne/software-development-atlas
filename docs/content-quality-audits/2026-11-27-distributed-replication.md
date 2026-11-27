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
