import test from 'node:test';
import assert from 'node:assert/strict';
import { PianoAudio } from '../src/audio.js';

test('stopping while the audio context resumes cancels the pending playback', async () => {
  const player = new PianoAudio();
  let resume;
  player.ready = () => new Promise(resolve => { resume = resolve; });
  let played = false;
  player.tone = () => { played = true; };
  const pending = player.play([[{ midi: 60 }]]);
  player.stop();
  resume();
  await pending;
  assert.equal(played, false);
  assert.equal(player.timers.size, 0);
});

test('a newer playback request supersedes an older pending request', async () => {
  const player = new PianoAudio();
  const resumes = [];
  const heard = [];
  player.context = { currentTime: 0 };
  player.ready = () => new Promise(resolve => { resumes.push(resolve); });
  player.tone = midi => heard.push(midi);
  player.later = () => {};
  const first = player.play([[{ midi: 60 }]]);
  const second = player.play([[{ midi: 67 }]]);
  resumes[1]();
  await second;
  resumes[0]();
  await first;
  assert.deepEqual(heard, [67]);
});

test('stop cancels progression UI callbacks and stops active voices', context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const player = new PianoAudio();
  let callbacks = 0;
  let stopped = 0;
  player.voices.add({ stop: () => { stopped++; } });
  player.later(() => callbacks++, 1000);
  player.stop();
  context.mock.timers.tick(2000);
  assert.equal(callbacks, 0);
  assert.equal(stopped, 1);
  assert.equal(player.voices.size, 0);
  assert.equal(player.timers.size, 0);
});

test('arpeggios schedule scale notes in ascending sequence', async () => {
  const player = new PianoAudio();
  const events = [];
  player.context = { currentTime: 10 };
  player.ready = async () => {};
  player.tone = (midi, when) => events.push({ midi, when });
  player.later = () => {};
  await player.play([[60, 62, 64, 65, 67, 69, 71, 72].map(midi => ({ midi }))], { arpeggio: true });
  assert.deepEqual(events.map(event => event.midi), [60, 62, 64, 65, 67, 69, 71, 72]);
  for (let i = 1; i < events.length; i++) assert.ok(Math.abs(events[i].when - events[i - 1].when - .22) < .0001);
});
