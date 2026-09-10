import type { AtlasIllustrationId } from '@/components/mdx/atlas-illustration';

export type LocalizedIllustrationText = {
  en: string;
  vi: string;
};

export type StaticTeachingIllustrationMedia = {
  kind: 'static-image';
  title: LocalizedIllustrationText;
  caption: LocalizedIllustrationText;
  description: LocalizedIllustrationText;
  asset:
    | `/illustrations/${string}.webp`
    | `/illustrations/${string}.svg`;
};

/**
 * Optional static teaching assets keyed by semantic illustration ID.
 *
 * First-generation Atlas illustrations render programmatically so bilingual
 * labels stay in HTML. Add entries here only when a production-quality
 * language-neutral WebP/SVG teaching asset clearly beats a diagram for
 * spatial/operational intuition.
 */
export const atlasStaticIllustrationMedia = {
} satisfies Partial<Record<AtlasIllustrationId, StaticTeachingIllustrationMedia>>;
