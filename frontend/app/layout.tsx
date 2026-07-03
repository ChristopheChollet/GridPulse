import Script from "next/script";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GridPulse — Mix électrique & intensité carbone",
  description:
    "Tableau de bord data sur le mix électrique français et l'intensité carbone — ingestion RTE + Electricity Maps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
    >
      <head>
        <Script
          id="gridpulse-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='gridpulse-theme',t=localStorage.getItem(k)||'light',r=document.documentElement;r.classList.remove('light','dark');if(t==='light'||t==='dark')r.classList.add(t);else r.classList.add('light');}catch(e){document.documentElement.classList.add('light');}})();`,
          }}
        />
      </head>
      <body className="app-canvas flex min-h-screen flex-col antialiased">
        <ThemeProvider>
          <SiteHeader />
          <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
