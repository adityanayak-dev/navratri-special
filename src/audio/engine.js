import { useSyncExternalStore } from 'react'
import { NavratriTheme, LAYERS } from './theme'
import { themeConfig } from '../content'

// One shared audio engine for the whole site (home theme + chat page).
class Engine {
  constructor() {
    this.ctx = null; this.master = null; this.analyser = null; this.synth = null; this.el = null
    this.state = { playing: false, volume: 0.7, layers: Object.fromEntries(LAYERS.map((l) => [l, true])), mode: themeConfig.src ? 'file' : 'synth', duck: 1 }
    this.subs = new Set(); this.buf = null; this.beatSubs = new Set()
  }
  subscribe = (fn) => { this.subs.add(fn); return () => this.subs.delete(fn) }
  getState = () => this.state
  _set(patch) { this.state = { ...this.state, ...patch }; this.subs.forEach((f) => f()) }
  onBeat(fn) { this.beatSubs.add(fn); return () => this.beatSubs.delete(fn) }
  _ensure() {
    if (this.ctx) return
    const AC = window.AudioContext || window.webkitAudioContext
    this.ctx = new AC()
    this.master = this.ctx.createGain(); this.master.gain.value = 0
    const comp = this.ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4
    this.analyser = this.ctx.createAnalyser(); this.analyser.fftSize = 512; this.analyser.smoothingTimeConstant = 0.8
    this.master.connect(comp); comp.connect(this.analyser); this.analyser.connect(this.ctx.destination)
    this.buf = new Uint8Array(this.analyser.fftSize)
    if (this.state.mode === 'file') {
      this.el = new Audio(themeConfig.src); this.el.loop = true; this.el.crossOrigin = 'anonymous'
      this.ctx.createMediaElementSource(this.el).connect(this.master)
    } else {
      this.synth = new NavratriTheme(this.ctx, this.master)
      this.synth.onBeat = (i) => this.beatSubs.forEach((f) => f(i))
    }
  }
  _applyGain() { if (this.master) this.master.gain.setTargetAtTime(this.state.playing ? 0.5 * this.state.volume * this.state.duck : 0, this.ctx.currentTime, 0.25) }
  async play() {
    this._ensure(); if (this.ctx.state === 'suspended') await this.ctx.resume()
    if (this.state.playing) return
    if (this.el) await this.el.play().catch(() => {}); else this.synth.start()
    this._set({ playing: true }); this._applyGain()
  }
  pause() {
    if (!this.ctx || !this.state.playing) return
    this._set({ playing: false }); this._applyGain()
    setTimeout(() => { if (!this.state.playing) { if (this.el) this.el.pause(); else this.synth.stop() } }, 700)
  }
  toggle() { return this.state.playing ? this.pause() : this.play() }
  setVolume(v) { this._set({ volume: v }); this._applyGain() }
  /** 1 = full, 0.3 = quiet background (used on the chat page) */
  duck(f) { this._set({ duck: f }); this._applyGain() }
  setLayer(name, on) { this._set({ layers: { ...this.state.layers, [name]: on } }); this.synth?.setLayer(name, on) }
  /** 0..1 loudness for visuals */
  level() {
    if (!this.analyser || !this.state.playing) return 0
    this.analyser.getByteTimeDomainData(this.buf)
    let s = 0; for (let i = 0; i < this.buf.length; i++) { const v = (this.buf[i] - 128) / 128; s += v * v }
    return Math.min(1, Math.sqrt(s / this.buf.length) * 3.2)
  }
  bars(n = 24) {
    if (!this.analyser || !this.state.playing) return new Array(n).fill(0)
    const f = new Uint8Array(this.analyser.frequencyBinCount); this.analyser.getByteFrequencyData(f)
    const out = []; const span = Math.floor(f.length * 0.6 / n)
    for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < span; j++) s += f[i * span + j]; out.push(s / span / 255) }
    return out
  }
}
export const engine = new Engine()
export const useAudio = () => useSyncExternalStore(engine.subscribe, engine.getState)
export { LAYERS }
