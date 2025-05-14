"use client";

import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import { SettingsProvider } from '@/contexts/settings';
import { ThemeProvider } from '@/contexts/theme/ThemeProvider';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    const calculatedZoom = Math.round(100 / window.devicePixelRatio) / 100;
    const clampedZoom = Math.max(calculatedZoom + 0.1, 0.9);
    setZoom(0.9);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased min-h-screen font-nunito`}
        suppressHydrationWarning
        // style={{ height: `calc(100vh / ${zoom})` }}
      >
        <SettingsProvider zoom={zoom}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
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
