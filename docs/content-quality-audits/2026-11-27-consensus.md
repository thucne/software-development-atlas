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


## Vietnamese editorial follow-up — 2026-11-27

- Re-read the paired EN/VI copy after the first audit and refined Vietnamese headings, explanatory paragraphs, failure scenarios, exercise language and review checklist. The VI prose now expresses replication/consensus, safety/liveness, leader election, current-term commit and minority-quorum behavior in Vietnamese sentence structure; protocol/API names remain where they identify exact technical concepts.
- Reconfirmed the Raft paper's election restriction, leader completeness, log matching and current-term commit rule against the [official extended paper](https://raft.github.io/raft.pdf), especially the explanation that an older-term entry replicated to a majority is not thereby committed.
- Reconfirmed the etcd v3.7 [failure modes](https://etcd.io/docs/v3.7/op-guide/failures/), [disaster recovery](https://etcd.io/docs/v3.7/op-guide/recovery/) and [performance](https://etcd.io/docs/v3.7/op-guide/performance/) documentation. The v3.7 recovery guide states that loss of quorum prevents the cluster from reaching consensus and accepting updates; recovery is a deliberate snapshot/restore operation.
- The consensus VI source-review date is synchronized to 2026-11-27. A paired regression test now checks the distinct replication/consensus boundary, current-term commit statement, and 2026-11-27 freshness for both locales.
- The earlier green Actions run #45924532225 validated SHA `4fdb4097d2831cbb8b1d8deb1b25dd744f7d59a`, before the new VI editorial commits. **That run does not validate the current PR head.** Require full exact-head Actions and merged-main Actions after merge; no live Raft cluster, partition injection or membership-change simulation is claimed.


## Regression assertion correction — 2026-11-27

- Actions run [#45936198582](https://github.com/thucne/software-development-atlas/actions/runs/45936198582) failed in the content/freshness test before inventory and downstream gates because the new EN regression assertion expected the literal `older-term entry`, while the article's precise sentence uses `an earlier-term entry`.
- Corrected only the expected literal in `tests/content-quality-wave1-boundaries.test.ts` to match the source wording. The test still requires the lesson to explain that an entry from an earlier term may be replicated to a majority without thereby being safely declared committed. No test was removed, relaxed, or skipped.
- The latest source content remains unchanged by this assertion-only correction. A fresh Actions run on the new exact PR head is required; run #45936198582 must not be treated as validation of that new head.
