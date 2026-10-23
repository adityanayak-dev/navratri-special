import { useRef } from 'react'
import { Bitmoji } from '../components/Bitmoji'
import { Icon } from '../components/Icon'
import { chapters, quizQuestions } from '../content'

// 3D-tilt that follows the pointer (CSS reads --rx / --ry / --mx / --my)
function Tilt({ className, onClick, children }) {
  const ref = useRef(null)
  const move = (e) => {
    const el = ref.current, r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
    el.style.setProperty('--ry', `${(x - .5) * 10}deg`); el.style.setProperty('--rx', `${(.5 - y) * 8}deg`); el.style.setProperty('--mx', `${x * 100}%`); el.style.setProperty('--my', `${y * 100}%`)
  }
  const leave = () => { const el = ref.current; el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg') }
  return <button ref={ref} className={className} onClick={onClick} onPointerMove={move} onPointerLeave={leave}>{children}</button>
}

export default function Choices({ onNavigate }) {
  return <main className="page choices-page">
    <div className="page-intro reveal-up">
      <span className="section-kicker">the next little chapter</span>
      <h1>Pick a corner <em>of our night.</em></h1>
      <p>One is a song waiting to happen. The other is a tiny test of how well you know the person who made this.</p>
    </div>
    <div className="choice-grid">
      <Tilt className="choice-card song-choice reveal-up delay-one" onClick={() => onNavigate('song')}>
        <div className="card-topline"><span className="sticker-label">01 · soundtrack</span><span className="card-arrow"><Icon name="arrowUp" size={18} /></span></div>
        <div className="choice-visual">
          <div className="visual-glow" />
          <div className="mini-chat">
            <div className="mini-line from-k"><span>you up? 👀</span></div>
            <div className="mini-line from-m"><span>always for you ✦</span></div>
            <div className="mini-line from-k"><span>…</span></div>
          </div>
          <Bitmoji person="krishna" mood="angry" shape="round" className="cv-bm cv-a" />
          <Bitmoji person="me" mood="love" shape="round" className="cv-bm cv-b" />
          <div className="mini-wave" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>
        </div>
        <div className="choice-text"><h2>What if our <em>conversation had a song?</em></h2><p>{chapters.length} chapters of our Snapchat chat — with songs and every little expression.</p></div>
        <div className="card-bottom"><span>tap to open</span><span className="tiny-line" /></div>
      </Tilt>
      <Tilt className="choice-card quiz-choice reveal-up delay-two" onClick={() => onNavigate('quiz')}>
        <div className="card-topline"><span className="sticker-label">02 · little quiz</span><span className="card-arrow"><Icon name="arrowUp" size={18} /></span></div>
        <div className="choice-visual">
          <div className="visual-glow" />
          <span className="quiz-giant" aria-hidden="true">?</span>
          <Bitmoji person="me" mood="smug" shape="round" className="cv-bm cv-c" />
          <div className="quiz-orb orb-one" /><div className="quiz-orb orb-two" />
        </div>
        <div className="choice-text"><h2>Let’s check what <em>you know about me.</em></h2><p>{quizQuestions.length} questions — some with text boxes for your own answers.</p></div>
        <div className="card-bottom"><span>tap to open</span><span className="tiny-line" /></div>
      </Tilt>
    </div>
    <div className="choices-footer"><span><Icon name="heart" size={15} /> both answers are correct here</span><span>made for Krishna · navratri 2026</span></div>
  </main>
}
