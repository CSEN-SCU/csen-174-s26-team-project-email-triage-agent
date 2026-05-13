import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f1115",
        "ink-soft": "#2a2c33",
        paper: "#faf8f3",
        "paper-deep": "#f1ece0",
        surface: "#ffffff",
        accent: "#e86a33",
        "accent-soft": "#f4b48f",
        decide: "#b08a3e",
        "decide-soft": "#e2cf9a",
        fyi: "#7f7d75",
        muted: "#6b6b6b",
        line: "#e5e1d6",
        "line-strong": "#c9c3b3",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        display: [
          "clamp(2.5rem, 1.4rem + 4.2vw, 5rem)",
          { lineHeight: "1.02", letterSpacing: "-0.02em" },
        ],
        hero: [
          "clamp(1.875rem, 1.1rem + 2.5vw, 3rem)",
          { lineHeight: "1.08", letterSpacing: "-0.015em" },
        ],
      },
      letterSpacing: {
        eyebrow: "0.22em",
      },
      boxShadow: {
        edge: "0 1px 0 rgba(15,17,21,0.04), 0 14px 30px -22px rgba(15,17,21,0.25)",
        "edge-lg": "0 1px 0 rgba(15,17,21,0.05), 0 30px 60px -32px rgba(15,17,21,0.35)",
        ring: "0 0 0 1px rgba(15,17,21,0.06)",
      },
      backgroundImage: {
        atmosphere:
          "radial-gradient(1100px 600px at 85% -10%, rgba(232,106,51,0.10), transparent 60%), radial-gradient(900px 500px at -10% 110%, rgba(176,138,62,0.08), transparent 55%)",
        grain: "radial-gradient(rgba(15,17,21,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        grain: "3px 3px",
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
