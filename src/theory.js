/** Pure music theory. Pitch classes use C=0; MIDI 60 is middle C (C4). */
export const ROOTS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
export const ROOT_SPELLINGS = [['C'], ['D♭', 'C♯'], ['D'], ['E♭', 'D♯'], ['E'], ['F'], ['G♭', 'F♯'], ['G'], ['A♭', 'G♯'], ['A'], ['B♭', 'A♯'], ['B']];
export const CIRCLE = ['C', 'G', 'D', 'A', 'E', 'B', 'G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F'];
export const RELATIVE_MINORS = ['Am', 'Em', 'Bm', 'F♯m', 'C♯m', 'G♯m', 'E♭m', 'B♭m', 'Fm', 'Cm', 'Gm', 'Dm'];
export const MINOR_ROOTS = RELATIVE_MINORS.map(name => name.slice(0, -1));
export const SIGNATURES = ['なし', '♯1', '♯2', '♯3', '♯4', '♯5', '♭6', '♭5', '♭4', '♭3', '♭2', '♭1'];
export const FOCUS_QUALITIES = ['maj7', 'm7', '7'];
export const SCALE_TYPES = [
  { id: 'major', label: 'メジャー' },
  { id: 'melodicMinor', label: 'メロディックマイナー' },
  { id: 'majorPentatonic', label: 'メジャーペンタ' },
  { id: 'minorPentatonic', label: 'マイナーペンタ' },
  { id: 'blues', label: 'ブルース' },
  { id: 'diminishedWholeHalf', label: 'ディミニッシュ 全・半' },
  { id: 'diminishedHalfWhole', label: 'ディミニッシュ 半・全' },
];

export const QUALITIES = [
  { id: 'major', symbol: '', name: 'メジャー', group: 'triad', intervals: [0, 4, 7], degrees: [1, 3, 5], formula: ['1', '3', '5'], description: 'ルートに長3度と完全5度を重ねた、明るく安定した響き。まず覚えたい基本の3和音です。' },
  { id: 'minor', symbol: 'm', name: 'マイナー', group: 'triad', intervals: [0, 3, 7], degrees: [1, 3, 5], formula: ['1', '♭3', '5'], description: 'メジャーの3度を半音下げた3和音。3度が変わると、響きの表情が変わります。' },
  { id: 'sus2', symbol: 'sus2', name: 'サスペンデッド2', group: 'triad', intervals: [0, 2, 7], degrees: [1, 2, 5], formula: ['1', '2', '5'], description: '3度の代わりに2度を使ったコード。3度を含まず、明るさや暗さを決めない開放的な響きです。' },
  { id: 'sus4', symbol: 'sus4', name: 'サスペンデッド4', group: 'triad', intervals: [0, 5, 7], degrees: [1, 4, 5], formula: ['1', '4', '5'], description: '3度の代わりに4度を使ったコード。3度を含まず、解決を待つような開放的な響きです。' },
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

/** Two-hand rootless II–V–I: split a standard A/B four-note voicing across both hands. */
export function getRootlessProgression(root, mode = 'major', type = 'A') {
  if (!['A', 'B'].includes(type)) throw new Error(`Unknown rootless voicing type: ${type}`);
  return getProgression(root, mode).map((chord, index) => {
    // Add a 9th to the four chord tones. In minor, the dominant commonly uses b9.
    const ninthInterval = mode === 'minor' && index === 1 ? 13 : 14;
    const ninth = {
      name: spellInterval(chord.root, ninthInterval, 9),
      pitchClass: mod(pitchClass(chord.root) + ninthInterval),
      degree: ninthInterval === 13 ? '♭9' : '9',
      isRoot: false,
    };
    const thirteenth = {
      name: spellInterval(chord.root, 21, 13),
      pitchClass: mod(pitchClass(chord.root) + 21),
      degree: '13',
      isRoot: false,
    };
    // A/B names the full ii–V–I path: ii and I use the selected shape, V alternates.
    const positionType = index === 1 ? (type === 'A' ? 'B' : 'A') : type;
    const [, third, fifth, seventh] = chord.notes;
    const alternateFifth = index === 1 && mode !== 'minor' ? thirteenth : fifth;
    const ordered = positionType === 'A'
      ? [third, alternateFifth, seventh, ninth]
      : [seventh, ninth, third, alternateFifth];

    // Keep both patterns in a comfortable middle register, starting at A2 or above.
    let previousMidi = 44;
    const notes = ordered.map((note, noteIndex) => {
      let midi;
      if (noteIndex === 0) {
        midi = 45 + mod(note.pitchClass - mod(45));
      } else {
        const semitones = mod(note.pitchClass - mod(previousMidi));
        midi = previousMidi + (semitones || 12);
      }
      previousMidi = midi;
      return { ...note, midi, isRoot: false };
    });
    return {
      ...chord,
      notes,
      inversion: positionType === 'A' ? 1 : 3,
      positionName: `${positionType}タイプ`,
      rootlessType: positionType,
      progressionType: type,
    };
  });
}

const SCALE_DEFINITIONS = {
  major: {
    name: 'メジャースケール', symbol: 'major',
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    degrees: ['1', '2', '3', '4', '5', '6', '7', '8'],
    spellings: [1, 2, 3, 4, 5, 6, 7, 8],
    steps: ['全', '全', '半', '全', '全', '全', '半'],
  },
  minor: {
    name: 'ナチュラルマイナースケール', symbol: 'natural minor',
    intervals: [0, 2, 3, 5, 7, 8, 10, 12],
    degrees: ['1', '2', '♭3', '4', '5', '♭6', '♭7', '8'],
    spellings: [1, 2, 3, 4, 5, 6, 7, 8],
    steps: ['全', '半', '全', '全', '半', '全', '全'],
  },
  melodicMinor: {
    name: 'メロディックマイナースケール', symbol: 'melodic minor',
    intervals: [0, 2, 3, 5, 7, 9, 11, 12],
    degrees: ['1', '2', '♭3', '4', '5', '6', '7', '8'],
    spellings: [1, 2, 3, 4, 5, 6, 7, 8],
    steps: ['全', '半', '全', '全', '全', '全', '半'],
  },
  majorPentatonic: {
    name: 'メジャーペンタトニックスケール', symbol: 'major pentatonic',
    intervals: [0, 2, 4, 7, 9, 12],
    degrees: ['1', '2', '3', '5', '6', '8'],
    spellings: [1, 2, 3, 5, 6, 8],
    steps: ['全', '全', '短3', '全', '短3'],
  },
  minorPentatonic: {
    name: 'マイナーペンタトニックスケール', symbol: 'minor pentatonic',
    intervals: [0, 3, 5, 7, 10, 12],
    degrees: ['1', '♭3', '4', '5', '♭7', '8'],
    spellings: [1, 3, 4, 5, 7, 8],
    steps: ['短3', '全', '全', '短3', '全'],
  },
  blues: {
    name: 'ブルーススケール', symbol: 'blues',
    intervals: [0, 3, 5, 6, 7, 10, 12],
    degrees: ['1', '♭3', '4', '♭5', '5', '♭7', '8'],
    spellings: [1, 3, 4, 5, 5, 7, 8],
    steps: ['短3', '全', '半', '半', '短3', '全'],
  },
  diminishedWholeHalf: {
    name: 'ディミニッシュスケール（全音・半音）', symbol: 'whole-half diminished',
    intervals: [0, 2, 3, 5, 6, 8, 9, 11, 12],
    degrees: ['1', '2', '♭3', '4', '♭5', '♭6', '6', '7', '8'],
    spellings: [1, 2, 3, 4, 5, 6, 6, 7, 8],
    steps: ['全', '半', '全', '半', '全', '半', '全', '半'],
  },
  diminishedHalfWhole: {
    name: 'ディミニッシュスケール（半音・全音）', symbol: 'half-whole diminished',
    intervals: [0, 1, 3, 4, 6, 7, 9, 10, 12],
    degrees: ['1', '♭2', '♭3', '3', '♭5', '5', '6', '♭7', '8'],
    spellings: [1, 2, 3, 3, 5, 5, 6, 7, 8],
    steps: ['半', '全', '半', '全', '半', '全', '半', '全'],
  },
};

export function getScale(root, mode = 'major', octave = 3) {
  const scale = SCALE_DEFINITIONS[mode];
  if (!scale) throw new Error(`Unknown mode: ${mode}`);
  const rootMidi = 12 * (octave + 1) + pitchClass(root);
  return {
    root, mode,
    symbol: `${root} ${scale.symbol}`,
    name: scale.name,
    steps: [...scale.steps],
    notes: scale.intervals.map((interval, index) => ({
      name: spellInterval(root, interval, scale.spellings[index]),
      midi: rootMidi + interval,
      pitchClass: mod(rootMidi + interval),
      degree: scale.degrees[index],
      isRoot: index === 0 || interval === 12,
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
