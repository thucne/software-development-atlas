# Deployment

Software Development Atlas is designed to deploy as a normal Next.js/Fumadocs application without a database or required environment variables.

## Initial target

Vercel is the initial hosting target because it supports Next.js directly. Phase 0.1 requires no project-owned model API key, database connection, object-storage credential, or paid search credential.

## Canonical data

Lesson content remains Git-tracked Markdown/MDX. A hosting migration must not require moving canonical lessons into a database.

## Search

Search indexes are generated from the documentation source and consumed locally by the browser. Search infrastructure may be revisited only after measured corpus size or user experience demonstrates a real limitation.

## Assets

Keep normal documentation images and lightweight assets in the repository initially. Object storage is introduced only when asset volume becomes a measured repository/deployment problem.

## Portability

Hosting, search indexing, large-asset storage, and future mutable user data are independent concerns. Replacing one of them must not require rewriting the lesson authoring model.
