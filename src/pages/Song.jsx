import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bitmoji } from '../components/Bitmoji'
import { MOODS } from '../components/moods'
import { Icon } from '../components/Icon'
import { chapters, songs } from '../content'
import { engine } from '../audio/engine'
import { getAudio, unlockAudio } from '../audio/player'
import SongHelp from '../components/SongHelp'

const NAME = { krishna: 'KRISHNA', me: 'ME' }
const DISPLAY = { krishna: 'Krishna', me: 'Aditya' }
const fmt = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, '0')}`

// how the two of them "feel together" → glyph between the Bitmojis
function vibeOf(a, b) {
  const set = [a, b], has = (...m) => set.some((x) => m.includes(x))
  if (has('angry')) return { g: '⚡', t: 'tense' }
  if (has('jealous', 'pout', 'annoyed', 'suspicious')) return { g: '☁', t: 'moody' }
  if (has('cry', 'sad', 'worried')) return { g: '☂', t: 'heavy' }
  if (has('love', 'shy') && !has('angry')) return { g: '♥', t: 'warm' }
  if (has('happy', 'laugh', 'surprised', 'smug', 'curious')) return { g: '✦', t: 'bright' }
  return { g: '·', t: 'quiet' }
}

/* ───────── mini music player (one song at a time, shared <audio> element) ─────────
   Plays /public/audio/<file> from clip[0] to clip[1]. If a file is missing it falls back to a
   silent animated "preview" so the chat still flows. If the browser blocks sound it tells the chat to wait. */
function useSongPlayer(onBlocked) {
  const R = useRef({ raf: 0, key: null, from: 0, to: 25, sim: false, simStart: 0, simEl: 0, simDur: 6, off: null, last: 0 })
  const blocked = useRef(onBlocked); blocked.current = onBlocked
  const [st, setSt] = useState({ key: null, playing: false, progress: 0, elapsed: 0, dur: 0, mode: 'audio' })
  const finish = useCallback(() => { const r = R.current; cancelAnimationFrame(r.raf); if (!r.sim) getAudio().pause(); setSt((s) => ({ ...s, playing: false, progress: 1, elapsed: r.to - r.from })) }, [])
  const tick = useCallback(() => {
    const r = R.current; if (r.key == null) return
    const dur = r.to - r.from; let p
    if (r.sim) p = Math.min(1, (performance.now() - r.simStart + r.simEl) / 1000 / r.simDur)
    else { const a = getAudio(); p = Math.max(0, Math.min(1, (a.currentTime - r.from) / dur)); if (a.currentTime >= r.to - 0.03 || a.ended) { finish(); return } }
    const now = performance.now()
    if (now - r.last > 66) { r.last = now; setSt((s) => ({ ...s, progress: p, elapsed: p * dur })) }   // ~15 fps is plenty for a progress bar
    if (r.sim && p >= 1) { finish(); return }
    r.raf = requestAnimationFrame(tick)
  }, [finish])
  const stop = useCallback(() => {
    const r = R.current; cancelAnimationFrame(r.raf); if (r.off) r.off(); r.off = null
    getAudio().pause(); r.key = null; r.sim = false
  }, [])
  const start = useCallback((key, songId, clip = [0, 25]) => {
    stop(); const r = R.current, def = songs[songId], a = getAudio(); const [from, to] = clip
    Object.assign(r, { key, from, to, sim: false, simEl: 0, simDur: Math.min(7, to - from), last: 0 })
    setSt({ key, playing: true, progress: 0, elapsed: 0, dur: to - from, mode: 'audio' })
    const sim = () => { if (r.key !== key || r.sim) return; r.sim = true; r.simStart = performance.now(); setSt((s) => ({ ...s, mode: 'sim' })); cancelAnimationFrame(r.raf); r.raf = requestAnimationFrame(tick) }
    if (!def.file || def.missing) { sim(); return }
    const seek = () => { if (from > 0) { try { a.currentTime = from } catch { /* not seekable yet */ } } }
    a.addEventListener('error', sim); a.addEventListener('loadedmetadata', seek)
    r.off = () => { a.removeEventListener('error', sim); a.removeEventListener('loadedmetadata', seek) }
    a.src = def.file; a.currentTime = 0
    a.play().then(() => { if (r.key === key && !r.sim) r.raf = requestAnimationFrame(tick) })
      .catch((e) => { if (r.key !== key) return; if (e && e.name === 'NotAllowedError') { setSt((s) => ({ ...s, playing: false, mode: 'blocked' })); blocked.current && blocked.current() } else if (!(e && e.name === 'AbortError')) sim() })
  }, [stop, tick])
  const pause = useCallback(() => { const r = R.current; if (r.key == null) return; cancelAnimationFrame(r.raf); if (r.sim) r.simEl += performance.now() - r.simStart; else getAudio().pause(); setSt((s) => ({ ...s, playing: false })) }, [])
  const resume = useCallback(() => { const r = R.current; if (r.key == null) return; setSt((s) => ({ ...s, playing: true })); if (r.sim) r.simStart = performance.now(); else getAudio().play().catch(() => { setSt((s) => ({ ...s, playing: false })); blocked.current && blocked.current() }); r.raf = requestAnimationFrame(tick) }, [tick])
  const toggle = useCallback((key, songId, clip) => { if (st.key === key && st.playing) pause(); else if (st.key === key && st.progress < 1) resume(); else start(key, songId, clip) }, [st, pause, resume, start])
  useEffect(() => stop, [stop])
  return { st, start, pause, resume, toggle, stop }
}

function SongCard({ it, idx, p, onToggle }) {
  const def = songs[it.song], mine = p.key === idx, playing = mine && p.playing, prog = mine ? p.progress : 0
  const dur = it.clip[1] - it.clip[0]
  const note = mine && p.mode === 'sim' ? (def.missing ? 'file not added · preview' : 'preview') : mine && p.mode === 'blocked' ? 'tap play for sound' : (def.range && !it.label ? `clip ${def.range}` : '')
  return <div className={`snap-song ${playing ? 'is-playing' : ''}`}>
    <button className="song-btn" onClick={() => onToggle(idx, it)} aria-label={playing ? `Pause ${def.title}` : `Play ${def.title}`}><Icon name={playing ? 'pause' : 'play'} size={20} strokeWidth={2.4} /></button>
    <div className="song-meta">
      <div className="song-title"><Icon name="note" size={13} strokeWidth={2.2} /><span>{def.title}</span></div>
      <div className="song-label">{[it.label, it.label ? '' : def.by, it.label && def.range ? def.range : ''].filter(Boolean).join(' · ')}</div>
      <div className="song-bar"><i style={{ transform: `scaleX(${prog})` }} /></div>
      <div className="song-time"><span>{fmt(mine ? p.elapsed : 0)} / {fmt(dur)}</span><span className="song-clip">{note}</span></div>
    </div>
    <span className="song-eq" aria-hidden="true"><i /><i /><i /><i /></span>
  </div>
}

function SnapCard({ it }) {
  const [open, setOpen] = useState(false)
  const kind = it.kind === 'video' ? 'Video' : 'Photo'
  return <div className={`snap-media kind-${it.kind}`}>
    {it.src ? (it.kind === 'video' ? <video src={it.src} controls playsInline preload="metadata" /> : <button className="media-img" onClick={() => setOpen(true)}><img src={it.src} alt={`${kind} from ${DISPLAY[it.from]}`} loading="lazy" /></button>)
      : <div className="media-ph"><span className="media-ico"><Icon name={it.kind === 'video' ? 'video' : 'camera'} size={22} /></span><b>{kind}</b><small>{DISPLAY[it.from]} sent a {kind.toLowerCase()}</small></div>}
    {open && <div className="media-lightbox" onClick={() => setOpen(false)} role="dialog"><img src={it.src} alt="" /></div>}
  </div>
}

export default function SongPage({ chapter, onNavigate }) {
  const ci = Math.min(Math.max(chapter, 1), chapters.length) - 1
  const ch = chapters[ci], items = ch.items, total = items.length
  const isLast = ci === chapters.length - 1
  const [shown, setShown] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [typing, setTyping] = useState(null)
  const [stageOpen, setStageOpen] = useState(true)
  const bodyRef = useRef(null)
  const [help, setHelp] = useState(false)
  const asked = useRef(false)
  const player = useSongPlayer(useCallback(() => setPlaying(false), []))
  const finished = shown >= total
  const msgCount = useMemo(() => items.filter((i) => i.type !== 'day').length, [items])
  const songCount = useMemo(() => items.filter((i) => i.type === 'song').length, [items])

  const blocks = useMemo(() => {
    const out = []
    items.slice(0, shown).forEach((it, idx) => {
      if (it.type === 'day') { out.push({ day: it.text, key: `d${idx}` }); return }
      const last = out[out.length - 1]
      if (last && last.sender === it.from) last.msgs.push({ ...it, idx }); else out.push({ sender: it.from, msgs: [{ ...it, idx }], key: `g${idx}` })
    })
    return out
  }, [items, shown])

  const lastMsg = useMemo(() => { for (let i = shown - 1; i >= 0; i--) if (items[i].type !== 'day') return items[i]; return null }, [items, shown])
  const moods = lastMsg ? { [lastMsg.from]: lastMsg.mood, [lastMsg.from === 'me' ? 'krishna' : 'me']: lastMsg.react || 'neutral' } : { krishna: 'neutral', me: 'neutral' }
  const speaker = lastMsg?.from
  const vibe = vibeOf(moods.krishna, moods.me)

  // background theme: quiet while chatting, almost silent while a song clip plays
  useEffect(() => { engine.duck(player.st.playing ? 0.04 : 0.35) }, [player.st.playing])
  useEffect(() => () => engine.duck(1), [])

  const toggleSong = useCallback((idx, it) => { unlockAudio(); if (player.st.key === idx && player.st.playing) setPlaying(false); player.toggle(idx, it.song, it.clip) }, [player])

  const play = useCallback(() => {
    unlockAudio()
    if (finished) { setShown(0); player.stop(); asked.current = false }
    setPlaying(true); engine.play()
    if (!finished && player.st.key != null && !player.st.playing && player.st.progress < 1) player.resume()
  }, [finished, player])
  const pause = useCallback(() => { setPlaying(false); setTyping(null); player.pause() }, [player])
  const restart = () => { setPlaying(false); setTyping(null); setShown(0); player.stop(); asked.current = false; setHelp(false) }
  const nextOne = () => { setTyping(null); setShown((s) => Math.min(s + 1, total)) }

  // auto-play: each message types in, songs start themselves and the chat waits until the clip ends
  const songBusy = player.st.playing && player.st.key !== null
  useEffect(() => {
    if (!playing) return undefined
    if (shown >= total) { setPlaying(false); setTyping(null); return undefined }
    if (songBusy) return undefined
    const it = items[shown]
    if (it.type === 'day') { const t = setTimeout(() => setShown((s) => s + 1), 600); return () => clearTimeout(t) }
    setTyping({ from: it.from, mood: it.mood })
    const wait = it.type === 'song' ? 1300 : it.type === 'snap' ? 1100 : Math.min(2300, 800 + it.text.length * 24)
    const t = setTimeout(() => { setTyping(null); setShown((s) => s + 1); if (it.type === 'song') player.start(shown, it.song, it.clip) }, wait)
    return () => clearTimeout(t)
  }, [playing, shown, total, songBusy]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!(finished && isLast) || asked.current || player.st.playing) return undefined
    const t = setTimeout(() => { asked.current = true; setHelp(true) }, 900)
    return () => clearTimeout(t)
  }, [finished, isLast, player.st.playing])

  useEffect(() => { const el = bodyRef.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }) }, [shown, typing, stageOpen])

  const shownMsgs = items.slice(0, shown).filter((i) => i.type !== 'day').length
  const pct = Math.round((shown / total) * 100)

  return <main className="snap-page">
    <div className="snap-phone">
      <div className="snap-status" aria-hidden="true"><span>11:02 <b className="ghosts">👻 👻 👻 ·</b></span><span>4G ▂▄▆ ⚡ ▮ 28%</span></div>

      <header className="snap-header">
        <button className="snap-back" onClick={() => onNavigate('choices')} aria-label="Back"><Icon name="back" size={26} strokeWidth={2.4} /></button>
        <div className="snap-profile"><Bitmoji person="krishna" mood={moods.krishna} zoom shape="round" className="snap-avatar" /><div className="snap-who"><strong>Krishna</strong><small>chapter {ci + 1} of {chapters.length} · {ch.title}</small></div></div>
        <div className="snap-header-actions"><button aria-label="Call"><Icon name="phone" size={24} strokeWidth={2.2} /></button><button aria-label="Video call"><Icon name="video" size={25} strokeWidth={2.2} /></button></div>
      </header>

      <section className={`snap-stage ${stageOpen ? 'is-open' : ''}`} aria-label="How they feel right now">
        <div className="stage-inner">
          <div className={`stage-person ${speaker === 'krishna' ? 'is-speaking' : ''}`}><Bitmoji person="krishna" mood={moods.krishna} label shape="round" className="stage-bm" /><span className="stage-name">Krishna</span></div>
          <div className="stage-vibe" key={vibe.t}><span className="vibe-glyph" data-v={vibe.t}>{vibe.g}</span><small>{vibe.t}</small></div>
          <div className={`stage-person ${speaker === 'me' ? 'is-speaking' : ''}`}><Bitmoji person="me" mood={moods.me} label shape="round" className="stage-bm" /><span className="stage-name">{DISPLAY.me}</span></div>
        </div>
      </section>
      <button className="stage-toggle" onClick={() => setStageOpen((o) => !o)} aria-expanded={stageOpen}><Icon name={stageOpen ? 'chevUp' : 'chevDown'} size={14} strokeWidth={2.4} /><span>{stageOpen ? 'hide faces' : 'show faces'}</span></button>

      <div className="snap-body" ref={bodyRef} onClick={(e) => { if (!playing && !finished && !e.target.closest('button, video, a')) nextOne() }}>
        {shown === 0 && !typing && <div className="snap-empty"><span className="chapter-chip">chapter {String(ci + 1).padStart(2, '0')}</span><h2>{ch.title}</h2><p>{msgCount} messages{songCount ? ` · ${songCount} song${songCount > 1 ? 's' : ''} 🎶` : ''}</p><p className="empty-hint">Press <b>play</b> and watch it come alive.</p><small>or tap anywhere to reveal one message at a time</small></div>}
        {blocks.map((b) => b.day
          ? <div className="snap-day" key={b.key}>{b.day}</div>
          : <div className={`snap-group from-${b.sender}`} key={b.key}>
            <div className="snap-label"><Bitmoji person={b.sender} mood={b.msgs[b.msgs.length - 1].mood} zoom shape="round" className="label-bm" /><span>{NAME[b.sender]}</span><em>{MOODS[b.msgs[b.msgs.length - 1].mood]?.label}</em></div>
            <div className="snap-lines">
              {b.msgs.map((m) => <Fragment key={m.idx}>
                {m.quote && <div className={`snap-quote from-${m.quote.from}`}><div className="quote-inner"><div className="quote-head"><b>{NAME[m.quote.from]}</b><span>{m.quote.day}</span></div><p>{m.quote.text}</p></div></div>}
                {m.type === 'song' ? <SongCard it={m} idx={m.idx} p={player.st} onToggle={toggleSong} />
                  : m.type === 'snap' ? <SnapCard it={m} />
                    : <p className="snap-line">{m.text}</p>}
              </Fragment>)}
            </div>
          </div>)}
        {typing && <div className={`snap-typing from-${typing.from}`}><Bitmoji person={typing.from} mood={typing.mood} zoom shape="round" className="label-bm" /><span className="dots"><i /><i /><i /></span><small>{DISPLAY[typing.from]} is {items[shown]?.type === 'song' ? 'picking a song' : 'typing'}…</small></div>}
        {finished && <div className="snap-finale">
          <div className="finale-pair"><Bitmoji person="krishna" mood={moods.krishna} shape="round" className="finale-bm" /><span className="finale-heart">♥</span><Bitmoji person="me" mood={moods.me} shape="round" className="finale-bm" /></div>
          <p>Chapter {ci + 1} done.<br /><em>{isLast ? 'That was our whole little story.' : `Next up: ${chapters[ci + 1].title.toLowerCase()}`}</em></p>
          <div className="finale-actions"><button className="snap-pill" onClick={restart}><Icon name="refresh" size={15} /> replay</button>
            {isLast ? <><button className="snap-pill" onClick={() => setHelp(true)}><Icon name="note" size={15} /> song help</button><button className="snap-pill is-hot" onClick={() => onNavigate('quiz')}>take the quiz <Icon name="arrow" size={15} /></button></> : <button className="snap-pill is-hot" onClick={() => onNavigate('song', ci + 2)}>next chapter <Icon name="arrow" size={15} /></button>}</div>
        </div>}
      </div>

      <div className="snap-controls">
        <button className={`ctl-play ${playing ? 'is-on' : ''}`} onClick={playing ? pause : play} aria-label={playing ? 'Pause chat' : 'Play chat'}><Icon name={playing ? 'pause' : 'play'} size={18} strokeWidth={2.2} /><span>{playing ? 'pause' : finished ? 'replay' : shown ? 'resume' : 'play'}</span></button>
        <div className="ctl-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={pct}><i style={{ width: `${pct}%` }} /></div>
        <span className="ctl-count">{String(shownMsgs).padStart(2, '0')}/{String(msgCount).padStart(2, '0')}</span>
        <button className="ctl-icon" onClick={nextOne} disabled={finished || playing} aria-label="Next message"><Icon name="arrow" size={17} strokeWidth={2.4} /></button>
        <button className="ctl-icon" onClick={restart} aria-label="Restart chapter"><Icon name="refresh" size={16} strokeWidth={2.2} /></button>
      </div>

      <div className="snap-composer">
        <button className="cmp-camera" aria-label="Camera"><Icon name="camera" size={24} strokeWidth={2} /></button>
        <div className="cmp-input"><span>Send a chat</span><Icon name="mic" size={22} /></div>
        <button aria-label="Emoji"><Icon name="smile" size={27} /></button><button aria-label="Stickers"><Icon name="cards" size={27} /></button><button aria-label="Games"><Icon name="game" size={27} /></button>
      </div>
      <div className="snap-nav" aria-hidden="true"><Icon name="menu" size={22} /><Icon name="circle" size={22} /><Icon name="back" size={22} /></div>
      {help && <SongHelp onClose={() => setHelp(false)} onQuiz={() => onNavigate('quiz')} />}
    </div>
    <p className="snap-foot">chapter {ci + 1} of {chapters.length} · {ch.title}{ch.sub ? ` — ${ch.sub}` : ''}</p>
  </main>
}
