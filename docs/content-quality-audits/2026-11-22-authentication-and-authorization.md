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

## Still required before certification
- Reconcile EN/VI rolling changelogs and check all links, examples, Mermaid diagrams, exercises, and teaching-order issues.
- Validate any further consequential claims against primary sources; the negative test is a proposed fixture, not a test run.
- Obtain exact PR-head unit/content inventory, lint, typecheck, build, and Chromium E2E results, plus applicable merged-main gate evidence.
- Do not check #116 or #119 until the entire rubric is satisfied.
