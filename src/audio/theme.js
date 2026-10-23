// ─────────────────────────────────────────────────────────────
//  Built-in Navratri theme — a tiny original garba/dandiya loop
//  synthesised live with the Web Audio API (no audio files, no
//  copyright). Layers: dhol, clap, dandiya sticks, bansuri flute,
//  harmonium pad, tanpura drone. Any layer can be switched on/off.
// ─────────────────────────────────────────────────────────────
const BPM = 126
const STEP = 60 / BPM / 4            // one 16th-note, in seconds
const BAR_STEPS = 16
const BARS = 8
export const LOOP_STEPS = BAR_STEPS * BARS
export const LOOP_SECONDS = LOOP_STEPS * STEP

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12)

// Flute melody in D mixolydian: [step, midi note, length in steps]
const MELODY = [
  [0, 69, 2], [2, 69, 1], [3, 71, 1], [4, 69, 2], [6, 66, 2], [8, 64, 2], [10, 66, 2], [12, 69, 4],
  [16, 74, 2], [18, 74, 1], [19, 76, 1], [20, 74, 2], [22, 71, 2], [24, 69, 2], [26, 71, 2], [28, 69, 4],
  [32, 76, 2], [34, 78, 1], [35, 76, 1], [36, 74, 2], [38, 71, 2], [40, 69, 2], [42, 66, 2], [44, 64, 4],
  [48, 62, 2], [50, 64, 1], [51, 66, 1], [52, 69, 2], [54, 71, 2], [56, 69, 7],
  [64, 74, 3], [67, 74, 1], [68, 76, 2], [70, 74, 2], [72, 72, 2], [74, 71, 2], [76, 69, 4],
  [80, 71, 2], [82, 72, 2], [84, 71, 2], [86, 69, 2], [88, 67, 2], [90, 69, 2], [92, 71, 4],
  [96, 74, 2], [98, 76, 2], [100, 78, 4], [104, 76, 2], [106, 74, 2], [108, 71, 4],
  [112, 69, 2], [114, 71, 2], [116, 69, 2], [118, 66, 2], [120, 62, 7],
]
// one chord per bar (D D G D | D C G D) — notes in Hz + bass root
const CH = {
  D: { pad: [146.83, 185, 220], root: 73.42 },
  G: { pad: [196, 246.94, 293.66], root: 98 },
  C: { pad: [130.81, 164.81, 196], root: 65.41 },
}
const PROG = ['D', 'D', 'G', 'D', 'D', 'C', 'G', 'D']
const BASS_STEPS = [0, 6, 8, 11]
const TIN_STEPS = [2, 4, 10, 12, 14]
const CLAP_STEPS = [4, 12]

export const LAYERS = ['dhol', 'dandiya', 'flute', 'drone']

export class NavratriTheme {
  constructor(ctx, destination) {
    this.ctx = ctx
    this.timer = null
    this.nextStep = 0
    this.nextTime = 0
    this.onBeat = null
    this.group = {}
    this.out = ctx.createGain(); this.out.gain.value = 1
    // light reverb for space
    this.verb = ctx.createConvolver(); this.verb.buffer = this._impulse(1.7)
    const wet = ctx.createGain(); wet.gain.value = 0.2
    const dry = ctx.createGain(); dry.gain.value = 0.9
    this.out.connect(dry).connect(destination)
    this.out.connect(this.verb); this.verb.connect(wet).connect(destination)
    this.comp = null
    for (const k of LAYERS) { const g = ctx.createGain(); g.gain.value = 1; g.connect(this.out); this.group[k] = g }
    this.noise = this._noiseBuffer()
  }
  _impulse(sec) {
    const ctx = this.ctx, len = Math.floor(ctx.sampleRate * sec), buf = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6) }
    return buf
  }
  _noiseBuffer() {
    const ctx = this.ctx, len = ctx.sampleRate, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    return buf
  }
  setLayer(name, on) { const g = this.group[name]; if (g) g.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.08) }

  // ── instruments ──
  _env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d) }
  _noiseHit(t, { freq, q = 1, type = 'bandpass', peak = 0.5, dur = 0.08, dest }) {
    const ctx = this.ctx, src = ctx.createBufferSource(); src.buffer = this.noise
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q
    const g = ctx.createGain(); this._env(g, t, 0.003, peak, dur)
    src.connect(f).connect(g).connect(dest); src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05)
  }
  dhaBass(t, v = 1) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'sine'; o.frequency.setValueAtTime(165, t); o.frequency.exponentialRampToValueAtTime(58, t + 0.14)
    this._env(g, t, 0.004, 0.95 * v, 0.34)
    o.connect(g).connect(this.group.dhol); o.start(t); o.stop(t + 0.42)
    this._noiseHit(t, { freq: 700, q: 0.7, peak: 0.28 * v, dur: 0.05, dest: this.group.dhol })
  }
  tin(t, v = 1) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'triangle'; o.frequency.setValueAtTime(430, t); o.frequency.exponentialRampToValueAtTime(330, t + 0.07)
    this._env(g, t, 0.002, 0.3 * v, 0.1)
    o.connect(g).connect(this.group.dhol); o.start(t); o.stop(t + 0.14)
    this._noiseHit(t, { freq: 3400, q: 1.1, peak: 0.34 * v, dur: 0.07, dest: this.group.dhol })
  }
  clap(t) {
    this._noiseHit(t, { freq: 1500, q: 0.9, peak: 0.5, dur: 0.13, dest: this.group.dhol })
    this._noiseHit(t + 0.013, { freq: 1900, q: 0.9, peak: 0.35, dur: 0.11, dest: this.group.dhol })
  }
  stick(t, hi, accent) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'triangle'; o.frequency.setValueAtTime(hi ? 1900 : 1350, t); o.frequency.exponentialRampToValueAtTime(hi ? 1500 : 1000, t + 0.035)
    this._env(g, t, 0.001, accent ? 0.2 : 0.11, 0.05)
    o.connect(g).connect(this.group.dandiya); o.start(t); o.stop(t + 0.08)
    this._noiseHit(t, { freq: 6500, q: 0.8, type: 'highpass', peak: accent ? 0.12 : 0.06, dur: 0.025, dest: this.group.dandiya })
  }
  flute(t, note, len) {
    const ctx = this.ctx, f = midi(note), dur = Math.max(0.12, len * STEP * 0.96)
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain()
    o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 2
    lfo.frequency.value = 5.2; lg.gain.value = f * 0.006; lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency)
    g2.gain.value = 0.16
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.05); g.gain.setValueAtTime(0.45, t + Math.max(0.06, dur - 0.1)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12)
    o.connect(g); o2.connect(g2).connect(g); g.connect(this.group.flute)
    o.start(t); o2.start(t); lfo.start(t); const end = t + dur + 0.16; o.stop(end); o2.stop(end); lfo.stop(end)
    this._noiseHit(t, { freq: 4200, q: 1.5, peak: 0.07, dur: Math.min(0.3, dur), dest: this.group.flute })
  }
  pad(t, freqs, dur) {
    const ctx = this.ctx, lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.1, t + 0.18); g.gain.setValueAtTime(0.1, t + dur - 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    lp.connect(g).connect(this.group.drone)
    for (const f of freqs) for (const det of [-5, 5]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; const og = ctx.createGain(); og.gain.value = 0.3; o.connect(og).connect(lp); o.start(t); o.stop(t + dur + 0.05) }
  }
  bassPluck(t, f) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'triangle'; o.frequency.value = f; this._env(g, t, 0.01, 0.4, 0.5)
    o.connect(g).connect(this.group.drone); o.start(t); o.stop(t + 0.6)
  }
  startDrone(t) {
    const ctx = this.ctx, lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 2
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.14, t + 1.2)
    lp.connect(g).connect(this.group.drone)
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.18; lg.gain.value = 160; lfo.connect(lg).connect(lp.frequency); lfo.start(t)
    this.droneNodes = [lfo, g]
    for (const [f, det] of [[73.42, 0], [146.83, 4], [220.5, -4], [293.66, 2]]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; o.connect(lp); o.start(t); this.droneNodes.push(o) }
  }

  // ── sequencer ──
  scheduleStep(step, t) {
    const s = step % LOOP_STEPS, b = s % BAR_STEPS, bar = Math.floor(s / BAR_STEPS)
    if (BASS_STEPS.includes(b)) this.dhaBass(t, b === 0 ? 1 : 0.8)
    const fill = bar === BARS - 1 && b >= 12
    if (TIN_STEPS.includes(b) || fill) this.tin(t, fill ? 0.8 : b === 14 ? 0.55 : 0.85)
    if (CLAP_STEPS.includes(b)) this.clap(t)
    if (b % 2 === 0) this.stick(t, (b / 2) % 2 === 0, b % 4 === 0)
    for (const [st, note, len] of MELODY) if (st === s) this.flute(t, note, len)
    if (b === 0) { const c = CH[PROG[bar]]; this.pad(t, c.pad, BAR_STEPS * STEP); this.bassPluck(t, c.root); }
    if (b === 8) this.bassPluck(t, CH[PROG[bar]].root)
    if (b % 4 === 0 && this.onBeat) { const delay = Math.max(0, (t - this.ctx.currentTime) * 1000); const idx = s / 4; setTimeout(() => this.onBeat && this.onBeat(idx), delay) }
  }
  start() {
    const ctx = this.ctx; this.nextTime = ctx.currentTime + 0.08; this.nextStep = 0
    this.startDrone(this.nextTime)
    const tick = () => { while (this.nextTime < ctx.currentTime + 0.35) { this.scheduleStep(this.nextStep, this.nextTime); this.nextStep++; this.nextTime += STEP } }
    tick(); this.timer = setInterval(tick, 80)
  }
  stop() {
    clearInterval(this.timer); this.timer = null
    const t = this.ctx.currentTime
    if (this.droneNodes) { const [lfo, g, ...oscs] = this.droneNodes; g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0.0001, t, 0.15); [lfo, ...oscs].forEach((o) => { try { o.stop(t + 0.8) } catch {} }); this.droneNodes = null }
  }
  /** Render N loops offline to an AudioBuffer (used for testing). */
  static async renderOffline(loops = 1, sampleRate = 22050) {
    const ctx = new OfflineAudioContext(2, Math.ceil(LOOP_SECONDS * loops * sampleRate), sampleRate)
    const comp = ctx.createDynamicsCompressor(); comp.connect(ctx.destination)
    const theme = new NavratriTheme(ctx, comp)
    theme.startDrone(0)
    for (let s = 0; s < LOOP_STEPS * loops; s++) theme.scheduleStep(s, 0.05 + s * STEP)
    return ctx.startRendering()
  }
}
