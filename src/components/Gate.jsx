import { useState } from 'react'
import { engine } from '../audio/engine'

// Intro: "light the diya". A real user tap also unlocks browser audio.
export default function Gate({ onDone }) {
  const [lit, setLit] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const go = (withSound) => {
    setLit(true)
    if (withSound) engine.play()
    setTimeout(() => setLeaving(true), withSound ? 1500 : 500)
    setTimeout(onDone, withSound ? 2500 : 1400)
  }
  return <div className={`gate ${lit ? 'is-lit' : ''} ${leaving ? 'is-leaving' : ''}`} role="dialog" aria-label="Welcome">
    <div className="gate-glow" />
    <div className="gate-inner">
      <p className="gate-eyebrow">navratri special · for Krishna</p>
      <button className="diya-btn" onClick={() => !lit && go(true)} aria-label="Light the diya and begin">
        <svg viewBox="0 0 200 170" className="diya-svg" aria-hidden="true">
          <defs><radialGradient id="flameG" cx=".5" cy=".75" r=".7"><stop offset="0" stopColor="#fff6c9" /><stop offset=".4" stopColor="#ffc94d" /><stop offset="1" stopColor="#ff6a1f" /></radialGradient>
            <linearGradient id="diyaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e58a3c" /><stop offset="1" stopColor="#8a3a14" /></linearGradient></defs>
          <g className="flame-wrap"><path className="flame" d="M100 18 C122 50 126 72 100 92 C74 72 78 50 100 18Z" fill="url(#flameG)" /><path className="flame-core" d="M100 52 C110 66 110 78 100 88 C90 78 90 66 100 52Z" fill="#fffbe0" opacity=".9" /></g>
          <path d="M100 96 v10" stroke="#3b1a0c" strokeWidth="4" strokeLinecap="round" />
          <path d="M22 108 Q100 100 178 108 Q168 158 100 160 Q32 158 22 108Z" fill="url(#diyaG)" stroke="#ffd36b" strokeWidth="2" />
          <path d="M44 120 Q100 128 156 120" stroke="#ffd36b" strokeWidth="2" fill="none" opacity=".6" strokeDasharray="2 6" strokeLinecap="round" />
        </svg>
      </button>
      <h1 className="gate-title">Light the diya<br /><em>to begin.</em></h1>
      <p className="gate-sub">{lit ? 'a little light for our little night ✦' : 'tap the flame — it turns the music on too'}</p>
      {!lit && <button className="gate-skip" onClick={() => go(false)}>enter without sound</button>}
    </div>
  </div>
}
