// Tiny in-memory + sessionStorage store for what Krishna types (never throws if storage is blocked).
const KEY = 'navratri-song-answer'
let mem = ''
export const getSongAnswer = () => { try { return sessionStorage.getItem(KEY) || mem } catch { return mem } }
export const setSongAnswer = (v) => { mem = v; try { sessionStorage.setItem(KEY, v) } catch { /* storage blocked */ } }

// One anonymous attempt id per visit, shared by the song-name answer and the quiz so they group together.
const AKEY = 'navratri-attempt-id'
let attempt = ''
const make = () => { try { if (crypto.randomUUID) return crypto.randomUUID() } catch { /* old browser */ } return Array.from({ length: 4 }, () => Math.random().toString(16).slice(2, 10).padEnd(8, '0')).join('-') }
export const getAttemptId = () => { if (attempt) return attempt; try { attempt = sessionStorage.getItem(AKEY) || '' } catch { /* blocked */ } if (!attempt) { attempt = make(); try { sessionStorage.setItem(AKEY, attempt) } catch { /* blocked */ } } return attempt }
export const resetAttemptId = () => { attempt = ''; try { sessionStorage.removeItem(AKEY) } catch { /* blocked */ } return getAttemptId() }
