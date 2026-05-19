---
name: Email Triage Agent
description: Calm, Linear-inspired triage dashboard on warm paper with restrained ember accent
colors:
  ink: "#0f1115"
  ink-soft: "#2a2c33"
  paper: "#faf8f3"
  paper-deep: "#f1ece0"
  surface: "#ffffff"
  accent: "#e86a33"
  accent-soft: "#f4b48f"
  decide: "#b08a3e"
  decide-soft: "#e2cf9a"
  fyi: "#7f7d75"
  muted: "#6b6b6b"
  line: "#e5e1d6"
  line-strong: "#c9c3b3"
typography:
  display:
    fontFamily: "Instrument Serif, ui-serif, Georgia, serif"
    fontSize: "clamp(2.5rem, 1.4rem + 4.2vw, 5rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  hero:
    fontFamily: "Instrument Serif, ui-serif, Georgia, serif"
    fontSize: "clamp(1.875rem, 1.1rem + 2.5vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Instrument Serif, ui-serif, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.22em"
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1.25rem"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.25rem"
  xl: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
  button-ghost:
    backgroundColor: "rgba(255, 255, 255, 0.6)"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  card-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input-field:
    backgroundColor: "rgba(241, 236, 224, 0.4)"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px"
---

# Design System: Email Triage Agent

## Overview

**Creative North Star: "The Morning Brief"**

A founder opens the app the way they open a trusted daily brief: warm paper, clear hierarchy, no AI theater. The system feels editorial and precise — Instrument Serif for conviction, Inter for utility — with just enough atmosphere (soft radial glow, fine grain) to feel human, not clinical. Density follows Linear: information-forward cards, tight eyebrows, decisive bucket semantics. Motion is restrained: staggered rise-in for streaming results, soft pulse only while work is in flight.

This system explicitly rejects generic Gmail/Gemini summary blobs, playful startup illustration, dark terminal aesthetics, and SaaS dashboard clichés (purple gradients, metric-card grids, glassmorphism-as-decoration, colored side-stripe borders).

**Key Characteristics:**

- Warm neutral paper ground (`#faf8f3`) with ink text, not pure white/black
- Single ember accent (`#e86a33`) for primary actions and "Act today" bucket
- Secondary bucket hues (decide gold, fyi stone) used only as semantic signals
- Serif headlines + sans body; uppercase eyebrows at wide tracking
- Flat surfaces with hairline borders; depth via soft `card-edge` shadow, not heavy lift
- Bucket columns use a 3px top color bar (`currentColor`), not left stripe accents

## Colors

Warm editorial neutrals with a restrained ember accent and semantic bucket tones.

### Primary

- **Founder Ember** (`#e86a33`): Primary CTA ("Run triage"), Act today bucket, context eyebrows, focus rings, in-progress stage pills. The only high-chroma hue on most screens.

### Secondary

- **Decision Brass** (`#b08a3e`): "Decide this week" bucket identity, secondary warm signal. Paired with **Brass Mist** (`#e2cf9a`) for soft backgrounds if needed.

### Tertiary

- **Archive Stone** (`#7f7d75`): FYI bucket identity. Desaturated on purpose — skimmable, de-emphasized.

### Neutral

- **Ink** (`#0f1115`): Primary text, priority bar fill
- **Ink Soft** (`#2a2c33`): Secondary emphasis within cards
- **Warm Paper** (`#faf8f3`): Page background (body)
- **Paper Deep** (`#f1ece0`): Input fill tint, subtle panel depth
- **Surface White** (`#ffffff`): Cards, buckets, solid panels
- **Muted Gray** (`#6b6b6b`): Meta copy, sender lines, helper text
- **Hairline Sand** (`#e5e1d6`): Borders, dividers (`line`)
- **Sand Strong** (`#c9c3b3`): Stronger dividers when needed

### Named Rules

**The Ember Budget Rule.** Accent orange appears on primary actions, Act bucket chrome, and active processing states only. It should not flood backgrounds or decorative gradients.

**The Bucket Color Rule.** Each triage bucket has one semantic hue (accent / decide / fyi). Do not mix bucket colors on unrelated UI chrome.

## Typography

**Display Font:** Instrument Serif (with ui-serif, Georgia fallback)  
**Body Font:** Inter (with system-ui fallback)  
**Label Font:** Inter (uppercase eyebrows)

**Character:** Editorial confidence without magazine excess. Serif carries voice on headlines; sans keeps triage data scannable.

### Hierarchy

- **Display** (400, `clamp(2.5rem … 5rem)`, line-height 1.02): Page hero — "Your inbox, with a point of view."
- **Hero** (400, `clamp(1.875rem … 3rem)`, line-height 1.08): Section titles inside buckets
- **Title** (400, 1.5rem / text-2xl, tight leading): Card headers, sidebar section titles
- **Body** (400, 0.875rem, relaxed leading): Summaries, descriptions, list items. Cap line length ~65–75ch in prose blocks.
- **Label** (500, 11px, tracking 0.22em, uppercase): Eyebrows — "bucket 01 · now", "Context", "Inbox"

### Named Rules

**The Eyebrow Rule.** Section labels are always 11px uppercase with `tracking-eyebrow` (0.22em). They establish structure before the serif headline.

## Elevation

Flat-by-default with tonal layering. Depth comes from white/semi-opaque surfaces on warm paper, hairline borders, and a single soft shadow vocabulary — not stacked cards or glass blur stacks.

Ambient atmosphere is fixed behind content: dual radial washes (ember + brass at low opacity) plus a 3px grain overlay on `body::before` / `body::after`.

### Shadow Vocabulary

- **Card edge** (`0 1px 0 rgba(15,17,21,0.04), 0 14px 30px -22px rgba(15,17,21,0.25)`): Default cards, buckets, context panel
- **Card edge large** (`0 1px 0 rgba(15,17,21,0.05), 0 30px 60px -32px rgba(15,17,21,0.35)`): Hover state on triage cards
- **Ring** (`0 0 0 1px rgba(15,17,21,0.06)`): Subtle containment when needed

### Named Rules

**The Flat-By-Default Rule.** Surfaces sit flush with hairline borders. Shadows deepen only on hover or when elevating a card intentionally — never on every nested element.

**The No-Glass Rule.** `surface-quiet` may use light blur sparingly for empty states only. Do not treat glassmorphism as a default decorative layer.

## Components

### Buttons

- **Shape:** Fully rounded pills for primary (`rounded-full`); rounded-xl for secondary/expand bars (`12px`)
- **Primary:** Ember fill, white text, medium weight, horizontal padding 20px, subtle shadow-edge. Hover: `bg-accent/90`
- **Ghost / expand:** White/60% fill, hairline border, muted text; hover shifts to ink text and stronger border — used for "N items more" bucket expansion

### Chips

- **Stage pill:** 10px uppercase, accent text on `accent/10` background, pulsing dot while streaming
- **Intent labels:** Small muted caps inside card meta row

### Cards / Containers

- **Surface card:** White background, 1px `#e5e1d6` border, 20px (`1.25rem`) radius, `card-edge` shadow
- **Bucket column:** Semi-opaque white (`rgba(255,255,255,0.55)`), same border/radius, 3px top bar in bucket color via `::before`
- **Internal padding:** 20–24px (`p-5` / `p-6`)
- **Hover:** Triage cards transition to `shadow-edge-lg`

### Inputs / Fields

- **Textarea (context):** `paper-deep/40` fill, `line` border, `rounded-xl`, focus `ring-2 ring-accent/40`, no harsh outline
- **Placeholder:** Muted at 70% opacity

### Navigation

- Top nav via `Nav` component: minimal, sits above main content on paper ground. Keep nav quiet — no competing accent blocks.

### Triage Card (signature)

- Header: intent + priority bar (ink fill on line track) + stage pill when processing
- Body: subject (medium weight), sender meta (muted), summary when present
- Expandable draft section; accent tone follows bucket (act / decide / fyi)

## Do's and Don'ts

### Do:

- **Do** use Warm Paper + Ink as the default ground/text pairing
- **Do** reserve Founder Ember for primary actions and Act-today semantics
- **Do** use Instrument Serif for headlines and Inter for everything operational
- **Do** keep bucket semantics visible via top color bar and eyebrow labels
- **Do** respect `prefers-reduced-motion` — triage must remain usable with motion off
- **Do** maintain WCAG 2.1 AA contrast on text and focus states

### Don't:

- **Don't** produce generic Gmail/Gemini-style summary blobs without structure or priority signals
- **Don't** use playful startup illustration, mascots, or bubbly empty states
- **Don't** adopt dark hacker/terminal aesthetics (neon-on-black, faux-technical chrome)
- **Don't** use SaaS dashboard clichés: purple gradient heroes, identical icon+title card grids, glassmorphism cards, colored `border-left` accent stripes on list items
- **Don't** use gradient text (`background-clip: text`) or hero-metric templates (big number + gradient + stat row)
- **Don't** animate layout properties; use opacity/transform only with ease-out curves
- **Don't** nest cards inside cards
