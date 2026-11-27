# Consensus — full EN/VI Wave 1 audit (2026-11-27)

- Pair: `content/docs/distributed-systems/consensus.mdx` + `.vi.mdx`
- Tracker: [#116](https://github.com/thucne/software-development-atlas/issues/116), [Wave 1 #119](https://github.com/thucne/software-development-atlas/issues/119)
- Status: full content review and paired corrections submitted; **not certified until exact PR-head and merged-main CI pass**.

## Whole-pair review
Read both complete lessons: opening five-node partition example, TL;DR, quorum term box, replication/consensus boundary, safety/liveness, term/epoch, leader-election sequence, proposed versus committed log, current-term commit caveat, quorum-intersection arithmetic and tolerance table, majority/minority partition diagram, crash-vs-Byzantine scope, latency, external effects, hypothetical stale-leader fallback, self-check, review checklist, agent rule, links and source notes. EN/VI preserve the same outcomes, conditions, failure cases and exercise answer.

## Technical claims checked
- Raft safety is not majority arithmetic alone: election restriction/leader completeness, log matching and the current-term rule matter. An older-term entry replicated to a majority is not directly committed by replica count alone.
- Quorum progress is conditional on a valid quorum and protocol election/log rules. The wording “safety always trumps liveness” was narrowed to **quorum-based consensus and the minority side**, avoiding a universal claim about every distributed service or availability policy.
- Majority tolerance table now explicitly assumes fixed membership, simple majority quorum and independent member failures; correlated faults or membership changes change the operational conclusion.
- A locally appended/uncommitted entry is not a committed business decision. Loss-of-quorum and former-leader examples are explicitly hypothetical; no real outage or measured impact is claimed.
- Crash-fault protocols are not described as Byzantine-fault tolerant; consensus commit does not guarantee exactly-once external effects.

## Primary references
- [Raft extended paper](https://pdos.csail.mit.edu/6.824/papers/raft-extended.pdf) — election restriction, leader completeness and current-term commit.
- [etcd v3.7 failure modes](https://etcd.io/docs/v3.7/op-guide/failures/) — leader change, uncommitted entries and quorum loss.
- [etcd v3.7 recovery](https://etcd.io/docs/v3.7/op-guide/recovery/) — loss of quorum and deliberate snapshot/restore recovery.
- [etcd v3.7 performance](https://etcd.io/docs/v3.7/op-guide/performance/) — network RTT and durable I/O in commit latency.

## Freshness and validation
- Updated both lesson `lastVerified` and source-review dates to 2026-11-27.
- Added regression assertions for the scoped quorum/liveness statement, table assumptions and hypothetical labeling; updated the existing paired-date assertion.
- No live Raft/etcd cluster, partition injection or membership-change simulation was run. CI is required to verify content/unit, inventory, lint, typecheck, build and Chromium E2E on the exact SHA.
