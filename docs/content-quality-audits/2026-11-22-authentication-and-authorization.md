# Wave 1 EN/VI review in progress — Authentication & Authorization (2026-11-22)

- Pair: `content/docs/backend-engineering/authentication-and-authorization.mdx` + `.vi.mdx`.
- Trackers: #116 and #119.
- **Status: NOT CERTIFIED.** Both complete articles were read; this is a focused corrective pass, not a claim that every rubric gate has been proven.

## Reviewed and corrected
- Both languages: scoped invoice lookup must derive the tenant from validated server-side identity, not client input; a scoped query is defense in depth, not a replacement for policy checks on all endpoints.
- Both languages: changed dramatic absolute failure wording to a conditional IDOR/BOLA failure mode.
- Both languages: added an explicitly hypothetical cross-tenant and same-tenant negative-test example, with no invented real incident.
- Updated both `lastVerified` fields to 2026-11-22 for the rechecked authorization claims.

## Primary references
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html): deny by default, validate permissions on every request, object-specific authorization.
- [OWASP API1:2023 BOLA](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/): object-level access failures.
- [NIST SP 800-63B-4 AAL requirements](https://pages.nist.gov/800-63-4/sp800-63b/aal/): AAL2 two factors and phishing-resistant option; framework-specific rather than a universal requirement.

## CI failure triage (2026-11-23)

- Initial PR head `520199b8869d9662ffbc58dac27ef0b2d9e49372` failed [Actions #45003040295](https://github.com/thucne/software-development-atlas/actions/runs/45003040295): 2 failing assertions out of 746 (105/107 test files passed), before inventory/lint/typecheck/build/E2E could run. The failures were the rolling changelog freshness invariant and an auth regression test still expecting the previous `lastVerified` date.
- Fixed the **content** by adding EN/VI rolling changelog entries and updating their freshness dates; strengthened the existing regression test with the new date and EN/VI scoped-tenant claims. No assertions were removed and no tests or CI gates were bypassed.
- The latest PR SHA still requires a fresh full Actions run. An earlier failing SHA must not be credited as success.

## Still required before certification
- EN/VI rolling changelogs now reconciled; finish reviewing all links, examples, Mermaid diagrams, exercises, and teaching-order issues.
- Validate any further consequential claims against primary sources; the negative test is a proposed fixture, not a test run.
- Obtain exact PR-head unit/content inventory, lint, typecheck, build, and Chromium E2E results, plus applicable merged-main gate evidence.
- Do not check #116 or #119 until the entire rubric is satisfied.

## CI follow-up (2026-11-24)

- [Run 45092621614](https://github.com/thucne/software-development-atlas/actions/runs/45092621614) failed 3 of 746 tests (743 passed): distributed replication, frontend modernization and test strategy all detected the same footer/changelog date mismatch (2026-11-18 vs 2026-11-23). Subsequent gates were skipped.
- Synchronized `lib/site-metadata.ts` and the exact expected footer label in `tests/e2e/docs-shell.spec.ts` to the actual changelog date, 2026-11-23. The equality checks and browser assertion remain intact. Fresh CI is required; no certification yet.

## CI follow-up (2026-11-25)

- Exact head `23c7a7dbd1fecb4984a712a34e9f4a2ac36fbd07`: [run 45308143866](https://github.com/thucne/software-development-atlas/actions/runs/45308143866) failed 2/746 tests; 744 passed. Containers and Property-Based Testing still expected November 18 site metadata and E2E footer text. Inventory, lint, typecheck, build and browser E2E were skipped.
- Updated both tests' exact expected metadata and footer strings to November 23, matching the rolling changelog and actual footer assertion. All existing assertions retained. Await full CI on the new head; no certification or merge yet.
