# Atlas content-quality remediation goals (November 2026)

**Status:** in progress — this document is a delivery plan, not a claim that the entire library is reviewed or fixed.

## Goal

Make every published English/Vietnamese lesson technically reliable, equally useful in both languages, clear to a working developer, grounded in evidence, and easy to use as a learning resource or reference. Preserve depth and trade-off reasoning rather than shortening articles to meet a readability score.

**Baseline (2026-11-05, main):** 95 substantive English MDX lessons and 95 Vietnamese companions across 13 authored sections, not counting guides/navigation pages. The canonical map contains 128 concepts; published article count and concept coverage are *not* measures of quality. A structural sweep of the 95 VI pages is complete; a full claim-by-claim and code-example review is **not** complete.

## Definition of done (per EN/VI pair)

- [ ] **Correctness:** review all prominent claims, rule-of-thumb statements, code, examples, tables and diagrams. Distinguish standards guarantees from provider behavior and conditional heuristics. Reproduce consequential examples or cite a normative/primary source; resolve every identified factual error in **both** languages.
- [ ] **Parity:** EN and VI teach the same learning outcomes, failure modes, examples, caveats, exercises, and meaningful API/version details. Translation need not be literal or equal length; record omissions and intentionally adapted examples.
- [ ] **Natural wording:** VI prose reads naturally rather than as a word-for-word translation. Preserve necessary technical terms but explain new ones on first substantive use. Avoid repetitive English verbs in Vietnamese syntax and gratuitous alarmist language.
- [ ] **Teaching order:** practical problem, plain-language model, minimal verifiable example, deeper reasoning, edge cases and production judgment. TL;DR should not repeat a long introduction or introduce excessive advanced terminology.
- [ ] **Evidence:** label illustrative incidents and sample numbers as hypothetical. For real incidents, include a primary incident report or similar authoritative source. Link standards and vendor documentation directly, especially for numerical/version-sensitive statements.
- [ ] **Usability:** check exercises/answers, working diagrams, meaningful visuals and correct related links. Avoid duplication between adjacent lessons by giving each a distinct outcome.
- [ ] **Freshness/validation:** update `lastVerified` for factual re-verification or material teaching changes, sync the EN/VI dates, and reconcile both rolling changelogs. Run the repository's content tests, lint, typecheck and build before merge where executable.
- [ ] **Review evidence:** a PR description records affected article pairs, exact factual corrections, parity gaps closed, source links, and which checks actually ran. Do not silently mark a pair complete on metadata or wording edits alone.

## Priority workstreams

| Priority | Workstream | Initial scope / examples | Exit criteria |
| --- | --- | --- | --- |
| P0 | Incorrect or overstated technical claims | Promise `.finally()` semantics; HTTP safe/idempotent methods; PostgreSQL multicolumn indexes; HTTP 429 `Retry-After`; other absolutes found during line review | Claim and qualification corrected in both languages; source and examples verified |
| P0 | English–Vietnamese parity | Browser Event Loop, Promises, Containers vs Serverless, HTTP Request Lifecycle, Async Waterfalls (first pass) | A section-by-section parity matrix confirms equivalent material; examples and sources preserved |
| P1 | Vietnamese editorial pass | All 95 VI companions | Natural prose, consistent technical terminology, appropriately qualified statements, no melodramatic or generic filler |
| P1 | Teaching-design pass | Overloaded TL;DRs, long ungrounded incident openings, exercises, agent checklists | Each page is understandable from a concrete first example; advanced details are discoverable without hiding rigor |
| P1 | Sources and incident transparency | Hypothetical conversion/latency/financial stories; reference lists without links | Incidents labeled real/illustrative and significant numerical claims traced to evidence or explicitly hypothetical |
| P2 | Curriculum and overlaps | Timeouts vs retries guides; thin Computing Foundations/Security/Delivery Operations coverage | Distinct outcomes for overlaps; roadmap prioritizes missing concepts by learner value, not article count |

## Known priority examples (not the exhaustive audit)

1. `programming/async/promises`: distinguish `finally()` cleanup transparency from `then()` / `catch()` return-value semantics; restore missing VI coverage of modern APIs, cancellation and examples.
2. `backend-engineering/idempotency`: do not equate HTTP safe methods with zero server-side effects or idempotency with identical responses; explain the operation boundary.
3. `data-systems/database-indexes-and-query-plans`: do not claim an index is **always** ignored when the leading column has no filter; explain optimizer/cost and skip-scan applicability.
4. `backend-engineering/rate-limiting`: do not present `Retry-After` as a mandatory header on every 429 response.
5. `engineering-judgment/decision-guides/containers-vs-serverless`: restore cross-language parity; qualify provider-specific runtime/cost claims, mark invented incident numbers as illustrative.

## Execution / merge policy

Make **small, reviewable PRs**: (1) standards and audit tracking, (2) verified technical fixes, (3) parity batches of a few lessons, (4) editorial/evidence batches by area, (5) curriculum work. Keep both languages in the same PR whenever changing material meaning. Merge only when changes and verification evidence can be inspected; **do not** bulk auto-rewrite 190 MDX files or represent unreviewed content as finished.

A workstream is complete only after every in-scope lesson pair has a recorded review; a merged PR for one batch closes only that batch. Remaining work is tracked openly rather than treating an approved plan as completion.

## Review template

```md
### Lesson pairs
- [ ] path (EN + VI)
### Change types
- [ ] factual semantics / tested example
- [ ] parity / learning outcome
- [ ] natural language / teaching order
- [ ] incident labeling / sources
### Evidence
- Primary sources:
- Example/code/diagram validation:
- Checks run (and checks not run):
- lastVerified/changelog handling:
- Known remaining gaps:
```
