import { AtlasReleaseBanner } from '@/components/atlas/release-banner';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';

export default function ViDocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AtlasReleaseBanner locale="vi" />
      <DocsLayout tree={source.getPageTree('vi')} {...baseOptions('vi')}>
        {children}
      </DocsLayout>
    </>
  );
}
