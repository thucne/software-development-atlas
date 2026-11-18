# Application Caching — Wave 1 full EN/VI content audit (2026-11-18)

- Pair: `content/docs/backend-engineering/application-caching.mdx` and `application-caching.vi.mdx`
- Trackers: [master #116](https://github.com/thucne/software-development-atlas/issues/116), [Wave 1 #119](https://github.com/thucne/software-development-atlas/issues/119)
- Review status: **full content rubric reviewed**. **Certification remains conditional** on exact final-head and merged-main CI; this is not a test report.

## Whole-article and bilingual review

Read both complete documents: hypothetical product-cache stampede introduction, TL;DR, cache-aside and source-of-truth glossary, two Mermaid diagrams, sections 1–8, key/TTL examples, pre/post-commit races, negative caching, local/shared topology, failure handling, pricing scenario and impact/cause/pattern, observability list, pitfalls, 20-replica exercise and answer, checklist, agent rule, crosslinks and sources. EN/VI contain equivalent learning outcomes, failure modes and caveats. Clarified unnatural Vietnamese idioms without removing technical information.

## Correctness and code/diagram examples

1. **Authority and durability:** cache-aside read entries derive from durable state. Losing them does not erase committed business facts but may overload the source and reduce availability; write-behind acknowledged pending writes have a separate durability contract. Write-through does not make two storage systems atomic.
2. **Key identity:** the explicitly hypothetical `price:{product_id}` example can return another tenant's price if tenant/currency/tier affect the answer. `price:v3:{tenant_id}:{product_id}:{currency}:{pricing_plan}:{locale}` is a conceptual complete key, not a universally correct implementation; escaping/canonical serialization is required to avoid delimiter collisions and leaking secrets.
3. **TTL:** TTL bounds cache-entry residence after fill, not freshness relative to authoritative state. A lagging replica or delayed reader can fill already-old data with a new TTL. Values of 10 minutes, 30 seconds, 5 minutes, 15 seconds, 10,000 callers and 99% hits are *illustrative*, not real-world measurements.
4. **Invalidation:** traced both stale-refill interleavings by hand, including (a) delete before DB commit and (b) delayed old read after commit+delete. Successful commit and a cache delete are separate actions; failed post-commit invalidation can retain old data. Versioned keys without a reliable latest-version pointer do not alone guarantee current reads.
5. **Stampede and negative cache:** in-process single-flight only coordinates local requests. TTL jitter distributes expiry times across keys but does not prevent many simultaneous misses of one key. Negative cache should only represent real absence, not dependency timeout or permission denial.
6. **Exercise:** with 20 process-local caches, invalidating on replica 3 cannot invalidate replicas 8 and 12. Broadcast invalidation, shorter TTL, shared cache or direct authoritative reads are conditional on freshness/capacity requirements; a shared cache alone cannot make commit+invalidate atomic.

## Teaching, sources, freshness and verification limits

- Matched all major sections, both diagrams, pseudocode, the 20-replica answer, operational checklist and route references across locales. Production pricing story is clearly hypothetical and load count illustrative.
- Checked [Microsoft Cache-Aside](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside), [Microsoft Caching Guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching), [AWS Caching Best Practices](https://aws.amazon.com/caching/best-practices/) and [Redis Cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/) on 2026-11-18. No live Redis fault injection, concurrency load or database integration fixture was executed; static interleavings and provider guidance support the examples.
- Set both `lastVerified` values and body source-review dates to 2026-11-18; reconciled both changelogs, preserved `application-caching`/`reason` placement and added targeted assertions in `tests/application-caching.test.ts`.
- Prior head `9babe043a71138cc7489b5ec8eb6f8cebc38a2eb` had successful [Actions run #44214746646](https://github.com/thucne/software-development-atlas/actions/runs/44214746646). That success **does not cover these new changes**. Require green unit/inventory/lint/typecheck/build/Chromium checks on exact new head, then on merged-main SHA before checking #116/#119.
