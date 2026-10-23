import { useEffect, useRef, useState } from 'react'
import { Bitmoji } from './Bitmoji'
import { Icon } from './Icon'
import { songHelp as C } from '../content'
import { getSongAnswer, setSongAnswer, getAttemptId } from '../store'
import { saveSongAnswer } from '../api'

// After the last chapter:  ask → (yes) screenshot + question + her text box → thanks
export default function SongHelp({ onClose, onQuiz }) {
  const [stage, setStage] = useState('ask')
  const [text, setText] = useState('')
  const [zoom, setZoom] = useState(false)
  const [sent, setSent] = useState(getSongAnswer)
  const box = useRef(null)
  useEffect(() => { if (stage === 'photo') box.current?.focus({ preventScroll: true }) }, [stage])
  useEffect(() => {
    const f = (e) => { if (e.key === 'Escape') (zoom ? setZoom(false) : onClose()) }
    window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f)
  }, [onClose, zoom])
  const send = (e) => { e.preventDefault(); const v = text.trim(); if (!v) return; setSongAnswer(v); saveSongAnswer(getAttemptId(), v); setSent(v); setStage('sent') }
  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) send(e) }
  const me = stage === 'ask' ? 'worried' : stage === 'photo' ? 'curious' : 'love'
  const kr = stage === 'sent' ? 'happy' : stage === 'photo' ? 'curious' : 'shy'

  return <div className="help-layer" role="dialog" aria-modal="true" aria-label="Song help">
    <div className={`help-sheet stage-${stage}`}>
      <button className="help-x" onClick={onClose} aria-label="Close"><Icon name="x" size={18} strokeWidth={2.4} /></button>
      <div className="help-faces"><Bitmoji person="me" mood={me} shape="round" className="help-bm" /><span aria-hidden="true">♪</span><Bitmoji person="krishna" mood={kr} shape="round" className="help-bm" /></div>

      {stage === 'ask' && <>
        <div className="help-bubble from-me"><b>ME</b><p>{C.ask}</p></div>
        <div className="help-actions">
          <button className="snap-pill is-hot" onClick={() => setStage('photo')} autoFocus>{C.yes}</button>
          <button className="snap-pill" onClick={onClose}>{C.no}</button>
        </div>
      </>}

      {stage === 'photo' && <>
        <div className="help-bubble from-me"><b>ME</b><p>{C.photoText}</p></div>
        <button className="help-photo" onClick={() => setZoom(true)} aria-label="Open the screenshot bigger"><img src={C.photo} alt="A YouTube page showing a song video, its singers and credits" /></button>
        <form className="help-form" onSubmit={send}>
          <label htmlFor="song-answer">{C.label}</label>
          <textarea id="song-answer" ref={box} rows={2} maxLength={120} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} placeholder={C.ph} enterKeyHint="send" autoComplete="off" />
          <button type="submit" className="primary-button" disabled={!text.trim()}>{C.send} <Icon name="arrow" size={17} /></button>
        </form>
      </>}

      {stage === 'sent' && <>
        <div className="help-bubble from-krishna"><b>KRISHNA</b><p>{sent}</p></div>
        <p className="help-thanks" role="status">{C.thanks}</p>
        <div className="help-actions">
          <button className="snap-pill is-hot" onClick={onQuiz} autoFocus>take the quiz <Icon name="arrow" size={15} /></button>
          <button className="snap-pill" onClick={onClose}>close</button>
        </div>
      </>}
    </div>
    {zoom && <div className="media-lightbox" onClick={() => setZoom(false)} role="dialog" aria-label="Screenshot"><img src={C.photo} alt="" /></div>}
  </div>
}
