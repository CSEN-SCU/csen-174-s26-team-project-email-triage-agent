import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Triage — Email Agent for Founders",
  description: "Adapts to your fundraise, customers, and deadlines.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
