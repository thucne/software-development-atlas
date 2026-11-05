# Wave 1 content review — Application Caching (EN/VI)

**Scope:** `content/docs/backend-engineering/application-caching.{mdx,vi.mdx}` · **Date:** 2026-11-05 · [Master #116](https://github.com/thucne/software-development-atlas/issues/116) · [Wave 1 #119](https://github.com/thucne/software-development-atlas/issues/119)

**Certification:** Corrections reviewed; full certification requires exact-change CI, merged-main checks and a complete claim/example/parity sign-off. Do **not** count this as 95/95 completion by virtue of targeted fixes alone.

## Technical and evidence findings

1. Previous narrative asserted 50,000 QPS, 99.8% hits, 10,000 simultaneous misses, 100% database CPU and a 30-second timeout without a primary incident report. Replaced both EN/VI openings with a hypothetical example without claimed measurements.
2. `Cache-Aside` does not intrinsically stop a stampede. `single-flight` scope matters (process vs distributed); TTL jitter spreads expiry times among keys rather than eliminating simultaneous misses for one hot key. No universal stampede recipe is guaranteed.
3. Prior unconditional rule 'always invalidate after commit' concealed a second race: a reader can load the old value before commit, the writer commits and invalidates, and then the delayed reader repopulates old data. Both directions and the appropriate version/TTL/bypass mitigations are now explicit and aligned in both languages.
4. Cache-aside's disposable derived values must be distinguished from Write-Behind, in which acknowledging a write before a durable commit risks losing the only acknowledged version. Write-Through does not automatically make DB+cache updates atomic.
5. Re-checked the accompanying cache-key identity explanation, negative caching, source-load fallback capacity, local/shared cache topology, two Mermaid diagrams, pseudocode and exercises for EN/VI correspondence. Existing content beyond the high-impact corrections remains subject to the master audit process.

## Primary sources

- [AWS — Caching Best Practices](https://aws.amazon.com/caching/best-practices/)
- [Microsoft — Cache-Aside Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
- [Microsoft — Caching Guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching)
- [Redis documentation — Cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/)

## Verification

- [x] EN/VI content, example sequence, diagrams, sections and key data-contract claims reviewed and materially corrected.
- [x] Synchronized `lastVerified` and bilingual changelogs.
- [ ] GitHub Actions unit/content tests, lint, typecheck, MDX build and Playwright E2E on exact PR head.
- [ ] Confirm merged-main checks before marking a full pair audit completed.
