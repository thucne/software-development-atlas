import atlasMapData from '@/content/atlas-map.json';
import { z } from 'zod';

const kebabCaseId = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Expected lowercase kebab-case');

export const learningDepthSchema = z.enum(['recognize', 'reason', 'operate']);

const atlasConceptSchema = z.object({
  id: kebabCaseId,
  title: z.string().min(1),
  targetDepth: learningDepthSchema,
});

const atlasDomainSchema = z.object({
  id: kebabCaseId,
  title: z.string().min(1),
  question: z.string().min(1),
  concepts: z.array(atlasConceptSchema).min(1),
});

export const atlasMapSchema = z
  .object({
    version: z.literal(1),
    domains: z.array(atlasDomainSchema).min(1),
  })
  .superRefine((map, context) => {
    const domainIds = new Set<string>();
    const conceptIds = new Set<string>();

    for (const [domainIndex, domain] of map.domains.entries()) {
      if (domainIds.has(domain.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate Atlas domain id: ${domain.id}`,
          path: ['domains', domainIndex, 'id'],
        });
      }
      domainIds.add(domain.id);

      for (const [conceptIndex, concept] of domain.concepts.entries()) {
        if (conceptIds.has(concept.id)) {
          context.addIssue({
            code: 'custom',
            message: `Duplicate Atlas concept id: ${concept.id}`,
            path: ['domains', domainIndex, 'concepts', conceptIndex, 'id'],
          });
        }
        conceptIds.add(concept.id);
      }
    }
  });

export const atlasMap = atlasMapSchema.parse(atlasMapData);

export const atlasConceptIds = new Set(
  atlasMap.domains.flatMap((domain) =>
    domain.concepts.map((concept) => concept.id),
  ),
);

export type AtlasMap = z.infer<typeof atlasMapSchema>;
export type AtlasConceptId = AtlasMap['domains'][number]['concepts'][number]['id'];
