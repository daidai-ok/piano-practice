/** Pure music theory. Pitch classes use C=0; MIDI 60 is middle C (C4). */
export const ROOTS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
export const ROOT_SPELLINGS = [['C'], ['D♭', 'C♯'], ['D'], ['E♭', 'D♯'], ['E'], ['F'], ['G♭', 'F♯'], ['G'], ['A♭', 'G♯'], ['A'], ['B♭', 'A♯'], ['B']];
export const CIRCLE = ['C', 'G', 'D', 'A', 'E', 'B', 'G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F'];
export const RELATIVE_MINORS = ['Am', 'Em', 'Bm', 'F♯m', 'C♯m', 'G♯m', 'E♭m', 'B♭m', 'Fm', 'Cm', 'Gm', 'Dm'];
export const MINOR_ROOTS = RELATIVE_MINORS.map(name => name.slice(0, -1));
export const SIGNATURES = ['なし', '♯1', '♯2', '♯3', '♯4', '♯5', '♭6', '♭5', '♭4', '♭3', '♭2', '♭1'];
export const FOCUS_QUALITIES = ['maj7', 'm7', '7'];

export const QUALITIES = [
  { id: 'major', symbol: '', name: 'メジャー', group: 'triad', intervals: [0, 4, 7], degrees: [1, 3, 5], formula: ['1', '3', '5'], description: 'ルートに長3度と完全5度を重ねた、明るく安定した響き。まず覚えたい基本の3和音です。' },
  { id: 'minor', symbol: 'm', name: 'マイナー', group: 'triad', intervals: [0, 3, 7], degrees: [1, 3, 5], formula: ['1', '♭3', '5'], description: 'メジャーの3度を半音下げた3和音。3度が変わると、響きの表情が変わります。' },
  { id: 'dim', symbol: 'dim', name: 'ディミニッシュ', group: 'triad', intervals: [0, 3, 6], degrees: [1, 3, 5], formula: ['1', '♭3', '♭5'], description: '短3度を2つ積み重ねた3和音。5度も半音下がり、不安定で緊張感のある響きになります。' },
  { id: 'aug', symbol: 'aug', name: 'オーギュメント', group: 'triad', intervals: [0, 4, 8], degrees: [1, 3, 5], formula: ['1', '3', '♯5'], description: 'メジャーの5度を半音上げた3和音。長3度が重なり、浮遊感のある響きになります。' },
  { id: 'maj7', symbol: 'maj7', name: 'メジャーセブンス', group: 'seventh', intervals: [0, 4, 7, 11], degrees: [1, 3, 5, 7], formula: ['1', '3', '5', '7'], description: 'メジャーコードに長7度を加えた、やわらかく広がる響き。メジャーのⅡ–Ⅴ–Ⅰでは、着地点のⅠに使います。' },
  { id: 'm7', symbol: 'm7', name: 'マイナーセブンス', group: 'seventh', intervals: [0, 3, 7, 10], degrees: [1, 3, 5, 7], formula: ['1', '♭3', '5', '♭7'], description: 'マイナーコードに短7度を加えた4和音。メジャーのⅡ–Ⅴ–Ⅰでは、最初のⅡを担当します。' },
  { id: '7', symbol: '7', name: 'ドミナントセブンス', group: 'seventh', intervals: [0, 4, 7, 10], degrees: [1, 3, 5, 7], formula: ['1', '3', '5', '♭7'], description: 'メジャーコードに短7度を加えた4和音。3度と7度の緊張感が、次のトニックへ向かう動きを生みます。' },
  { id: 'm7b5', symbol: 'm7♭5', name: 'ハーフディミニッシュ', group: 'seventh', intervals: [0, 3, 6, 10], degrees: [1, 3, 5, 7], formula: ['1', '♭3', '♭5', '♭7'], description: 'マイナーセブンスの5度を半音下げた4和音。「ø7」とも表記され、マイナーのⅡ–Ⅴ–ⅠのⅡで使います。' },
  { id: 'dim7', symbol: 'dim7', name: 'ディミニッシュセブンス', group: 'seventh', intervals: [0, 3, 6, 9], degrees: [1, 3, 5, 7], formula: ['1', '♭3', '♭5', '♭♭7'], description: '短3度を3つ積み重ねた4和音。減7度は長7度から2半音下がるため、構成音にダブルフラットが現れることがあります。' },
  { id: 'mMaj7', symbol: 'm(maj7)', name: 'マイナーメジャーセブンス', group: 'seventh', intervals: [0, 3, 7, 11], degrees: [1, 3, 5, 7], formula: ['1', '♭3', '5', '7'], description: 'マイナーコードに長7度を加えた4和音。このツールでは、マイナーのⅡ–Ⅴ–Ⅰの着地点に使います。' },
];

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURALS = [0, 2, 4, 5, 7, 9, 11];
const mod = (value, base = 12) => ((value % base) + base) % base;

export function pitchClass(note) {
  const normalized = note.replaceAll('#', '♯').replaceAll('b', '♭');
  if (!/^[A-G][♯♭]*$/.test(normalized)) throw new Error(`Invalid note: ${note}`);
  const accidental = [...normalized.slice(1)].reduce((n, char) => n + (char === '♯' ? 1 : -1), 0);
  return mod(NATURALS[LETTERS.indexOf(normalized[0])] + accidental);
}

// Spell by diatonic degree, not just pitch class: Cdim7 has B♭♭, not A.
export function spellInterval(root, semitones, degree) {
  const letterIndex = mod(LETTERS.indexOf(root[0]) + degree - 1, 7);
  const target = mod(pitchClass(root) + semitones);
  let offset = mod(target - NATURALS[letterIndex]);
  if (offset > 6) offset -= 12;
  return LETTERS[letterIndex] + (offset < 0 ? '♭'.repeat(-offset) : '♯'.repeat(offset));
}

export function getChord(root, qualityId, octave = 3) {
  const quality = QUALITIES.find(item => item.id === qualityId);
  if (!quality) throw new Error(`Unknown chord quality: ${qualityId}`);
  const rootMidi = 12 * (octave + 1) + pitchClass(root);
  return {
    root, quality, symbol: root + quality.symbol,
    notes: quality.intervals.map((interval, index) => ({
      name: spellInterval(root, interval, quality.degrees[index]),
      midi: rootMidi + interval,
      pitchClass: mod(rootMidi + interval),
      degree: quality.formula[index],
      isRoot: index === 0,
    })),
  };
}

export function getProgression(root, mode = 'major') {
  if (!['major', 'minor'].includes(mode)) throw new Error(`Unknown mode: ${mode}`);
  const minor = mode === 'minor';
  return [
    { ...getChord(spellInterval(root, 2, 2), minor ? 'm7b5' : 'm7'), roman: minor ? 'iiø7' : 'ii7', role: '準備', functionName: 'サブドミナント' },
    { ...getChord(spellInterval(root, 7, 5), '7'), roman: 'V7', role: '緊張', functionName: 'ドミナント' },
    { ...getChord(root, minor ? 'mMaj7' : 'maj7'), roman: minor ? 'i(maj7)' : 'Imaj7', role: '解決', functionName: 'トニック' },
  ];
}

export const INVERSION_NAMES = ['基本形', '第1転回形', '第2転回形', '第3転回形'];

/** Closed-position inversions, retaining every chord tone exactly once. */
export function chordVoicings(chord, minMidi = 48, maxMidi = 72) {
  const result = [];
  chord.notes.forEach((bass, inversion) => {
    const order = [...chord.notes.slice(inversion), ...chord.notes.slice(0, inversion)];
    for (let bassMidi = minMidi; bassMidi <= maxMidi; bassMidi++) {
      if (mod(bassMidi) !== bass.pitchClass) continue;
      const notes = order.map(note => ({ ...note, midi: bassMidi + mod(note.pitchClass - bass.pitchClass) }));
      if (notes.at(-1).midi <= maxMidi) result.push({ ...chord, notes, inversion, positionName: INVERSION_NAMES[inversion] });
    }
  });
  return result;
}

/** The four voices are paired from lowest to highest, without crossing. */
export function voiceMovement(from, to) {
  if (from.notes.length !== to.notes.length) throw new Error('Voice counts must match');
  const distances = from.notes.map((note, index) => Math.abs(to.notes[index].midi - note.midi));
  return { total: distances.reduce((sum, value) => sum + value, 0), largest: Math.max(...distances) };
}

export function getVoicedProgression(root, mode = 'major', voicing = 'root') {
  if (!['root', 'connected'].includes(voicing)) throw new Error(`Unknown voicing: ${voicing}`);
  const chords = getProgression(root, mode).map(chord => ({ ...chord, inversion: 0, positionName: INVERSION_NAMES[0] }));
  if (voicing === 'root') return chords;

  // Keep ii in the familiar root position. Compare every V/I inversion pair
  // within C3–C5, minimizing total semitone movement across BOTH transitions.
  // Break ties by the largest single-voice leap, then simpler final inversions.
  let best = null;
  let bestScore = null;
  for (const dominant of chordVoicings(chords[1])) {
    for (const tonic of chordVoicings(chords[2])) {
      const first = voiceMovement(chords[0], dominant);
      const second = voiceMovement(dominant, tonic);
      const score = [first.total + second.total, Math.max(first.largest, second.largest), tonic.inversion, dominant.inversion];
      const difference = bestScore ? score.findIndex((value, index) => value !== bestScore[index]) : -1;
      if (!best || (difference >= 0 && score[difference] < bestScore[difference])) {
        best = [chords[0], dominant, tonic];
        bestScore = score;
      }
    }
  }
  return best;
}

export function getScale(root, mode = 'major', octave = 3) {
  if (!['major', 'minor'].includes(mode)) throw new Error(`Unknown mode: ${mode}`);
  const intervals = mode === 'major' ? [0, 2, 4, 5, 7, 9, 11, 12] : [0, 2, 3, 5, 7, 8, 10, 12];
  const degrees = mode === 'major' ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['1', '2', '♭3', '4', '5', '♭6', '♭7', '8'];
  const rootMidi = 12 * (octave + 1) + pitchClass(root);
  return {
    root, mode,
    symbol: `${root} ${mode === 'major' ? 'major' : 'natural minor'}`,
    name: mode === 'major' ? 'メジャースケール' : 'ナチュラルマイナースケール',
    steps: mode === 'major' ? ['全', '全', '半', '全', '全', '全', '半'] : ['全', '半', '全', '全', '半', '全', '全'],
    notes: intervals.map((interval, index) => ({
      name: spellInterval(root, interval, index + 1),
      midi: rootMidi + interval,
      pitchClass: mod(rootMidi + interval),
      degree: degrees[index],
      isRoot: index === 0 || index === 7,
    })),
  };
}

export function circleTonic(root, mode) {
  return (mode === 'minor' ? MINOR_ROOTS : CIRCLE).find(note => pitchClass(note) === pitchClass(root));
}

// Move anticlockwise around the circle: C → F → B♭ → … → G → C.
export function practiceKey(root, direction = 1, mode = 'major') {
  const index = CIRCLE.findIndex(note => pitchClass(note) === pitchClass(root));
  const next = CIRCLE[mod(index - direction, CIRCLE.length)];
  return circleTonic(next, mode);
}

export function midiLabel(midi) {
  return ROOTS[mod(midi)] + (Math.floor(midi / 12) - 1);
}

export function keyboardKeys(start = 48, end = 72) {
  const keys = [];
  let whiteIndex = 0;
  for (let midi = start; midi <= end; midi++) {
    const black = !NATURALS.includes(mod(midi));
    keys.push({ midi, black, position: black ? whiteIndex - 0.31 : whiteIndex, label: midiLabel(midi) });
    if (!black) whiteIndex++;
  }
  return { keys, whiteCount: whiteIndex };
}
