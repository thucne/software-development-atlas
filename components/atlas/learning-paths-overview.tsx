import Link from 'next/link';

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
  locale = 'en',
}: {
  paths: readonly LearningPathOverviewItem[];
  locale?: string;
}) {
  const isVi = locale === 'vi';

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {paths.map((path) => (
        <article key={path.id} className="rounded-lg border p-4">
          <h3 className="mt-0 text-lg font-semibold">
            <Link
              href={
                isVi
                  ? `/vi/docs/learning-paths/${path.id}`
                  : `/docs/learning-paths/${path.id}`
              }
            >
              {path.title}
            </Link>
          </h3>
          <p>{path.description}</p>
          <p className="text-sm text-fd-muted-foreground">{path.audience}</p>
          <p className="mb-1 text-sm text-fd-muted-foreground">
            {isVi
              ? `${path.covered} / ${path.total} khái niệm hiện đã có bài học`
              : `${path.covered} / ${path.total} concepts currently covered`}
          </p>
          <progress
            aria-label={
              isVi
                ? `Độ bao phủ ${path.title}`
                : `${path.title} coverage`
            }
            className="h-2 w-full"
            value={path.covered}
            max={path.total}
          />
        </article>
      ))}
    </div>
  );
}
