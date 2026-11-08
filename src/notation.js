import { keyboardKeys, midiLabel } from './theory.js';

const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const naturalPitches = [0, 2, 4, 5, 7, 9, 11];
const syllables = ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ'];

export const CLEFS = [
  { id: 'treble', name: 'ト音記号', glyph: '\uE050', bottomMidi: 64, start: 53, end: 88,
    keyboardStart: 53, keyboardEnd: 88, referenceMidi: 67, referenceStep: 2,
    description: '高い音域を読む記号。下から2本目の線が「ソ（G4）」です。',
    lines: 'ミ・ソ・シ・レ・ファ', spaces: 'ファ・ラ・ド・ミ' },
  { id: 'bass', name: 'ヘ音記号', glyph: '\uE062', bottomMidi: 43, start: 40, end: 60,
    keyboardStart: 36, keyboardEnd: 60, referenceMidi: 53, referenceStep: 6,
    description: '低い音域を読む記号。2つの点の間、上から2本目の線が「ファ（F3）」です。',
    lines: 'ソ・シ・レ・ファ・ラ', spaces: 'ラ・ド・ミ・ソ' },
];

function diatonicIndex(midi) {
  const index = naturalPitches.indexOf(midi % 12);
  if (index < 0 || !Number.isInteger(midi)) throw new Error('Staff notes must be natural notes.');
  return (Math.floor(midi / 12) - 1) * 7 + index;
}

export function staffNote(midi, clefId) {
  const clef = CLEFS.find(item => item.id === clefId);
  if (!clef) throw new Error(`Unknown clef: ${clefId}`);
  const step = diatonicIndex(midi) - diatonicIndex(clef.bottomMidi);
  const index = naturalPitches.indexOf(midi % 12);
  const ledgerSteps = [];
  for (let line = -2; line >= step; line -= 2) ledgerSteps.push(line);
  for (let line = 10; line <= step; line += 2) ledgerSteps.push(line);
  const position = step >= 0 && step <= 8
    ? (step % 2 === 0 ? `下から第${step / 2 + 1}線` : `下から第${(step + 1) / 2}間`)
    : step === -1 ? '第1線のすぐ下' : step === 9 ? '第5線のすぐ上'
      : `${step < 0 ? '下' : '上'}の第${Math.floor((step < 0 ? -step : step - 8) / 2)}加線${step % 2 ? 'の外側' : ''}`;
  return { midi, name: letters[index], label: midiLabel(midi), syllable: syllables[index],
    step, ledgerSteps, position, middleC: midi === 60 };
}

export function staffNotes(clefId) {
  const clef = CLEFS.find(item => item.id === clefId);
  if (!clef) throw new Error(`Unknown clef: ${clefId}`);
  return keyboardKeys(clef.start, clef.end).keys.filter(key => !key.black).map(key => staffNote(key.midi, clefId));
}
