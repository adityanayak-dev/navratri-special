// A hanging marigold toran (door garland) with swaying flowers and tiny bells.
export default function Toran({ count = 15 }) {
  const items = Array.from({ length: count }, (_, i) => {
    const x = (i + .5) * (1200 / count), t = i / (count - 1)
    const curve = 24 + Math.sin(t * Math.PI * 4 - .3) * 10 + Math.sin(t * Math.PI) * 5
    const drop = 22 + ((i * 37) % 5) * 8
    return { x, y: curve, drop, i, big: i % 2 === 0 }
  })
  const path = items.reduce((d, it, i) => d + (i ? ` T ${it.x} ${it.y}` : `M -20 24 Q ${it.x / 2} 40 ${it.x} ${it.y}`), '') + ' T 1220 24'
  return <svg className="toran" viewBox="0 0 1200 150" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
    <path d={path} fill="none" stroke="url(#toranRope)" strokeWidth="3" strokeLinecap="round" />
    <defs><linearGradient id="toranRope" x1="0" x2="1"><stop offset="0" stopColor="#c98a2c" /><stop offset=".5" stopColor="#ffd36b" /><stop offset="1" stopColor="#c98a2c" /></linearGradient>
      <radialGradient id="mari" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffe08a" /><stop offset=".55" stopColor="#f5a623" /><stop offset="1" stopColor="#e2711d" /></radialGradient></defs>
    {items.map((it) => <g key={it.i} className="toran-hang" style={{ transformOrigin: `${it.x}px ${it.y}px`, animationDelay: `${-it.i * .37}s`, animationDuration: `${3.2 + (it.i % 3) * .5}s` }}>
      <line x1={it.x} y1={it.y} x2={it.x} y2={it.y + it.drop} stroke="#d99a3a" strokeWidth="2" />
      {it.big ? <g transform={`translate(${it.x} ${it.y + it.drop + 16})`}>
        {Array.from({ length: 10 }, (_, k) => <ellipse key={k} cx="0" cy="-13" rx="7.5" ry="13" fill="url(#mari)" transform={`rotate(${k * 36})`} />)}
        <circle r="7" fill="#c75b12" /><circle r="3.4" fill="#ffd36b" /></g>
        : <g transform={`translate(${it.x} ${it.y + it.drop})`}><path d="M0 0 C-12 6 -12 22 0 30 C12 22 12 6 0 0Z" fill="#2fae74" /><circle cy="34" r="5.5" fill="#ffd36b" stroke="#c98a2c" strokeWidth="1.5" /></g>}
    </g>)}
  </svg>
}
