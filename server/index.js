// Production server: serves the built site (dist/), stores quiz answers in Postgres and
// shows them on the password-protected /admin/quiz page.
// Secrets come ONLY from the environment:  DATABASE_URL  and  ADMIN_PASSWORD  (never hardcode them).
import express from 'express'
import pg from 'pg'
import { timingSafeEqual, createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const { DATABASE_URL, ADMIN_PASSWORD, PORT = 3000 } = process.env
if (!DATABASE_URL) { console.error('DATABASE_URL is not set — refusing to start.'); process.exit(1) }

const pool = new pg.Pool({ connectionString: DATABASE_URL, max: 5 })
pool.on('error', (e) => console.error('db pool error:', e.message))
await pool.query(`CREATE TABLE IF NOT EXISTS quiz_answers (
  id BIGSERIAL PRIMARY KEY, attempt_id TEXT NOT NULL, question_number INTEGER NOT NULL, answer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE (attempt_id, question_number))`)
await pool.query('CREATE INDEX IF NOT EXISTS quiz_answers_created_idx ON quiz_answers (created_at DESC)')

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const digest = (s) => createHash('sha256').update(String(s)).digest()

// tiny per-IP rate limit for the public endpoint
const hits = new Map()
const limited = (ip) => { const now = Date.now(), h = (hits.get(ip) || []).filter((t) => now - t < 60000); h.push(now); hits.set(ip, h); return h.length > 60 }
setInterval(() => hits.clear(), 10 * 60 * 1000).unref()

// ── public: save one answer (idempotent per attempt + question) ──
const UUID = /^[A-Za-z0-9-]{16,64}$/
app.post('/api/quiz-answers', express.json({ limit: '16kb' }), async (req, res) => {
  if (limited(req.ip)) return res.status(429).json({ error: 'too many requests' })
  const { attemptId, questionNumber, answer } = req.body || {}
  const n = Number(questionNumber), text = typeof answer === 'string' ? answer.trim() : ''
  if (typeof attemptId !== 'string' || !UUID.test(attemptId) || !Number.isInteger(n) || n < 1 || n > 1000 || !text || text.length > 4000) return res.status(400).json({ error: 'invalid answer' })
  try {
    await pool.query(`INSERT INTO quiz_answers (attempt_id, question_number, answer) VALUES ($1, $2, $3)
      ON CONFLICT (attempt_id, question_number) DO UPDATE SET answer = EXCLUDED.answer, created_at = now()`, [attemptId, n, text])
    res.status(201).json({ ok: true })
  } catch (e) { console.error('save failed:', e.message); res.status(500).json({ error: 'could not save' }) }
})

// ── admin: HTTP Basic auth, password = ADMIN_PASSWORD (any username) ──
const requireAdmin = (req, res, next) => {
  if (!ADMIN_PASSWORD) return res.status(503).type('text').send('Admin is disabled: ADMIN_PASSWORD is not set on the server.')
  const m = /^Basic (.+)$/.exec(req.headers.authorization || '')
  const given = m ? Buffer.from(m[1], 'base64').toString('utf8').split(':').slice(1).join(':') : ''
  if (m && timingSafeEqual(digest(given), digest(ADMIN_PASSWORD))) return next()
  res.set('WWW-Authenticate', 'Basic realm="Quiz admin", charset="UTF-8"').status(401).type('text').send('Authentication required')
}
app.get('/admin/quiz', requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT attempt_id, question_number, answer, created_at FROM quiz_answers ORDER BY created_at DESC, question_number ASC LIMIT 2000')
    const by = new Map(); rows.forEach((r) => { if (!by.has(r.attempt_id)) by.set(r.attempt_id, []); by.get(r.attempt_id).push(r) })
    const body = [...by].map(([id, list]) => `<section><h2>Attempt <code>${esc(id)}</code> <small>${list.length} answers · latest ${esc(new Date(Math.max(...list.map((r) => r.created_at))).toISOString())}</small></h2>
      <table><thead><tr><th>Q#</th><th>Answer</th><th>Saved at (UTC)</th></tr></thead><tbody>${[...list].sort((a, b) => a.question_number - b.question_number).map((r) => `<tr><td>${r.question_number === 100 ? 'Song name' : r.question_number}</td><td>${esc(r.answer)}</td><td>${esc(r.created_at.toISOString())}</td></tr>`).join('')}</tbody></table></section>`).join('') || '<p>No answers yet.</p>'
    res.set('Cache-Control', 'no-store').type('html').send(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Quiz answers</title>
<style>body{font:16px/1.5 system-ui,sans-serif;margin:0;padding:20px;background:#120f2a;color:#f6f0e4}h1{margin:0 0 4px}small{color:#b9b2c8;font-weight:400;font-size:.8rem}section{margin:22px 0;overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:520px}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #3a3360;vertical-align:top}td:nth-child(2){white-space:pre-wrap;overflow-wrap:anywhere}code{font-size:.85rem}</style>
<h1>Quiz answers</h1><p><small>${by.size} attempts · ${rows.length} answers (newest first)</small></p>${body}</html>`)
  } catch (e) { console.error('admin query failed:', e.message); res.status(500).type('text').send('Could not read answers.') }
})

// ── the built site ──
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
app.use(express.static(dist, { index: 'index.html' }))
app.get(/^\/(?!api\/|admin\/|garba\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))

app.listen(PORT, () => console.log(`Listening on :${PORT}`))
