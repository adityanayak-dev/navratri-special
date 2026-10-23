import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bitmoji } from '../components/Bitmoji'
import { Icon } from '../components/Icon'
import { chapters, songs } from '../content'
import { engine } from '../audio/engine'
import { getAudio } from '../audio/player'

const fmt = (s) => (Number.isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00')

// every song that was sent in the chat and has an mp3, in the order the chat sent them
function buildTracks() {
  const seen = new Set(), out = []
  chapters.forEach((ch, ci) => ch.items.forEach((it) => {
    if (it.type !== 'song' || seen.has(it.song) || songs[it.song].missing) return
    seen.add(it.song); out.push({ id: it.song, ch: ci + 1, ...songs[it.song] })
  }))
  return out
}

export default function Playlist({ onNavigate }) {
  const tracks = useMemo(buildTracks, [])
  const [cur, setCur] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [dur, setDur] = useState(0)
  const [err, setErr] = useState('')
  const curRef = useRef(-1)
  const a = getAudio()

  const load = useCallback((i) => {
    const tr = tracks[(i + tracks.length) % tracks.length]; const idx = tracks.indexOf(tr)
    curRef.current = idx; setCur(idx); setErr(''); setT(0); setDur(0)
    a.src = tr.file
    a.play().catch((e) => { if (e && e.name !== 'AbortError') setPlaying(false) })
  }, [a, tracks])

  useEffect(() => {
    engine.pause()   // the home theme would fight with the songs
    const on = { timeupdate: () => setT(a.currentTime), loadedmetadata: () => setDur(a.duration || 0), durationchange: () => setDur(a.duration || 0),
      play: () => setPlaying(true), pause: () => setPlaying(false), ended: () => load(curRef.current + 1),
      error: () => { if (curRef.current >= 0) { setErr('This song file could not be loaded.'); setPlaying(false) } } }
    Object.entries(on).forEach(([k, f]) => a.addEventListener(k, f))
    return () => { Object.entries(on).forEach(([k, f]) => a.removeEventListener(k, f)); a.pause() }
  }, [a, load])

  const toggle = (i) => { if (i === cur) { if (a.paused) a.play().catch(() => {}); else a.pause() } else load(i) }
  const seek = (e) => { const v = Number(e.target.value); a.currentTime = v; setT(v) }
  const now = cur >= 0 ? tracks[cur] : null

  return <main className={`playlist-page ${now ? 'has-now' : ''}`}>
    <header className="pl-head">
      <div className="pl-faces" aria-hidden="true"><Bitmoji person="krishna" mood={playing ? 'happy' : 'shy'} shape="round" className="pl-bm" /><Bitmoji person="me" mood={playing ? 'love' : 'smug'} shape="round" className="pl-bm" /></div>
      <h1>Garba playlist</h1>
      <p>Tap any song and it plays — the same {tracks.length} clips we sent each other in the chat. Chal, ramiye. 💃</p>
    </header>

    <ol className="pl-list">
      {tracks.map((tr, i) => {
        const on = i === cur, live = on && playing
        return <li key={tr.id}>
          <button className={`pl-row ${on ? 'is-current' : ''} ${live ? 'is-live' : ''}`} onClick={() => toggle(i)} aria-label={`${live ? 'Pause' : 'Play'} ${tr.title}, ${tr.by}`} aria-current={on ? 'true' : undefined}>
            <span className="pl-no">{live ? <span className="pl-eq" aria-hidden="true"><i /><i /><i /></span> : i + 1}</span>
            <span className="pl-info"><strong>{tr.title}</strong><small>{[tr.by, tr.range, `chapter ${tr.ch}`].filter(Boolean).join(' · ')}</small></span>
            <span className="pl-btn"><Icon name={live ? 'pause' : 'play'} size={18} strokeWidth={2.4} /></span>
          </button>
        </li>
      })}
    </ol>

    <div className="pl-links">
      <a className="outline-button" href="/garba/index.html">Open the full Garba catalogue</a>
      <button className="text-button" onClick={() => onNavigate('home')}><Icon name="back" size={15} /> back to the home page</button>
    </div>

    {now && <div className="pl-now" role="region" aria-label="Now playing">
      <div className="pl-now-top">
        <div className="pl-now-info"><strong>{now.title}</strong><small>{err || [now.by, now.range].filter(Boolean).join(' · ')}</small></div>
        <div className="pl-ctl">
          <button onClick={() => load(cur - 1)} aria-label="Previous song"><Icon name="back" size={20} strokeWidth={2.4} /></button>
          <button className="is-main" onClick={() => toggle(cur)} aria-label={playing ? 'Pause' : 'Play'}><Icon name={playing ? 'pause' : 'play'} size={22} strokeWidth={2.4} /></button>
          <button onClick={() => load(cur + 1)} aria-label="Next song"><Icon name="arrow" size={20} strokeWidth={2.4} /></button>
        </div>
      </div>
      <div className="pl-seek"><span>{fmt(t)}</span><input type="range" min="0" max={dur || 0} step="0.1" value={Math.min(t, dur || 0)} onChange={seek} aria-label="Seek" disabled={!dur} /><span>{fmt(dur)}</span></div>
    </div>}
  </main>
}
