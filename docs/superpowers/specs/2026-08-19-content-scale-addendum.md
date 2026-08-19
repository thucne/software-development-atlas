# Content Scale Architecture Addendum

**Date:** 2026-08-19  
**Status:** Approved

This addendum extends the Software Development Atlas foundation design with an explicit content-scale constraint.

## Content-scale independence

Canonical lessons remain Git-tracked Markdown/MDX. Growth in lesson count must not, by itself, cause canonical lesson content to move into a runtime database.

Page generation, search indexing, large-asset storage, and hosting are separate infrastructure concerns and must remain independently replaceable as the corpus grows.

The expected scaling path is:

1. **Initial corpus:** Git/MDX + Next.js/Fumadocs + build-time/client-side search + normal repository assets.
2. **Larger corpus:** optimize or shard compilation/search outputs without changing the authoring model.
3. **Large binary assets:** introduce object storage only when repository-hosted assets become a measured problem.
4. **Runtime user state:** introduce a database only for features that inherently need mutable runtime data, such as accounts, bookmarks, progress, quiz history, or comments.

## Consequences

- The documentation shell must not query a database to render ordinary lessons.
- Search starts from canonical content and uses a zero-cost local/static approach.
- Generated search/metadata/agent artifacts are disposable outputs and are not canonical source data.
- Large-asset storage is optional and must not be required for the initial public application.
- Hosting must remain portable enough that a future hosting migration does not require rewriting lesson content.
- Any future database or object-storage proposal must be justified by a measured product need and must preserve the project's zero-cost core guarantee.
