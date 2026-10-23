/**
 * PlayGarba Garba Circle faces
 * The twelve faces a host can give a Garba Circle: bandhani pagdis, bindis, jhumkas and odhnis.
 * These are the same drawings as the Immersive player's faces (public-site/garbo/prototype/lives.js);
 * validate-runtime-packaging keeps the two copies identical.
 */

// faces:start
var SKIN = ['#e0a56f', '#c98a57', '#b87a47', '#a56a3a'];
var AVATARS = [
  { label: 'Woman with a flower in her hair', w: 1, skin: 1, hair: 'bun', flower: 1, garment: '#c2185b' },
  { label: 'Man in a bandhani pagdi', skin: 2, turban: ['#d8453a', '#f0b429', '#2f8f5b'], beard: 1, garment: '#f3e6d0', stole: '#d8453a' },
  { label: 'Woman with a long braid', w: 1, skin: 0, hair: 'braid', garment: '#2f8f5b', odhni: '#f0b429' },
  { label: 'Young man in a yellow kurta', skin: 1, hair: 'short', garment: '#f0b429', stole: '#c2185b' },
  { label: 'Man with curly hair and a beard', skin: 2, hair: 'curly', beard: 1, garment: '#2f8f5b', stole: '#c2185b' },
  { label: 'Woman with long wavy hair', w: 1, skin: 1, hair: 'long', garment: '#7b3fa0', odhni: '#f0b429' },
  { label: 'Man in a red pagdi', skin: 1, turban: ['#d8453a', '#f08a24', '#b8312b'], moustache: 1, garment: '#f3e6d0' },
  { label: 'Woman with curls pinned up', w: 1, skin: 3, hair: 'curlybun', garment: '#2f8f5b' },
  { label: 'Woman in a yellow odhni', w: 1, skin: 0, hair: 'long', garment: '#f0b429', odhni: '#d8453a' },
  { label: 'Man with glasses', skin: 1, hair: 'short', glasses: 1, beard: 1, garment: '#2f5fa8', stole: '#f0b429' },
  { label: 'Woman with her odhni over her head', w: 1, skin: 1, veil: ['#2f8f5b', '#d8453a'], garment: '#2f8f5b' },
  { label: 'Man in a white pagdi', skin: 2, turban: ['#f3e6d0', '#d8453a', '#2f8f5b'], beard: 1, garment: '#f3e6d0' }
];
var INK = '#2a1a12', HAIR = '#23150e', uid = 0;

function dots(pts, r, fill) { return pts.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="' + (fill || '#fff6e6') + '"/>'; }).join(''); }
function avatarSVG(i) {
  var a = AVATARS[((i % AVATARS.length) + AVATARS.length) % AVATARS.length], skin = SKIN[a.skin], id = 'av' + (++uid), o = [];
  var S = ' stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"';
  o.push('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">');
  // Hair and odhni that fall behind the shoulders
  if (a.veil) o.push('<path d="M20 100 C16 70 20 30 50 14 C80 30 84 70 80 100 Z" fill="' + a.veil[0] + '"' + S + '/><path d="M24 96 C21 70 25 36 50 20 C75 36 79 70 76 96" fill="none" stroke="' + a.veil[1] + '" stroke-width="3"/>' + dots([[27, 60], [30, 44], [38, 30], [50, 24], [62, 30], [70, 44], [73, 60], [75, 78], [25, 78]], 1.3));
  if (a.hair === 'long') o.push('<path d="M27 42 C22 64 26 82 20 94 L80 94 C74 82 78 64 73 42 Z" fill="' + HAIR + '"' + S + '/>');
  if (a.hair === 'braid') o.push('<g fill="' + HAIR + '"' + S + '><ellipse cx="31" cy="64" rx="6" ry="7"/><ellipse cx="30" cy="76" rx="5.5" ry="6.5"/><ellipse cx="31" cy="87" rx="5" ry="6"/></g>');
  if (a.hair === 'bun') o.push('<circle cx="70" cy="40" r="11" fill="' + HAIR + '"' + S + '/>' + (a.flower ? dots([[74, 34], [78, 39], [76, 45], [71, 47]], 2.6, '#fff8ec') : ''));
  if (a.hair === 'curlybun') o.push('<g fill="' + HAIR + '"' + S + '><circle cx="50" cy="19" r="11"/><circle cx="40" cy="22" r="6"/><circle cx="60" cy="22" r="6"/></g>');
  // Shoulders: kurta, kediyu or choli, with a bandhani trim
  o.push('<path d="M12 100 C14 83 28 76 50 76 C72 76 86 83 88 100 Z" fill="' + a.garment + '"' + S + '/>');
  o.push('<path d="M42 76 L50 88 L58 76" fill="' + (a.w ? skin : '#fff6e6') + '"' + S + '/>');
  if (a.odhni) o.push('<path d="M14 94 C30 82 62 86 88 97 L88 100 L13 100 Z" fill="' + a.odhni + '"' + S + '/>' + dots([[24, 91], [34, 88], [46, 88], [58, 89], [70, 92], [80, 95]], 1.2));
  if (a.stole) o.push('<path d="M30 80 L38 77 L42 100 L33 100 Z M70 80 L62 77 L58 100 L67 100 Z" fill="' + a.stole + '"' + S + '/>' + dots([[36, 86], [37, 94], [64, 86], [63, 94]], 1.1));
  if (!a.odhni && !a.stole) o.push(dots([[22, 92], [30, 86], [70, 86], [78, 92], [50, 95]], 1.2));
  // Neck, ears and jhumkas, face
  o.push('<rect x="44" y="62" width="12" height="16" fill="' + skin + '"' + S + '/>');
  o.push('<circle cx="29" cy="49" r="5" fill="' + skin + '"' + S + '/><circle cx="71" cy="49" r="5" fill="' + skin + '"' + S + '/>');
  if (a.w) o.push('<g fill="#e8a52a" stroke="' + INK + '" stroke-width="1.4"><path d="M26 54 h6 l2.5 7 h-11 Z"/><path d="M68 54 h6 l2.5 7 h-11 Z"/></g>' + dots([[26, 62.5], [29, 63], [32, 62.5], [68, 62.5], [71, 63], [74, 62.5]], 0.9, '#e8a52a'));
  o.push('<ellipse cx="50" cy="47" rx="21" ry="23" fill="' + skin + '"' + S + '/>');
  // Hair, curls or a pagdi on top
  if (a.turban) {
    o.push('<clipPath id="' + id + '"><path d="M25 45 C20 22 38 11 50 11 C63 11 81 20 75 45 C66 35 34 35 25 45 Z"/></clipPath>');
    o.push('<g clip-path="url(#' + id + ')"><rect x="15" y="5" width="70" height="45" fill="' + a.turban[0] + '"/>');
    o.push('<path d="M10 40 L70 6 L80 12 L20 46 Z" fill="' + a.turban[1] + '"/><path d="M30 46 L86 16 L90 26 L40 50 Z" fill="' + a.turban[2] + '"/>');
    o.push(dots([[32, 22], [42, 17], [56, 16], [66, 21], [30, 34], [46, 28], [60, 30], [70, 34], [38, 38]], 1.2) + '</g>');
    o.push('<path d="M25 45 C20 22 38 11 50 11 C63 11 81 20 75 45 C66 35 34 35 25 45 Z" fill="none"' + S + '/><path d="M26 44 C40 34 60 34 74 44" fill="none" stroke="' + INK + '" stroke-width="1.6"/>');
  } else if (a.veil) {
    o.push('<path d="M29 46 C28 30 40 24 50 24 C60 24 72 30 71 46 C66 37 57 32 50 31 C43 32 34 37 29 46 Z" fill="' + HAIR + '"' + S + '/>');
  } else if (a.w) {
    o.push('<path d="M28 47 C26 28 40 22 50 22 C60 22 74 28 72 47 C67 36 57 31 50 30 C43 31 33 36 28 47 Z" fill="' + HAIR + '"' + S + '/><path d="M50 23 L50 30" stroke="' + skin + '" stroke-width="1.6"/>');
  } else if (a.hair === 'curly') {
    o.push('<g fill="' + HAIR + '"' + S + '><path d="M28 46 C25 27 40 20 51 21 C63 21 76 28 72 46 C68 36 60 32 50 32 C41 32 33 36 28 46 Z"/><circle cx="33" cy="28" r="6"/><circle cx="42" cy="22" r="6"/><circle cx="53" cy="20" r="6"/><circle cx="64" cy="24" r="6"/><circle cx="70" cy="33" r="5"/></g>');
  } else {
    o.push('<path d="M28 45 C25 25 42 18 53 20 C65 21 76 29 72 45 C68 34 60 30 49 31 C41 31 33 35 28 45 Z" fill="' + HAIR + '"' + S + '/>');
  }
  // Beard under the mouth
  if (a.beard) o.push('<path d="M29 50 C29 66 39 73 50 73 C61 73 71 66 71 50 C67 60 60 63 50 63 C40 63 33 60 29 50 Z" fill="' + HAIR + '"' + S + '/>');
  // Eyes, brows, nose, cheeks, smile
  o.push('<circle cx="42" cy="48" r="2.7" fill="' + INK + '"/><circle cx="58" cy="48" r="2.7" fill="' + INK + '"/>');
  o.push('<path d="M37.5 42 Q42 39.5 46 41.5 M54 41.5 Q58 39.5 62.5 42" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>');
  o.push('<path d="M50 50 Q47.5 55 51 56" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>');
  o.push('<circle cx="37" cy="55" r="3.6" fill="#e0785f" opacity=".45"/><circle cx="63" cy="55" r="3.6" fill="#e0785f" opacity=".45"/>');
  if (a.beard) o.push('<ellipse cx="50" cy="61.5" rx="8.5" ry="4.6" fill="' + skin + '"/><path d="M40 58.5 Q50 53.5 60 58.5 Q50 57 40 58.5 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="1.2"/>');
  if (a.moustache) o.push('<path d="M42.5 60 Q50 55 57.5 60 Q50 58.5 42.5 60 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="1.4"/>');
  o.push('<path d="M43.5 60.5 Q50 66 56.5 60.5 Q50 63 43.5 60.5 Z" fill="#8a2a1c" stroke="' + INK + '" stroke-width="1.4" stroke-linejoin="round"/>');
  if (a.glasses) o.push('<g fill="none" stroke="' + INK + '" stroke-width="2"><circle cx="42" cy="48" r="6.2"/><circle cx="58" cy="48" r="6.2"/><path d="M48.2 48 H51.8 M35.8 47 L30 45 M64.2 47 L70 45"/></g>');
  if (a.w) o.push('<circle cx="50" cy="37" r="1.9" fill="#c0392b"/>');
  o.push('</svg>');
  return o.join('');
}
// faces:end

export const CIRCLE_FACE_COUNT = AVATARS.length;

/** The accessible description of face `index`, or '' when there is no such face. */
export function circleFaceLabel(index) {
  return Number.isInteger(index) && index >= 0 && index < AVATARS.length ? AVATARS[index].label : '';
}

/** The face as SVG markup built only from the fixed drawings above. */
export function circleFaceSvg(index) {
  return avatarSVG(index);
}
