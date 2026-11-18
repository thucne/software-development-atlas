# Wave 1 complete EN/VI article audit — Rate Limiting (2026-11-18)

- Pair: `content/docs/backend-engineering/rate-limiting.mdx`, `rate-limiting.vi.mdx`
- Trackers: [#116](https://github.com/thucne/software-development-atlas/issues/116) and [Wave 1 #119](https://github.com/thucne/software-development-atlas/issues/119)
- Status: **full lesson-level correctness, parity, editorial and evidence review performed**. **Final certification pending exact PR-head and merged-main CI.** No checkbox should be marked solely on this report.

## Full article, instructional and bilingual inspection

Compared both complete articles: introductory fixed-window example, admission-policy TL;DR, decision flowchart, all 11 numbered sections, identity-key flowchart, rate/quota/concurrency/backpressure table, fixed/sliding/token-bucket explanation and example, weighted-cost/hierarchical policy, multi-replica behavior, response status/header example, failure-mode policy, constructed tenant reporting incident and Impact/Cause/Pattern, telemetry, decision checklist, self-check/answer, 12 actionable review tasks, agent rule and primary references. Both variants cover the same technical outcomes, examples, cautionary cases and links. Improved unnatural Vietnamese and removed sensational wording.

## Factual claims, risk and examples

1. **Fabricated outage removed:** An earlier intro gave precise authentication attack timestamps followed by unverified 100% CPU, password-hashing overload and an authentication database crash as if it were reported fact. Replaced it in EN/VI with a clearly **constructed** fixed-window counterexample. Two 100-request batches on different sides of the minute boundary can be admitted in a short *rolling* span without violating either calendar-minute policy; the example **does not** claim measured CPU saturation or an actual breach. The 100-request threshold is an assumption, not an empirically established capacity.
2. **Identity and credential stuffing:** A per-IP allowance is vulnerable to rotating proxies and distributed attackers; a single composite `IP + username` bucket can also permit unbounded attempts against different usernames from one IP. The review adds independent per-account and per-source budgets when suitable, plus MFA and layered protections; policies must be tuned to avoid account lockout attacks and avoid exposing per-account attempt information. Grounded in the official OWASP credential-stuffing and anti-automation cheat sheets.
3. **Algorithms and scope:** Fixed-window budgets have boundary bursts; sliding window and token bucket have different memory/precision and refill/burst trade-offs. The `10 tokens/s`, `50 token` bucket example implies an initial 50-token burst followed by sustained demand near 10/s—not a universal service throughput guarantee. A per-replica bucket is not a tenant-wide ceiling; with 10 independent replicas, aggregate allowance can reach roughly 10x, conditional on traffic distribution and policy.
4. **Admission vs cost:** A rate limit alone does not bound concurrent in-flight work, a monthly quota or total CPU. Weighted tokens and a concurrency cap serve distinct policy needs, especially for long-running export work. The hypothetical 2-to-12-replica tenant reporting scenario is illustrative and not a documented production incident.
5. **HTTP 429 contract:** RFC 6585 §4 defines `429` and allows—but does not require—`Retry-After`; RFC 9110 §10.2.3 accepts an HTTP date or nonnegative delay-seconds. Example `Retry-After: 20` is illustrative, **not** a measured guarantee of capacity recovery. Completed the response with a syntactically valid illustrative RFC 9457 Problem Details JSON body, with localized human title in VI. Avoid revealing detailed anti-abuse thresholds to attackers.
6. **RateLimit status and freshness:** Verified the IETF HTTPAPI RateLimit/RateLimit-Policy document remains the active **`draft-ietf-httpapi-ratelimit-headers-11`** (published 2026-05-23, expiring 2026-11-24) on 2026-11-18, not an RFC. EN/VI now state the 2026-11-18 verification date, link to official IETF datatracker and warn against timeless syntax claims. A draft's guidance is not equivalent to the RFC 6585 status guarantee.
7. **Failure policy and operations:** Fail-open can allow extra work and fail-closed can create unneeded outages. Source-backed recommendation remains conditional by endpoint/security sensitivity, with monitoring for admitted/limited rates, overflow, backend latency, saturation and credential leakage controls.

## Code, self-check, navigation and review limitations

- Compared all EN/VI Mermaid diagrams (admission, identity, token bucket), code/text fences, weighted cost table and 429 response syntax. Read review questions and self-check: eight independent 100/min per-replica counters **do not** provide one fleet-wide 100/min invariant. This was analyzed as an architectural example, not executed against Redis or a gateway.
- Verified the existing Backend Engineering crosslinks and canonical `rate-limiting` concept at `reason` depth remain unchanged; synchronizes `lastVerified: 2026-11-18`, both rolling changelog entries and `tests/rate-limiting.test.ts` regression assertions. The site maintenance footer was already dated 2026-11-18, so no separate footer bump was needed.
- Did **not** execute load generation, DDoS traffic, authentication attacks or failover/Redis simulations. No claim of those tests or of actual production metrics is made.

## Primary-source verification (2026-11-18)

- [RFC 6585 §4 — 429 Too Many Requests](https://www.rfc-editor.org/rfc/rfc6585.html#section-4)
- [RFC 9110 §10.2.3 — Retry-After](https://www.rfc-editor.org/rfc/rfc9110.html#section-10.2.3)
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)
- [IETF HTTPAPI — RateLimit header fields draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/)
- [OWASP — Credential Stuffing Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html)
- [OWASP — Bot Management and Anti-Automation](https://cheatsheetseries.owasp.org/cheatsheets/Bot_Management_and_Anti-Automation_Cheat_Sheet.html)

## Release certification gate

- [x] Full source and EN/VI parity, natural-language, examples/diagrams, rubric, links and citations review recorded.
- [x] Pair freshness and changelog reconciled, targeted factual assertions added.
- [ ] Exact final PR-head full content/unit tests, inventory, lint, typecheck, MDX build, Chromium Playwright E2E and required checks.
- [ ] Exact merged-main push CI green before checking #116/#119. Keep both issues open.
