import './globals.css';
import { Provider } from '@/components/provider';
import { rootMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = rootMetadata;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
