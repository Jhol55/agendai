"use client";

import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import { SettingsProvider } from '@/contexts/settings';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import { ThemeProvider } from '@/contexts/theme/ThemeProvider';

export default function RootLayout({
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
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange          
          >
            <main>
              {children}
            </main>
          </ThemeProvider>
          <Toaster closeButton />
        </SettingsProvider>
      </body>
    </html>
  );
}
