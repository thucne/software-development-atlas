import type { PathCoverage } from '@/lib/content/coverage';
import type { LearningPathDefinition } from '@/lib/content/learning-paths';
import Link from 'next/link';

export type LearningPathSummary = Pick<
  LearningPathDefinition,
  'title' | 'description' | 'audience' | 'targetDepth' | 'outcomes'
>;

export function LearningPathView({
  path,
  coverage,
}: {
  path: LearningPathSummary;
  coverage: PathCoverage;
}) {
  return (
    <section aria-label={`${path.title} learning path`} className="space-y-6">
      <div className="rounded-lg border p-4">
        <h2 className="mt-0 text-xl font-semibold">{path.title}</h2>
        <p>{path.description}</p>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="font-medium">Audience</dt>
            <dd className="m-0 text-fd-muted-foreground">{path.audience}</dd>
          </div>
          <div>
            <dt className="font-medium">Target depth</dt>
            <dd className="m-0 text-fd-muted-foreground">
              {path.targetDepth}
            </dd>
          </div>
        </dl>
        <p className="mb-1 mt-4 text-sm text-fd-muted-foreground">
          {coverage.covered} / {coverage.total} concepts currently covered
        </p>
        <progress
          aria-label={`${path.title} coverage`}
          className="h-2 w-full"
          value={coverage.covered}
          max={coverage.total}
        />
      </div>

      <div>
        <h3>Outcomes</h3>
        <ul>
          {path.outcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Path</h3>
        <ol className="space-y-3 pl-6">
          {coverage.steps.map((step) => (
            <li key={step.id} className="pl-1">
              <article className="rounded-lg border p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h4 className="m-0 text-base font-semibold">{step.title}</h4>
                  <span className="text-sm text-fd-muted-foreground">
                    Target depth: {step.targetDepth}
                  </span>
                </div>

                {step.content.length > 0 ? (
                  <div className="mt-3">
                    <p className="m-0 text-sm font-medium">
                      Available Atlas content
                    </p>
                    <ul className="mb-0 mt-1 pl-5">
                      {step.content.map((content) => (
                        <li key={content.url}>
                          <Link href={content.url}>{content.title}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mb-0 mt-3 text-sm text-fd-muted-foreground">
                    No Atlas content yet
                  </p>
                )}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
