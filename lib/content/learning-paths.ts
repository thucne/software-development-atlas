import learningPathData from '@/content/learning-paths.json';
import { atlasConceptIds, learningDepthSchema } from '@/lib/content/atlas-map';
import { z } from 'zod';

const kebabCaseId = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Expected lowercase kebab-case');

const learningPathSchema = z
  .object({
    id: kebabCaseId,
    title: z.string().min(1),
    description: z.string().min(1),
    audience: z.string().min(1),
    targetDepth: learningDepthSchema,
    outcomes: z.array(z.string().min(1)).min(1),
    concepts: z.array(z.string().min(1)).min(2),
  })
  .strict()
  .superRefine((path, context) => {
    const seen = new Set<string>();

    for (const [index, conceptId] of path.concepts.entries()) {
      if (seen.has(conceptId)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate Atlas concept id: ${conceptId}`,
          path: ['concepts', index],
        });
      }
      seen.add(conceptId);

      if (!atlasConceptIds.has(conceptId)) {
        context.addIssue({
          code: 'custom',
          message: `Unknown Atlas concept id: ${conceptId}`,
          path: ['concepts', index],
        });
      }
    }
  });

export const learningPathsSchema = z
  .object({
    version: z.literal(1),
    paths: z.array(learningPathSchema).min(1),
  })
  .strict()
  .superRefine((data, context) => {
    const seen = new Set<string>();

    for (const [index, path] of data.paths.entries()) {
      if (seen.has(path.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate learning path id: ${path.id}`,
          path: ['paths', index, 'id'],
        });
      }
      seen.add(path.id);
    }
  });

export const learningPaths = learningPathsSchema.parse(learningPathData);

export type LearningPathDefinition = (typeof learningPaths.paths)[number];

const learningPathById = new Map(
  learningPaths.paths.map((path) => [path.id, path] as const),
);

export function getLearningPath(id: string): LearningPathDefinition {
  const path = learningPathById.get(id);

  if (!path) {
    throw new Error(`Unknown learning path: ${id}`);
  }

  return path;
}
