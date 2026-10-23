# Navratri for Krishna — implementation plan

## Product shape
A single-page React experience with lightweight URL-synced screens (`/`, `/choices`, `/song`, `/quiz`) rather than a backend. The first pass keeps conversation and quiz content in clearly labeled arrays in `src/main.jsx` so Krishna's real content can be swapped in without touching the interaction logic.

## Design direction
- **Design movement:** Romantic editorial festival poster meets soft glassmorphism — intimate, celebratory, and tactile rather than a generic centered landing page.
- **Core principles:** (1) warmth before spectacle, (2) playful discovery, (3) graceful motion, (4) personal details over decoration.
- **Color philosophy:** Deep jam/plum creates a dusk-like Navratri stage; marigold and vermilion carry the festival energy; rose, blush, and cream soften the palette for a romantic, feminine feel. The ownable brand color is **Krishna Berry** (`#8d3f6d`), a rich berry-pink that bridges devotion, warmth, and modern romance.
- **Layout paradigm:** A layered vertical story with offset cards, oversized numerals, and an asymmetrical “festival poster” hero; content feels discovered in scenes instead of sitting in a rigid grid.
- **Signature elements:** haldi-dot constellations, hand-drawn mandala rings, and small “sticker” labels with rounded corners.
- **Interaction philosophy:** Every click should feel like revealing a little more of the relationship. Controls use tactile press states, progress cues, and gentle celebration rather than noisy gamification.
- **Animation:** slow float and shimmer for ambient decoration; spring-like card entrances; 160–220ms micro-interactions; message reveal uses blur-to-focus and a soft slide; quiz feedback uses a contained shake or pulse, never a full-screen flash.
- **Typography system:** `DM Serif Display` for romantic display copy, `Manrope` for UI and body. Italic serif accents are used sparingly for handwritten-feeling moments.
- **Brand essence:** A tiny digital Navratri night made just for Krishna — warm, flirty, festive. Personality: **tender, playful, glowing**.
- **Brand voice:** intimate and lightly teasing. Example lines: “A little festival of us.” / “Open the next little secret.”
- **Wordmark & logo:** a small berry circle containing a four-petal diya/flower mark next to a stacked “for Krishna / NAVRATRI” lockup.
- **Signature brand color:** Krishna Berry `#8d3f6d`.

## Project structure
- `index.html` — document shell and font imports.
- `src/main.jsx` — screen routing, editable content arrays, interaction state, and UI components.
- `src/styles.css` — design tokens, responsive layout, motion, decorative festival shapes, and state feedback.
- `public/manus-routes.json` — route manifest for the four experience screens.
- `app.config.ts` — project logo metadata.
- `TODO.md` — source-of-truth acceptance clauses for the requested first version.

## Runtime
A Vite React app serves on `0.0.0.0:3000`. No server or database is needed for this first version. The site is designed mobile-first, with touch-friendly controls and reduced-motion fallbacks.
