import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Email Triage — your inbox with a point of view",
  description:
    "Email triage for founders. Context-aware buckets — act today, decide this week, FYI — not another generic AI digest.",
  icons: {
    icon: "/triage_symbol.png",
    shortcut: "/triage_symbol.png",
    apple: "/triage_symbol.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
