import type { Metadata } from "next";
import { Bebas_Neue, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AZFLIX Azərbaycan — Azərbaycan Filmləri Kataloqu",
  description:
    "Azərbaycan kinematoqrafiyasının seçilmiş filmləri üçün qeyri-rəsmi tədris məqsədli kataloq. Netflix ilə heç bir əlaqəsi yoxdur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="az"
      data-theme="dark"
      className={`${inter.variable} ${jakarta.variable} ${bebas.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
