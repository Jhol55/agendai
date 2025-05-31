import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import { SettingsProvider } from '@/contexts/settings';
import { ThemeProvider } from '@/contexts/theme/ThemeProvider';
import { Suspense } from 'react';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased min-h-screen font-nunito`} suppressHydrationWarning>
        <SettingsProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={
              <div className='h-screen w-full bg-black text-white'>1</div>
            }>
              <main>
                {children}
              </main>
            </Suspense>
          </ThemeProvider>
          <Toaster closeButton />
        </SettingsProvider>
      </body>
    </html>
  );
}
