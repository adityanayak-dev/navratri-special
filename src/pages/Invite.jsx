import { useEffect, useRef, useState } from 'react'
import { Bitmoji } from '../components/Bitmoji'
import { Icon } from '../components/Icon'
import { engine } from '../audio/engine'
import { inviteConfig } from '../content'

// Final question: "chal mare jode Garba ramva"
//  • Haa chal  → a short "launching" moment, then the Garba playlist page opens
//  • Naa papa nai mane → shows the reply message, then goes back to the home page
export default function Invite({ onNavigate }) {
  const [choice, setChoice] = useState(null)       // null | 'yes' | 'no'
  const [hover, setHover] = useState(null)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const yes = () => {
    if (choice) return
    setChoice('yes'); engine.pause()
    timer.current = setTimeout(() => onNavigate('playlist'), inviteConfig.yesDelay)
  }
  const no = () => {
    if (choice) return
    setChoice('no')
    timer.current = setTimeout(() => onNavigate('home'), inviteConfig.noDelay)
  }

  // faces: Aditya asks, Krishna's face follows her choice
  let meMood = 'happy', kMood = 'smug'
  if (hover === 'yes') { meMood = 'love'; kMood = 'shy' }
  if (hover === 'no') { meMood = 'worried'; kMood = 'pout' }
  if (choice === 'yes') { meMood = 'love'; kMood = 'happy' }
  if (choice === 'no') { meMood = 'sad'; kMood = 'pout' }

  return <main className={`page invite-page ${choice ? `is-${choice}` : ''}`}>
    <div className="invite-card">
      <span className="section-kicker">{choice === 'no' ? 'reply' : 'one last question'}</span>
      <div className="invite-faces">
        <Bitmoji person="me" mood={meMood} label shape="round" className="invite-bm" />
        <span className="invite-heart" aria-hidden="true">{choice === 'no' ? '☁' : '♥'}</span>
        <Bitmoji person="krishna" mood={kMood} label shape="round" className="invite-bm" />
      </div>

      {choice !== 'no' && <h1 className="invite-title"><span style={{ '--i': 0 }}>{inviteConfig.line1}</span> <em style={{ '--i': 1 }}>{inviteConfig.line2}</em> <span style={{ '--i': 2 }}>{inviteConfig.line3}</span></h1>}

      {!choice && <div className="invite-actions">
        <button className="primary-button invite-yes" onClick={yes} onPointerEnter={() => setHover('yes')} onPointerLeave={() => setHover(null)} onFocus={() => setHover('yes')} onBlur={() => setHover(null)}>{inviteConfig.yes} <Icon name="arrow" size={18} /></button>
        <button className="outline-button invite-no" onClick={no} onPointerEnter={() => setHover('no')} onPointerLeave={() => setHover(null)} onFocus={() => setHover('no')} onBlur={() => setHover(null)}>{inviteConfig.no}</button>
      </div>}

      {choice === 'yes' && <p className="invite-note" role="status">{inviteConfig.yesNote}</p>}

      {choice === 'no' && <div className="invite-reply" role="status">
        <div className="snap-reply from-me"><b>ME</b><p>{inviteConfig.noReply}</p></div>
        <div className="invite-back"><i style={{ animationDuration: `${inviteConfig.noDelay}ms` }} /></div>
        <small>{inviteConfig.noBack}</small>
      </div>}
    </div>

    {choice === 'yes' && <div className="launch" aria-hidden="true">
      <div className="launch-ring"><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <p>{inviteConfig.launching}</p>
    </div>}
  </main>
}
