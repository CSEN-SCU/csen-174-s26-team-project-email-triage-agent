import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5645d4",
          pressed: "#4534b3",
          deep: "#3a2a99",
        },
        navy: {
          DEFAULT: "#0a1530",
          deep: "#070f24",
          mid: "#1a2a52",
        },
        link: {
          DEFAULT: "#0075de",
          pressed: "#005bab",
        },
        act: "#dd5b00",
        decide: "#2a9d99",
        fyi: "#a4a097",
        "brand-orange": "#dd5b00",
        "brand-teal": "#2a9d99",
        "brand-pink": "#ff64c8",
        "brand-purple": "#7b3ff2",
        "brand-green": "#1aae39",
        canvas: "#ffffff",
        surface: {
          DEFAULT: "#f6f5f4",
          soft: "#fafaf9",
        },
        hairline: {
          DEFAULT: "#e5e3df",
          soft: "#ede9e4",
          strong: "#c8c4be",
        },
        ink: {
          DEFAULT: "#1a1a1a",
          deep: "#000000",
        },
        charcoal: "#37352f",
        slate: "#5d5b54",
        steel: "#787671",
        stone: "#a4a097",
        muted: "#bbb8b1",
        "on-dark": "#ffffff",
        "on-dark-muted": "#a4a097",
        success: "#1aae39",
        warning: "#dd5b00",
        error: "#e03131",
        "tint-peach": "#ffe8d4",
        "tint-rose": "#fde0ec",
        "tint-mint": "#d9f3e1",
        "tint-lavender": "#e6e0f5",
        "tint-sky": "#dcecfa",
        "tint-yellow": "#fef7d6",
        "tint-yellow-bold": "#f9e79f",
        "tint-cream": "#f8f5e8",
        "tint-gray": "#f0eeec",
        /* Legacy aliases (migrate callers gradually) */
        accent: "#5645d4",
        paper: "#ffffff",
        "paper-deep": "#f6f5f4",
        line: "#e5e3df",
        "line-strong": "#c8c4be",
        "ink-soft": "#37352f",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "hero-display": [
          "clamp(2rem, 1.25rem + 2.5vw, 3.25rem)",
          { lineHeight: "1.12", letterSpacing: "-0.025em", fontWeight: "600" },
        ],
        "display-lg": [
          "clamp(1.75rem, 1.1rem + 2vw, 2.75rem)",
          { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        "heading-1": ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        "heading-2": [
          "clamp(1.5rem, 1rem + 1.5vw, 1.875rem)",
          { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        "heading-3": ["1.75rem", { lineHeight: "1.25", fontWeight: "600" }],
        "heading-4": ["1.375rem", { lineHeight: "1.3", fontWeight: "600" }],
      },
      letterSpacing: {
        eyebrow: "0.08em",
      },
      borderRadius: {
        notion: "8px",
        card: "12px",
      },
      boxShadow: {
        subtle: "rgba(15, 15, 15, 0.04) 0px 1px 2px 0px",
        card: "rgba(15, 15, 15, 0.08) 0px 4px 12px 0px",
        mockup: "rgba(15, 15, 15, 0.2) 0px 24px 48px -8px",
        edge: "rgba(15, 15, 15, 0.04) 0px 1px 2px 0px",
        "edge-lg": "rgba(15, 15, 15, 0.08) 0px 4px 12px 0px",
        ring: "0 0 0 1px rgba(26, 26, 26, 0.06)",
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "rise-in": "rise-in 480ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 320ms ease-out both",
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
