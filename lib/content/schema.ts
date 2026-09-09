import { atlasConceptIds, learningDepthSchema } from '@/lib/content/atlas-map';
import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const contentTypeSchema = z.enum([
  'guide',
  'concept',
  'deep-dive',
  'decision-guide',
  'field-guide',
  'architecture-walkthrough',
]);

const conceptsSchema = z
  .array(z.string().min(1))
  .superRefine((concepts, context) => {
    const seen = new Set<string>();

    for (const conceptId of concepts) {
      if (seen.has(conceptId)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate Atlas concept id: ${conceptId}`,
        });
      }

      seen.add(conceptId);

      if (!atlasConceptIds.has(conceptId)) {
        context.addIssue({
          code: 'custom',
          message: `Unknown Atlas concept id: ${conceptId}`,
        });
      }
    }
  });

export const lessonFrontmatterSchema = pageSchema.extend({
  description: z.string().min(1),
  category: z.string().min(1),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['evergreen', 'evolving', 'frontier']),
  lastVerified: isoDate,
  reviewAfterDays: z.number().int().positive(),
  topics: z.array(z.string().min(1)),
  prerequisites: z.array(z.string().min(1)),
  related: z.array(z.string().min(1)),
  technologies: z.array(z.string().min(1)),
  contentType: contentTypeSchema,
  learningDepth: learningDepthSchema,
  concepts: conceptsSchema,
});

export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;
