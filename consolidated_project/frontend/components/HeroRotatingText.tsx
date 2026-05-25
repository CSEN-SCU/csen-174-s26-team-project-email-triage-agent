"use client";

import { useEffect, useMemo, useState } from "react";

const EXIT_MS = 240;
const ENTER_MS = 560;
const HOLD_MS = 3300;

export function HeroRotatingText({
  phrases,
}: {
  phrases: readonly string[];
}) {
  if (phrases.length === 0) return null;

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "exiting" | "entering">("idle");

  const widestPhrase = useMemo(
    () =>
      phrases.reduce(
        (widest, phrase) => (phrase.length > widest.length ? phrase : widest),
        phrases[0],
      ),
    [phrases],
  );

  useEffect(() => {
    if (phrases.length <= 1) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    let exitTimer: number | undefined;
    let enterTimer: number | undefined;

    const interval = window.setInterval(() => {
      setPhase("exiting");

      exitTimer = window.setTimeout(() => {
        setIndex((current) => (current + 1) % phrases.length);
        setPhase("entering");

        enterTimer = window.setTimeout(() => {
          setPhase("idle");
        }, ENTER_MS);
      }, EXIT_MS);
    }, HOLD_MS);

    return () => {
      window.clearInterval(interval);
      if (exitTimer) window.clearTimeout(exitTimer);
      if (enterTimer) window.clearTimeout(enterTimer);
    };
  }, [phrases]);

  return (
    <>
      <span className="sr-only">{phrases[0]}</span>
      <span
        aria-hidden="true"
        className={`hero-rotator is-${phase}`}
      >
        <span className="hero-rotator-measure">{widestPhrase}</span>
        <span className="hero-rotator-live">{phrases[index]}</span>
      </span>
    </>
  );
}
