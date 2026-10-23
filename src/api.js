// Saves each submitted quiz answer to the server (which stores it in the database).
// Never blocks or breaks the quiz: if the request fails, the quiz carries on.
export const newAttemptId = () => {
  try { if (crypto.randomUUID) return crypto.randomUUID() } catch { /* old browser */ }
  return Array.from({ length: 4 }, () => Math.random().toString(16).slice(2, 10).padEnd(8, '0')).join('-')
}
// choice question -> "B. Krishna jode jagdo karvo; C. ... (own: ...)"   text question -> fields joined by " | "
export function formatAnswer(q, d) {
  if (q.type === 'text') return q.fields.map((_, i) => ((d.texts || [])[i] || '').trim()).filter(Boolean).join(' | ')
  const picked = [...(d.sel || [])].sort().map((k) => { const o = q.options.find((x) => x.k === k); return o ? `${k}. ${o.text.trim()}` : k })
  const own = (d.custom || '').trim()
  return [picked.join('; '), own ? `(own answer: ${own})` : ''].filter(Boolean).join(' ')
}
export const SONG_QUESTION = 100   // reserved question number for the "what is the song name" answer
// POST with up to 3 tries (1s, 3s) so a flaky mobile connection does not lose an answer.
function post(attemptId, questionNumber, answer, tries = 0) {
  try {
    fetch('/api/quiz-answers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: JSON.stringify({ attemptId, questionNumber, answer }) })
      .then((r) => { if (!r.ok && r.status >= 500 && tries < 2) throw new Error('retry') })
      .catch(() => { if (tries < 2) setTimeout(() => post(attemptId, questionNumber, answer, tries + 1), tries ? 3000 : 1000) })
  } catch { /* offline */ }
}
export function saveAnswer(attemptId, q, d) {
  const answer = formatAnswer(q, d)
  if (answer) post(attemptId, q.id, answer)
}
export function saveSongAnswer(attemptId, text) { const t = (text || '').trim(); if (t) post(attemptId, SONG_QUESTION, t) }
