import type { Metadata } from 'next';
import { DM_Sans, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import SessionProvider from '@/components/session-provider';
import StoreHydrator from '@/components/store-hydrator';
import ChatWidget from '@/components/chat/chat-widget';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500'],
});

const cormorant = Cormorant_Garamond({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Glamour — Feel Radiant, Look Stunning',
  description:
    'Clean, effective beauty essentials crafted for every complexion. Feel radiant, look stunning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('h-full', 'antialiased', dmSans.variable, cormorant.variable)}>
      <body className="min-h-full" suppressHydrationWarning>
        <SessionProvider>
          <StoreHydrator />
          {children}
          <ChatWidget />
        </SessionProvider>
      </body>
    </html>
  );
}
