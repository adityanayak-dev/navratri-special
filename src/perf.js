// "Lite" mode for phones / weaker devices: fewer particles, no blur-type effects.
const mq = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches
export const LITE = typeof window !== 'undefined' && (mq('(pointer: coarse)') || window.innerWidth < 820 || (navigator.hardwareConcurrency || 8) <= 4)
export const REDUCED = mq('(prefers-reduced-motion: reduce)')
if (typeof document !== 'undefined' && LITE) document.documentElement.classList.add('is-lite')
