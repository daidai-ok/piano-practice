/** Small, locally synthesized keyboard sound; no audio files or network needed. */
export class PianoAudio {
  context = null;
  master = null;
  voices = new Set();
  timers = new Set();
  generation = 0;

  async ready() {
    if (!this.context) {
      const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Context) throw new Error('このブラウザでは音声再生に対応していません。別のブラウザでお試しください。');
      this.context = new Context();
      this.master = this.context.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') await this.context.resume();
    if (this.context.state !== 'running') throw new Error('音声を開始できませんでした。もう一度再生を押してください。');
  }

  tone(midi, when, duration = 1.3, level = 1) {
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    [1, 2, 3].forEach((harmonic, index) => {
      const oscillator = this.context.createOscillator();
      const envelope = this.context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency * harmonic;
      const volume = [0.25, 0.07, 0.025][index] * level;
      envelope.gain.setValueAtTime(0, when);
      envelope.gain.linearRampToValueAtTime(volume, when + 0.008);
      envelope.gain.exponentialRampToValueAtTime(0.001, when + duration);
      envelope.gain.linearRampToValueAtTime(0, when + duration + 0.04);
      oscillator.connect(envelope);
      envelope.connect(this.master);
      this.voices.add(oscillator);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); this.voices.delete(oscillator); };
      oscillator.start(when);
      oscillator.stop(when + duration + 0.05);
    });
  }

  later(callback, ms) {
    const timer = setTimeout(() => { this.timers.delete(timer); callback(); }, ms);
    this.timers.add(timer);
  }

  stop() {
    this.generation++;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.voices.forEach(voice => { try { voice.stop(); } catch { /* Voice already ended. */ } });
    this.voices.clear();
  }

  async play(chords, { arpeggio = false, stepSeconds = 1.6, onStep = () => {}, onEnd = () => {} } = {}) {
    this.stop();
    const generation = this.generation;
    await this.ready();
    if (generation !== this.generation) return;
    const start = this.context.currentTime + 0.04;
    chords.forEach((notes, chordIndex) => {
      notes.forEach((note, noteIndex) => this.tone(note.midi, start + chordIndex * stepSeconds + (arpeggio ? noteIndex * 0.22 : 0), 1.3, 1 / Math.sqrt(notes.length)));
      this.later(() => onStep(chordIndex), 40 + chordIndex * stepSeconds * 1000);
    });
    const tail = arpeggio ? (chords.at(-1).length - 1) * 0.22 : 0;
    this.later(onEnd, 40 + ((chords.length - 1) * stepSeconds + tail + 1.4) * 1000);
  }
}
