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
