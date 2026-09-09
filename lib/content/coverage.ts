import { atlasMap, type AtlasMap } from '@/lib/content/atlas-map';
import type { LearningPathDefinition } from '@/lib/content/learning-paths';

export type ContentPlacement = {
  title: string;
  url: string;
  concepts: readonly string[];
};

export type ConceptCoverage = {
  id: string;
  title: string;
  targetDepth: 'recognize' | 'reason' | 'operate';
  covered: boolean;
  content: ContentPlacement[];
};

export type DomainCoverage = {
  id: string;
  title: string;
  covered: number;
  total: number;
  concepts: ConceptCoverage[];
};

export type PathCoverage = {
  id: string;
  title: string;
  covered: number;
  total: number;
  steps: ConceptCoverage[];
};

export function buildConceptContentIndex(
  placements: readonly ContentPlacement[],
): Map<string, ContentPlacement[]> {
  const index = new Map<string, ContentPlacement[]>();

  for (const placement of placements) {
    for (const conceptId of placement.concepts) {
      const existing = index.get(conceptId);

      if (existing) {
        existing.push(placement);
      } else {
        index.set(conceptId, [placement]);
      }
    }
  }

  return index;
}

function toConceptCoverage(
  concept: AtlasMap['domains'][number]['concepts'][number],
  index: Map<string, ContentPlacement[]>,
): ConceptCoverage {
  const content = index.get(concept.id) ?? [];

  return {
    id: concept.id,
    title: concept.title,
    targetDepth: concept.targetDepth,
    covered: content.length > 0,
    content,
  };
}

export function buildDomainCoverage(
  map: AtlasMap,
  placements: readonly ContentPlacement[],
): DomainCoverage[] {
  const index = buildConceptContentIndex(placements);

  return map.domains.map((domain) => {
    const concepts = domain.concepts.map((concept) =>
      toConceptCoverage(concept, index),
    );

    return {
      id: domain.id,
      title: domain.title,
      covered: concepts.filter((concept) => concept.covered).length,
      total: concepts.length,
      concepts,
    };
  });
}

const conceptById = new Map(
  atlasMap.domains.flatMap((domain) =>
    domain.concepts.map((concept) => [concept.id, concept] as const),
  ),
);

export function buildPathCoverage(
  path: LearningPathDefinition,
  placements: readonly ContentPlacement[],
): PathCoverage {
  const index = buildConceptContentIndex(placements);
  const steps = path.concepts.map((conceptId) => {
    const concept = conceptById.get(conceptId);

    if (!concept) {
      throw new Error(`Unknown Atlas concept in learning path: ${conceptId}`);
    }

    return toConceptCoverage(concept, index);
  });

  return {
    id: path.id,
    title: path.title,
    covered: steps.filter((step) => step.covered).length,
    total: steps.length,
    steps,
  };
}
