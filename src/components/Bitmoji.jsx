import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { MOODS, PEOPLE, moodOf } from './moods'
import { LITE } from '../perf'

// pause animations of Bitmojis that are off-screen (big win on phones)
const visIO = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((es) => es.forEach((e) => { e.target.dataset.vis = e.isIntersecting ? '1' : '0' }), { rootMargin: '60px' }) : null

/* Shared SVG defs (blur filter + eyelid gradients). Render once near the app root. */
export function BitmojiDefs() {
  return <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="bm-g-blush"><stop offset="0" stopColor="#ff4f7d" stopOpacity=".95" /><stop offset=".45" stopColor="#ff4f7d" stopOpacity=".55" /><stop offset="1" stopColor="#ff4f7d" stopOpacity="0" /></radialGradient>
      <radialGradient id="bm-g-puff"><stop offset="0" stopColor="#fff4d8" stopOpacity=".9" /><stop offset=".6" stopColor="#fff4d8" stopOpacity=".5" /><stop offset="1" stopColor="#fff4d8" stopOpacity="0" /></radialGradient>
      {Object.entries(PEOPLE).flatMap(([key, p]) => [['pm', p.skinMouth], ['pb', p.skinBrow]].map(([k, c]) => (
        <radialGradient key={`${k}${key}`} id={`bm-${k}-${key}`}><stop offset="0" stopColor={c} /><stop offset=".74" stopColor={c} /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient>
      )))}
      {Object.entries(PEOPLE).map(([key, p]) => (
        <mask key={`m${key}`} id={`bm-sil-${key}`} maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="520"><image href={p.src} width="520" height="520" /></mask>
      ))}
      {Object.entries(PEOPLE).map(([key, p]) => (
        <linearGradient key={key} id={`bm-lid-${key}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.skinLid} /><stop offset=".86" stopColor={p.skinLid} /><stop offset=".95" stopColor="#4a3029" /><stop offset="1" stopColor={p.skinLid} stopOpacity="0" />
        </linearGradient>
      ))}
    </defs>
  </svg>
}

const heartPath = 'M0 9 C-14 -2 -12 -14 -5 -14 C-2 -14 0 -11 0 -9 C0 -11 2 -14 5 -14 C12 -14 14 -2 0 9Z'

function Brow({ p, b, side, cfg }) {
  const c = cfg.brow || {}
  const s = side === 'l' ? (c.l || c) : (c.r || c)
  const tilt = (s.tilt ?? c.tilt ?? 0) * (side === 'l' ? 1 : -1)
  const dy = s.dy ?? c.dy ?? 0
  const w = b.w * 0.5
  const t = p.browW * (c.thick || 1)
  return <g transform={`translate(${b.x} ${b.y + dy}) rotate(${b.rot + tilt})`} className="bm-brow">
    <path d={`M${-w} 3 Q0 ${-5} ${w} 3`} fill="none" stroke={p.brow} strokeWidth={t} strokeLinecap="round" />
  </g>
}

function Mouth({ p, shape }) {
  const m = p.mouth, hw = m.w * 0.46
  const base = { fill: 'none', stroke: p.lip, strokeWidth: 5.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const open = (depth, top = -2) => `M${-hw} ${top} Q0 ${top + 9} ${hw} ${top} Q${hw * 0.55} ${depth} 0 ${depth} Q${-hw * 0.55} ${depth} ${-hw} ${top}Z`
  let body = null
  if (shape === 'grin' || shape === 'laugh') {
    const depth = shape === 'grin' ? hw * 0.9 : hw * 1.22
    const d = open(depth)
    const cid = `bm-mc-${p.name}-${shape}`
    body = <>
      <clipPath id={cid}><path d={d} /></clipPath>
      <path d={d} fill="#6a1f27" />
      <g clipPath={`url(#${cid})`}><rect x={-hw} y={-6} width={hw * 2} height={shape === 'grin' ? 15 : 19} fill="#fffaf2" /><ellipse cx="0" cy={depth - 2} rx={hw * 0.5} ry={shape === 'grin' ? 10 : 15} fill="#ea6f7c" /></g>
      <path d={d} fill="none" stroke="#4a171d" strokeWidth="2.4" strokeLinejoin="round" />
    </>
  } else if (shape === 'softsmile') body = <path d={`M${-hw * .85} -2 Q0 ${hw * .62} ${hw * .85} -2`} {...base} />
  else if (shape === 'smile') body = <path d={`M${-hw * .6} 0 Q0 ${hw * .3} ${hw * .6} 0`} {...base} />
  else if (shape === 'frown') body = <path d={`M${-hw * .62} 8 Q0 ${-9} ${hw * .62} 8`} {...base} />
  else if (shape === 'worry') body = <path d={`M${-hw * .5} 7 Q0 ${-3} ${hw * .5} 7`} {...base} />
  else if (shape === 'flat') body = <path d={`M${-hw * .55} 2 L${hw * .55} 2`} {...base} />
  else if (shape === 'smirk') body = <path d={`M${-hw * .6} 5 Q${hw * .1} 7 ${hw * .75} -7`} {...base} />
  else if (shape === 'smirkflat') body = <path d={`M${-hw * .55} 4 Q${hw * .1} 1 ${hw * .6} 5`} {...base} />
  else if (shape === 'wobble') body = <path d={`M${-hw * .62} 8 Q${-hw * .32} ${-6} 0 4 Q${hw * .32} ${-6} ${hw * .62} 8`} {...base} className="bm-wobble" />
  else if (shape === 'O') body = <g><ellipse cx="0" cy="6" rx="12" ry="16" fill="#5a1b24" stroke="#3b1017" strokeWidth="2.4" /><ellipse cx="0" cy="14" rx="7" ry="5" fill="#ea6f7c" /></g>
  else if (shape === 'pout') body = <g transform="translate(5 2)"><ellipse cx="0" cy="0" rx="15" ry="8.5" fill={p.lip} /><ellipse cx="-3" cy="-2.5" rx="7" ry="2.6" fill="#fff" opacity=".28" /><path d="M-14 0 Q0 3 14 0" stroke="#4a2a20" strokeWidth="1.6" fill="none" opacity=".5" /></g>
  else if (shape === 'grit') {
    const w = hw * .82
    body = <g>
      <path d={`M${-w} 9 Q0 ${-11} ${w} 9 L${w * .92} 20 Q0 ${3} ${-w * .92} 20Z`} fill="#fffaf2" stroke="#3b1017" strokeWidth="2.6" strokeLinejoin="round" />
      {[-.5, 0, .5].map((k) => <path key={k} d={`M${w * k} ${k === 0 ? -1 : 2 + Math.abs(k) * 4} L${w * k * .96} ${k === 0 ? 13 : 16 + Math.abs(k) * 2}`} stroke="#3b1017" strokeWidth="1.8" />)}
    </g>
  }
  return <g transform={`translate(${m.x} ${m.y}) rotate(${m.rot})`} className="bm-mouth">{body}</g>
}

function Eye({ e, person, lid, blinkDelay }) {
  const top = e.y - e.ry - 7, h = e.ry * 2 + 13
  const shape = { cx: e.x, cy: top + h / 2, rx: e.rx + 4, ry: h / 2, fill: `url(#bm-lid-${person})` }
  return <>
    <ellipse {...shape} className="bm-lid" style={{ '--lid': lid }} />
    <ellipse {...shape} className="bm-blink" style={{ '--lid': lid, animationDelay: `${blinkDelay}s` }} />
  </>
}

function Face({ person, mood, blinkSeed }) {
  const p = PEOPLE[person], c = moodOf(mood)
  const skinPatch = (cx, cy, rx, ry, gid, rot = 0) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${gid})`} transform={`rotate(${rot} ${cx} ${cy})`} />
  const f = p.face
  const heartEye = (e) => <g key={e.x} transform={`translate(${e.x} ${e.y})`}><g className="bm-heart-eye"><path d={heartPath} transform="scale(2.5)" fill="#ff3d6e" stroke="#c81e4d" strokeWidth="1.2" /><ellipse cx="-9" cy="-12" rx="4" ry="2.4" fill="#fff" opacity=".65" transform="rotate(-30)" /></g></g>
  return <g className="bm-face">
    {/* puffed cheeks for the sulk */}
    {c.puff && [p.cheekL, p.cheekR].map((k, i) => <g key={i} className="bm-puff" style={{ transformOrigin: `${k.x}px ${k.y}px` }}><circle cx={k.x + (i ? 6 : -6)} cy={k.y} r="30" fill="url(#bm-g-puff)" opacity=".45" /></g>)}
    {c.blush > 0 && [p.cheekL, p.cheekR].map((k, i) => <ellipse key={i} cx={k.x} cy={k.y} rx="38" ry="24" fill="url(#bm-g-blush)" opacity={Math.min(1, c.blush * .85)} className="bm-blush" />)}

    {/* brows */}
    {c.brow && <>
      {p.patchBrow && <>{skinPatch(p.browL.x, p.browL.y + 1, p.browL.w * .6, 15, `bm-pb-${person}`, p.browL.rot)}{skinPatch(p.browR.x - 4, p.browR.y + 2, p.browR.w * .6, 15, `bm-pb-${person}`, p.browR.rot)}</>}
      <Brow p={p} b={p.browL} side="l" cfg={c} /><Brow p={p} b={p.browR} side="r" cfg={c} />
    </>}
    {/* mouth */}
    {c.mouth && <>{skinPatch(p.mouth.x, p.mouth.y + 2, p.mouth.w * .66, 22, `bm-pm-${person}`, p.mouth.rot)}<Mouth p={p} shape={c.mouth} /></>}
    {/* heart eyes */}
    {c.heartEyes && [p.eyeL, p.eyeR].map(heartEye)}
    {/* mood lids + blinking */}
    {!c.heartEyes && <><Eye e={p.eyeL} person={person} lid={c.lid || 0} blinkDelay={blinkSeed} /><Eye e={p.eyeR} person={person} lid={c.lid || 0} blinkDelay={blinkSeed + .08} /></>}
    {/* tears */}
    {c.joyTears && [p.eyeL, p.eyeR].map((e, i) => <path key={i} className="bm-tear" d="M0 -9 Q9 5 0 10 Q-9 5 0 -9Z" fill="#9edcff" stroke="#5fb6ee" strokeWidth="1.2" style={{ transform: `translate(${e.x + (i ? 24 : -24)}px, ${e.y + 16}px)`, animationDelay: `${i * .25}s` }} />)}
    {c.tears === 1 && <g style={{ transform: `translate(${p.eyeL.x - 8}px, ${p.eyeL.y + 18}px)` }}><path className="bm-tear slow" d="M0 -9 Q9 5 0 10 Q-9 5 0 -9Z" fill="#9edcff" stroke="#5fb6ee" strokeWidth="1.2" /></g>}
    {c.tears === 2 && [p.eyeL, p.eyeR].map((e, i) => <g key={i} style={{ transform: `translate(${e.x + (i ? 8 : -6)}px, ${e.y + 15}px)` }}>
      <rect className="bm-stream" x="-5" y="0" width="10" height="46" rx="5" fill="#9edcff" opacity=".8" style={{ animationDelay: `${i * .3}s` }} />
      <path className="bm-tear" d="M0 -9 Q9 5 0 10 Q-9 5 0 -9Z" fill="#b9e8ff" stroke="#5fb6ee" strokeWidth="1.2" style={{ animationDelay: `${i * .3}s` }} /></g>)}
    {/* tint over the skin (red = angry, green = jealous, blue = sad) — above patches so it blends in */}
    {c.tint && <ellipse cx={f.x} cy={f.y} rx={f.rx} ry={f.ry} fill={c.tint[0]} mask={`url(#bm-sil-${person})`} className="bm-tint" style={{ '--a': c.tint[1] }} />}
    {/* stickers around the head */}
    {c.vein && <g transform={`translate(${p.mark.x} ${p.mark.y})`}><g className="bm-vein"><path d="M-14 -5 Q-5 -5 -5 -14 M14 -5 Q5 -5 5 -14 M-14 5 Q-5 5 -5 14 M14 5 Q5 5 5 14" stroke="#ff2e2e" strokeWidth="6" fill="none" strokeLinecap="round" /></g></g>}
    {c.sweat && <g transform={`translate(${p.temple.x} ${p.temple.y})`}><path className="bm-sweat" d="M0 -12 Q11 5 0 12 Q-11 5 0 -12Z" fill="#aee3ff" stroke="#5fb6ee" strokeWidth="1.5" /></g>}
    {c.bang && <g transform={`translate(${p.mark.x} ${p.mark.y - 4})`}><text className="bm-bang" textAnchor="middle" fontSize="64" fontWeight="900" fill="#ff5a3c" stroke="#fff" strokeWidth="3" paintOrder="stroke" fontFamily="Manrope Variable, sans-serif">{c.bang}</text></g>}
    {c.bubble && <g transform={`translate(${p.mark.x - 6} ${p.mark.y - 8})`}><g className="bm-bubble"><rect x="-34" y="-20" width="68" height="36" rx="18" fill="#fff" opacity=".95" /><path d="M-14 15 L-22 28 L-2 15Z" fill="#fff" opacity=".95" /><text textAnchor="middle" y="6" fontSize={c.bubble.length > 2 ? 17 : 26} fontWeight="800" fill="#3c1735" fontFamily="Manrope Variable, sans-serif">{c.bubble}</text></g></g>}
    {c.sideEyes && <g transform={`translate(${p.mark.x - 6} ${p.mark.y + 4})`}><g className="bm-sideeyes">{[-17, 17].map((x) => <g key={x} transform={`translate(${x} 0)`}><circle r="15" fill="#fff" stroke="#143d1f" strokeWidth="2.4" /><circle className="bm-pupil" cx="5" cy="0" r="6.5" fill="#143d1f" /></g>)}</g></g>}
    {c.glint && <g transform={`translate(${p.mouth.x + p.mouth.w * .46} ${p.mouth.y - 10})`}><path className="bm-glint" d="M0 -13 L3 -3 L13 0 L3 3 L0 13 L-3 3 L-13 0 L-3 -3Z" fill="#fff" stroke="#e8c7ff" strokeWidth="1.5" /></g>}
  </g>
}

// deterministic pseudo-random so particles don't jump on re-render
const rnd = (i, s) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x) }

function Particles({ kind }) {
  const items = useMemo(() => {
    if (!kind) return []
    const n = Math.ceil(({ sparkle: 7, heart: 8, steam: 4, drops: 6, burst: 10 }[kind] || 0) * (LITE ? 0.55 : 1))
    return Array.from({ length: n }, (_, i) => ({ i, x: 8 + rnd(i, 1) * 84, y: 6 + rnd(i, 2) * 60, d: rnd(i, 3) * 2.4, s: .6 + rnd(i, 4) * .8, dur: 2.2 + rnd(i, 5) * 2 }))
  }, [kind])
  if (!kind) return null
  return <div className={`bm-fx fx-${kind}`} aria-hidden="true">
    {items.map((it) => <i key={it.i} style={{ '--x': `${kind === 'steam' ? 28 + it.i * 14 : kind === 'burst' ? 50 : it.x}%`, '--y': `${it.y}%`, '--d': `${it.d}s`, '--s': it.s, '--dur': `${it.dur}s`, '--r': `${it.i * 36}deg` }}>
      {kind === 'sparkle' ? '✦' : kind === 'heart' ? '♥' : null}
    </i>)}
  </div>
}

/**
 * <Bitmoji person="me|krishna" mood="happy" shape="round|free" zoom label />
 * Crossfades between expressions and animates head motion + particles per mood.
 */
function BitmojiImpl({ person = 'krishna', mood = 'neutral', shape = 'round', zoom = false, label = false, className = '', style, blink = true }) {
  const p = PEOPLE[person] || PEOPLE.krishna
  const [layers, setLayers] = useState([{ mood, k: 0 }])
  const counter = useRef(0)
  const rootRef = useRef(null)
  const svgRef = useRef(null)
  useEffect(() => { // blink every few seconds (one-shot class, no always-running animation)
    if (!blink || zoom) return undefined
    let t; const go = () => { t = setTimeout(() => { const el = svgRef.current; if (el && !document.hidden && rootRef.current?.dataset.vis !== '0') { el.classList.add('is-blinking'); setTimeout(() => el.classList.remove('is-blinking'), 260) } go() }, 2800 + Math.random() * 3600) }
    go(); return () => clearTimeout(t)
  }, [blink, zoom])
  useEffect(() => { const el = rootRef.current; if (!visIO || !el) return undefined; visIO.observe(el); return () => visIO.unobserve(el) }, [])
  useEffect(() => {
    setLayers((cur) => {
      if (cur[cur.length - 1].mood === mood) return cur
      counter.current += 1
      return [...cur.slice(-1), { mood, k: counter.current }]
    })
    const t = setTimeout(() => setLayers((cur) => cur.slice(-1)), 520)
    return () => clearTimeout(t)
  }, [mood])
  const cur = layers[layers.length - 1]
  const c = moodOf(cur.mood)
  const seed = person === 'me' ? 1.3 : 3.1
  return <div ref={rootRef} className={`bm bm-${shape} ${zoom ? 'is-zoom' : ''} ${className}`} data-mood={cur.mood} style={{ '--a1': c.aura[0], '--a2': c.aura[1], '--glow': c.glow || c.aura[0], '--zx': `${p.zoom.x}%`, '--zy': `${p.zoom.y}%`, ...style }} role="img" aria-label={`${p.name} looks ${c.label}`}>
    <div className="bm-aura" />
    <div className="bm-mask"><div className="bm-zoom"><div className={`bm-body motion-${c.motion}`}>
      <img src={p.src} alt="" draggable="false" />
      <svg ref={svgRef} viewBox="0 0 520 520" className="bm-svg" aria-hidden="true">
        {layers.map((l, i) => <g key={l.k} className={`bm-layer ${i === layers.length - 1 ? 'is-in' : 'is-out'}`}><Face person={person} mood={l.mood} blinkSeed={seed} /></g>)}
      </svg>
    </div></div></div>
    {!zoom && <Particles key={`fx-${cur.mood}`} kind={c.fx} />}
    {label && <span className="bm-chip" key={`chip-${cur.mood}`}>{c.label}</span>}
  </div>
}
export const Bitmoji = memo(BitmojiImpl)
export { MOODS }
