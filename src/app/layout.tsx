import "./globals.css";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import Script from "next/script";
import { DialogProvider } from "@/context/dialogContext";
import { UserProvider } from "@/context/userContext";
import { RoutePrefetcher } from "@/components/routePrefetcher";
import AppShell from "@/components/appShell";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Letterex",
  description: "Exchange language corrections",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeInitScript = `
    (function() {
      try {
        var storedTheme = localStorage.getItem('theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var isDark = storedTheme ? storedTheme === 'dark' : prefersDark;
        document.documentElement.classList.toggle('dark', isDark);
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" className={`${lexend.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <UserProvider>
          <RoutePrefetcher />
          <DialogProvider>
            <AppShell>{children}</AppShell>
          </DialogProvider>
        </UserProvider>
      </body>
    </html>
  );
}
