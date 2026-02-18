import "./globals.css";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { DialogProvider } from "@/context/dialogContext";

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
  return (
    <html lang="en" className={`${lexend.variable}`}>
      <body suppressHydrationWarning>
        <DialogProvider>{children}</DialogProvider>
      </body>
    </html>
  );
}
