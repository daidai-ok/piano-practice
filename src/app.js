import { getChord, getVoicedProgression, getScale } from './theory.js';
import { PianoAudio } from './audio.js';
import { CLEFS, staffNote } from './notation.js';
import { renderReadingView } from './views/reading.js';
import { createAppState, persistAppState, transitionAppState } from './app-state.js';
import { VIEW_PATHS, pathForView, viewForPath } from './routes.js';
import { icon } from './views/shared.js';
import { renderChordLibrary } from './views/chords.js';
import { renderCircleView } from './views/circle.js';
import { renderScalesView } from './views/scales.js';

const audio = new PianoAudio();
const app = document.querySelector('#app');
let state = createAppState(window.location.pathname);

function syncViewPath({ replace = false } = {}) {
  const path = pathForView(state.view);
  if (window.location.pathname === path) return;
  window.history[replace ? 'replaceState' : 'pushState']({ view: state.view }, '', path);
}

function selectedProgression() {
  return getVoicedProgression(state.tonic, state.mode, state.voicing);
}

function render() {
  const focusKey = document.activeElement?.dataset.focus;
  const staffScroll = [...app.querySelectorAll('.staff-scroll')].map(element => element.scrollLeft);
  app.innerHTML = `<div class="app-shell">
    <aside class="sidebar"><a class="brand" href="${VIEW_PATHS.chords}" data-action="home" aria-label="voicing. コード一覧へ"><span class="brand-icon">${icon('keyboard')}</span><span>voicing<span class="brand-period">.</span></span></a>
      <nav class="main-nav" aria-label="練習メニュー"><a href="${VIEW_PATHS.chords}" data-action="view" data-value="chords" data-focus="nav-chords" ${state.view === 'chords' ? 'aria-current="page"' : ''}>${icon('keyboard')}<span>コードを覚える</span></a><a href="${VIEW_PATHS.circle}" data-action="view" data-value="circle" data-focus="nav-circle" ${state.view === 'circle' ? 'aria-current="page"' : ''}>${icon('circle')}<span>五度圏とⅡ–Ⅴ–Ⅰ</span></a><a href="${VIEW_PATHS.scales}" data-action="view" data-value="scales" data-focus="nav-scales" ${state.view === 'scales' ? 'aria-current="page"' : ''}>${icon('notes')}<span>スケール</span></a><a href="${VIEW_PATHS.reading}" data-action="view" data-value="reading" data-focus="nav-reading" ${state.view === 'reading' ? 'aria-current="page"' : ''}>${icon('book')}<span>楽譜の読み方</span></a></nav>
      <div class="sidebar-bottom"><div class="small-keys" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div>
    </aside>
    <div class="main-shell"><main id="main" tabindex="-1">${renderView()}</main></div>
  </div>`;
  if (focusKey) [...app.querySelectorAll('[data-focus]')].find(element => element.dataset.focus === focusKey)?.focus({ preventScroll: true });
  app.querySelectorAll('.staff-scroll').forEach((element, index) => { element.scrollLeft = staffScroll[index] ?? 0; });
  persistAppState(state);
}

function renderView() {
  if (state.view === 'chords') return renderChordLibrary(state);
  if (state.view === 'circle') return renderCircleView(state);
  if (state.view === 'scales') return renderScalesView(state);
  return renderReadingView(state.reading);
}

function announce(message) { document.querySelector('#announcement').textContent = message; }

function revealStaffNote(clef) {
  const note = app.querySelector(`.staff-note[data-clef="${clef}"][aria-pressed="true"]`);
  if (!note) return;
  const scroller = note.closest('.staff-scroll');
  const bounds = scroller.getBoundingClientRect();
  const noteBounds = note.getBoundingClientRect();
  if (noteBounds.left < bounds.left) scroller.scrollLeft += noteBounds.left - bounds.left;
  else if (noteBounds.right > bounds.right) scroller.scrollLeft += noteBounds.right - bounds.right;
}

function syncPlayback() {
  const buttons = [['play-chord', 'コードを聴く'], ['arpeggio', '1音ずつ聴く'], ['play-progression', 'Ⅱ–Ⅴ–Ⅰを聴く'], ['play-scale', 'スケールを聴く']];
  buttons.forEach(([action, label]) => {
    const button = app.querySelector(`[data-action="${action}"]`);
    if (!button) return;
    const text = state.playing === action ? '停止する' : label;
    const symbol = icon(state.playing === action ? 'stop' : ['arpeggio', 'play-scale'].includes(action) ? 'notes' : 'play');
    button.innerHTML = action === 'play-progression' ? symbol : `${symbol}<span>${text}</span>`;
    if (action === 'play-progression') button.setAttribute('aria-label', text);
  });
}

function stopPlayback() {
  audio.stop();
  state.playing = null;
  app.querySelectorAll('.is-playing, .sounding').forEach(element => element.classList.remove('is-playing', 'sounding'));
  syncPlayback();
}

async function play(chords, action, { arpeggio = false, stepIndex = null, midi = null } = {}) {
  if (state.playing === action && midi === null) { stopPlayback(); return; }
  stopPlayback();
  state.playing = action;
  syncPlayback();
  clearAppError();
  try {
    await audio.play(chords.map(chord => chord.notes), {
      arpeggio,
      onStep: index => {
        app.querySelectorAll('.is-playing').forEach(element => element.classList.remove('is-playing'));
        if (action === 'play-progression' || stepIndex !== null) app.querySelector(`[data-step="${stepIndex ?? index}"]`)?.classList.add('is-playing');
        if (midi !== null) app.querySelectorAll(`[data-midi="${midi}"]`).forEach(element => element.classList.add('sounding'));
      },
      onEnd: () => { state.playing = null; app.querySelectorAll('.is-playing, .sounding').forEach(element => element.classList.remove('is-playing', 'sounding')); syncPlayback(); },
    });
  } catch (error) {
    stopPlayback();
    showAppError(error.message || '音声を再生できませんでした。もう一度お試しください。');
  }
}

function showAppError(message) {
  const banner = document.querySelector('#app-error');
  banner.textContent = message;
  banner.hidden = false;
}

function clearAppError() {
  document.querySelector('#app-error').hidden = true;
}

app.addEventListener('click', async event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action, value } = target.dataset;
  if (['view', 'home'].includes(action) && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
  try {
    clearAppError();
    if (action === 'reading-note') {
      const { clef, midi } = target.dataset;
      const note = staffNote(Number(midi), clef);
      stopPlayback();
      state = transitionAppState(state, 'reading-note', { clef, midi: note.midi });
      render();
      revealStaffNote(clef);
      announce(`${CLEFS.find(item => item.id === clef).name}、${note.syllable} ${note.label}、${note.position}${note.middleC ? '、中央ド' : ''}`);
      return await play([{ notes: [note] }], 'note', { midi: note.midi });
    }
    if (action === 'note') return await play([{ notes: [{ midi: Number(target.dataset.midi) }] }], 'note', { midi: Number(target.dataset.midi) });
    if (action === 'play-chord' || action === 'arpeggio') return await play([getChord(state.root, state.quality)], action, { arpeggio: action === 'arpeggio' });
    if (action === 'play-progression') return await play(selectedProgression(), action);
    if (action === 'play-scale') return await play([getScale(state.scaleRoot, state.scaleType)], action, { arpeggio: true });
    if (action === 'play-step') return await play([selectedProgression()[Number(value)]], `step-${value}`, { stepIndex: Number(value) });
    stopPlayback();
    const oldView = state.view;
    if (['view', 'home'].includes(action)) event.preventDefault();
    const progression = ['to-circle', 'inspect'].includes(action) ? selectedProgression() : [];
    state = transitionAppState(state, action, value, progression);
    render();
    if (oldView !== state.view) syncViewPath();
    if (action === 'reading-middle') CLEFS.forEach(clef => revealStaffNote(clef.id));
    if (oldView !== state.view) { document.querySelector('#main').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
    if (action === 'voicing') announce(`ルート入りの4音、${state.voicing === 'root' ? '基本形' : '転回形でつなぐ'}。${selectedProgression().map(chord => `${chord.symbol} ${chord.positionName} ${chord.notes.map(note => note.name).join('、')}`).join('。')}`);
    else if (state.view === 'reading') announce(action === 'reading-middle' ? '中央ド C4。ト音記号の下の加線、ヘ音記号の上の加線。同じ鍵盤の音です。' : '楽譜の読み方。ト音記号とヘ音記号の音符を選ぶと、鍵盤で確認できます。');
    else if (state.view === 'scales') { const scale = getScale(state.scaleRoot, state.scaleType); announce(`${scale.root}${scale.name}、構成音 ${scale.notes.map(note => note.name).join('、')}`); }
    else if (state.view === 'chords') announce(`${getChord(state.root, state.quality).symbol}、構成音 ${getChord(state.root, state.quality).notes.map(note => note.name).join('、')}`);
    else announce(`${state.tonic}${state.mode === 'major' ? 'メジャー' : 'マイナー'}、Ⅱ–Ⅴ–Ⅰは${selectedProgression().map(chord => chord.symbol).join('、')}`);
  } catch (error) {
    stopPlayback();
    console.error('App action failed:', error);
    showAppError('操作を完了できませんでした。画面を更新してもう一度お試しください。');
  }
});

app.addEventListener('change', event => {
  if (event.target.id !== 'quality-select') return;
  clearAppError();
  stopPlayback();
  state = transitionAppState(state, 'quality', event.target.value);
  render();
  announce(`${getChord(state.root, state.quality).symbol}、構成音 ${getChord(state.root, state.quality).notes.map(note => note.name).join('、')}`);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { stopPlayback(); clearAppError(); }
  const key = event.target.closest('.piano-key');
  const staffKey = event.target.closest('.staff-note');
  if (staffKey && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const notes = [...staffKey.parentElement.querySelectorAll('.staff-note')];
    const index = notes.indexOf(staffKey);
    notes[event.key === 'Home' ? 0 : event.key === 'End' ? notes.length - 1 : Math.max(0, Math.min(notes.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)))]?.focus();
  }
  if (key && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const keys = [...key.parentElement.querySelectorAll('.piano-key')];
    const index = keys.indexOf(key);
    keys[event.key === 'Home' ? 0 : event.key === 'End' ? keys.length - 1 : Math.max(0, Math.min(keys.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)))]?.focus();
  }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) stopPlayback(); });
render();
syncViewPath({ replace: true });

window.addEventListener('popstate', () => {
  const view = viewForPath(window.location.pathname);
  if (!view || view === state.view) return;
  stopPlayback();
  state = transitionAppState(state, 'view', view);
  render();
  document.querySelector('#main').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
});
