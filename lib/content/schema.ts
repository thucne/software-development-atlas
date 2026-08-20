import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

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
});

export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;
