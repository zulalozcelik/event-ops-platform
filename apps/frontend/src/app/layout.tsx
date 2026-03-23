import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'Event Ops Platform',
  description: 'Event registration platform for organizers and attendees',
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-text">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 md:px-6 md:py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
