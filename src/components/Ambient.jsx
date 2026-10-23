import { useEffect, useRef } from 'react'
import { engine } from '../audio/engine'
import { LITE, REDUCED } from '../perf'

// Fixed canvas: falling marigold petals + gold sparks (scroll-speed + beat linked),
// sparkle trail on pointer move / tap. Petals are pre-rendered sprites (cheap drawImage),
// frame rate is capped on phones, and the loop sleeps when `paused`.
const COLORS = ['#f5a623', '#ef8a2d', '#ffc94d', '#e8587a', '#f6b8c4', '#ff7a45']
function makeSprite(color) {
  const c = document.createElement('canvas'); c.width = c.height = 40; const g = c.getContext('2d'); g.translate(20, 20)
  g.fillStyle = color; g.beginPath(); g.moveTo(0, -17); g.bezierCurveTo(15, -9, 12, 12, 0, 17); g.bezierCurveTo(-12, 12, -15, -9, 0, -17); g.fill()
  g.globalAlpha = .5; g.fillStyle = '#fff3c4'; g.beginPath(); g.ellipse(0, -3, 2.4, 9, 0, 0, 6.28); g.fill(); return c
}
function makeGlow(color) {
  const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d')
  const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, color); gr.addColorStop(.35, color); gr.addColorStop(1, 'rgba(255,200,100,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return c
}

// Phones: no canvas at all — a few CSS-animated petals (compositor only) + tiny tap sparkles.
function LiteAmbient({ paused }) {
  useEffect(() => {
    if (paused || REDUCED) return undefined
    const layer = document.createElement('div'); layer.className = 'lite-sparks'; document.body.appendChild(layer)
    const onDown = (e) => {
      for (let i = 0; i < 6; i++) { const d = document.createElement('i'); const a = (i / 6) * 6.28 + Math.random(); d.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--dx:${Math.cos(a) * (28 + Math.random() * 26)}px;--dy:${Math.sin(a) * (28 + Math.random() * 26)}px`; layer.appendChild(d); setTimeout(() => d.remove(), 750) }
    }
    window.addEventListener('pointerdown', onDown, { passive: true })
    return () => { window.removeEventListener('pointerdown', onDown); layer.remove() }
  }, [paused])
  if (paused || REDUCED) return null
  return <div className="lite-petals" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <i key={i} style={{ left: `${(i * 17 + 8) % 92}%`, animationDuration: `${15 + (i % 4) * 3}s`, animationDelay: `${-i * 2.3}s`, '--sw': `${(i % 2 ? 1 : -1) * (18 + i * 5)}px`, '--c': COLORS[i % COLORS.length] }} />)}</div>
}

export default function Ambient({ paused = false }) {
  return LITE ? <LiteAmbient paused={paused} /> : <CanvasAmbient paused={paused} />
}

function CanvasAmbient({ paused = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current; if (paused) { cv.style.display = 'none'; return undefined }
    cv.style.display = ''
    const ctx = cv.getContext('2d', { alpha: true })
    const sprites = COLORS.map(makeSprite), glows = [makeGlow('#ffd36b'), makeGlow('#ff9ec0')]
    let W = 0, H = 0, dpr = 1, raf = 0, last = performance.now(), running = true, lastY = window.scrollY, vel = 0
    let target = REDUCED ? 0 : LITE ? 9 : 30
    const minDt = LITE ? 1000 / 40 : 0
    const petals = [], sparks = []
    const mk = (init) => ({ x: Math.random() * W, y: init ? Math.random() * H : -24, s: .45 + Math.random() * .5, vy: 18 + Math.random() * 26, vx: -10 + Math.random() * 20, rot: Math.random() * 6.28, vr: -1.2 + Math.random() * 2.4, sw: Math.random() * 6.28, sa: 14 + Math.random() * 24, c: (Math.random() * COLORS.length) | 0, a: .4 + Math.random() * .4, depth: .5 + Math.random() * .8 })
    const resize = () => { dpr = Math.min(window.devicePixelRatio || 1, LITE ? 1.5 : 2); W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    resize(); for (let i = 0; i < target; i++) petals.push(mk(true))
    const maxSparks = LITE ? 24 : 70
    const spark = (x, y, n = 6, power = 1) => { for (let i = 0; i < n && sparks.length < maxSparks; i++) { const a = Math.random() * 6.28, sp = (30 + Math.random() * 90) * power; sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30, life: 0, max: .6 + Math.random() * .6, s: 6 + Math.random() * 8, g: Math.random() < .7 ? 0 : 1 }) } }
    let lastMove = 0
    const onMove = (e) => { const t = performance.now(); if (REDUCED || t - lastMove < 60 || e.pointerType === 'touch') return; lastMove = t; spark(e.clientX, e.clientY, 2, .5) }
    const onDown = (e) => { if (!REDUCED) spark(e.clientX, e.clientY, LITE ? 7 : 12, 1.2) }
    const offBeat = engine.onBeat(() => { if (REDUCED || !running || LITE) return; spark(Math.random() * W, H * (.25 + Math.random() * .5), 3, .6) })
    const onVis = () => { running = !document.hidden; if (running) { last = performance.now(); raf = requestAnimationFrame(frame) } }
    function frame(now) {
      if (!running) return
      raf = requestAnimationFrame(frame)
      if (now - last < minDt) return
      const dt = Math.min(.05, (now - last) / 1000); last = now
      const y = window.scrollY; vel += (Math.max(-1, Math.min(1, (y - lastY) / 60)) - vel) * .15; lastY = y
      ctx.clearRect(0, 0, W, H)
      const boost = 1 + Math.abs(vel) * 3
      for (const p of petals) {
        p.sw += dt * 1.4; p.y += (p.vy * boost * p.depth) * dt - vel * 40 * dt; p.x += (p.vx + Math.sin(p.sw) * p.sa) * dt * .6; p.rot += p.vr * dt
        if (p.y > H + 24 || p.y < -60) Object.assign(p, mk(false), { y: vel < -0.2 ? H + 20 : -20 })
        if (p.x < -30) p.x = W + 20; else if (p.x > W + 30) p.x = -20
        ctx.globalAlpha = p.a; const cs = Math.cos(p.rot) * p.s * dpr, sn = Math.sin(p.rot) * p.s * dpr; ctx.setTransform(cs, sn, -sn, cs, p.x * dpr, p.y * dpr)
        ctx.drawImage(sprites[p.c], -20, -20)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      while (petals.length < target) petals.push(mk(false))
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.life += dt; if (s.life > s.max) { sparks.splice(i, 1); continue }
        s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 120 * dt; const k = 1 - s.life / s.max, r = s.s * (.4 + k)
        ctx.globalAlpha = k; ctx.drawImage(glows[s.g], s.x - r, s.y - r, r * 2, r * 2)
      }
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize); window.addEventListener('pointermove', onMove, { passive: true }); window.addEventListener('pointerdown', onDown, { passive: true }); document.addEventListener('visibilitychange', onVis)
    return () => { running = false; cancelAnimationFrame(raf); offBeat(); window.removeEventListener('resize', resize); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerdown', onDown); document.removeEventListener('visibilitychange', onVis) }
  }, [paused])
  return <canvas ref={ref} className="ambient-canvas" aria-hidden="true" />
}
