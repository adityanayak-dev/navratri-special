// ─────────────────────────────────────────────────────────────
// Bitmoji expression data.
// Landmarks are measured on the 520×520 bust images in
// /public/assets/bitmoji (bust-aditya.webp, bust-krishna.webp).
// If you ever swap the Bitmoji images, re-measure these numbers.
// ─────────────────────────────────────────────────────────────
export const PEOPLE = {
  me: {
    name: 'Aditya', src: '/assets/bitmoji/bust-aditya.webp',
    eyeL: { x: 205, y: 243, rx: 34, ry: 15 }, eyeR: { x: 313, y: 238, rx: 36, ry: 15 },
    browL: { x: 205, y: 221, w: 58, rot: 0 }, browR: { x: 313, y: 215, w: 60, rot: 0 },
    mouth: { x: 258, y: 329, w: 84, rot: 0 },
    cheekL: { x: 188, y: 290 }, cheekR: { x: 332, y: 286 },
    face: { x: 268, y: 300, rx: 112, ry: 108 },
    mark: { x: 352, y: 168 }, above: { x: 268, y: 90 }, temple: { x: 372, y: 224 },
    brow: '#17120f', browW: 9, lip: '#d4825f', patchBrow: false,
    skinLid: '#f6c796', skinMouth: '#fcc48c', skinBrow: '#fbd5a3',
    zoom: { x: 52, y: 58 }, bubble: 'Aditya',
  },
  krishna: {
    name: 'Krishna', src: '/assets/bitmoji/bust-krishna.webp',
    eyeL: { x: 172, y: 209, rx: 32, ry: 14 }, eyeR: { x: 280, y: 188, rx: 31, ry: 16 },
    browL: { x: 170, y: 172, w: 62, rot: -7 }, browR: { x: 270, y: 152, w: 68, rot: -9 },
    mouth: { x: 241, y: 276, w: 72, rot: -6 },
    cheekL: { x: 165, y: 256 }, cheekR: { x: 303, y: 238 },
    face: { x: 236, y: 215, rx: 98, ry: 118 },
    mark: { x: 330, y: 112 }, above: { x: 238, y: 52 }, temple: { x: 336, y: 190 },
    brow: '#2c211c', browW: 11, lip: '#8b5d49', patchBrow: true,
    skinLid: '#e9c8ab', skinMouth: '#f0c595', skinBrow: '#f3d8aa',
    zoom: { x: 45, y: 42 }, bubble: 'Krishna',
  },
}

// tilt > 0 = inner ends of the brows pushed DOWN (angry); tilt < 0 = inner ends UP (sad/worried)
export const MOODS = {
  neutral:   { label: 'calm',      aura: ['#c26a98', '#3c1735'], motion: 'idle',     custom: false },
  happy:     { label: 'happy',     aura: ['#ffd36b', '#e8803a'], motion: 'bob',      brow: { tilt: -5, dy: -4 }, mouth: 'grin', blush: .5, lid: .12, fx: 'sparkle', glow: '#ffd36b' },
  laugh:     { label: 'laughing',  aura: ['#ffe27a', '#ff8d42'], motion: 'laugh',    brow: { tilt: -8, dy: -6 }, mouth: 'laugh', blush: .45, lid: .55, joyTears: 1, fx: 'sparkle', glow: '#ffd36b' },
  love:      { label: 'in love',   aura: ['#ff86b0', '#8d3f6d'], motion: 'sway',     brow: { tilt: -4, dy: -4 }, mouth: 'softsmile', blush: .7, heartEyes: 1, fx: 'heart', glow: '#ff7aa8' },
  shy:       { label: 'shy',       aura: ['#ffb0c0', '#b95887'], motion: 'wiggle',   brow: { tilt: -10, dy: -3 }, mouth: 'smile', blush: .85, lid: .3, sweat: 1, fx: 'sparkle', glow: '#ff9fb8' },
  angry:     { label: 'angry',     aura: ['#ff5a3c', '#5e0b19'], motion: 'shake',    brow: { tilt: 26, dy: 5, thick: 1.35 }, mouth: 'grit', lid: .2, tint: ['#ff2a1a', .38], vein: 1, fx: 'steam', glow: '#ff4a2a' },
  jealous:   { label: 'jealous',   aura: ['#7be26d', '#0f4a2a'], motion: 'tilt',     brow: { l: { tilt: 14, dy: 4 }, r: { tilt: -6, dy: -9 } }, mouth: 'smirkflat', lid: .5, tint: ['#4fd860', .2], sideEyes: 1, glow: '#6bdc6e' },
  sad:       { label: 'sad',       aura: ['#7ea6ff', '#1f2a5c'], motion: 'droop',    brow: { tilt: -24, dy: -2 }, mouth: 'frown', lid: .3, tint: ['#5b86ff', .16], tears: 1, glow: '#7ea6ff' },
  cry:       { label: 'crying',    aura: ['#5b8cff', '#14204f'], motion: 'tremble',  brow: { tilt: -30, dy: -2 }, mouth: 'wobble', lid: .42, tint: ['#5b86ff', .2], tears: 2, fx: 'drops', glow: '#5b8cff' },
  surprised: { label: 'shocked',   aura: ['#fff1a8', '#ff9d5c'], motion: 'pop',      brow: { tilt: -2, dy: -17 }, mouth: 'O', lid: 0, bang: '!', fx: 'burst', glow: '#ffe27a' },
  annoyed:   { label: 'annoyed',   aura: ['#a089c9', '#2c1f4d'], motion: 'tilt',     brow: { tilt: 9, dy: 1 }, mouth: 'flat', lid: .52, bubble: '…', glow: '#a089c9' },
  smug:      { label: 'smug',      aura: ['#c58bff', '#3d1a6b'], motion: 'tilt',     brow: { l: { tilt: 5, dy: 2 }, r: { tilt: -7, dy: -11 } }, mouth: 'smirk', lid: .3, glint: 1, glow: '#c58bff' },
  worried:   { label: 'worried',   aura: ['#8ec5ff', '#2a3f6b'], motion: 'tremble',  brow: { tilt: -19, dy: -3 }, mouth: 'worry', lid: .06, sweat: 1, glow: '#8ec5ff' },
  curious:   { label: 'curious',   aura: ['#8ed6ff', '#274a7a'], motion: 'tilt', brow: { l: { tilt: 4, dy: 1 }, r: { tilt: -6, dy: -13 } }, mouth: 'flat', lid: .08, bubble: '?', glow: '#8ed6ff' },
  suspicious:{ label: 'suspicious',aura: ['#b6a2e0', '#32245a'], motion: 'tilt', brow: { l: { tilt: 13, dy: 3 }, r: { tilt: -4, dy: -9 } }, mouth: 'flat', lid: .42, bubble: '?', glow: '#b6a2e0' },
  pout:      { label: 'sulking',   aura: ['#ff8fb0', '#7a2a4e'], motion: 'pout',     brow: { tilt: 11, dy: 2 }, mouth: 'pout', blush: .55, lid: .22, puff: 1, bubble: 'hmph', glow: '#ff8fb0' },
}
MOODS.neutral.brow = null
export const MOOD_ORDER = ['happy', 'laugh', 'love', 'shy', 'pout', 'angry', 'jealous', 'annoyed', 'suspicious', 'curious', 'sad', 'cry', 'worried', 'surprised', 'smug', 'neutral']
export const moodOf = (m) => MOODS[m] || MOODS.neutral
