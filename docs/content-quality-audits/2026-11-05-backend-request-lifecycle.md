# Wave 1 EN/VI source review — Backend Request Lifecycle

- Review date: 2026-11-05
- Issue tracking: [#116](https://github.com/thucne/software-development-atlas/issues/116) and [#119](https://github.com/thucne/software-development-atlas/issues/119)
- Scope: `content/docs/backend-engineering/backend-request-lifecycle.mdx` and `content/docs/backend-engineering/backend-request-lifecycle.vi.mdx`
- Evidence state: Full article-level reasoning/EN-VI/source review completed; **PR-head and merged-main quality gate are pending**, so do not certify this pair until then.

## Technical correctness review
1. **Unsourced and inconsistent incident figures**: The EN version claimed 10,000 concurrent customers, 12% CPU, 5-second payment slowdown, a 200-connection pool and 60-second timeout; VI described a concert sale and 15% CPU. Both are now the *same explicitly hypothetical checkout incident* with no invented metrics or real postmortem claims.
2. **NGINX vs deadline**: Official NGINX `proxy_read_timeout` default is 60s but this is an **inter-read idle interval**, not a request-wide upper bound. An upstream timeout may yield gateway 504 under RFC 9110, not necessarily on every client or from every application. Do not infer Envoy defaults from NGINX.
3. **Request shape**: Not every request runs a write transaction or durable async dispatch. The diagram is illustrative; cheap validation/auth should precede expensive processing where applicable, but authorization depending on mutable state may need an in-transaction recheck to avoid TOCTOU.
4. **Cancellation**: Go's context cancellation example proves it is a *cooperative* propagation signal. It is not a rollback guarantee. A timeout/client disconnect can leave the outcome of DB commit or remote call unknown. Safe retries require stable operation identity, state lookup or idempotency.
5. **Outbox / dual writes**: The sequence diagram previously showed a disconnected handoff participant, suggesting the relay may publish without reading committed work. Updated the EN/VI diagrams to show an outbox record written atomically with application data, committed, and later read/delivered by a relay; duplicates are possible and consumers must be idempotent. No exactly-once delivery claim.
6. **HTTP status**: RFC 9110 requires a `WWW-Authenticate` challenge with 401. Gateway 504 is conditional; 202 only accepts processing and must not claim the work completed. When an API promises durable acceptance, commit job state before returning and authorize status lookups.
7. **Incident scenario & teaching**: A second 'production failure' was presented as an actual incident without evidence; now labeled constructed in both languages. Failure mapping distinguishes definite rollback from ambiguous commit.
8. **Tracing and security**: W3C Trace Context propagation, request-vs-trace IDs, sensitive-log minimization, identity and resource authorization, state lifecycle and the self-check worked example were compared in both languages. No unsupported instrumentation guarantees introduced.

## EN/VI parity and complete lesson coverage
- Read and compared introduction, high-level flowchart, all nine numbered sections, deadline flowchart, transaction sequence diagram, response mapping table, scenario and its impact/cause/correction, 12+ operations checklist entries, self-check and answer, agent rule, references and linked curriculum.
- EN and VI now share the same hypothetical checkout scenario and numerical assumptions (none), the same NGINX and gateway caveats, the same idempotency/outbox boundaries and the same conceptual examples.
- Kept code fence and Mermaid diagram counts matched. Improved Vietnamese naturalness without deleting the technical depth.
- Updated both `lastVerified` values and both changelogs after primary-source review. Existing canonical concept and learning outcomes preserved.

## Primary-source references (checked 2026-11-05)
- [RFC 9110 — HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html): 401 challenge, 202 Accepted, 504 Gateway Timeout and general status semantics.
- [RFC 9457 — Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html): structured error representation.
- [W3C Trace Context](https://www.w3.org/TR/trace-context/): `traceparent` and `tracestate`.
- [NGINX HTTP proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout): `proxy_read_timeout` is between successive upstream reads, not an end-to-end timeout.
- [Go database cancellation](https://go.dev/doc/database/cancel-operations): cooperative propagated context cancellation.
- [AWS Prescriptive Guidance transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html): committed work record, at-least-once/duplicate message caveats and idempotent consumers.

## Verification
- Full source/parity/teaching review and content-level regression assertions: performed.
- Exact head PR CI required: `pnpm test`, `pnpm audit:content`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test:e2e` (Chromium).
- Exact merged-main CI required before #116/#119 complete-rubric checkbox.
- No live proxy/payment outage or two-phase distributed-failure simulation was executed; claims are scoped to documented behavior and a clearly hypothetical narrative. A green MDX build cannot prove runtime fault injection.
