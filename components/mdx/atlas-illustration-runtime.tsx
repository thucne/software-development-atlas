import Image from 'next/image';
import {
  AtlasIllustration as ProgrammaticAtlasIllustration,
  atlasIllustrationIds,
  type AtlasIllustrationId,
} from '@/components/mdx/atlas-illustration';
import {
  atlasInteractiveIllustrationMedia,
  type InteractivePhaseIllustrationMedia,
} from '@/components/mdx/atlas-interactive-illustrations';
import { AtlasPhaseWalkthrough } from '@/components/mdx/atlas-phase-walkthrough';
import {
  atlasStaticIllustrationMedia,
  type LocalizedIllustrationText,
  type StaticTeachingIllustrationMedia,
} from '@/components/mdx/atlas-static-illustrations';
import { withBasePath } from '@/lib/base-path';

type Locale = 'en' | 'vi';

type ProgrammaticIllustrationMedia = {
  kind: 'programmatic';
};

export type AtlasIllustrationMedia =
  | ProgrammaticIllustrationMedia
  | StaticTeachingIllustrationMedia
  | InteractivePhaseIllustrationMedia;

const programmaticIllustrationMedia = Object.fromEntries(
  atlasIllustrationIds.map((id) => [id, { kind: 'programmatic' }]),
) as Record<AtlasIllustrationId, AtlasIllustrationMedia>;

export const atlasIllustrationMedia = {
  ...programmaticIllustrationMedia,
  ...atlasStaticIllustrationMedia,
  ...atlasInteractiveIllustrationMedia,
} satisfies Record<AtlasIllustrationId, AtlasIllustrationMedia>;

function localized(text: LocalizedIllustrationText, locale: Locale) {
  return text[locale];
}

function StaticTeachingIllustration({
  id,
  definition,
  locale,
}: {
  id: AtlasIllustrationId;
  definition: StaticTeachingIllustrationMedia;
  locale: Locale;
}) {
  const title = localized(definition.title, locale);
  const caption = localized(definition.caption, locale);
  const labelId = `atlas-illustration-${id}`;
  // `next/image` does not apply `basePath` for unoptimized local SVGs.
  const unoptimized = definition.asset.endsWith('.svg');
  const src = unoptimized ? withBasePath(definition.asset) : definition.asset;

  return (
    <figure
      data-atlas-illustration={id}
      data-atlas-illustration-medium="static-image"
      aria-labelledby={labelId}
      className="my-7 min-w-0 overflow-hidden rounded-2xl border border-fd-border bg-gradient-to-br from-fd-card to-fd-muted/25 shadow-sm"
    >
      <div className="border-b border-fd-border px-4 py-3 sm:px-5">
        <div id={labelId} className="text-sm font-semibold text-fd-foreground">
          {title}
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <div className="overflow-hidden rounded-xl border border-fd-border bg-[#111827]">
          <Image
            src={src}
            alt={localized(definition.description, locale)}
            width={1600}
            height={900}
            sizes="(max-width: 768px) 100vw, 900px"
            unoptimized={unoptimized}
            className="block h-auto w-full object-contain"
          />
        </div>
      </div>
      <figcaption className="border-t border-fd-border bg-fd-muted/20 px-4 py-3 text-xs leading-relaxed text-fd-muted-foreground sm:px-5">
        {caption}
      </figcaption>
    </figure>
  );
}

export function AtlasIllustration({
  id,
  locale = 'en',
}: {
  id: AtlasIllustrationId;
  locale?: string;
}) {
  const resolvedLocale: Locale = locale === 'vi' ? 'vi' : 'en';
  const definition = atlasIllustrationMedia[id];

  if (definition.kind === 'interactive-phases') {
    return (
      <AtlasPhaseWalkthrough
        id={id}
        definition={definition}
        locale={resolvedLocale}
      />
    );
  }

  if (definition.kind === 'static-image') {
    return (
      <StaticTeachingIllustration
        id={id}
        definition={definition}
        locale={resolvedLocale}
      />
    );
  }

  return <ProgrammaticAtlasIllustration id={id} locale={resolvedLocale} />;
}
