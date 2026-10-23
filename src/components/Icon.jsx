export function Icon({ name, size = 18, strokeWidth = 1.8, className = '' }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className }
  const paths = {
    arrow: <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></>,
    arrowUp: <><path d="M7 17 17 7" /><path d="M7 7h10v10" /></>,
    down: <><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></>,
    heart: <path d="M20.8 8.8c0 5.5-8.8 10.3-8.8 10.3S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />,
    sparkle: <><path d="m12 3-1.3 5.7L5 10l5.7 1.3L12 17l1.3-5.7L19 10l-5.7-1.3L12 3Z" /><path d="m19 16-.6 2.4L16 19l2.4.6L19 22l.6-2.4L22 19l-2.4-.6L19 16Z" /></>,
    flower: <><path d="M12 12c-4.8 0-7-2.1-7-4.5S7.3 4 9.3 4c1.6 0 2.7 1.1 2.7 3.1C12 5.1 13.1 4 14.7 4 16.7 4 19 5.1 19 7.5S16.8 12 12 12Z" /><path d="M12 12c0 4.8-2.1 7-4.5 7S4 16.7 4 14.7c0-1.6 1.1-2.7 3.1-2.7C5.1 12 4 10.9 4 9.3 4 7.3 5.1 5 7.5 5S12 7.2 12 12Z" /><circle cx="12" cy="12" r="1.8" /></>,
    check: <path d="m5 12 4 4L19 6" />, x: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    refresh: <><path d="M20 11a8.1 8.1 0 0 0-14.8-4L3 10" /><path d="M3 5v5h5" /><path d="M4 13a8.1 8.1 0 0 0 14.8 4L21 14" /><path d="M21 19v-5h-5" /></>,
    phone: <path d="M5.5 4.5 8 3l2.5 5-2 1.5a14 14 0 0 0 6.5 6.5l1.5-2 5 2.5-1.5 2.5c-.6 1-1.7 1.4-2.8 1.1C10.5 18.5 5.5 13.5 3.4 6.8c-.3-1.1.1-2.3 1.1-2.8Z" />,
    video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
    camera: <><path d="M4 7h3l1.5-2h7L17 7h3v11H4Z" /><circle cx="12" cy="12" r="3" /></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></>,
    smile: <><circle cx="12" cy="12" r="9" /><path d="M8 14s1.3 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></>,
    cards: <><rect x="6" y="5" width="12" height="15" rx="2" /><path d="M9 3h7a2 2 0 0 1 2 2M9 9h6M9 13h4" /></>,
    game: <><path d="m7 9 3-2h4l3 2 3 7c.5 1.4-1 2.7-2.2 1.8L15 15H9l-2.8 2.8C5 18.7 3.5 17.4 4 16Z" /><path d="M8 11v4M6 13h4M16 12h.01M18 14h.01" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" />, pause: <><path d="M8 5v14M16 5v14" /></>,
    back: <path d="m15 5-7 7 7 7" />,
    chevUp: <path d="m6 15 6-6 6 6" />, chevDown: <path d="m6 9 6 6 6-6" />,
    menu: <><path d="M5 7h14M5 12h14M5 17h14" /></>, circle: <circle cx="12" cy="12" r="7" />,
    volume: <><path d="M4 10v4h4l5 4V6l-5 4H4Z" /><path d="M16 9.5a4 4 0 0 1 0 5" /><path d="M18.5 7a7.5 7.5 0 0 1 0 10" /></>,
    note: <><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}
