# Phase 0.1 Documentation Shell — Runtime Corrections

**Status:** Normative implementation note discovered immediately before execution.

Current Fumadocs MDX uses generated server entry files under `.source/server` and the `collections/*` TypeScript alias. The preferred loader integration is `docs.toFumadocsSource()`.

Therefore Phase 0.1 uses:

```ts
import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});
```

and `tsconfig.json` maps:

```json
"collections/*": ["./.source/*"]
```

This replaces the older `@/.source` plus `createMDXSource()` example in the original plan.

The first CI run intentionally installs with `--no-frozen-lockfile` and uploads the generated `pnpm-lock.yaml` as an artifact because the execution sandbox cannot reach the npm registry. After the artifact is committed, CI must switch to `pnpm install --frozen-lockfile`.
