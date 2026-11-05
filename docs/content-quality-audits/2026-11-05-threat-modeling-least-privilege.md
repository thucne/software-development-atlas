# Wave 1 EN/VI audit — Threat Modeling & Least Privilege

- Date: 2026-11-05
- Master tracking: [#116](https://github.com/thucne/software-development-atlas/issues/116)
- Wave 1 tracking: [#119](https://github.com/thucne/software-development-atlas/issues/119)
- Scope: `content/docs/security/threat-modeling-and-least-privilege.{mdx,vi.mdx}` (one EN/VI pair)
- Review status: source/content review performed; **complete certification waits for the exact-commit CI result and issue reconciliation**. Do not count as certified until then.

## Claim-by-claim and technical audit

1. **Unsourced incident metrics:** the opening invented a twenty-minute/ten-million-user breach with no primary incident report. Replaced it with an explicitly hypothetical multi-boundary scenario; no real-world incident is claimed. The later support-portal example is also explicitly hypothetical in both languages.
2. **AWS privilege layers:** `rds:*` is RDS control-plane authorization, not equivalent to SQL row access. `rds-db:connect` applies to IAM DB login, which still needs database principal/grants. Clarified both languages and isolated stolen support-agent session from stolen service IAM credentials.
3. **Wildcard caveat:** assessed effective IAM privileges rather than claiming any wildcard inevitably compromises the whole infrastructure; resources, conditions and policy intersections matter.
4. **Policy-enforcement boundaries:** OWASP recommends checking authorization for every request. Clarified that an implementation can load minimal trusted policy attributes before authorizing, but must not return protected data first; writes and async workers need checks at their own execution boundary.
5. **Risk response:** explained that not every identified threat is simply mitigated; teams may eliminate, mitigate, transfer some impact or explicitly accept residual risk. Transfer does not erase technical risk.
6. **Definitions and diagrams:** compared both matching Mermaid diagrams and terminology for trust boundaries, identity vs authorization, default deny, blast radius, STRIDE and four-step loop against primary sources. Diagrams remain illustrative, not asserted network topology of a real incident.

## EN/VI parity and teaching review

- Compared corresponding headings, scenario, diagrams, mitigation lists, pseudo-code, least-privilege table, four-question workflow, self-check and answer, and production checklist in both files.
- Rephrased Vietnamese headings and key paragraphs for natural developer-facing Vietnamese while preserving recognizable technical terms.
- Kept the same scenario assumptions, risk caveats and primary-source links in EN and VI; synchronized `lastVerified: 2026-11-05` and both rolling changelogs.
- The existing export-job exercise still tests privilege scope, short-lived credentials and policy verification in both languages.

## Primary evidence

- [OWASP Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) — four questions, iterative modeling, treatment of threats.
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) — deny by default, validate permissions on each request and least privilege.
- [NIST CSRC: least privilege](https://csrc.nist.gov/glossary/term/least_privilege) — minimum system authorizations/resources.
- [AWS RDS: IAM database authentication policy](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.IAMPolicy.html) — `rds-db:connect` versus `rds:`.
- [AWS RDS: management API IAM actions](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/security_iam_service-with-iam.html) — RDS control-plane policy scope.

## Verification record

- Read both lessons fully (including examples, diagrams, exercise, answer and crosslinks).
- Review content and source parity manually; machine checks to be supplied by GitHub Actions PR result.
- Required run: frozen install, `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` and `pnpm test:e2e`. A green check at the *previous* main commit does not certify this change.
- Unresolved source claims: no known specific unsupported numeric incident claims remain in this pair; full certification depends on successful CI and final review.
