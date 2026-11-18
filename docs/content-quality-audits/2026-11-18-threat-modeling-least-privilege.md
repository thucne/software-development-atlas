# Wave 1 complete EN/VI source audit — Threat Modeling & Least Privilege (2026-11-18)

- EN/VI scope: `content/docs/security/threat-modeling-and-least-privilege.mdx` and `.vi.mdx`
- Master [#116](https://github.com/thucne/software-development-atlas/issues/116), Wave 1 [#119](https://github.com/thucne/software-development-atlas/issues/119)
- This is a **new 2026-11-18 whole-article source/parity review** building on [the 2026-11-05 full review](2026-11-05-threat-modeling-least-privilege.md). **Final certification conditional on full green CI at the exact PR head and merged-main SHA.**

## Complete bilingual teaching review

Read both articles in full: opening **constructed** multi-boundary example (support-agent session and *separately compromised* service identity); TL;DR and threat-modeling action loop; four Mermaid diagrams (system boundaries, iterative questions, deny-by-default, blast radius); three TermBoxes (trust boundary, authorization, blast radius); resource-specific auth pseudocode; horizontal and vertical permission examples; IAM scope/lifetime and comparison table; support-portal hypothetical production scenario and Impact/Root cause/Correct pattern; export-job self-check/answer; ten-item operational checklist, agent rule, linked dependencies and primary references. Checked both versions convey the same assumptions, outcomes, technical caveats and concrete operator decisions. Rewrote strongly Anglicized VI text and headlines into idiomatic developer Vietnamese while preserving formal terms needed to read IAM/API docs.

## Evidence and correctness

1. **Authenticated is not authorized:** OWASP [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) calls for deny-by-default, per-request authorization and testing object-level policies. A guessed or changed customer ID cannot grant access merely because a session is valid; UI button hiding and unpredictable identifiers are not substitutes for server policy.
2. **Mutable policy/TOCTOU boundary:** The conceptual `authenticate -> load_minimal_policy_attributes -> authorize -> perform_authorized_action` sequence cannot by itself protect a later read/write if ownership changes after a precheck. Both EN and VI now explicitly require enforcing tenant/resource scope **at the data query or transaction point of use** and testing permission changes. Pre-auth attribute reads should remain minimal and trusted, without disclosing protected content.
3. **RDS IAM scope and engine support:** Per [AWS RDS IAM database policy docs](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.IAMPolicy.html), `rds:* ` pertains to management API actions and cannot by itself read table rows via SQL; `rds-db:connect` is a distinct IAM-auth DB-connect grant constrained by DB user/SQL privileges. [RDS IAM DB authentication](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.html) is conditional on supported DB engine, region, version and feature being enabled. This is stated explicitly in both languages. An overprivileged workload identity must be compromised separately from the support-agent session; one does not automatically reveal the other's credentials.
4. **Least privilege:** NIST [least-privilege definition](https://csrc.nist.gov/glossary/term/least_privilege) supports scope by resource, action and time. A wildcard's effect depends on other policy conditions and resource constraints. A short-lived credential does not substitute for minimal resource grants.
5. **Threat response:** The four-question loop and STRIDE are heuristic processes, not universal automated risk scores. Eliminating, mitigating, transferring impact or explicitly accepting residual risk are different responses. Neither purchased insurance nor reassigned liability removes technical exposure.
6. **Constructed support-portal scenario:** The earlier lesson and its 2026-11-05 audit already labeled the cross-tenant incident hypothetical; new changes remove the EN/VI impression that compromise of the human support session necessarily provides the backend IAM credentials. The incident's impact remains possible under the stated missing authorization and overly broad service grants; no actual breach, counts, timing or loss is claimed.
7. **Examples and checks:** The four diagrams, IAM table, access-control pseudocode, cross-tenant positive/negative test cases and 10-item checklist were statically inspected against the sources. Export-job exercise correctly asks for scope, action, lifetime and machine-checkable policy instead of relying solely on rotation. This is *static source review*, not a live IAM/RDS account penetration test or cloud policy simulator run.

## Verification and release gate

- [x] Read EN and VI in full; source-backed, diagram/pseudocode, scenario, teaching, linked-content, language purity and learning-outcome parity verified.
- [x] Synchronized both `lastVerified: 2026-11-18`, in-body source date, both locale rolling changelogs and `tests/threat-modeling-least-privilege.test.ts` with RDS/TOCTOU assertions. Canonical concepts `threat-modeling` and `least-privilege`, depth `operate` unchanged.
- [ ] Final full unit/content tests, content inventory, lint, typecheck, MDX build and Chromium Playwright E2E on the **exact new PR head**; Vercel.
- [ ] Same full green gate on **exact merged-main SHA**; only then reconcile #116/#119. Keep both issues open. Original [PR #135](https://github.com/thucne/software-development-atlas/pull/135) had source review and historic CI green, but did **not** run today's new inventory on its original head, so that old result alone does not certify the pair.

## Primary references rechecked on 2026-11-18

- [OWASP Threat Modeling](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html)
- [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [NIST least privilege](https://csrc.nist.gov/glossary/term/least_privilege)
- [AWS RDS IAM database connection policy](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.IAMPolicy.html)
- [AWS RDS IAM database authentication engine support](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.html)
- [AWS RDS management IAM actions](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/security_iam_service-with-iam.html)
- [OWASP Top 10 2025: A01 Broken Access Control](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/)
