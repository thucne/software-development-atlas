# Phase 0.1 Documentation Shell — Runtime Corrections

**Status:** Normative implementation note discovered immediately before and during execution.

## Fumadocs MDX Macro API

Current Fumadocs MDX supports the Macro API, which defines the content collection directly in application code and avoids generated `.source` collection imports. Phase 0.1 therefore uses `defineDocs()` from `fumadocs-mdx/macro` in `lib/source.ts` while keeping `source.config.ts` only for global MDX plugin configuration.

This removes the need for a `collections/*` TypeScript alias and a `postinstall` code-generation command while preserving build-time schema validation and processed Markdown output.

## Client provider boundary

The custom static-search dialog is passed into `RootProvider` through a dedicated `components/provider.tsx` Client Component. This follows the current Fumadocs Next.js example and avoids passing a component reference through a Server Component boundary.

## Lockfile bootstrap

The execution sandbox cannot reach the npm registry, so it cannot generate `pnpm-lock.yaml` locally. The branch workflow temporarily installs with `--no-frozen-lockfile`; once a lockfile can be generated in a networked runner, it must be committed and CI switched to `pnpm install --frozen-lockfile`.
