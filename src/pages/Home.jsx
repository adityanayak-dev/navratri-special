import { memo, useEffect, useRef, useState } from 'react'
import { Bitmoji } from '../components/Bitmoji'
import { Icon } from '../components/Icon'
import { chapters, nights, quizQuestions } from '../content'
import { useScene, clamp } from '../hooks/useScroll'
import { LITE } from '../perf'

/* ─────────────  RANGOLI — one ring per night, built from the chat's nine chapters  ───────────── */
const C = 260
const GEOM = nights.map((_, i) => {
  const r = 38 + i * 24, n = 8 + i * 4
  return { r, pts: Array.from({ length: n }, (_, k) => { const a = (k / n) * Math.PI * 2 - Math.PI / 2; return { x: C + r * Math.cos(a), y: C + r * Math.sin(a), deg: (a * 180) / Math.PI + 90 } }) }
})
const Ring = memo(function Ring({ i, color, rings }) {
  const { r, pts } = GEOM[i]
  return <g className="rg" style={{ '--i': i }} ref={(el) => { if (rings) rings.current[i] = el }}>
    <g className="rg-spin" style={{ '--dir': i % 2 ? 'reverse' : 'normal' }}>
      <circle cx={C} cy={C} r={r} className="rg-guide" stroke={color} />
      {pts.map((p, k) => i % 2 === 0
        ? <circle key={k} cx={p.x} cy={p.y} r={4 + (i % 3)} fill={color} />
        : <ellipse key={k} cx={p.x} cy={p.y} rx="3.2" ry="9" fill={color} transform={`rotate(${p.deg.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})`} />)}
    </g>
  </g>
})
function Rangoli({ rings, className = '' }) {
  return <svg viewBox="0 0 520 520" className={`rangoli ${className}`} aria-hidden="true" focusable="false">
    {nights.map((n, i) => <Ring key={i} i={i} color={n.color} rings={rings} />)}
    <circle cx={C} cy={C} r="13" fill="#ffd36b" /><circle cx={C} cy={C} r="5" fill="#ff4d5e" />
  </svg>
}

/* ─────────────  HERO  ───────────── */
function Hero({ onNavigate, ready }) {
  return <section className={`h-hero ${ready ? 'is-ready' : ''}`}>
    <div className="h-hero-copy">
      <p className="h-kicker">નવરાત્રિ — nine nights, for Krishna</p>
      <h1><span>Krishna,</span><span>nav raat,</span><span className="h-outline">nav vaato.</span></h1>
      <p className="h-sub">A tiny website for one very specific Navratri. Scroll down: every night adds a ring to the rangoli and opens one chapter of our chat.</p>
      <div className="h-cta">
        <button className="primary-button" onClick={() => onNavigate('song', 1)}>Start the chat <Icon name="arrow" size={18} /></button>
        <button className="outline-button" onClick={() => onNavigate('quiz')}>Quiz first</button>
      </div>
    </div>
    <Rangoli className="is-bloom" />
    <span className="h-cue" aria-hidden="true"><Icon name="down" size={18} /></span>
  </section>
}

/* ─────────────  NINE NIGHTS — pinned; the rangoli grows while you scroll  ───────────── */
function Nights({ onNavigate }) {
  const rings = useRef([])
  const last = useRef(0)
  const [active, setActive] = useState(0)
  const ref = useScene((pin) => {
    const f = 0.4 + clamp(pin) * 8.6, a = Math.min(8, Math.floor(f))
    rings.current.forEach((el, i) => { if (!el) return; const p = clamp(f - i); el.style.opacity = (p * (i === a ? 1 : 0.5)).toFixed(3); el.style.transform = `scale(${(0.55 + 0.45 * p).toFixed(3)})` })
    if (a !== last.current) { last.current = a; setActive(a) }
  })
  const jump = (i) => { const el = ref.current; if (!el) return; const top = el.getBoundingClientRect().top + window.scrollY; window.scrollTo({ top: top + ((i + 0.1) / 8.6) * (el.offsetHeight - window.innerHeight) }) }
  const n = nights[active], ch = chapters[active]
  return <section className="h-nights" ref={ref} aria-label="The nine nights">
    <div className="h-nights-stage">
      <Rangoli rings={rings} className="is-scroll" />
      <div className="night-card" key={active} aria-live="polite">
        <p className="night-no">Raat {active + 1} of 9</p>
        <h2>{ch.title}</h2>
        <blockquote><p>{n.teaser}</p><cite>{n.who}</cite></blockquote>
        <button className="primary-button" onClick={() => onNavigate('song', active + 1)}>Read this night <Icon name="arrow" size={17} /></button>
      </div>
      <ol className="night-dots" aria-label="Jump to a night">
        {nights.map((x, i) => <li key={i}><button className={i === active ? 'is-on' : ''} style={{ '--c': x.color }} onClick={() => jump(i)} aria-label={`Night ${i + 1}: ${chapters[i].title}`} aria-current={i === active ? 'true' : undefined} /></li>)}
      </ol>
    </div>
  </section>
}

/* ─────────────  FACES — the Bitmojis change mood as the lines scroll past  ───────────── */
const FACES = [
  { me: 'love', kr: 'shy', who: 'Aditya', line: 'tare ankho bov ja mast che ❤️' },
  { me: 'curious', kr: 'pout', who: 'Krishna', line: 'naaaaaaaaa 😭' },
  { me: 'worried', kr: 'angry', who: 'Krishna', line: 'tane khabar nai padti 😠' },
  { me: 'shy', kr: 'love', who: 'Krishna', line: '😍😘' },
  { me: 'worried', kr: 'smug', who: 'Krishna', line: 'tension naa le, mara husband ne hu sambhali laish 😂' },
]
function Faces() {
  const [i, setI] = useState(0)
  const steps = useRef([])
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setI(Number(e.target.dataset.i)) }), { rootMargin: '-45% 0px -45% 0px' })
    steps.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])
  const f = FACES[i]
  return <section className="h-faces" aria-label="Every chat, a new face">
    <div className="h-faces-stage" aria-hidden="true">
      <Bitmoji person="me" mood={f.me} label shape="round" className="mood-bm" />
      <Bitmoji person="krishna" mood={f.kr} label shape="round" className="mood-bm" />
    </div>
    <div className="h-faces-steps">
      <h2>Har vaate, navo chehro.</h2>
      {FACES.map((x, k) => <p key={k} data-i={k} ref={(el) => { steps.current[k] = el }} className={`face-step ${k === i ? 'is-on' : ''}`}><span>{x.line}</span><cite>{x.who}</cite></p>)}
    </div>
  </section>
}

/* ─────────────  DOORS  ───────────── */
const DOORS = [
  { go: ['song', 1], t: 'The chat', d: 'Nine chapters with songs and every little expression.', c: nights[0].color },
  { go: ['quiz'], t: 'The quiz', d: `${quizQuestions.length} questions. Some have a box for your own answer.`, c: nights[6].color },
  { go: ['playlist'], t: 'Garba playlist', d: 'Pick a song and play it. Chal, ramiye.', c: nights[8].color },
]
function Doors({ onNavigate }) {
  return <section className="h-doors">
    <h2>Aaje raate kai kariye?</h2>
    <div className="h-door-list">
      {DOORS.map((d) => <button key={d.t} className="h-door" style={{ '--c': d.c }} onClick={() => onNavigate(...d.go)}><span><strong>{d.t}</strong><small>{d.d}</small></span><Icon name="arrow" size={22} /></button>)}
    </div>
  </section>
}

export default function Home({ onNavigate, ready }) {
  return <main className={`home-page ${LITE ? 'is-lite-home' : ''}`}>
    <Hero onNavigate={onNavigate} ready={ready} />
    <Nights onNavigate={onNavigate} />
    <Faces />
    <Doors onNavigate={onNavigate} />
  </main>
}
