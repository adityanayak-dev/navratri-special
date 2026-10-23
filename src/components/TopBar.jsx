import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { engine, useAudio } from '../audio/engine'

export function Logo() {
  return <span className="logo-mark"><span className="logo-bloom"><Icon name="flower" size={19} strokeWidth={1.5} /></span><span className="logo-copy"><small>for Krishna</small><strong>NAVRATRI</strong></span></span>
}

export default function TopBar({ screen, onNavigate }) {
  const a = useAudio()
  const [stuck, setStuck] = useState(false)
  useEffect(() => { const f = () => setStuck(window.scrollY > 24); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f) }, [])
  return <header className={`topbar ${stuck ? 'is-stuck' : ''}`}>
    <button className="logo-button" onClick={() => onNavigate('home')} aria-label="Home"><Logo /></button>
    <div className="topbar-right">
      {screen !== 'home' && <button className="tiny-back" onClick={() => onNavigate(screen === 'choices' || screen === 'playlist' ? 'home' : 'choices')}><Icon name="back" size={14} /><span>{screen === 'choices' || screen === 'playlist' ? 'Home' : 'Choices'}</span></button>}
      <button className={`sound-toggle ${a.playing ? 'is-on' : ''}`} onClick={() => engine.toggle()} aria-label={a.playing ? 'Pause Navratri theme' : 'Play Navratri theme'}>
        <span className="eq" aria-hidden="true"><i /><i /><i /><i /></span><span className="sound-label">{a.playing ? 'theme on' : 'play theme'}</span>
      </button>
    </div>
  </header>
}
