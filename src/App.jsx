import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Choices from './pages/Choices'
import SongPage from './pages/Song'
import QuizPage from './pages/Quiz'
import Invite from './pages/Invite'
import Playlist from './pages/Playlist'
import TopBar from './components/TopBar'
import Ambient from './components/Ambient'
import Gate from './components/Gate'
import { BitmojiDefs } from './components/Bitmoji'
import './perf'

const PATHS = { home: '/', choices: '/choices', song: '/song', quiz: '/quiz', invite: '/invite', playlist: '/playlist' }
const TITLES = { home: 'Navratri for Krishna', choices: 'Choose our little adventure', song: 'What if our conversation had a song', quiz: 'How well do you know me?', invite: 'One last question', playlist: 'Garba playlist' }
const getScreen = () => { const p = window.location.pathname.replace(/\/$/, '') || '/'; return Object.keys(PATHS).find((k) => PATHS[k] === p) || 'home' }
const getChapter = () => Math.max(1, parseInt(new URLSearchParams(window.location.search).get('c') || '1', 10) || 1)
let gateDone = false

function useNarrow() {
  const [n, setN] = useState(() => window.innerWidth < 700)
  useEffect(() => { const f = () => setN(window.innerWidth < 700); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f) }, [])
  return n
}

export default function App() {
  const [screen, setScreen] = useState(getScreen)
  const [chapter, setChapter] = useState(getChapter)
  const [gate, setGate] = useState(() => getScreen() === 'home' && !gateDone && !new URLSearchParams(window.location.search).has('nogate'))
  const narrow = useNarrow()
  useEffect(() => { const f = () => { setScreen(getScreen()); setChapter(getChapter()) }; window.addEventListener('popstate', f); return () => window.removeEventListener('popstate', f) }, [])
  useEffect(() => { window.scrollTo(0, 0); document.title = TITLES[screen] }, [screen, chapter])
  useEffect(() => { document.body.classList.toggle('no-scroll', gate) }, [gate])
  const navigate = (next, arg) => {
    const c = next === 'song' ? Math.max(1, arg || 1) : 1
    window.history.pushState({}, '', PATHS[next] + (next === 'song' ? `?c=${c}` : ''))
    setScreen(next); setChapter(c)
  }
  const ready = !gate
  return <div className={`app-shell screen-${screen}`}>
    <BitmojiDefs />
    <Ambient paused={(screen === 'song' && narrow) || screen === 'home' || screen === 'playlist' || gate} />
    <TopBar screen={screen} onNavigate={navigate} />
    <div className="page-fade" key={`${screen}-${chapter}`}>
      {screen === 'home' && <Home onNavigate={navigate} ready={ready} />}
      {screen === 'choices' && <Choices onNavigate={navigate} />}
      {screen === 'song' && <SongPage chapter={chapter} onNavigate={navigate} />}
      {screen === 'quiz' && <QuizPage onNavigate={navigate} />}
      {screen === 'invite' && <Invite onNavigate={navigate} />}
      {screen === 'playlist' && <Playlist onNavigate={navigate} />}
    </div>
    {screen !== 'song' && screen !== 'invite' && screen !== 'playlist' && <footer className="site-footer"><span>✦</span> with a little extra sparkle for Krishna <span>✦</span></footer>}
    {gate && <Gate onDone={() => { gateDone = true; setGate(false) }} />}
  </div>
}
