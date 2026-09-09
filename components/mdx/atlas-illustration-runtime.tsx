import Image from 'next/image';
import {
  AtlasIllustration as ProgrammaticAtlasIllustration,
  atlasIllustrationIds,
  type AtlasIllustrationId,
} from '@/components/mdx/atlas-illustration';

type Locale = 'en' | 'vi';

export type LocalizedIllustrationText = {
  en: string;
  vi: string;
};

type ProgrammaticIllustrationMedia = {
  kind: 'programmatic';
};

export type StaticTeachingIllustrationMedia = {
  kind: 'static-image';
  title: LocalizedIllustrationText;
  caption: LocalizedIllustrationText;
  description: LocalizedIllustrationText;
  asset: `/illustrations/${string}.webp`;
};

export type AtlasIllustrationMedia =
  | ProgrammaticIllustrationMedia
  | StaticTeachingIllustrationMedia;

export const illustrationText = (
  en: string,
  vi: string,
): LocalizedIllustrationText => ({ en, vi });

export const atlasIllustrationMedia = Object.fromEntries(
  atlasIllustrationIds.map((id) => [id, { kind: 'programmatic' }]),
) as Record<AtlasIllustrationId, AtlasIllustrationMedia>;

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

  return (
    <figure
      data-atlas-illustration={id}
      data-atlas-illustration-medium="static-image"
      aria-labelledby={labelId}
      className="my-7 overflow-hidden rounded-2xl border border-fd-border bg-gradient-to-br from-fd-card to-fd-muted/25 shadow-sm"
    >
      <div className="border-b border-fd-border px-4 py-3 sm:px-5">
        <div id={labelId} className="text-sm font-semibold text-fd-foreground">
          {title}
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <div className="overflow-hidden rounded-xl border border-fd-border bg-[#111827]">
          <Image
            src={definition.asset}
            alt={localized(definition.description, locale)}
            width={1600}
            height={900}
            sizes="(max-width: 768px) 100vw, 900px"
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

  if (definition.kind === 'programmatic') {
    return <ProgrammaticAtlasIllustration id={id} locale={resolvedLocale} />;
  }

  return (
    <StaticTeachingIllustration
      id={id}
      definition={definition}
      locale={resolvedLocale}
    />
  );
}
