'use client';

import AtlasSearchDialog from '@/components/search-dialog';
import { i18nUI } from '@/lib/i18n';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export function Provider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '';
  const router = useRouter();

  const isVi = pathname.includes('/vi/docs') || pathname.endsWith('/vi');
  const currentLocale = isVi ? 'vi' : 'en';

  const providerProps = i18nUI.provider(currentLocale);

  const onLocaleChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    if (newLocale === 'vi') {
      if (pathname.includes('/docs/')) {
        router.push(pathname.replace('/docs/', '/vi/docs/'));
      } else if (pathname.endsWith('/docs')) {
        router.push(pathname.replace(/\/docs$/, '/vi/docs'));
      } else {
        router.push('/vi/docs');
      }
    } else {
      if (pathname.includes('/vi/docs/')) {
        router.push(pathname.replace('/vi/docs/', '/docs/'));
      } else if (pathname.endsWith('/vi/docs')) {
        router.push(pathname.replace(/\/vi\/docs$/, '/docs'));
      } else {
        router.push('/docs');
      }
    }
  };

  return (
    <RootProvider
      search={{ SearchDialog: AtlasSearchDialog }}
      i18n={{
        ...providerProps,
        onLocaleChange,
      }}
    >
      {children}
    </RootProvider>
  );
}
