import type { Metadata } from "next";
import { LandingNav } from "@/components/LandingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

export const metadata: Metadata = {
  title: "Email Triage — your inbox with a point of view",
  description:
    "Email triage for founders. Context-aware buckets — act today, decide this week, FYI — not another generic AI digest.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingNav />
      {children}
      <MarketingFooter />
    </>
  );
}
