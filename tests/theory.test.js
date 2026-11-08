import test from 'node:test';
import assert from 'node:assert/strict';
import { ROOTS, CIRCLE, MINOR_ROOTS, QUALITIES, pitchClass, spellInterval, getChord, getProgression, getVoicedProgression, chordVoicings, voiceMovement, getScale, circleTonic, keyboardKeys, midiLabel } from '../src/theory.js';

test('basic chord structures are musically correct', () => {
  const fixtures = {
    major: ['C', 'E', 'G'], minor: ['C', 'E♭', 'G'], dim: ['C', 'E♭', 'G♭'], aug: ['C', 'E', 'G♯'],
    maj7: ['C', 'E', 'G', 'B'], m7: ['C', 'E♭', 'G', 'B♭'], '7': ['C', 'E', 'G', 'B♭'],
    m7b5: ['C', 'E♭', 'G♭', 'B♭'], dim7: ['C', 'E♭', 'G♭', 'B♭♭'], mMaj7: ['C', 'E♭', 'G', 'B'],
  };
  for (const [quality, names] of Object.entries(fixtures)) assert.deepEqual(getChord('C', quality).notes.map(note => note.name), names);
});

test('every root and quality has correctly spelled, ascending, visible notes', () => {
  for (const root of [...ROOTS, 'C♯', 'D♯', 'F♯', 'G♯', 'A♯']) {
    for (const quality of QUALITIES) {
      const chord = getChord(root, quality.id);
      assert.equal(chord.notes.length, quality.intervals.length);
      assert.equal(chord.notes.filter(note => note.isRoot).length, 1);
      chord.notes.forEach((note, index) => {
        assert.equal(pitchClass(note.name), note.midi % 12, `${chord.symbol}: ${note.name}`);
        assert.equal(note.midi - chord.notes[0].midi, quality.intervals[index]);
        assert.ok(note.midi >= 48 && note.midi <= 72, `${chord.symbol} must fit C3–C5`);
      });
    }
  }
});

test('major ii–V–I examples, including sharp and flat spellings', () => {
  const cases = [
    ['C', ['Dm7', 'G7', 'Cmaj7']], ['F', ['Gm7', 'C7', 'Fmaj7']], ['B♭', ['Cm7', 'F7', 'B♭maj7']],
    ['G♭', ['A♭m7', 'D♭7', 'G♭maj7']], ['B', ['C♯m7', 'F♯7', 'Bmaj7']],
  ];
  cases.forEach(([root, expected]) => assert.deepEqual(getProgression(root).map(chord => chord.symbol), expected));
  assert.deepEqual(getProgression('G♭')[0].notes.map(note => note.name), ['A♭', 'C♭', 'E♭', 'G♭']);
});

test('minor iiø–V–i uses a major dominant and minor-major tonic', () => {
  assert.deepEqual(getProgression('C', 'minor').map(chord => chord.symbol), ['Dm7♭5', 'G7', 'Cm(maj7)']);
  const aMinor = getProgression('A', 'minor');
  assert.deepEqual(aMinor.map(chord => chord.symbol), ['Bm7♭5', 'E7', 'Am(maj7)']);
  assert.deepEqual(aMinor[1].notes.map(note => note.name), ['E', 'G♯', 'B', 'D']);
  assert.deepEqual(aMinor[2].notes.map(note => note.name), ['A', 'C', 'E', 'G♯']);
});

test('all 24 major/minor progressions resolve to the chosen tonic and follow descending fifths', () => {
  for (const root of CIRCLE) for (const mode of ['major', 'minor']) {
    const chords = getProgression(root, mode);
    assert.equal(chords.length, 3);
    assert.equal(chords[2].root, root);
    assert.equal((pitchClass(chords[0].root) - pitchClass(root) + 12) % 12, 2);
    assert.equal((pitchClass(chords[1].root) - pitchClass(root) + 12) % 12, 7);
    for (const chord of chords) for (const note of chord.notes) {
      assert.equal(pitchClass(note.name), note.midi % 12);
      assert.ok(note.midi >= 48 && note.midi <= 72);
    }
  }
});

test('circle covers 12 unique pitch classes and wraps by perfect fifths', () => {
  assert.equal(new Set(CIRCLE.map(pitchClass)).size, 12);
  CIRCLE.forEach((note, i) => assert.equal((pitchClass(CIRCLE[(i + 1) % 12]) - pitchClass(note) + 12) % 12, 7));
});

test('enharmonic spelling preserves the scale degree', () => {
  assert.equal(pitchClass('B♭♭'), 9);
  assert.equal(pitchClass('E♯'), 5);
  assert.equal(pitchClass('Cb'), 11);
  assert.equal(pitchClass('F#'), 6);
  assert.equal(spellInterval('G♭', 11, 7), 'F');
  assert.equal(spellInterval('F♯', 11, 7), 'E♯');
  assert.equal(spellInterval('D♭', 3, 3), 'F♭');
});

test('keyboard places the right black keys between natural keys', () => {
  const { keys, whiteCount } = keyboardKeys();
  assert.equal(keys.length, 25);
  assert.equal(whiteCount, 15);
  assert.equal(keys.filter(key => key.black).length, 10);
  assert.equal(keys[1].position, 0.69);
  assert.equal(keys.find(key => key.midi === 60).position, 7);
  assert.equal(keys.at(-1).position, 14);
  assert.equal(midiLabel(60), 'C4');
  assert.equal(midiLabel(49), 'D♭3');
});

test('invalid theory inputs fail explicitly', () => {
  assert.throws(() => pitchClass('H'), /Invalid note/);
  assert.throws(() => getChord('C', 'unknown'), /Unknown chord quality/);
  assert.throws(() => getProgression('C', 'dorian'), /Unknown mode/);
  assert.throws(() => getScale('C', 'dorian'), /Unknown mode/);
  assert.throws(() => getVoicedProgression('C', 'major', 'rootless'), /Unknown voicing/);
});

test('major scales keep their correct sharps and flats', () => {
  assert.deepEqual(getScale('C').notes.map(note => note.name), ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']);
  assert.deepEqual(getScale('G').notes.map(note => note.name), ['G', 'A', 'B', 'C', 'D', 'E', 'F♯', 'G']);
  assert.deepEqual(getScale('G♭').notes.map(note => note.name), ['G♭', 'A♭', 'B♭', 'C♭', 'D♭', 'E♭', 'F', 'G♭']);
});

test('natural minor uses the unraised seventh, independently from minor ii–V–I', () => {
  const scale = getScale('A', 'minor');
  assert.deepEqual(scale.notes.map(note => note.name), ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'A']);
  assert.equal(scale.notes[6].name, 'G');
  assert.equal(getProgression('A', 'minor')[2].notes[3].name, 'G♯');
  assert.deepEqual(getScale('F♯', 'minor').notes.map(note => note.name), ['F♯', 'G♯', 'A', 'B', 'C♯', 'D', 'E', 'F♯']);
});

test('all outer and inner scales span one octave and fit the keyboard', () => {
  for (const mode of ['major', 'minor']) for (const root of mode === 'major' ? CIRCLE : MINOR_ROOTS) {
    const scale = getScale(root, mode);
    assert.equal(scale.notes.length, 8);
    assert.equal(scale.notes.at(-1).midi - scale.notes[0].midi, 12);
    assert.equal(scale.notes.at(-1).name, root);
    assert.equal(scale.notes.filter(note => note.isRoot).length, 2);
    scale.notes.forEach((note, i) => {
      assert.equal(pitchClass(note.name), note.midi % 12);
      assert.ok(note.midi >= 48 && note.midi <= 72);
      if (i) assert.equal(note.midi - scale.notes[i - 1].midi, scale.steps[i - 1] === '全' ? 2 : 1);
    });
  }
});

test('paired outer major and inner minor scales have identical pitch classes', () => {
  CIRCLE.forEach((major, i) => {
    const majorNotes = getScale(major).notes.slice(0, 7).map(note => note.pitchClass).sort((a, b) => a - b);
    const minorNotes = getScale(MINOR_ROOTS[i], 'minor').notes.slice(0, 7).map(note => note.pitchClass).sort((a, b) => a - b);
    assert.deepEqual(majorNotes, minorNotes);
    assert.equal(circleTonic(major, 'major'), major);
    assert.equal(circleTonic(MINOR_ROOTS[i], 'minor'), MINOR_ROOTS[i]);
  });
  assert.equal(circleTonic('G♭', 'minor'), 'F♯');
  assert.equal(circleTonic('C♯', 'major'), 'D♭');
});

test('root-position progression preserves the original notes in all 24 keys', () => {
  for (const mode of ['major', 'minor']) for (const root of CIRCLE) {
    const original = getProgression(root, mode);
    const voiced = getVoicedProgression(root, mode, 'root');
    voiced.forEach((chord, index) => {
      assert.deepEqual(chord.notes, original[index].notes);
      assert.equal(chord.inversion, 0);
      assert.equal(chord.positionName, '基本形');
    });
  }
});

test('C major connects Dm7 to G7/D to Cmaj7, retaining G as a root inside the voicing', () => {
  const chords = getVoicedProgression('C', 'major', 'connected');
  assert.deepEqual(chords.map(chord => chord.notes.map(note => note.midi)), [[50, 53, 57, 60], [50, 53, 55, 59], [48, 52, 55, 59]]);
  assert.deepEqual(chords[1].notes.map(note => note.name), ['D', 'F', 'G', 'B']);
  assert.deepEqual(chords[1].notes.map(note => note.degree), ['5', '♭7', '1', '3']);
  assert.equal(chords[1].inversion, 2);
  assert.equal(chords[1].notes[0].isRoot, false);
  assert.equal(chords[1].notes[2].isRoot, true);
  assert.equal(voiceMovement(chords[0], chords[1]).total + voiceMovement(chords[1], chords[2]).total, 6);
});

test('connected voicings preserve all four chord tones and roots in every major/minor key', () => {
  for (const mode of ['major', 'minor']) for (const root of mode === 'minor' ? MINOR_ROOTS : CIRCLE) {
    const original = getProgression(root, mode);
    const voiced = getVoicedProgression(root, mode, 'connected');
    assert.deepEqual(voiced[0].notes, original[0].notes, 'ii starts in root position');
    voiced.forEach((chord, index) => {
      assert.equal(chord.notes.length, 4);
      assert.equal(new Set(chord.notes.map(note => note.pitchClass)).size, 4);
      assert.deepEqual(chord.notes.map(note => note.name).sort(), original[index].notes.map(note => note.name).sort());
      assert.deepEqual(chord.notes.map(note => note.degree).sort(), original[index].notes.map(note => note.degree).sort());
      assert.equal(chord.notes.filter(note => note.isRoot).length, 1);
      assert.equal(chord.notes.find(note => note.isRoot).name, chord.root);
      assert.equal(chord.notes[0].name, original[index].notes[chord.inversion].name);
      chord.notes.forEach((note, noteIndex) => {
        assert.equal(note.midi % 12, pitchClass(note.name));
        assert.ok(note.midi >= 48 && note.midi <= 72, `${root}: every note fits the keyboard`);
        if (noteIndex) assert.ok(note.midi > chord.notes[noteIndex - 1].midi);
      });
      assert.ok(chord.notes[3].midi - chord.notes[0].midi < 12, 'closed-position voicing');
    });
    const movement = chords => voiceMovement(chords[0], chords[1]).total + voiceMovement(chords[1], chords[2]).total;
    assert.ok(movement(voiced) < movement(original), `${root} ${mode}: reduced total movement`);
  }
});

test('inversion generation includes all positions without mutating its input', () => {
  const chord = getChord('G', '7');
  const snapshot = structuredClone(chord);
  const candidates = chordVoicings(chord);
  assert.deepEqual([...new Set(candidates.map(candidate => candidate.inversion))].sort(), [0, 1, 2, 3]);
  assert.ok(candidates.some(candidate => candidate.notes.map(note => note.midi).join(',') === '50,53,55,59'));
  assert.deepEqual(chord, snapshot);
  assert.throws(() => voiceMovement(getChord('C', 'major'), chord), /Voice counts must match/);
});
