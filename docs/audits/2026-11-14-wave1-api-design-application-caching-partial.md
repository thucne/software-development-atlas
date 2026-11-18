# Wave 1 partial audit evidence — API Design and Application Caching (2026-11-14)

**Status: PARTIAL — neither EN/VI pair is certified under the complete #116 rubric.** This is an evidence log for [PR #142](https://github.com/thucne/software-development-atlas/pull/142), not a completion certificate.

## Reviewed scope and edits

| Pair | EN + VI | Evidence / change | Remaining |
| --- | --- | --- | --- |
| API Design | `content/docs/backend-engineering/api-design{,.vi}.mdx` | Clarified HTTP 401: absent valid authentication credentials and a required `WWW-Authenticate` challenge. Checked section alignment (11 numbered sections; 16 code-fence markers per language) and hypothetical mobile-compatibility example labeling. | Full line-by-line correctness of every method/status/example, exercise execution, crosslinks and editorial pass |
| Application Caching | `content/docs/backend-engineering/application-caching{,.vi}.mdx` | Explicitly labeled tenant-blind pricing as hypothetical; bounded the 10,000-request stampede as an illustrative worst case without coalescing. Checked section alignment (8 numbered sections; 14 code-fence markers per language). | Full line-by-line correctness, race/code example execution, source coverage, exercises, crosslinks and editorial pass |

### Primary-source checks

- [RFC 9110 §15.5.2 — 401 Unauthorized](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.2): a 401 response concerns missing valid authentication credentials for the target resource; the server MUST send a `WWW-Authenticate` field containing at least one challenge applicable to the target resource. **Reviewed 2026-11-14**.
- [Microsoft Azure Architecture Center — Cache-Aside pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside): cache misses load from the backing store; updates normally write to the store before invalidating the cached entry; cache-aside does not guarantee consistency. **Reviewed 2026-11-14**.
- The 10,000-request count is an illustrative concurrency upper bound, **not** an incident statistic or a guaranteed database read count.

### Validation

- PR #142 pre-evidence head SHA `7dea2356e88d92a13e8511ab50fe2c4cc67f9af3`: [GitHub Actions run 43380126704](https://github.com/thucne/software-development-atlas/actions/runs/43380126704), job `Unit, lint, typecheck, build and E2E` **success**; individually checked steps: content/unit tests, content inventory, lint, typecheck, build, Chromium E2E all **success**.
- This evidence file adds a new commit. **Recheck GitHub Actions against the new PR head SHA**; the earlier successful run does not validate subsequent commits.
- Local `pnpm` tests not run because the execution environment cannot clone the repository. GitHub Actions is the validation environment.

### Metadata and certification decision

- `lastVerified` remains `2026-11-05` in both languages for both pairs: a targeted source check is **not** a full factual re-verification of the entire lesson. No article changelog is claimed updated.
- **Do not check** either pair in #116/#119; do not merge solely on this partial record. Complete the rubric, then update paired `lastVerified` and changelogs and record full-pair evidence before certification.

## Additional targeted review — 2026-11-15 (still partial)

- **API Design (EN/VI):** Compared PUT/PATCH semantics and retries against [RFC 5789 §2](https://www.rfc-editor.org/rfc/rfc5789.html#section-2) and [RFC 9110 conditional requests](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.1). Clarified that PATCH is not idempotent by method definition, though particular patch operations can be; a strong ETag with `If-Match` can protect version-dependent updates, and failed preconditions use `412`. Added equivalent EN/VI guidance and an RFC 5789 source link. This is a standards-backed prose example, **not a live API integration test**.
- **Application Caching (EN/VI):** Resolved a misleading absolute claim that all cache eviction can only hurt performance: that statement applies to disposable cache-aside/read copies of durable state, **not** a write-behind layer holding acknowledged but uncommitted writes. Aligned the qualification in both languages with the existing write-behind warning. This is a conceptual review, **not a durability fault-injection test**.
- **Prior CI on previous PR head:** [run 43541542942](https://github.com/thucne/software-development-atlas/actions/runs/43541542942), result `success` for unit/content, inventory, lint, typecheck, build and Chromium E2E on SHA `809b1180296404189371fb55d1c91ccb68da7604`. Its success does **not** validate the new edits above. Recheck exact current head and all steps before merge.
- **Certification:** both pairs remain **NOT CERTIFIED**. Full EN/VI line-by-line audit, consequential examples, crosslinks, idiomatic editorial pass, freshness/changelog reconciliation, and final exact-head CI remain outstanding. Do not tick the pair checkboxes or merge this draft based only on this record.


## Targeted follow-up — 2026-11-16 (still partial)

- **Exact prior head CI verified:** SHA `ceb0ab285cfbf62f82bf1f2b956c5100dbf94a2f`, [Content quality gates run #43664602200](https://github.com/thucne/software-development-atlas/actions/runs/43664602200), job `Unit, lint, typecheck, build and E2E` completed successfully. Individually inspected successful steps: checkout exact commit, install locked dependencies, lesson/content tests, inventory, lint, typecheck, build, Chromium install and browser E2E. This evidence validates **that SHA only**.
- **Application Caching (EN/VI):** Clarified that TTL measures the lifetime of an entry **since cache fill**, not a guaranteed maximum age of the data compared with the authoritative source. A stale read from a lagging replica or a delayed pre-commit reader can populate the cache with old data and a fresh TTL; strict read-after-write freshness needs a version check or a cache bypass. This corrects an overly broad interpretation of TTL. Cross-checked against [Azure Cache-Aside](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside) and [Azure Caching Guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching) (consistency, invalidation ordering, replica lag).
- **Current edits:** both cache lesson files have new commits after the green run. **Do not claim the previous run validates the new PR head.** Recheck full Actions steps on the final SHA before merge.
- **Certification decision unchanged:** API Design and Application Caching remain partial, not fully certified; paired `lastVerified` remains unchanged. Full EN/VI line-by-line, code/exercise, link and editorial review remains outstanding.

## Update 2026-11-17 — cache key scope, outage risk, and commit ordering (partial)

- Verified prior PR head `2069a0cf1483e826a8b7f5be67676627cbf0e7ec` against [GitHub Actions run #43787239001](https://github.com/thucne/software-development-atlas/actions/runs/43787239001): the complete `Unit, lint, typecheck, build and E2E` job and every substantive step (lesson/content tests, inventory, lint, typecheck, build, Chromium E2E) succeeded. This verification **does not** cover the new edits below.
- Reviewed the full English and Vietnamese Application Caching lesson bodies and corresponding sections in API Design for parity and claim strength. Corrected the EN/VI TL;DR claim that *every* missing cache-key dimension inevitably leaks data: the relevant dimensions must be represented in the key **or** guaranteed invariant by isolation, and an omitted tenant/authorization dimension *can* cause cross-tenant exposure. This aligns with the existing key-isolation discussion later in the lesson.
- Updated the EN/VI cache-aside glossary note to distinguish loss of committed business truth from source overload and loss of availability; write-behind buffers retain a separate durability contract.
- Updated both Mermaid diagrams to make the successful authoritative commit explicit **before** invalidation, consistent with the documented write path. The diagram remains a simplified model and does not claim to eliminate stale refill races.
- Source rationale: [Azure Cache-Aside pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside) (cache key and consistency considerations), [Azure Caching Guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching) (cache failures, invalidation, source pressure). These are guidance references, not measured production incidents.
- **Status remains PARTIAL:** no claim of a complete pair-by-pair rubric audit or new certification; do not change `lastVerified` or issue checkboxes yet. Recheck all Actions steps against the **new exact PR head SHA** before any merge.

## Targeted follow-up — 2026-11-18 (still partial)

- **Exact prior-head CI:** SHA `a48920d9b5a6e326b3948711199a9e448fa19496`, [Actions run #43994995455](https://github.com/thucne/software-development-atlas/actions/runs/43994995455) completed **success**. Inspected job `133744770689` and its successful steps: content/unit tests, inventory, lint, typecheck, MDX build and Chromium browser E2E. This does **not** validate today's subsequent commits.
- **API Design (VI):** Restored EN/VI parity for the security-sensitive `404 Not Found` case: RFC 9110 §15.5.4 permits an origin server that wishes to hide the existence of a forbidden target resource to respond with `404` instead of `403`. This is an optional concealment choice, not a universal authorization policy. [RFC 9110 §15.5.4](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.4).
- **Application Caching (EN/VI):** Clarified that illustrative colon-delimited key examples need unambiguous component serialization when input identifiers can contain separators, and the same tenant/authorization dimensions must be used consistently on all cache operations. This is a correctness design inference from key isolation, not a vendor-specific guarantee.
- **Application Caching (EN/VI):** Added the missing post-commit invalidation failure case: database commit and cache delete are not atomic across systems. A failed delete can leave stale cached state; freshness must be bounded or supported by durable retry/version mechanisms. Source guidance: [Azure Cache-Aside](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside) and [Azure caching guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching). The examples are architectural scenarios, not reported incidents.
- **Status: PARTIAL / NOT CERTIFIED.** Full-pair EN/VI review, code/exercise execution, idiomatic editorial pass, crosslinks, changelog/lastVerified reconciliation and **CI on the new exact head** remain outstanding. No checklist tick or merge is justified yet.
