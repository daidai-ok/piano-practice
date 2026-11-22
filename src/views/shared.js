import { keyboardKeys, midiLabel } from '../theory.js';
import { CLEFS } from '../notation.js';

const icons = {
  keyboard: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14m8-14v14M7 5v7h3V5m4 0v7h3V5"/>',
  circle: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3m9 6h-3m-6 9v-3m-9-6h3"/>',
  play: '<path d="m9 5 11 7-11 7Z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  sound: '<path d="m11 4-5 4H3v8h3l5 4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  notes: '<path d="M8 17V5l11-2v12M8 8l11-2"/><ellipse cx="5" cy="17" rx="3" ry="2"/><ellipse cx="16" cy="15" rx="3" ry="2"/>',
  book: '<path d="M12 6v15m0-15C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-4-1-7-1-10 2Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};

export const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;

export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function renderKeyboard(chord, id, compact = false, options = {}) {
  const start = options.start ?? 48;
  const end = options.end ?? 72;
  const { keys, whiteCount } = keyboardKeys(start, end);
  const middleMidi = keys.filter(key => !key.black)[Math.floor(whiteCount / 2)].midi;
  const clef = CLEFS.find(item => item.id === options.clef);
  const register = midi => `${midiLabel(midi)}${midi === 60 ? ' <span class="middle-c">中央ド</span>' : ''}`;
  return `<div class="keyboard-wrap ${compact ? 'compact' : ''}">
    <div class="piano" role="group" aria-label="${escapeHtml(chord.symbol)}の鍵盤。色の付いた鍵盤が${options.reading ? '選択中の音' : '構成音'}" style="--white-count:${whiteCount}">
      ${keys.map(key => {
        const note = chord.notes.find(note => note.midi === key.midi);
        const readingKey = clef && !key.black && key.midi >= clef.start && key.midi <= clef.end;
        return `<button type="button" class="piano-key ${key.black ? 'black' : 'white'} ${note ? 'chord-tone' : ''} ${note?.isRoot ? 'root-tone' : ''}" style="--key-position:${key.position}" data-action="${readingKey ? 'reading-note' : 'note'}" ${clef ? `data-clef="${clef.id}"` : ''} data-midi="${key.midi}" data-focus="${id}-key-${key.midi}" tabindex="${key.midi === chord.notes[0].midi ? 0 : -1}" aria-label="${escapeHtml(note ? options.reading ? `${note.syllable}、${note.label}、選択中の音` : `${note.name}、${note.degree}度、${midiLabel(key.midi)}、構成音` : key.label)}">
          ${note && !options.reading ? `<span class="key-degree">${note.isRoot ? 'R' : note.degree}</span>` : ''}
          <span class="key-label">${escapeHtml(options.reading ? key.label : note?.name || key.label.replace(/\d/, ''))}</span>
        </button>`;
      }).join('')}
    </div>
    <div class="keyboard-register"><span>${register(start)}</span><span>${register(middleMidi)}</span><span>${register(end)}</span></div>
  </div>`;
}

export function renderChordSymbol(chord) {
  return `${escapeHtml(chord.root)}<span>${escapeHtml(chord.quality.symbol)}</span>`;
}
