import { useEffect, useRef } from 'react'
import { REDUCED } from '../perf'

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t

/* One shared, idle-aware scroll scheduler for ALL scenes.
   - geometry is measured once (and on resize), never per frame
   - nothing runs while the page is still; only scenes near the viewport update
   - callbacks write transforms/opacity directly (no document-wide CSS variables) */
const scenes = new Set()
let raf = 0, vh = typeof window !== 'undefined' ? window.innerHeight : 800

function measure(s) { const r = s.el.getBoundingClientRect(); s.top = r.top + window.scrollY; s.h = r.height }
function measureAll() { vh = window.innerHeight; scenes.forEach(measure); kick() }

function frame() {
  raf = 0
  const y = window.scrollY; let busy = false
  scenes.forEach((s) => {
    const near = y + vh > s.top - vh * 0.35 && y < s.top + s.h + vh * 0.35
    const tp = clamp((y + vh - s.top) / (vh + s.h)), tpin = clamp((y - s.top) / Math.max(1, s.h - vh))
    if (!near) { if (s.p !== tp || s.pin !== tpin) { s.p = tp; s.pin = tpin; s.cb(s.pin, s.p) } return }
    const k = REDUCED ? 1 : 0.16
    s.p = lerp(s.p, tp, k); s.pin = lerp(s.pin, tpin, k)
    if (Math.abs(tp - s.p) < 0.0008) s.p = tp
    if (Math.abs(tpin - s.pin) < 0.0008) s.pin = tpin
    s.cb(s.pin, s.p)
    if (s.p !== tp || s.pin !== tpin) busy = true
  })
  if (busy) raf = requestAnimationFrame(frame)
}
function kick() { if (!raf) raf = requestAnimationFrame(frame) }

let started = false
function boot() {
  if (started) return; started = true
  window.addEventListener('scroll', kick, { passive: true })
  window.addEventListener('resize', measureAll)
  window.addEventListener('load', measureAll)
  if ('ResizeObserver' in window) new ResizeObserver(() => { clearTimeout(boot.t); boot.t = setTimeout(measureAll, 120) }).observe(document.body)
}

/** useScene(cb): cb(pin, p) — pin 0→1 while a tall sticky section is pinned, p 0→1 as it crosses the viewport. */
export function useScene(onProgress) {
  const ref = useRef(null); const cb = useRef(onProgress); cb.current = onProgress
  useEffect(() => {
    const el = ref.current; if (!el) return undefined
    boot()
    const s = { el, top: 0, h: 0, p: 0, pin: 0, cb: (a, b) => cb.current && cb.current(a, b) }
    measure(s); scenes.add(s)
    const y = window.scrollY
    s.p = clamp((y + vh - s.top) / (vh + s.h)); s.pin = clamp((y - s.top) / Math.max(1, s.h - vh))
    s.cb(s.pin, s.p); kick()
    return () => scenes.delete(s)
  }, [])
  return ref
}

/** Adds `.is-visible` when [data-reveal] elements enter the viewport. */
export function useReveal() {
  useEffect(() => {
    const nodes = [...document.querySelectorAll('[data-reveal]')]
    if (!nodes.length) return undefined
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target) } }), { threshold: 0.12, rootMargin: '0px 0px -5% 0px' })
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
}

/** true while the element is on screen (used to stop off-screen loops) */
export function useInView(ref, margin = '120px') {
  const state = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return undefined
    const io = new IntersectionObserver(([e]) => { state.current = e.isIntersecting }, { rootMargin: margin })
    io.observe(el); return () => io.disconnect()
  }, [ref, margin])
  return state
}
