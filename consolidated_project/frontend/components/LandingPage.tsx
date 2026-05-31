"use client";

import { HeroRotatingText } from "@/components/HeroRotatingText";
import { LandingCtas } from "@/components/landing/LandingCtas";
import { LandingProductPreview } from "@/components/LandingProductPreview";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const HERO_ROTATION_OPTIONS = [
  "point of view.",
  "founder context.",
  "clear lens.",
  "decision filter.",
] as const;

const BUCKETS = [
  {
    eyebrow: "01 · now",
    title: "Act today",
    body: "Time-critical threads. Reply or decide before the day slips.",
  },
  {
    eyebrow: "02 · this week",
    title: "Decide this week",
    body: "Important, not urgent. Block time instead of letting it linger.",
  },
  {
    eyebrow: "03 · fyi",
    title: "FYI",
    body: "Context you might skim. Collapsed by default so noise stays quiet.",
  },
] as const;

const BENTO_CARDS = [
  {
    eyebrow: "Context first",
    title: "Every priority decision starts with your current reality.",
    body: "Company stage, pipeline, investors, customers, and goals become the lens for triage.",
    className: "md:col-span-2 lg:col-span-3",
  },
  {
    eyebrow: "No summary wall",
    title: "A digest that makes decisions.",
    body: "The output is a small set of buckets, not another paragraph to parse.",
    className: "lg:col-span-2",
  },
  {
    eyebrow: "Quiet by default",
    title: "FYI stays out of the way.",
    body: "Low-signal messages stay collapsed so attention goes to work that needs you.",
    className: "lg:col-span-2",
  },
] as const;

const SIGNALS = [
  "Investor follow-up",
  "Pilot redline",
  "Customer outage",
  "Vendor receipt",
] as const;

export function LandingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/app");
    }
  }, [status, router]);

  async function connectGmail() {
    setBusy(true);
    await signIn("google", { callbackUrl: "/app" });
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <main className="max-w-3xl mx-auto px-6 py-32 text-center">
        <p className="text-sm text-steel" role="status" aria-live="polite">
          Loading…
        </p>
      </main>
    );
  }

  return (
    <main id="main-content" className="bg-canvas">
      <section aria-labelledby="landing-hero-heading" className="overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-16 md:pb-24 md:pt-24">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="bento-card bento-rise lg:col-span-5 lg:row-span-2 p-7 md:p-9">
              <p className="eyebrow text-steel">Morning brief for founders</p>
              <h1
                id="landing-hero-heading"
                className="mt-4 text-hero-display text-ink tracking-tight"
              >
                Your inbox, with a{" "}
                <span className="text-ink">
                  <HeroRotatingText phrases={HERO_ROTATION_OPTIONS} />
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-[17px] leading-[1.65] text-slate">
                Email Triage turns a noisy inbox into a focused daily brief:
                what needs action, what needs a decision, and what can wait.
              </p>
              <LandingCtas busy={busy} onConnect={connectGmail} className="mt-8" />
              <p className="mt-5 max-w-md text-sm leading-relaxed text-steel">
                Read-only Gmail access. Demo mode includes a seeded founder inbox.
              </p>
            </div>

            <div className="bento-card bento-rise bento-rise-delay-1 lg:col-span-7 p-3 md:p-4">
              <LandingProductPreview />
            </div>

            <div className="bento-card bento-rise bento-rise-delay-2 lg:col-span-3 p-6">
              <p className="eyebrow text-steel">Signal</p>
              <div className="mt-6 space-y-3">
                {SIGNALS.map((signal, index) => (
                  <div
                    key={signal}
                    className="flex items-center gap-3 rounded-notion border border-hairline bg-canvas px-3 py-2.5"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-surface text-[11px] font-medium text-charcoal">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-ink">{signal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bento-card bento-rise bento-rise-delay-3 lg:col-span-4 p-6">
              <p className="eyebrow text-steel">Outcome</p>
              <p className="mt-4 text-heading-3 text-ink">A smaller morning list.</p>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                The agent filters for decisions, replies, and useful context so the
                day starts with a clear queue.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="bento-story-heading" className="border-t border-hairline">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="eyebrow text-steel">How it works</p>
            <h2 id="bento-story-heading" className="mt-3 text-heading-2 text-ink">
              Built for triage, not browsing.
            </h2>
            <p className="mt-4 text-[17px] leading-[1.65] text-slate">
              The agent reads each message against your current priorities, then
              sorts the inbox into what needs action, what needs a decision, and
              what can safely wait.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {BENTO_CARDS.map((card, index) => (
              <article
                key={card.title}
                className={`bento-card bento-rise p-6 md:p-7 ${card.className}`}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <p className="eyebrow text-steel">{card.eyebrow}</p>
                <h3 className="mt-4 text-heading-4 text-ink">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate">{card.body}</p>
              </article>
            ))}

            <article className="bento-card bento-rise md:col-span-2 lg:col-span-4 p-6 md:p-7">
              <div className="grid gap-4 md:grid-cols-3">
                {BUCKETS.map((bucket) => (
                  <div
                    key={bucket.title}
                    className="rounded-card border border-hairline bg-canvas p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <p className="eyebrow text-steel">{bucket.eyebrow}</p>
                    <h3 className="mt-2 text-base font-semibold text-ink">
                      {bucket.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate">
                      {bucket.body}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section aria-labelledby="landing-cta-heading" className="border-t border-hairline">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="bento-card bento-cta p-7 md:p-10">
            <div className="max-w-2xl">
              <p className="eyebrow text-steel">Get started</p>
              <h2 id="landing-cta-heading" className="mt-3 text-heading-2 text-ink">
                Start with clarity, not clutter.
              </h2>
              <p className="mt-4 text-[17px] leading-[1.65] text-slate">
                Connect your inbox or try the seeded demo. Same triage flow, no
                credit card.
              </p>
              <LandingCtas busy={busy} onConnect={connectGmail} className="mt-8" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
