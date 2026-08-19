import './globals.css';
import AtlasSearchDialog from '@/components/search-dialog';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'Software Development Atlas',
    template: '%s | Software Development Atlas',
  },
  description:
    'A living, open-source knowledge system for software engineering.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider search={{ SearchDialog: AtlasSearchDialog }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
