import { engine } from './engine'
import { LITE, REDUCED } from '../perf'

// Tiny shared loop (≈30fps, only while music plays, never on phones) that lets a few
// elements "breathe" with the music via opacity/transform — no CSS variables, no shadows.
const subs = new Set(); let raf = 0, last = 0
function loop(now) {
  raf = 0
  if (!engine.getState().playing || document.hidden) { subs.forEach((f) => f(0)); return }
  if (now - last > 33) { last = now; const v = engine.level(); subs.forEach((f) => f(v)) }
  raf = requestAnimationFrame(loop)
}
engine.subscribe(() => { if (engine.getState().playing && subs.size && !raf && !LITE && !REDUCED) raf = requestAnimationFrame(loop) })
export function onPulse(fn) { if (LITE || REDUCED) return () => {}; subs.add(fn); if (engine.getState().playing && !raf) raf = requestAnimationFrame(loop); return () => subs.delete(fn) }
