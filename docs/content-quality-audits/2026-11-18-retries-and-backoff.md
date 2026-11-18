# Wave 1 complete EN/VI article audit — Retries and Backoff (2026-11-18)

- Files: `content/docs/distributed-systems/retries-and-backoff.mdx` and `retries-and-backoff.vi.mdx`
- Trackers: [master #116](https://github.com/thucne/software-development-atlas/issues/116), [Wave 1 #119](https://github.com/thucne/software-development-atlas/issues/119)
- Decision: **full article-level source, teaching, bilingual parity and example review completed; certification pending final PR-head and merged-main green CI.** The record does not imply checks have already passed.

## End-to-end article review

Read and compared both complete lessons: illustrative retry-storm introduction, TL;DR and decision flow, three TermBoxes, classification table, ambiguous-write rules, backoff numerical sequence, two Mermaid diagrams (decision tree + sequence), `Retry-After` example, multi-layer amplification calculation, AWS SDK retry quota, hypothetical checkout incident with Impact/Cause/Pattern, self-check/answer, operational checklist, agent rule, crosslinks and primary sources. Kept same learning outcomes and scope across EN/VI and replaced awkward untranslated Vietnamese phrases around retry eligibility and safe replay. Related Timeouts and combined Partial Failure synthesis remain distinct. Canonical `retries-and-backoff` and `operate` placement unchanged.

## Technical and example verification

1. **Retry eligibility and effects:** HTTP status alone is not enough. Network timeouts can leave an ambiguous committed write; safe replay requires a stable idempotency contract, naturally idempotent mutation, or reconciliation before another attempt. The original unconditional statement that an ambiguous retry *will* duplicate business effects was incorrect; duplication is a **risk**, not a guaranteed outcome. The corrected version is explicit in both languages.
2. **Amplification arithmetic:** The original phrase “3 retries” conflicts with `3 × 3 × 3 = 27`. With **3 total attempts per layer** (initial + 2 retries), 27 deepest calls are possible if all three layers exhaust attempts. **3 additional retries** per layer instead gives `4 × 4 × 4 = 64`. The narrative was corrected so both languages now match the diagram and the hypothetical incident.
3. **Backoff example:** `100 -> 200 -> 400 ms` is illustrative uncapped exponential delay before jitter, not fixed user-observed scheduling. The sequence diagram's 120-ms/310-ms jitter values are constructed, not actual timings. Deadline and remaining capacity determine whether further attempts help.
4. **HTTP delay hint:** RFC 9110 §10.2.3 defines `Retry-After` as nonnegative seconds or HTTP-date. RFC 6585 §4 makes it **optional** on 429, RFC 9110 §15.6.4 optional on 503. A 2-second hint cannot fit a 250-ms remaining deadline. Delay hints do not authorize unsafe replay; overload/quota can persist.
5. **AWS retries:** AWS SDK standard mode uses a retry-quota token bucket and bounded randomized backoff, but that quota is normally **per SDK client instance**, not a global distributed fleet budget. Previously vague language about “shared budget” was qualified in both locales. Do not turn AWS's implementation choice into a universal protocol requirement.
6. **Hypothetical scenario / exercise:** Multi-layer checkout attempts are deliberately a constructed example; a duplicate reservation is possible but not certain. The answer to the self-check prioritizes auditing existing SDK+wrapper attempts, assigning a single retry owner and preserving budget. Both EN/VI diagrams and examples were statically traced, not executed against an AWS service.

## Primary references checked 2026-11-18

- [RFC 9110 — Retry-After §10.2.3 and 503 §15.6.4](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 6585 — 429 and optional delay header §4](https://www.rfc-editor.org/rfc/rfc6585.html#section-4)
- [AWS Well-Architected — Control and limit retry calls](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_mitigate_interaction_failure_limit_retries.html)
- [AWS SDKs — Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html)

## Release gate

- [x] Full EN/VI article, scenarios, diagrams, examples, numeric checks, editorial, references and self-check parity reviewed.
- [x] Synchronized `lastVerified: 2026-11-18`, source-review date, English/Vietnamese changelogs and `tests/retries-and-backoff.test.ts` regression checks.
- [ ] Full unit/content tests, audit inventory, lint, typecheck, build, Chromium E2E on final exact PR-head commit.
- [ ] Green exact merged-main commit after merge; then update both checklist issues. Keep certification open until verified.
