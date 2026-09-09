import { AtlasCoverageView } from '@/components/atlas/atlas-coverage';
import { getContentPlacements } from '@/components/atlas/content-placements';
import { LearningPathView } from '@/components/atlas/learning-path';
import { LearningPathsOverviewView } from '@/components/atlas/learning-paths-overview';
import { atlasMap } from '@/lib/content/atlas-map';
import {
  buildDomainCoverage,
  buildPathCoverage,
} from '@/lib/content/coverage';
import {
  getLearningPath,
  learningPaths,
} from '@/lib/content/learning-paths';

export function AtlasCoverage({ locale = 'en' }: { locale?: string } = {}) {
  const placements = getContentPlacements(locale);
  const domains = buildDomainCoverage(atlasMap, placements);

  return <AtlasCoverageView domains={domains} locale={locale} />;
}

export function LearningPathsOverview({
  locale = 'en',
}: { locale?: string } = {}) {
  const placements = getContentPlacements(locale);
  const paths = learningPaths.paths.map((path) => {
    const coverage = buildPathCoverage(path, placements);

    return {
      id: path.id,
      title: path.title,
      description: path.description,
      audience: path.audience,
      covered: coverage.covered,
      total: coverage.total,
    };
  });

  return <LearningPathsOverviewView paths={paths} locale={locale} />;
}

export function LearningPath({
  pathId,
  locale = 'en',
}: {
  pathId: string;
  locale?: string;
}) {
  const path = getLearningPath(pathId);
  const placements = getContentPlacements(locale);
  const coverage = buildPathCoverage(path, placements);

  return <LearningPathView path={path} coverage={coverage} locale={locale} />;
}
