import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { Nav } from "@/components/Nav";
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
  title: "Sales Triage — an email agent that knows your pipeline",
  description:
    "Built for B2B sellers. Adapts to your deals, accounts, and quota instead of summarizing every email the same way.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased min-h-screen">
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
