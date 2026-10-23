// ═══════════════════════════════════════════════════════════════
//  ✏️  ALL personal content lives in this file:
//  the 9 chat chapters, the songs, the quiz, the popup, the invite and the home page.
// ═══════════════════════════════════════════════════════════════

// ── 1) SONGS ────────────────────────────────────────────────────
// Every file in /public/audio is already the exact clip that was sent in the chat,
// so a song plays from 0:00 to its own end.  `range` is only the label shown on the card.
// Different part of ONE file?  give the message a clip:  S(..., [from, to]) in seconds.
// A song without `file` (or with a file that is not there yet) shows a silent animated preview.
export const songs = {
  'tara-neno':       { title: 'તારા નેણાનો મને રંગ લાગ્યો', by: 'Aditya Gadhvi',  file: '/audio/tara-neno.mp3',          dur: 26 },
  'naa-na':          { title: 'Naa Na Nahi Aavu',            by: 'Krishna’s pick', file: '/audio/naa-na-nahi-aavu.mp3',   dur: 28, range: '0:07–0:35' },
  'vaa-vaaya':       { title: 'Vaa Vaaya Ne Vadal',          by: 'Aditya Gadhvi',  file: '/audio/vaa-vaaya-ne-vadal.mp3', dur: 15, range: '0:48–1:03' },
  'aavata-jata':     { title: 'Aavata Jata',                 by: 'Krishna’s pick', file: '/audio/aavata-jata.mp3',        dur: 20, missing: true },
  'ramo-boy-intro':  { title: 'Ramo Re',                     by: 'Jigardan Gadhavi', file: '/audio/ramo-re-boy-intro.mp3', dur: 22, range: '0:00–0:24' },
  'ramo-girl-1':     { title: 'Ramo Re',                     by: 'girl part',      file: '/audio/ramo-re-girl-1.mp3',     dur: 31, range: '2:29–3:00' },
  'ramo-boy-line':   { title: 'Ramo Re',                     by: 'boy line',       file: '/audio/ramo-re-boy-line.mp3',   dur: 16, range: '3:00–3:16' },
  'ramo-girl-2':     { title: 'Ramo Re',                     by: 'girl part',      file: '/audio/ramo-re-girl-2.mp3',     dur: 14, range: '3:17–3:31' },
  'rasiya-girl':     { title: 'O Rang Rasiya',               by: 'girl part',      file: '/audio/o-rang-rasiya-girl.mp3', dur: 26 },
  'rasiya-boy':      { title: 'O Rang Rasiya',               by: 'boy part',       file: '/audio/o-rang-rasiya-boy.mp3',  dur: 27 },
  'olya-girl':       { title: 'Olya Mangamta Medama',        by: 'girl part',      file: '/audio/olya-girl.mp3',          dur: 24 },
  'olya-boy':        { title: 'Olya Mangamta Medama',        by: 'boy part',       file: '/audio/olya-boy.mp3',           dur: 26 },
  'der-girl':        { title: 'Der Mari Anguthi No Chor',    by: 'girl part',      file: '/audio/der-girl.mp3',           dur: 25, range: '2:48–3:14' },
  'der-boy':         { title: 'Der Mari Anguthi No Chor',    by: 'boy part',       file: '/audio/der-boy.mp3',            dur: 36, range: '3:16–3:52' },
  'krishna-bhagwan': { title: 'Krishna Bhagwan Chaleya',     by: 'Krishna’s pick', file: '/audio/krishna-bhagwan.mp3',    dur: 32, range: '4:57–5:29' },
}
// Different home-page theme music (null = built-in Navratri theme).
export const themeConfig = { src: null }

// ── 2) THE CONVERSATION — 9 chapters (each one is its own chat page) ──
// K(text, mood, react)  = Krishna says     A(text, mood, react) = Aditya says
// S(who, songId, mood, react, label, [from,to]) = a song sent in the chat
// P(who, 'photo'|'video', mood, react, { src })   = a photo / video snap (add src to show the real file)
// mood = how the SENDER feels · react = how the OTHER person feels
// Moods: happy laugh love shy pout angry jealous annoyed suspicious curious sad cry worried surprised smug neutral
const K = (text, mood, react) => ({ from: 'krishna', text, mood, react })
const A = (text, mood, react) => ({ from: 'me', text, mood, react })
const S = (who, song, mood, react, label, clip) => ({ type: 'song', from: who, song, mood, react, label, clip: clip || [0, songs[song].dur] })
const P = (who, kind, mood, react, more) => ({ type: 'snap', from: who, kind, mood, react, ...more })

export const chapters = [
  { title: 'First message', items: [
    P('krishna', 'photo', 'shy', 'love'),
    A('tare ankho bov ja mast che ❤️', 'love', 'shy'),
    K('thank you 🫠', 'shy', 'happy'),
    S('me', 'tara-neno', 'love', 'shy'),
    A('have aavi photo moklti rehse to mari attention nu shu thase? 😭😂', 'shy', 'smug'),
    A('ankho to already chor che... have dil ni vaat baki che 😏', 'smug', 'shy'),
    K('bas bas, aatlu flirt karvanu bandh kar 😂', 'shy', 'smug'),
  ] },
  { title: 'Second message', items: [
    A('tu mare jode Garba ramva aaves?? 😁', 'happy', 'curious'),
    K('naaaaaaaaa 😭', 'pout', 'surprised'),
    A('kem??', 'curious', 'pout'),
    S('krishna', 'naa-na', 'pout', 'laugh'),
    A('wahh... direct "naa" pan song ma 😂', 'laugh', 'smug'),
    A('etle mare aklo j Garba ramvano?', 'annoyed', 'smug'),
    K('haa, tu eklo j ramje have 😂', 'smug', 'laugh'),
    S('me', 'vaa-vaaya', 'smug', 'shy'),
  ] },
  { title: 'Third message', items: [
    A('tu aaje pan society maa Garba rames?', 'curious', 'neutral'),
    K('haa 😌', 'neutral', 'annoyed'),
    A('ok 😑 (haa, mare jode to tane thodu game che 😂)', 'jealous', 'smug'),
    K('tu aaje mari society maa aaves?', 'curious', 'curious'),
    A('kem??', 'suspicious', 'shy'),
    K('kemmm?? Obviously mara mate 🫣', 'shy', 'surprised'),
    A('kem aavu??? 😂', 'surprised', 'shy'),
    S('krishna', 'aavata-jata', 'smug', 'curious'),
    A('ohhh... etle bolavshe pan sidhu bolvanu nai 😂', 'smug', 'shy'),
    A('samji gayo, Garba nu bahanu che 😏', 'smug', 'shy'),
    K('haan haan, have vadhu smart banvani jarur nathi 😂', 'shy', 'laugh'),
  ] },
  { title: 'Fourth message', items: [
    A('tane Garba ramva vadhare game ke jova game?', 'curious', 'happy'),
    K('obviously, ramva bov jaa game mane 💃🏻', 'happy', 'love'),
    K('kem?? Tane su game?', 'curious', 'shy'),
    A('mane pan Garba ramva vadhare game, pan tu Garba ramti hoy tyare tane jova vadhare game ❤️', 'love', 'shy'),
    K('kem, mane jovi kem game che?', 'suspicious', 'shy'),
    S('me', 'ramo-boy-intro', 'love', 'shy', '💗'),
    A('bas, aa question no answer song ma j samji le 😌', 'shy', 'curious'),
    A('Garba badha ramse, pan mari nazar to ek j jagyae hase 😂', 'love', 'shy'),
    K('haaa, samji gayi hu tari vaat 😂', 'shy', 'love'),
  ] },
  { title: 'Fifth message', sub: 'aapda be vachche kai che?', items: [
    A('aapda be vachche kai che biju? 👀', 'curious', 'curious'),
    K('biju atle??', 'curious', 'suspicious'),
    A('kai biju? 😂', 'smug', 'curious'),
    K('biju su pan??', 'suspicious', 'smug'),
    A('aapde bee su thaye? 👀', 'curious', 'suspicious'),
    K('aapde kai nai lagta... ooh, khota sapna naa banayes 😤', 'annoyed', 'worried'),
    S('krishna', 'ramo-girl-1', 'smug', 'worried'),
    A('😭😭', 'sad', 'smug'),
    K('😏😏😎', 'smug', 'sad'),
    S('me', 'ramo-boy-line', 'love', 'shy'),
    S('krishna', 'ramo-girl-2', 'shy', 'love'),
  ] },
  { title: 'Sixth message', items: [
    K('kale gayo\'to Garba ramva?', 'curious', 'smug'),
    A('haaa gayooo tooo neee 😉', 'smug', 'suspicious'),
    A('kem puche che?', 'suspicious', 'shy'),
    S('krishna', 'rasiya-girl', 'shy', 'love', 'girl part'),
    S('me', 'rasiya-boy', 'love', 'shy', 'boy part'),
    A('aa su che... Garba ni vaat hati ke feelings expose karvani? 😂', 'surprised', 'shy'),
    K('mane kai nathi khabar, song j moklyo che 😂', 'shy', 'smug'),
  ] },
  { title: 'Seventh message', items: [
    S('krishna', 'olya-girl', 'shy', 'curious'),
    A('Aa su? 👀😂', 'curious', 'shy'),
    S('krishna', 'olya-girl', 'annoyed', 'curious', 'same song again 🙄'),
    A('Okkk, have su? 😂', 'curious', 'annoyed'),
    K('tane khabar nai padti 😠', 'angry', 'curious'),
    S('krishna', 'olya-girl', 'annoyed', 'worried', 'same song again 😤'),
    A('Su khabar pade dobiii 😭😂', 'worried', 'pout'),
    K('mane message naa karto 😤', 'angry', 'worried'),
    K('😠😠', 'angry', 'surprised'),
    S('me', 'olya-boy', 'love', 'shy', 'boy version · first line', [0, 13]),
    K('😍😘', 'love', 'love'),
    S('me', 'olya-boy', 'smug', 'shy', 'boy version · second line', [13, 26]),
    K('have khabar pade ne mara doba ne 😁❤️', 'happy', 'smug'),
    A('Haa haa 😂❤️', 'shy', 'happy'),
    K('tane badhu khabar pade, pan tu khali khali natak kare 😂', 'smug', 'suspicious'),
    A('Tari jode thodu to karvu pade 😂🤭', 'smug', 'shy'),
    K('haa, atle that\'s why I like you 😁💗', 'shy', 'surprised'),
    A('Ohooo 😂❤️ sidhu kehta sharam aavti hati?', 'smug', 'shy'),
    K('mara doba 🫠❤️', 'laugh', 'smug'),
    A('Tara j doba chu 😌❤️😂', 'love', 'shy'),
  ] },
  { title: 'Eighth message', items: [
    A('tane ghar nu kaam aavde?', 'curious', 'shy'),
    K('naa, mane nai aavdtu 😂', 'shy', 'laugh'),
    K('kem?', 'curious', 'smug'),
    A('tane ghar nu kaam nai aavdtu to marriage pachi su thase taru? 😂', 'laugh', 'shy'),
    A('taru je thavu hoy e thaye, pan tara husband nu su thase? 😂', 'worried', 'laugh'),
    A('kem nai aavdtu kaam? 😭', 'surprised', 'shy'),
    S('krishna', 'der-girl', 'smug', 'curious'),
    A('🤦🏻😂', 'laugh', 'smug'),
    A('dobiiii... 🫠', 'annoyed', 'smug'),
    S('me', 'der-boy', 'smug', 'shy'),
    K('😁😅', 'shy', 'smug'),
    A('ghar nu kaam nathi aavdtu, pan song thi jawab aapvama PhD che tari 😂❤️', 'laugh', 'shy'),
    A('husband karta pehla mane j tension aavi gayu 😂', 'worried', 'laugh'),
    K('tension naa le, mara husband ne hu sambhali laish 😂', 'smug', 'shy'),
  ] },
  { title: 'Ninth message', items: [
    P('me', 'photo', 'smug', 'curious'),
    A('Barobar che ne???', 'worried', 'happy'),
    K('mast lage 😘❤️', 'love', 'shy'),
    A('bas atlu j? 😭', 'pout', 'laugh'),
    K('haan 😂', 'smug', 'pout'),
    A('😮‍💨 dobii...', 'annoyed', 'laugh'),
    S('krishna', 'krishna-bhagwan', 'happy', 'happy'),
    A('haan, have barobar aavyu ne 😁', 'happy', 'shy'),
    A('🫶🏻', 'love', 'shy'),
    K('🫣🫶🏻', 'shy', 'love'),
    A('have aa "mast lage 😘" ne official approval mali gayu 😌', 'smug', 'shy'),
    K('haan bas, have vadhu overthink nai karto 😂', 'love', 'smug'),
  ] },
]

// ── 2b) THE "HELP ME WITH A SONG NAME" POPUP (after the last chapter) ──
export const songHelp = {
  ask: 'can you help me I don\'t know a song name can you help me',
  yes: 'Yes, I\'ll help 🙋🏻‍♀️', no: 'Not now',
  photo: '/media/song-help.jpg',
  photoText: 'here photo my friend send can you tell me what is song name is???',
  label: 'Your answer', ph: 'Type the song name here…', send: 'send my answer',
  thanks: 'Aww thank you 🫶🏻 noted!',
}

// ── 3) THE QUIZ ────────────────────────────────────────────────
// type: 'single' (radio cards) · 'multi' (checkbox cards) · 'text' (real input boxes)
// correct: letters that count as right. single → any of them is OK; multi → she must pick exactly this set.
// For 'text' questions there is no right/wrong — her typed answers are collected.
const o = (...t) => t.map((text, i) => ({ k: String.fromCharCode(65 + i), text }))
export const quizTitle = { title: 'Aditya × Krishna', sub: 'Funny & Flirty MCQ Quiz 😭😂' }
export const quizQuestions = [
  { id: 1, type: 'single', q: 'Mane khavama su game?? 👀🍴', options: o('Vagareli Khichdi 🤨', 'Badhu j 😭', 'Poha 😌', 'Bhajiya ❤️'), correct: ['D'], ans: 'D. Bhajiya ❤️',
    right: 'Bhajiya!! Tu to mane oli kheech lidhi 😭❤️', wrong: 'Arey naa naa 😭 sachu jawab to Bhajiya ❤️ che!' },
  { id: 2, type: 'single', q: 'Mane free time maa su karvu game? 😌', options: o('Krishna ne message karvo 🫣', 'Krishna jode jagdo karvo 😭😂', 'Drawing karvi 🎨', 'Overthinking karvu 🧠💀'), correct: ['B'], ans: 'B. Krishna jode jagdo karvo 😭😂',
    right: 'Haha sachu!! Jagdo j mari free-time hobby che 😭😂', wrong: 'Nai nai 😂 mane to tari jode jagdo karvo j game che!' },
  { id: 3, type: 'single', q: 'Tu mara vishay su vichare che? 👀❤️', options: o('Time pass... arrange marriage mate chokaro male tya sudhi, pachi block 😭', 'Maro D nu breakup thaye tya sudhi bas time pass 😂', 'College maa koi saru nathi, etle aa chokra jode time pass 😭', 'Mane tu bov j game che 💗'), correct: ['D'], ans: 'D. Mane tu bov j game che 💗',
    right: 'Aww 🫣💗 aa j sachu jawab hato!', wrong: 'Hmm... aa to ghani mushkil thi pass thai 😭 sachu jawab: "Mane tu bov j game che 💗"' },
  { id: 4, type: 'multi', q: 'Hu tara vishay su vicharu chu? 🤨', options: o('Krishna doba jevi che 🫪😂', 'Krishna innocent banvanu natak kare che, but actually che nai 😭', 'Krishna busy hova nu natak kare che, pan ena bf jode hoy che 👀😂', 'Krishna no bf nathi ane e sachhe j busy hoy che 😌'), correct: ['A', 'B', 'C'], ans: 'D sivay badha answers right che 😭😂',
    right: 'Perfect 😭😂 D sivay badha right!', wrong: 'Haha nai 😭 D sivay badha answers right che!' },
  { id: 5, type: 'multi', q: 'Tane hu random day par yaad aavu chu?? 👀💭', options: o('Yes 😌', 'No 😭', 'Haa, bov j yaad aavu chu 🫣❤️', 'Thodi pan yaad nathi aavti... mane to gamto j nathi 😭😂'), correct: ['B', 'D'], ans: 'B, D 😭😂',
    right: 'Ouch 😭😂 pan sachu j!', wrong: 'Sachu jawab: B, D 😭😂' },
  { id: 6, type: 'text', q: 'Tu mane kevi rite ane kaya-kaya moments maa yaad kare che? 👀💭', note: 'Tell me honestly 👀😂', fields: [{ label: 'Answer 1', ph: 'First moment…' }, { label: 'Answer 2', ph: 'Second moment…' }, { label: 'Answer 3', ph: 'Third moment…' }],
    done: 'Aww noted 🫣 mane khabar nathi kem pan mane khushi thai 😭❤️' },
  { id: 7, type: 'multi', q: 'Su tane koi farak pade che ke tu mane late replies kare che? 😭', options: o('Naa, thodo pan nai 😌', 'Hu jaanijoye ne late reply karu chu 😭😂', 'Mara late replies maa j jawab chhupayela hoy che 👀', "I don't care whether you live or die 💀😂"), correct: ['A', 'B', 'C', 'D'], ans: 'All of the above 😭😂',
    right: 'All of the above 😭😂 tu to mane jaanti j hati!', wrong: 'Sachu jawab: All of the above 😭😂' },
  { id: 8, type: 'text', q: 'Te mara mate su gift lidhu che? Kem?? 🫣🎁', note: 'Kem ke have mane bilkul rahevatu nathi 😭😂', fields: [{ label: 'Gift reveal karo, madam 👀🫣', ph: 'Type your answer…', big: true }],
    done: 'Aaahh!! Have mane rahevatu j nathi 😭🎁' },
  { id: 9, type: 'single', q: 'Mare jode aa varsh Garba ramva aaves? 💃🏻🫣', options: o('Naaa, tare jode to nai ja 😭', 'Na, actually mara mummy-papa naa pade che... tare jode to bilkul nai aavu 😂', 'Haa, ramva che ne 🫣❤️', 'Naa, mare mara D jode javanu che 😭😂'), correct: ['A', 'B', 'D'], ans: 'All except C 😂',
    right: 'Haha 😂 C sivay badha answers right che!', wrong: 'Aww 🫣❤️ pan hu to "C" sivay badha answers right gane chu 😭😂' },
  { id: 10, type: 'multi', q: 'What is my biggest red flag according to you? 🚩😭', options: o('24/7 vaat karvi hoy che 😭', 'Flirt karta properly aavdtu nathi 😂', 'Mara mate sara efforts nathi karto 😤', 'Looks maa barobar nathi tu 💀', 'Tu mara D jevo nathi 😭😂'), correct: ['A', 'B', 'C', 'D', 'E'], ans: 'All of the above 💀😂',
    custom: { label: 'But jo taro potano answer hoy to:', ph: 'Write your own answer…' },
    right: 'All of the above 💀😂 ghani badhi red flags 😭', wrong: 'Sachu jawab: All of the above 💀😂', customDone: 'Tara potana answer ni to vaat j alag 😭😂' },
  { id: 11, type: 'multi', q: 'What is my biggest green flag according to you? 💚👀', options: o('Mara problems samje che and overreact nathi karto 😌', 'Mane samje che 🫶🏻', 'Hu aaju-sidhu tari jode j rahu chu... aej taro moto green flag che, kem ke mane tu game che 🫣💗', 'Mane tara jevo chokaro malyo j nathi 😭', 'Tu mara mate perfect che, aej taro biggest green flag che 💚'), correct: ['A', 'B', 'C', 'D', 'E'], ans: 'All of the above 😭💗',
    right: 'All of the above 😭💗 aww!', wrong: 'Sachu jawab: All of the above 😭💗' },
  { id: 12, type: 'multi', q: 'Tu mane gift aapva mate su vicharyu che? 👀🎁', options: o('Male ne, pachi aapish. Taro reaction jovu che 🫣❤️', 'Khali natak karu chu... me gift mate kai vicharyu j nathi 😭😂', 'Kai vadhare expect naa kar, bov saru gift nathi 😭', 'Maru arrange marriage nakki thase pachi aapish... ae pan jo mara husband ne gamyu to. Nai to gift bhuli jaaje 💀😂'), correct: ['A', 'C', 'D'], ans: 'A, C, D 😭😂',
    right: 'Haha A, C, D 😭😂 perfect!', wrong: 'Sachu jawab: A, C, D 😭😂' },
  { id: 13, type: 'text', q: 'What part of my personality pulls you in the most??', note: 'Write it in your own words', fields: [{ label: 'Your answer', ph: 'Type your answer', big: true }],
    done: 'Aww noted 🫶🏻' },
  { id: 14, type: 'text', q: "What's the one moment when you realized you were really attached to me??", note: 'Write it in your own words', fields: [{ label: 'Your answer', ph: 'Type your answer', big: true }],
    done: 'Aww noted 🫶🏻' },
  { id: 15, type: 'text', q: "What's the first thing about me you noticed that you still love?", note: 'Write it in your own words', fields: [{ label: 'Your answer', ph: 'Type your answer', big: true }],
    done: 'Aww noted 🫶🏻' },
  { id: 16, type: 'text', q: "what's the sweetest thing I've ever done for you??", note: 'Write it in your own words', fields: [{ label: 'Your answer', ph: 'Type your answer', big: true }],
    done: 'Aww noted 🫶🏻' },
  { id: 17, type: 'text', q: "What's the memory of us you wish you could experience again for the first time?", note: 'Write it in your own words', fields: [{ label: 'Your answer', ph: 'Type your answer', big: true }],
    done: 'Aww noted 🫶🏻' },
]

// ── 4) THE FINAL INVITATION (shown after the quiz) ───────────────
export const inviteConfig = {
  line1: 'chal', line2: 'mare jode', line3: 'Garba ramva 💃',
  yes: 'Haa chal 💃', no: 'Naa papa nai mane 😤',
  yesNote: 'Chalo then!! 🪔', launching: 'Garba start thay che…',
  noReply: 'ok tane am bhi nai gamto atle excuse kare che', noBack: 'ghare pachi jaie chie…',
  yesDelay: 1800, noDelay: 5200,
}

// ── 5) HOME PAGE — nine nights = nine chapters ──────────────────
// teaser = one real line from that chapter · color = the powder of that night's rangoli ring
export const nights = [
  { teaser: 'bas bas, aatlu flirt karvanu bandh kar 😂', who: 'Krishna', color: '#ffb02e' },
  { teaser: 'haa, tu eklo j ramje have 😂', who: 'Krishna', color: '#f4f0e6' },
  { teaser: 'kemmm?? Obviously mara mate 🫣', who: 'Krishna', color: '#ff4d5e' },
  { teaser: 'Garba badha ramse, pan mari nazar to ek j jagyae hase 😂', who: 'Aditya', color: '#4d7bff' },
  { teaser: 'aapde kai nai lagta... ooh, khota sapna naa banayes 😤', who: 'Krishna', color: '#ffe14d' },
  { teaser: 'mane kai nathi khabar, song j moklyo che 😂', who: 'Krishna', color: '#3fd17a' },
  { teaser: 'haa, atle that\'s why I like you 😁💗', who: 'Krishna', color: '#b36bff' },
  { teaser: 'tension naa le, mara husband ne hu sambhali laish 😂', who: 'Krishna', color: '#ff7ac8' },
  { teaser: 'have aa "mast lage 😘" ne official approval mali gayu 😌', who: 'Aditya', color: '#27d3c3' },
]
