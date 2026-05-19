"use client";

import { LandingCtas } from "@/components/landing/LandingCtas";
import { LandingProductPreview } from "@/components/LandingProductPreview";
import {
  RevealGroup,
  RevealItem,
  RevealOnScroll,
} from "@/components/RevealOnScroll";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

const BUCKETS = [
  {
    eyebrow: "01 · now",
    title: "Act today",
    body: "Time-critical threads — reply or decide before the day slips.",
    accent: "border-l-accent bg-accent/5",
  },
  {
    eyebrow: "02 · this week",
    title: "Decide this week",
    body: "Important, not urgent. Block time instead of letting it linger.",
    accent: "border-l-decide bg-decide/5",
  },
  {
    eyebrow: "03 · fyi",
    title: "FYI",
    body: "Context you might skim. Collapsed by default so noise stays quiet.",
    accent: "border-l-fyi bg-fyi/5",
  },
] as const;

function StackSection({
  children,
  className = "",
  zIndex,
  id,
  label,
}: {
  children: ReactNode;
  className?: string;
  zIndex: number;
  id: string;
  label: string;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className={`stack-section ${className}`}
      style={{ zIndex }}
    >
      <div className="w-full max-w-6xl mx-auto px-6 py-16 md:py-20">{children}</div>
    </section>
  );
}

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
      <main className="max-w-6xl mx-auto px-6 py-32 text-center">
        <p className="text-sm text-muted" role="status" aria-live="polite">
          Loading…
        </p>
      </main>
    );
  }

  return (
    <main id="main-content">
      <section
        aria-labelledby="landing-hero-heading"
        className="relative min-h-[calc(100dvh-3.5rem)] max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-20 md:pb-24 flex flex-col justify-center"
      >
        <div
          aria-hidden
          className="absolute -top-8 left-0 right-0 h-[320px] bg-atmosphere blur-2xl opacity-90 pointer-events-none"
        />
        <div className="relative grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
          <div>
            <p className="eyebrow text-accent">Morning brief for founders</p>
            <h1
              id="landing-hero-heading"
              className="font-serif text-display mt-2 text-ink"
            >
              Your inbox,
              <br />
              <em className="text-accent">with a point of view.</em>
            </h1>
            <p className="text-base text-muted mt-4 max-w-xl leading-relaxed">
              Not another summary wall. Email Triage reads your deals and goals,
              then streams every message into three buckets so you know what
              actually needs you today.
            </p>
            <div className="hairline mt-6 max-w-sm" />
            <LandingCtas
              busy={busy}
              onConnect={connectGmail}
              className="mt-8"
            />
            <p className="mt-4 text-xs text-muted max-w-md leading-relaxed">
              Gmail access is read-only for now — we pull messages to triage, not
              send on your behalf. Compose and send scopes come later.
            </p>
          </div>

          <div className="mt-8 lg:mt-0">
            <LandingProductPreview />
          </div>
        </div>
      </section>

      <div className="landing-stack">
        <StackSection
          id="landing-problem"
          label="The problem"
          className="bg-paper-deep"
          zIndex={10}
        >
          <RevealGroup>
            <RevealItem>
              <p className="eyebrow text-muted">The problem</p>
            </RevealItem>
            <RevealItem>
              <h2 className="font-serif text-hero mt-2 max-w-2xl text-ink leading-tight">
                Generic AI treats every email like the last one.
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="text-base text-muted mt-4 max-w-xl leading-relaxed">
                Founders don&apos;t need another digest. You need priority that
                respects your pipeline, your runway conversations, and what you
                already decided to ignore.
              </p>
            </RevealItem>
          </RevealGroup>
        </StackSection>

        <StackSection
          id="landing-how"
          label="How it works"
          className="bg-paper"
          zIndex={20}
        >
          <RevealGroup>
            <RevealItem>
              <p className="eyebrow text-accent">How it works</p>
            </RevealItem>
            <RevealItem>
              <h2 className="font-serif text-hero mt-2 text-ink">
                Three buckets. One clear morning.
              </h2>
            </RevealItem>
            <RevealItem>
              <ul className="mt-10 grid gap-4 md:grid-cols-3">
                {BUCKETS.map((b) => (
                  <li
                    key={b.title}
                    className={`surface card-edge border-l-4 pl-5 py-5 transition-shadow duration-150 hover:shadow-edge ${b.accent}`}
                  >
                    <p className="eyebrow text-muted">{b.eyebrow}</p>
                    <h3 className="font-serif text-xl mt-1 text-ink">{b.title}</h3>
                    <p className="text-sm text-muted mt-2 leading-relaxed">
                      {b.body}
                    </p>
                  </li>
                ))}
              </ul>
            </RevealItem>
          </RevealGroup>
        </StackSection>

        <StackSection
          id="landing-context"
          label="Your context"
          className="bg-paper-deep"
          zIndex={30}
        >
          <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
            <RevealGroup>
              <RevealItem>
                <p className="eyebrow text-accent">Your context</p>
              </RevealItem>
              <RevealItem>
                <h2 className="font-serif text-hero mt-2 text-ink">
                  It adapts to you — not a template.
                </h2>
              </RevealItem>
              <RevealItem>
                <p className="text-base text-muted mt-4 leading-relaxed">
                  Set who you are, what you&apos;re building, and what matters this
                  quarter. The agent scores every thread against that lens before it
                  lands in a bucket.
                </p>
              </RevealItem>
            </RevealGroup>
            <RevealOnScroll delay={80}>
              <div className="surface card-edge p-6 font-mono text-xs text-ink-soft leading-relaxed">
                <p className="eyebrow text-muted mb-3">Example context</p>
                <p>Building: B2B workflow tool, seed stage</p>
                <p className="mt-2">Focus: enterprise pilots + Q2 pipeline</p>
                <p className="mt-2 text-muted">
                  → Investor updates → Decide this week
                </p>
                <p className="text-muted">→ Customer outage → Act today</p>
              </div>
            </RevealOnScroll>
          </div>
        </StackSection>

        <StackSection
          id="landing-cta"
          label="Get started"
          className="bg-ink text-paper border-t-0 shadow-[0_-28px_56px_-20px_rgba(15,17,21,0.35)]"
          zIndex={40}
        >
          <RevealGroup className="text-center max-w-lg mx-auto">
            <RevealItem>
              <h2 className="font-serif text-hero text-paper">
                Start with clarity, not clutter.
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="text-paper/70 mt-3 text-sm leading-relaxed">
                Connect your inbox or try the seeded demo — same triage flow, no
                credit card.
              </p>
            </RevealItem>
            <RevealItem>
              <div className="mt-8 flex justify-center">
                <LandingCtas
                  busy={busy}
                  onConnect={connectGmail}
                  variant="dark"
                />
              </div>
            </RevealItem>
            <RevealItem>
              <p className="mt-4 text-xs text-paper/50">
                Read-only Gmail · demo uses a seeded founder inbox
              </p>
            </RevealItem>
          </RevealGroup>
        </StackSection>
      </div>
    </main>
  );
}
