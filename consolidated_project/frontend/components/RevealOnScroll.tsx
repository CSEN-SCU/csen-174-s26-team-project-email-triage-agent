"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";

function isInViewport(el: Element, threshold = 0.08) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
  if (visibleHeight <= 0) return false;
  return visibleHeight / rect.height >= threshold;
}

function useRevealOnce(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    let done = false;
    let observer: IntersectionObserver | null = null;
    const markVisible = () => {
      if (done) return;
      done = true;
      setVisible(true);
      observer?.disconnect();
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) markVisible();
      },
      { threshold: 0.05, rootMargin: "0px 0px 5% 0px" },
    );

    observer.observe(el);

    // IntersectionObserver can miss above-the-fold / sticky layouts on first paint
    const checkNow = () => {
      if (isInViewport(el, threshold)) markVisible();
    };
    checkNow();
    requestAnimationFrame(checkNow);
    const t = window.setTimeout(checkNow, 100);
    // Never leave copy invisible if IO + sticky layout miss the trigger
    const fallback = window.setTimeout(markVisible, 2000);

    return () => {
      observer?.disconnect();
      window.clearTimeout(t);
      window.clearTimeout(fallback);
    };
  }, [threshold]);

  return { ref, visible };
}

export function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  const { ref, visible } = useRevealOnce();

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ ...style, transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}

export function RevealGroup({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, visible } = useRevealOnce(0.08);

  return (
    <div
      ref={ref}
      className={`reveal-group ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function RevealItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`reveal-item ${className}`}>{children}</div>;
}
