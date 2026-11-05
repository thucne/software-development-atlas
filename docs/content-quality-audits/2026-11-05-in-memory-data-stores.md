# Wave 1 EN/VI review — In-Memory Data Stores

Date: 2026-11-05. Scope: `content/docs/data-systems/in-memory-data-stores.{mdx,vi.mdx}`. Tracking: [#116](https://github.com/thucne/software-development-atlas/issues/116), [#119](https://github.com/thucne/software-development-atlas/issues/119). **Full-pair certification pending CI on PR head and merged main.**

## Corrections and source evidence

1. Original opening was a fake postmortem asserting different EN/VI latency (4 vs 5 ms), tens of thousands of requests, 10-second `KEYS *`, Redis being OOM-killed, and database outages without evidence. Both are now the same explicitly hypothetical example, without invented metrics.
2. `maxmemory` is not a hard RSS cap. Redis `noeviction` can reject memory-growing writes with an OOM error while reads work; it does not automatically invoke the OS OOM killer. Allocator fragmentation and persistence/replication buffers affect overall memory.
3. `KEYS` is O(N) and can block large keyspaces, while `SCAN` performs incremental traversal with limited consistency under concurrent changes; no fixed command duration is claimed.
4. TTL jitter spreads expiration for different keys but does not stop a single hot key from stampeding. Key-local request coalescing or bounded stale refresh may be needed.
5. RDB snapshots and AOF have different restart recovery windows. `appendfsync everysec` can lose roughly the most recent second; `always` has increased write cost. Neither is the same as replica failover durability.
6. Redis replication is async by default. `WAIT` counts replication acknowledgments, not an fsync or CP quorum; promoted replicas may still lack acknowledged writes.
7. Redis Cluster uses 16,384 hash slots. Single-key writes remain concentrated on one owner; explicitly redirected read traffic may differ and has consistency implications.
8. The eviction-pool example was an invented teaching scenario, now labeled. Retention contracts (e.g. 24h idempotency records) are application assumptions, not universal Redis guarantees.

## Bilingual and pedagogical audit

Compared all 18 numbered sections, introductory examples, both Mermaid diagrams, key/TTL/RDB/AOF snippets, failure classification and state-retention table, production scenario, exercises and answer, checklist, agent rule, crosslinks and original reference list. Preserved learning depth and aligned EN/VI corrections and source URLs; edited Vietnamese summaries and key paragraphs toward precise idiomatic language. Updated paired lastVerified dates and changelogs. Added content-contract regression checks.

## Primary sources (reviewed 2026-11-05)

- [Redis eviction](https://redis.io/docs/latest/develop/reference/eviction/)
- [Redis noeviction/OOM](https://redis.io/docs/latest/develop/reference/errors/common/oom/)
- [Redis keys and SCAN](https://redis.io/docs/latest/develop/use/keyspace/)
- [Redis memory and RSS](https://redis.io/docs/latest/management/optimization/memory-optimization/)
- [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- [Redis replication](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)
- [Redis WAIT](https://redis.io/docs/latest/commands/wait/)
- [Redis Cluster](https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/)

## Release checks

- [x] Reviewed full EN/VI article, code, tables, examples, diagrams, source-claim boundaries and exercises.
- [x] Added regression assertions and bilingual changelog.
- [ ] Exact PR-head `pnpm test`, `pnpm audit:content`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, Chromium `pnpm test:e2e`.
- [ ] Exact merged-main green CI and issue synchronization prior to certification.

No live Redis fault injection was performed; no simulated OOM/failover experiment is claimed. All example metrics are explicitly hypothetical or absent.
