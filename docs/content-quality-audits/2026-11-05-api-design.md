# Wave 1 EN/VI audit — API Design

- Date: 2026-11-05
- Pair: `content/docs/backend-engineering/api-design.{mdx,vi.mdx}`
- Trackers: [#116](https://github.com/thucne/software-development-atlas/issues/116), [#119](https://github.com/thucne/software-development-atlas/issues/119)
- Status: article and evidence review performed; **not certified until exact-commit CI and merged-main verification pass**.

## Technical claims reviewed and corrected

1. An invented outage was narrated with a fabricated 50,000 mobile-app crash count, five-minute response and 100% backend uptime. The opening and second scenario are now explicitly hypothetical in both languages; not all clients have strict decoders or equal update options.
2. HTTP APIs represent a technical contract, not an inherently legally binding agreement. Backward compatibility depends on the published contract and an explicit migration/version strategy; absolute 'never change field' language was removed.
3. RFC 9457 **obsoletes RFC 7807**; using Problem Details is an available standard, not a universal requirement. The example's five members are optional. `type` defaults to `about:blank`, `status` is advisory, the HTTP status remains authoritative, `application/problem+json` is the content type, and clients use machine-readable identifiers rather than localized detail text.
4. RFC 9110's 401 requires `WWW-Authenticate` with an applicable challenge. Other method and status behavior reviewed: safe vs idempotent methods, PATCH retry caveat, 202/204/409/422, DELETE effect versus differing responses.
5. Cursor/keyset pagination improves certain performance characteristics but does not guarantee no gaps or duplicates under concurrent writes. Document deterministic indexed ordering with tie-breaker and snapshot/consistency boundary when required.
6. The response-loss/retry sequence diagram, idempotency-key caveat, export exercise and answer were reviewed against the surrounding lessons; unchanged unless necessary. Related authorization, rate limiting and caching remain separate boundaries.

## Parity, editorial and teaching evidence

- Compared all eleven substantive sections, source examples (HTTP method table, status codes, JSON errors and response changes), Mermaid graphs, retry sequence, pagination, compatibility checklist, self-check/answer and agent rule across EN and VI.
- Reworded prominent Vietnamese headings and summaries to remove overly absolute/unnatural claims; kept English and Vietnamese learning outcomes, examples and caveats aligned.
- Source links, lastVerified dates and changelog entries synchronized in both languages.

## Primary sources

- [RFC 9110 HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) — safe and idempotent method semantics, response codes, 401 challenge.
- [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html) — obsoletes 7807, optional members, MIME type, error identity and advisories.

## Release validation

- Manual EN/VI full-pair read complete.
- Required: the exact branch head and merged main pass unit/content tests, lint, typecheck, MDX build, Chromium Playwright E2E. Keep issue checklist unchecked until verified.
