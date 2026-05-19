import type { Metadata } from "next";
import { LandingNav } from "@/components/LandingNav";

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
    </>
  );
}
