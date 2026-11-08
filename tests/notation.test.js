import test from 'node:test';
import assert from 'node:assert/strict';
import { CLEFS, staffNote, staffNotes } from '../src/notation.js';

test('treble and bass lines and spaces map to the correct piano pitches', () => {
  const treble = staffNotes('treble');
  const bass = staffNotes('bass');
  assert.deepEqual(treble.filter(note => [0, 2, 4, 6, 8].includes(note.step)).map(note => note.label), ['E4', 'G4', 'B4', 'D5', 'F5']);
  assert.deepEqual(treble.filter(note => [1, 3, 5, 7].includes(note.step)).map(note => note.label), ['F4', 'A4', 'C5', 'E5']);
  assert.deepEqual(bass.filter(note => [0, 2, 4, 6, 8].includes(note.step)).map(note => note.label), ['G2', 'B2', 'D3', 'F3', 'A3']);
  assert.deepEqual(bass.filter(note => [1, 3, 5, 7].includes(note.step)).map(note => note.label), ['A2', 'C3', 'E3', 'G3']);
});

test('middle C is the same key on the lower treble and upper bass ledger lines', () => {
  const treble = staffNote(60, 'treble');
  const bass = staffNote(60, 'bass');
  assert.equal(treble.label, 'C4');
  assert.equal(bass.label, 'C4');
  assert.equal(treble.step, -2);
  assert.deepEqual(treble.ledgerSteps, [-2]);
  assert.equal(bass.step, 10);
  assert.deepEqual(bass.ledgerSteps, [10]);
  assert.ok(treble.middleC && bass.middleC);
});

test('staff advances diatonically, with every note visible on its corresponding keyboard', () => {
  for (const clef of CLEFS) {
    const notes = staffNotes(clef.id);
    assert.equal(notes.length, clef.id === 'treble' ? 21 : 13);
    assert.equal(staffNote(clef.referenceMidi, clef.id).step, clef.referenceStep);
    for (let index = 0; index < notes.length; index++) {
      const note = notes[index];
      assert.ok(note.midi >= clef.keyboardStart && note.midi <= clef.keyboardEnd);
      if (index > 0) {
        assert.equal(note.step - notes[index - 1].step, 1);
        assert.ok([1, 2].includes(note.midi - notes[index - 1].midi));
      }
      if (note.step >= 0 && note.step <= 8) assert.deepEqual(note.ledgerSteps, []);
    }
  }
});

test('extended treble notes below C4 and above A5 have the correct ledger lines', () => {
  const notes = staffNotes('treble');
  assert.deepEqual(notes.slice(0, 4).map(note => [note.label, note.ledgerSteps]), [
    ['F3', [-2, -4, -6]], ['G3', [-2, -4]], ['A3', [-2, -4]], ['B3', [-2]],
  ]);
  assert.deepEqual(notes.slice(-4).map(note => [note.label, note.ledgerSteps]), [
    ['B5', [10]], ['C6', [10, 12]], ['D6', [10, 12]], ['E6', [10, 12, 14]],
  ]);
});
