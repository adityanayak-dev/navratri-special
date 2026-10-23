// One shared <audio> element for the whole site (chat clips + playlist).
// Mobile browsers only let an element play after a tap, so the first tap "unlocks" it once
// and every later clip just swaps the src — that is what makes the chat auto-play reliably.
let el = null
export const getAudio = () => { if (!el) { el = new Audio(); el.preload = 'auto'; el.playsInline = true } return el }
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
export function unlockAudio() {
  const a = getAudio(); if (a.dataset.unlocked) return
  a.dataset.unlocked = '1'; a.src = SILENT
  const p = a.play(); if (p && p.then) p.then(() => { if (a.src === SILENT) a.pause() }).catch(() => {})
}
