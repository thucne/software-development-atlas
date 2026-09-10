import { AtlasReleaseBanner } from '@/components/atlas/release-banner';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';

export default function DocsRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AtlasReleaseBanner locale="en" />
      <DocsLayout tree={source.getPageTree()} {...baseOptions('en')}>
        {children}
      </DocsLayout>
    </>
  );
}
