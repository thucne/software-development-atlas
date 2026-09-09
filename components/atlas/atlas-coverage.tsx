import type { DomainCoverage } from '@/lib/content/coverage';

export function AtlasCoverageView({
  domains,
}: {
  domains: readonly DomainCoverage[];
}) {
  return (
    <div className="space-y-6">
      {domains.map((domain) => {
        const headingId = `coverage-${domain.id}`;

        return (
          <section
            key={domain.id}
            aria-labelledby={headingId}
            className="rounded-lg border p-4"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h3 id={headingId} className="m-0 text-lg font-semibold">
                {domain.title}
              </h3>
              <p className="m-0 text-sm text-fd-muted-foreground">
                {domain.covered} / {domain.total} concepts covered
              </p>
            </div>

            <progress
              aria-label={`${domain.title} coverage`}
              className="mt-3 h-2 w-full"
              value={domain.covered}
              max={domain.total}
            />

            <ul className="mt-4 grid gap-2 p-0 sm:grid-cols-2">
              {domain.concepts.map((concept) => (
                <li
                  key={concept.id}
                  className="flex items-start justify-between gap-3 rounded-md bg-fd-muted/50 px-3 py-2 text-sm"
                >
                  <span>{concept.title}</span>
                  <span className="shrink-0 text-fd-muted-foreground">
                    {concept.covered ? 'Covered' : 'Uncovered'}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
