import { QUALITIES, ROOT_SPELLINGS, SCALE_TYPES, circleTonic } from './theory.js';
import { CLEFS, staffNotes } from './notation.js';
import { viewForPath } from './routes.js';

const STORAGE_KEY = 'voicing-settings';
const ROOT_NAMES = ROOT_SPELLINGS.flat();

export function createAppState(pathname, storage = undefined) {
  let saved = {};
  try {
    const localStorage = storage ?? globalThis.localStorage;
    saved = JSON.parse(localStorage?.getItem(STORAGE_KEY) || '{}') || {};
  } catch { /* Storage is optional. */ }

  const state = {
    view: viewForPath(pathname) ?? (['circle', 'scales', 'reading'].includes(saved.view) ? saved.view : 'chords'),
    root: ROOT_NAMES.includes(saved.root) ? saved.root : 'C',
    quality: QUALITIES.some(item => item.id === saved.quality) ? saved.quality : 'maj7',
    tonic: ROOT_NAMES.includes(saved.tonic) ? saved.tonic : 'C',
    scaleRoot: ROOT_NAMES.includes(saved.scaleRoot) ? saved.scaleRoot : 'C',
    scaleType: SCALE_TYPES.some(scale => scale.id === saved.scaleType) ? saved.scaleType : 'major',
    mode: saved.mode === 'minor' ? 'minor' : 'major',
    voicing: saved.voicing === 'connected' ? 'connected' : 'root',
    reading: Object.fromEntries(CLEFS.map(clef => [
      clef.id,
      staffNotes(clef.id).some(note => note.midi === saved.reading?.[clef.id])
        ? saved.reading[clef.id]
        : clef.referenceMidi,
    ])),
    playing: null,
  };
  state.tonic = circleTonic(state.tonic, state.mode);
  return state;
}

export function persistAppState(state, storage = undefined) {
  const { playing, ...settings } = state;
  try {
    const localStorage = storage ?? globalThis.localStorage;
    localStorage?.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch { /* Private browsing can disable storage. */ }
}

/** Apply a user action without touching the DOM, browser history, or audio. */
export function transitionAppState(state, action, value, progression = []) {
  const next = { ...state };
  switch (action) {
    case 'root': next.root = value; break;
    case 'quality': next.quality = value; break;
    case 'tonic-major': next.tonic = value; next.mode = 'major'; break;
    case 'tonic-minor': next.tonic = value; next.mode = 'minor'; break;
    case 'scale-root': next.scaleRoot = value; break;
    case 'scale-type': next.scaleType = value; break;
    case 'mode': next.mode = value; next.tonic = circleTonic(state.tonic, value); break;
    case 'voicing': next.voicing = value; break;
    case 'view': next.view = value; break;
    case 'reading-note':
      next.reading = { ...state.reading, [value.clef]: value.midi };
      break;
    case 'reading-middle':
      next.reading = { ...state.reading, treble: 60, bass: 60 };
      break;
    case 'to-circle':
      next.tonic = circleTonic(state.root, state.mode);
      next.view = 'circle';
      break;
    case 'home': next.view = 'chords'; break;
    case 'inspect': {
      const chord = progression[Number(value)];
      if (!chord) return state;
      next.root = chord.root;
      next.quality = chord.quality.id;
      next.view = 'chords';
      break;
    }
    default: return state;
  }
  return next;
}
