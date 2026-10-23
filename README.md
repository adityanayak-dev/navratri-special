# Navratri for Krishna 🪔

React + Vite.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build → dist/
```

## ✏️ Everything personal lives in `src/content.js`

| What | Where |
|---|---|
| The 11 chat chapters (messages + expressions) | `chapters = [...]` |
| Songs (file names) | `songs = {...}` — put the mp3s in `public/audio/` (see the README.txt there) |
| Song clip times | the 5th argument of `S(...)`, e.g. `[t(1, 50), t(2, 38)]` = 1:50 → 2:38 |
| Photos / videos in the chat | `P('krishna', 'photo', mood, react, { src: '/media/pic.jpg' })` (put files in `public/media/`) |
| Quiz (12 questions, text boxes) | `quizQuestions` |
| "Nine nights" cards on the home page | `nineNights` |

A message: `K('text', 'mood', 'react')` = Krishna, `A(...)` = Aditya.
`mood` = how the **sender** feels, `react` = how the **other person** feels.
Moods: `happy laugh love shy pout angry jealous annoyed suspicious curious sad cry worried surprised smug neutral`.

## The ending: "chal mare jode Garba ramva"
After the quiz result, **continue** opens `/invite`:
- **Haa chal 💃** → short "Garba start thay che…" moment, then the PlayGarba project opens (`/garba/index.html`).
- **Naa papa nai mane 😤** → shows *"ok tane am bhi nai gamto atle excuse kare che"*, then returns to the home page after ~5 s.
All the wording, delays and the garba link are in `inviteConfig` in `src/content.js`.

### PlayGarba (`public/garba/`)
An **unmodified** copy of [PlayGarba](https://github.com/ruddvz/garba) (AGPL-3.0 code, CC BY-SA data), assembled with the same steps as its own GitHub Pages workflow. It is served from the `/garba/` sub-folder and its service worker is scoped to that folder only, so it cannot affect the rest of the site. Keep `LICENSE`, `NOTICE` and `TRADEMARKS.md` in that folder. Static hosts (Netlify, Vercel, GitHub Pages…) serve `/garba/` automatically; the Vite dev/preview servers are handled by a small rule in `vite.config.js`.

## How it works
- **Chat chapters** – `/song?c=1` … `/song?c=11`. Each chapter is its own chat page; at the end a *next chapter* button opens the next one (the last one leads to the quiz).
- **Mini music player** – every song message is a player card (play/pause, progress, clip range). During auto-play the chat starts the song itself and waits until the clip ends.
- **Bitmoji expressions** – `src/components/Bitmoji.jsx` + `moods.js` draw brows, eyelids (with blinking), mouths, blush, tears and effects on top of your two cut-out Bitmojis. To add a mood, add one entry to `MOODS`.
- **Quiz** – radio cards, checkbox cards and real text boxes; her typed answers are collected on the result page with *send / copy / WhatsApp* buttons.
- **Performance** – phones get "lite mode" (`src/perf.js`): CSS-only petals, no canvas, fewer particles/animations, off-screen Bitmojis freeze, one idle-aware scroll scheduler (`src/hooks/useScroll.js`).

## Latest round
- Home page is new ("Nav raat"): a rangoli gains one ring per night while you scroll; each night = one chat chapter.
- Chat = the 9 real sections; songs play from `public/audio` (shared audio element, works on phones).
- After chapter 9 a popup asks for help with a song name -> screenshot (`public/media/song-help.jpg`) -> her text box. Her answer is added to the quiz "send my answers" text. Wording: `songHelp` in `src/content.js`.
- "Haa chal" opens `/playlist` (Garba playlist). The old PlayGarba catalogue is still at `/garba/index.html` (button on the playlist page).
- `public/_redirects` gives single-page fallback on Netlify.

## Quiz database (server)
- `npm run build` then `npm start` serves `dist/` plus the API. Needs two server-side environment variables (never commit them): `DATABASE_URL` (Postgres) and `ADMIN_PASSWORD` (for `/admin/quiz`, HTTP Basic auth, any username; admin is disabled if unset).
- The `quiz_answers` table is created on start (`db/schema.sql`): question_number, answer, anonymous attempt_id, created_at. One row per attempt + question, saved when each question is submitted.
- Local dev: `npm run dev:server` (with the env vars) and `npm run dev` (Vite proxies `/api`).
- Questions 13-17 are the five new written-answer questions in `src/content.js`.
- The song-name answer (after chapter 9) is saved as question_number 100 and shown as "Song name" in /admin/quiz; it shares the anonymous attempt id of the quiz that follows.
