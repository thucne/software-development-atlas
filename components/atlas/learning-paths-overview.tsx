export type LearningPathOverviewItem = {
  id: string;
  title: string;
  description: string;
  audience: string;
  covered: number;
  total: number;
};

export function LearningPathsOverviewView({
  paths,
}: {
  paths: readonly LearningPathOverviewItem[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {paths.map((path) => (
        <article key={path.id} className="rounded-lg border p-4">
          <h3 className="mt-0 text-lg font-semibold">
            <a href={`/docs/learning-paths/${path.id}`}>{path.title}</a>
          </h3>
          <p>{path.description}</p>
          <p className="text-sm text-fd-muted-foreground">{path.audience}</p>
          <p className="mb-1 text-sm text-fd-muted-foreground">
            {path.covered} / {path.total} concepts currently covered
          </p>
          <progress
            aria-label={`${path.title} coverage`}
            className="h-2 w-full"
            value={path.covered}
            max={path.total}
          />
        </article>
      ))}
    </div>
  );
}
