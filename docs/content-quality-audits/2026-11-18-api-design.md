# API Design — Wave 1 full EN/VI content audit (2026-11-18)

- Pair: `content/docs/backend-engineering/api-design.mdx` and `api-design.vi.mdx`
- Trackers: [master #116](https://github.com/thucne/software-development-atlas/issues/116), [Wave 1 #119](https://github.com/thucne/software-development-atlas/issues/119)
- Review status: **full content rubric reviewed**. **Certification remains conditional** on final-head and merged-main CI; this is not a CI success claim.

## End-to-end coverage and bilingual parity

Read both entire lessons, including the opening illustrative mobile-compatibility scenario, TL;DR, eleven numbered sections, HTTP method/status tables, resource/validation diagrams, RFC 9457 JSON error, offset/cursor trade-offs, retry sequence, mobile JSON before/after, async export self-check and answer, checklist, agent rule, sources and related links. English and Vietnamese still teach equivalent method semantics, status/error models, migration, pagination, retry and authorization boundaries. Vietnamese descriptions of contract, idempotency and compatibility were naturalized; protocol field names and code payloads remain literal.

## Claim-by-claim and example evidence

1. **Safety and idempotency:** RFC 9110 §9.2 distinguishes a safe client's requested semantics from incidental server effects; idempotency means repeat requests have the same intended effect, not identical responses. The 204-then-404 DELETE example is consistent with that definition.
2. **PATCH / concurrency:** RFC 5789 §2 does not make PATCH idempotent by default. A strong ETag with `If-Match` provides an HTTP conditional version guard, with false preconditions mapped to 412 by RFC 9110. A counter increment may not be safe to replay; fixed-value replacement can be designed to be idempotent.
3. **Statuses and validation:** RFC 9110 §§15.5.2, 15.5.4: a 401 response requires at least one applicable `WWW-Authenticate` challenge; 404 can *optionally* conceal forbidden-resource existence. Validation and domain errors have different response meanings; the Mermaid branching diagram is conceptual, not a mandatory framework pipeline.
4. **Problem Details:** RFC 9457 supersedes 7807, defines an optional error format and the `application/problem+json` media type. `type`, `status`, `title`, `detail`, `instance` can be omitted. `about:blank` is the default type; `status` is advisory. Both JSON examples were parsed for syntax and kept equivalent; `example.com` addresses and incident numbers are fictitious, not production captures.
5. **Pagination and compatibility:** Offset scans can shift under writes. Deterministic keyset ordering with a unique tie-breaker still needs an explicit snapshot/consistency contract if ordering keys change. Schema field/type changes may break strict decoders; no fabricated customer metrics are asserted.
6. **Retry and self-check:** Simulated by reasoning the lost-201-response-after-commit path, not by running a real API. Async export exercise expects job identity, authorization, timeout budget, completion/error representation and duplicate-safety; a 202 response alone does not establish durable completion.

## Usability, metadata and validation boundaries

- Checked three Mermaid diagrams' corresponding EN/VI behavior, three JSON code fences' syntax in both languages, the original method/status and text snippets, section sequence, related routes, rubric questions and answer consistency.
- Reviewed technical claims against [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), [RFC 5789](https://www.rfc-editor.org/rfc/rfc5789.html), [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html) on 2026-11-18. No live HTTP server or SDK integration test is claimed; these are standards-based conceptual examples.
- Set EN/VI `lastVerified` to 2026-11-18; added paired rolling changelog entry and regression assertions in `tests/api-design.test.ts`. Canonical `api-design` concept and `operate` depth unchanged.
- The earlier PR head `9babe043a71138cc7489b5ec8eb6f8cebc38a2eb` passed [Actions run #44214746646](https://github.com/thucne/software-development-atlas/actions/runs/44214746646). **It does not validate these newer commits.** Need full unit/inventory/lint/typecheck/build/Chromium CI on exact final PR SHA and merged-main SHA before certification and checklist edits.
