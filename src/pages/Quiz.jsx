import { useMemo, useRef, useState } from 'react'
import { Bitmoji } from '../components/Bitmoji'
import { Icon } from '../components/Icon'
import { quizQuestions, quizTitle } from '../content'
import { getSongAnswer, getAttemptId, resetAttemptId } from '../store'
import { saveAnswer } from '../api'

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x))
const scored = quizQuestions.filter((q) => q.type !== 'text')

export default function QuizPage({ onNavigate }) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState({})          // id → { sel, texts, custom, right }
  const [draft, setDraft] = useState({ sel: [], texts: [], custom: '' })
  const [done, setDone] = useState(false)
  const [pops, setPops] = useState(0)
  const [copied, setCopied] = useState('')
  const attempt = useRef(getAttemptId())               // anonymous id for this run of the quiz
  const q = quizQuestions[idx]
  const locked = answers[q.id]
  const score = useMemo(() => scored.reduce((n, s) => n + (answers[s.id]?.right ? 1 : 0), 0), [answers])
  const isText = q.type === 'text'
  const filled = (draft.texts || []).some((t) => t && t.trim())
  const canSubmit = isText ? filled : (draft.sel.length > 0 || (q.custom && draft.custom.trim()))
  const right = locked?.right

  const pick = (k) => {
    if (locked) return
    setDraft((d) => q.type === 'single' ? { ...d, sel: [k] } : { ...d, sel: d.sel.includes(k) ? d.sel.filter((x) => x !== k) : [...d.sel, k] })
  }
  const setText = (i, v) => setDraft((d) => { const t = [...(d.texts || [])]; t[i] = v; return { ...d, texts: t } })
  const submit = () => {
    if (!canSubmit || locked) return
    let ok = null
    if (q.type === 'single') ok = draft.sel.some((k) => q.correct.includes(k))
    if (q.type === 'multi') ok = sameSet([...draft.sel].sort(), [...q.correct].sort()) || !!(q.custom && draft.custom.trim())
    setAnswers((a) => ({ ...a, [q.id]: { ...draft, right: ok } }))
    saveAnswer(attempt.current, q, draft)
    if (ok) setPops((p) => p + 1)
  }
  const next = () => {
    if (idx === quizQuestions.length - 1) { quizQuestions.forEach((x) => { if (answers[x.id]) saveAnswer(attempt.current, x, answers[x.id]) }); setDone(true); return }   // safety net: re-send everything (saving is idempotent)
    setIdx((i) => i + 1); setDraft({ sel: [], texts: [], custom: '' })
  }
  const reset = () => { setIdx(0); setAnswers({}); setDraft({ sel: [], texts: [], custom: '' }); setDone(false); setCopied(''); attempt.current = resetAttemptId() }

  const summary = () => {
    const lines = [`${quizTitle.title} — ${quizTitle.sub}`, `Score: ${score}/${scored.length}`, '']
    quizQuestions.forEach((x) => {
      const a = answers[x.id]; if (!a) return
      if (x.type === 'text') lines.push(`${x.id}) ${x.q}`, ...x.fields.map((f, i) => (a.texts[i] ? `   • ${a.texts[i].trim()}` : null)).filter(Boolean))
      else lines.push(`${x.id}) ${[...a.sel].sort().join(', ') || '-'}${a.custom?.trim() ? `  + own answer: ${a.custom.trim()}` : ''}`)
    })
    const song = getSongAnswer(); if (song) lines.push('', `Song name (I Love You photo): ${song}`)
    return lines.join('\n')
  }
  const copy = async () => { try { await navigator.clipboard.writeText(summary()); setCopied('Copied! Now paste it to me 💗') } catch { setCopied('Select and copy from the box below 💗') } }
  const share = async () => { if (navigator.share) { try { await navigator.share({ text: summary() }) } catch { /* cancelled */ } } else copy() }

  // faces react to what's happening
  let meMood = 'smug', kMood = 'curious'
  if (done) { meMood = score >= 8 ? 'love' : score >= 5 ? 'smug' : 'laugh'; kMood = score >= 8 ? 'happy' : score >= 5 ? 'shy' : 'pout' }
  else if (locked) { if (isText) { meMood = 'shy'; kMood = 'shy' } else if (right) { meMood = 'love'; kMood = 'happy' } else { meMood = 'laugh'; kMood = 'pout' } }
  else if (isText && filled) { meMood = 'curious'; kMood = 'shy' }
  else if (q.type === 'multi') kMood = 'suspicious'
  const progress = done ? 100 : (idx / quizQuestions.length) * 100 + (locked ? 100 / quizQuestions.length : 0)

  return <main className="page quiz-page">
    <div className="quiz-heading reveal-up">
      <div><span className="section-kicker">{quizTitle.title} · quiz</span><h1>Funny &amp; flirty, <em>how well do you know me?</em></h1></div>
      <div className="score-stamp" aria-label={`Score ${score} of ${scored.length}`}><span>{score}<small>/ {scored.length}</small></span><small>little score</small></div>
    </div>
    <div className="quiz-progress"><span>progress</span><div><i style={{ width: `${progress}%` }} /></div><span>{done ? 'done' : `${idx + 1} of ${quizQuestions.length}`}</span></div>
    <div className="quiz-layout">
      <aside className="quiz-faces reveal-up delay-one" aria-hidden="true">
        <Bitmoji person="me" mood={meMood} label shape="round" className="quiz-bm" />
        <Bitmoji person="krishna" mood={kMood} label shape="round" className="quiz-bm" />
        {pops > 0 && <div className="pop-burst" key={pops}>{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--a': `${i * 30}deg`, '--d': `${(i % 4) * .04}s` }} />)}</div>}
      </aside>

      {!done ? <form className={`quiz-panel reveal-up delay-one ${locked ? (isText ? 'is-text-done' : right ? 'is-correct' : 'is-wrong') : ''}`} key={q.id} onSubmit={(e) => { e.preventDefault(); submit() }}>
        <div className="question-top"><span className="question-number">{String(q.id).padStart(2, '0')}</span><span className="question-tag">{isText ? 'type your answer' : q.type === 'multi' ? 'select all that apply' : 'pick one'}</span></div>
        <h2>{q.q}</h2>
        {q.note && <p className="question-hint"><Icon name="sparkle" size={14} /> {q.note}</p>}

        {!isText && <fieldset className="answer-list" disabled={!!locked}>
          <legend className="sr-only">{q.q}</legend>
          {q.options.map((o) => {
            const on = (locked ? locked.sel : draft.sel).includes(o.k), isAns = locked && q.correct.includes(o.k)
            return <label key={o.k} className={`answer-option ${q.type === 'multi' ? 'is-multi' : ''} ${on ? 'is-selected' : ''} ${isAns ? 'is-answer' : ''} ${locked && on && !q.correct.includes(o.k) ? 'is-missed' : ''}`}>
              <input type={q.type === 'multi' ? 'checkbox' : 'radio'} name={`q${q.id}`} value={o.k} checked={on} onChange={() => pick(o.k)} />
              <span className="answer-letter">{locked && isAns ? <Icon name="check" size={16} strokeWidth={2.6} /> : o.k}</span><span className="answer-text">{o.text}</span>
            </label>
          })}
        </fieldset>}

        {(isText || q.custom) && <div className="text-fields">
          {isText ? q.fields.map((f, i) => <label className="text-field" key={i}>
            <span>{f.label}</span>
            {f.big ? <textarea rows={3} placeholder={f.ph} value={(locked ? locked.texts : draft.texts)[i] || ''} onChange={(e) => setText(i, e.target.value)} disabled={!!locked} maxLength={400} /> : <input type="text" placeholder={f.ph} value={(locked ? locked.texts : draft.texts)[i] || ''} onChange={(e) => setText(i, e.target.value)} disabled={!!locked} maxLength={200} />}
          </label>) : <label className="text-field">
            <span>{q.custom.label}</span>
            <textarea rows={2} placeholder={q.custom.ph} value={locked ? locked.custom : draft.custom} onChange={(e) => setDraft((d) => ({ ...d, custom: e.target.value }))} disabled={!!locked} maxLength={300} />
          </label>}
        </div>}

        {locked && <div className={`answer-feedback ${isText || right ? 'correct' : 'wrong'}`}><span className="feedback-icon"><Icon name={isText || right ? 'check' : 'x'} size={15} /></span>
          <div><strong>{isText ? q.done : (q.custom && locked.custom?.trim() && !right ? q.customDone : right ? q.right : q.wrong)}</strong>{!isText && <span>Ans: {q.ans}</span>}</div></div>}

        <div className="quiz-actions">
          {!locked ? <button type="submit" className="primary-button" disabled={!canSubmit}>{isText ? 'send my answer' : 'check my answer'} <Icon name="arrow" size={17} /></button>
            : <button type="button" className="primary-button" onClick={next}>{idx === quizQuestions.length - 1 ? 'show my little score' : 'next question'} <Icon name="arrow" size={17} /></button>}
          {!locked && <span className="select-note">{isText ? 'write at least one answer' : q.type === 'multi' ? 'you can pick more than one' : 'pick one card'}</span>}
        </div>
      </form> : <div className="result-card reveal-up">
        <span className="section-kicker">the grand little result</span>
        <h2>You got <em>{score} out of {scored.length}</em> right.</h2>
        <p>{score >= 9 ? 'Almost perfect 😭💗 tu mane bov saru jaanti che.' : score >= 6 ? 'Pretty good!! Tu mane ghanu jaanti che 😌❤️' : 'Haha 😂 haju thodi vaar lagse mane samajva ma... pan mane game che!'}</p>
        <div className="own-answers"><h3>Your own answers</h3>
          {quizQuestions.filter((x) => x.type === 'text' || x.custom).map((x) => <div className="own-item" key={x.id}><b>{x.id}) {x.q}</b>
            {x.type === 'text' ? x.fields.map((f, i) => answers[x.id]?.texts[i] ? <p key={i}>• {answers[x.id].texts[i]}</p> : null) : (answers[x.id]?.custom ? <p>• {answers[x.id].custom}</p> : <p className="muted">—</p>)}</div>)}
        </div>
        <div className="result-actions">
          <button className="primary-button" onClick={share}><Icon name="arrowUp" size={16} /> send my answers</button>
          <button className="outline-button" onClick={copy}>copy</button>
          <a className="outline-button" href={`https://wa.me/?text=${encodeURIComponent(summary())}`} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
        {copied && <p className="copied-note" role="status">{copied}</p>}
        <div className="invite-teaser"><span>one last question 🪔</span><button className="primary-button" onClick={() => onNavigate('invite')}>continue <Icon name="arrow" size={17} /></button></div>
        <div className="result-actions"><button className="text-button" onClick={reset}><Icon name="refresh" size={15} /> play again</button><button className="text-button" onClick={() => onNavigate('choices')}>choose another corner <Icon name="arrowUp" size={14} /></button></div>
      </div>}
    </div>
    <div className="quiz-foot"><button className="text-button" onClick={() => onNavigate('choices')}><Icon name="back" size={15} /> choose another corner</button><span>question {Math.min(idx + 1, quizQuestions.length)} of {quizQuestions.length}</span></div>
  </main>
}
