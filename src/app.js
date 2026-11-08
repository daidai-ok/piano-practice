import { ROOTS, ROOT_SPELLINGS, CIRCLE, RELATIVE_MINORS, MINOR_ROOTS, SIGNATURES, FOCUS_QUALITIES, QUALITIES, getChord, getVoicedProgression, getScale, circleTonic, practiceKey, keyboardKeys, pitchClass, midiLabel } from './theory.js';
import { PianoAudio } from './audio.js';
import { CLEFS, staffNotes, staffNote } from './notation.js';
import { readingView } from './reading.js';

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
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const audio = new PianoAudio();
const app = document.querySelector('#app');
let saved = {};
try { saved = JSON.parse(localStorage.getItem('voicing-settings') || '{}') || {}; } catch { /* Storage is optional. */ }
const state = {
  view: ['circle', 'reading'].includes(saved.view) ? saved.view : 'chords',
  root: ROOT_SPELLINGS.flat().includes(saved.root) ? saved.root : 'C',
  quality: QUALITIES.some(item => item.id === saved.quality) ? saved.quality : 'maj7',
  tonic: ROOT_SPELLINGS.flat().includes(saved.tonic) ? saved.tonic : 'C',
  mode: saved.mode === 'minor' ? 'minor' : 'major',
  voicing: saved.voicing === 'connected' ? 'connected' : 'root',
  reading: Object.fromEntries(CLEFS.map(clef => [clef.id, staffNotes(clef.id).some(note => note.midi === saved.reading?.[clef.id]) ? saved.reading[clef.id] : clef.referenceMidi])),
  playing: null,
};
state.tonic = circleTonic(state.tonic, state.mode);

function persist() {
  const { playing, ...settings } = state;
  try { localStorage.setItem('voicing-settings', JSON.stringify(settings)); } catch { /* Private browsing can disable storage. */ }
}

function keyboard(chord, id, compact = false, options = {}) {
  const start = options.start ?? 48;
  const end = options.end ?? 72;
  const { keys, whiteCount } = keyboardKeys(start, end);
  const clef = CLEFS.find(item => item.id === options.clef);
  const register = midi => `${midiLabel(midi)}${midi === 60 ? ' <span class="middle-c">中央ド</span>' : ''}`;
  return `<div class="keyboard-wrap ${compact ? 'compact' : ''}">
    <div class="piano" role="group" aria-label="${escape(chord.symbol)}の鍵盤。色の付いた鍵盤が${options.reading ? '選択中の音' : '構成音'}" style="--white-count:${whiteCount}">
      ${keys.map(key => {
        const note = chord.notes.find(note => note.midi === key.midi);
        const readingKey = clef && !key.black && key.midi >= clef.start && key.midi <= clef.end;
        return `<button type="button" class="piano-key ${key.black ? 'black' : 'white'} ${note ? 'chord-tone' : ''} ${note?.isRoot ? 'root-tone' : ''}" style="--key-position:${key.position}" data-action="${readingKey ? 'reading-note' : 'note'}" ${clef ? `data-clef="${clef.id}"` : ''} data-midi="${key.midi}" data-focus="${id}-key-${key.midi}" tabindex="${key.midi === chord.notes[0].midi ? 0 : -1}" aria-label="${escape(note ? options.reading ? `${note.syllable}、${note.label}、選択中の音` : `${note.name}、${note.degree}度、${midiLabel(key.midi)}、構成音` : key.label)}">
          ${note && !options.reading ? `<span class="key-degree">${note.isRoot ? 'R' : note.degree}</span>` : ''}
          <span class="key-label">${escape(options.reading ? key.label : note?.name || key.label.replace(/\d/, ''))}</span>
        </button>`;
      }).join('')}
    </div>
    <div class="keyboard-register"><span>${register(start)}</span><span>${register(start + 12)}</span><span>${register(end)}</span></div>
  </div>`;
}

function chordSymbol(chord) {
  return `${escape(chord.root)}<span>${escape(chord.quality.symbol)}</span>`;
}

function selectedProgression() {
  return getVoicedProgression(state.tonic, state.mode, state.voicing);
}

function keyPractice(root, target) {
  const next = practiceKey(root, 1, target === 'circle' ? state.mode : 'major');
  return `<div class="key-practice"><p>12キー練習 <span>五度圏を反時計回りに</span></p><div><button type="button" data-action="practice-key" data-target="${target}" data-value="-1" data-focus="${target}-previous-key" aria-label="前のキーへ">← 前のキー</button><button type="button" data-action="practice-key" data-target="${target}" data-value="1" data-focus="${target}-next-key" aria-label="次のキー ${next}へ">次：${next} ${icon('arrow')}</button></div></div>`;
}

function qualityChoices(qualities) {
  return qualities.map(q => `<button type="button" class="quality-choice" data-action="quality" data-value="${q.id}" data-focus="quality-${q.id}" aria-pressed="${state.quality === q.id}"><span class="quality-symbol">${state.root}<span>${q.symbol}</span></span><span class="quality-name">${q.name}</span><span class="choice-mark" aria-hidden="true">${state.quality === q.id ? icon('check') : ''}</span></button>`).join('');
}

function chordLibrary() {
  const chord = getChord(state.root, state.quality);
  const alternative = ROOT_SPELLINGS[pitchClass(state.root)].find(root => root !== state.root);
  const focused = FOCUS_QUALITIES.map(id => QUALITIES.find(q => q.id === id));
  const remaining = QUALITIES.filter(q => !FOCUS_QUALITIES.includes(q.id));
  return `<header class="page-heading">
    <div><p class="section-caption">CHORD LIBRARY</p><h1>コードを、指で覚える。</h1><p class="page-description">まずは maj7・m7・7 を12キーで。3種類、36コードをひとつずつ。</p></div>
    <span class="header-mark" aria-hidden="true">${icon('keyboard')}</span>
  </header>
  <div class="chord-workbench">
    <section class="library-panel" aria-label="コードを選択">
      <div class="panel-title"><h2>ルート音</h2><span>ROOT NOTE</span></div>
      <div class="root-selector" role="group" aria-label="ルート音">${ROOTS.map((root, index) => { const selected = pitchClass(state.root) === index; const label = selected ? state.root : root; return `<button type="button" data-action="root" data-value="${label}" data-focus="root-${index}" aria-pressed="${selected}">${label}</button>`; }).join('')}</div>
      <div class="enharmonic-control">${alternative ? `<button type="button" data-action="root" data-value="${alternative}" data-focus="enharmonic" aria-label="ルートを${alternative}表記に切り替え">${state.root} ⇄ ${alternative}<span>異名同音</span></button>` : '<span>12音からルートを選択</span>'}</div>
      ${keyPractice(state.root, 'chords')}
      <div class="mobile-quality"><label for="quality-select">コードの種類</label><select id="quality-select" data-focus="quality-select">${[[focused, 'まず覚える3つ'], [remaining, 'その他のコード']].map(([qualities, label]) => `<optgroup label="${label}">${qualities.map(q => `<option value="${q.id}" ${state.quality === q.id ? 'selected' : ''}>${state.root}${q.symbol} — ${q.name}</option>`).join('')}</optgroup>`).join('')}</select></div>
      <div class="quality-groups"><div class="quality-group"><div class="panel-title"><h2>まず覚える3つ</h2><span>3 TYPES × 12 KEYS</span></div><div class="quality-list" role="group" aria-label="優先して練習するコード">${qualityChoices(focused)}</div></div><details class="other-chords" ${FOCUS_QUALITIES.includes(state.quality) ? '' : 'open'}><summary>その他のコード</summary><div class="quality-list" role="group" aria-label="その他のコード">${qualityChoices(remaining)}</div></details></div>
    </section>
    <section class="chord-detail" aria-label="選択したコード">
      <div class="detail-heading"><div><span class="subtle-label">選択中のコード</span><h2 class="chord-display">${chordSymbol(chord)}</h2><p class="chord-name">${chord.quality.name}</p></div><span class="position-label">基本形 <span>ルートを含む${chord.notes.length}音</span></span></div>
      <div class="instrument-panel">
        <div class="instrument-heading"><span>${icon('keyboard')} 鍵盤で確認</span><span>タップして音を聴く</span></div>
        ${keyboard(chord, 'main')}
        <div class="key-legend"><span><i class="root-dot"></i>ルート</span><span><i class="tone-dot"></i>構成音</span><span class="range-label">C3 — C5</span></div>
      </div>
      <div class="tone-heading"><h3>コードの構成音</h3><span>${chord.quality.formula.join(' · ')}</span></div>
      <div class="tone-list">${chord.notes.map(note => `<div class="tone-item ${note.isRoot ? 'is-root' : ''}"><span class="tone-degree">${note.isRoot ? 'ROOT' : `${note.degree} 度`}</span><strong>${note.name}</strong></div>`).join('')}</div>
      <div class="audio-controls"><button type="button" class="button primary" data-action="play-chord" data-focus="play-chord">${icon('play')}<span>コードを聴く</span></button><button type="button" class="button secondary" data-action="arpeggio" data-focus="arpeggio">${icon('notes')}<span>1音ずつ聴く</span></button><span class="synth-note">合成ピアノ音</span></div>
      <aside class="learning-note"><span class="note-icon">${icon('book')}</span><div><h3>このコードのこと</h3><p>${chord.quality.description}</p></div></aside>
      <button type="button" class="next-lesson" data-action="to-circle" data-focus="to-circle"><span>このルートへのⅡ–Ⅴ–Ⅰを見る</span>${icon('arrow')}</button>
    </section>
  </div>`;
}

function circleWheel(progression) {
  return `<div class="circle-wheel" role="group" aria-label="五度圏。外側でメジャー、内側でナチュラルマイナーのルートを選択">
    <svg class="wheel-guide" viewBox="0 0 400 400" aria-hidden="true"><circle cx="200" cy="200" r="163"/><circle cx="200" cy="200" r="111"/>${CIRCLE.map((_, i) => { const angle = (i * 30 - 75) * Math.PI / 180; return `<path d="M${200 + Math.cos(angle) * 140} ${200 + Math.sin(angle) * 140} L${200 + Math.cos(angle) * 184} ${200 + Math.sin(angle) * 184}"/>`; }).join('')}</svg>
    ${CIRCLE.map((root, index) => {
      const angle = (index * 30 - 90) * Math.PI / 180;
      const x = (50 + Math.cos(angle) * 40.5).toFixed(3);
      const y = (50 + Math.sin(angle) * 40.5).toFixed(3);
      const roleIndex = progression.findIndex(chord => pitchClass(chord.root) === pitchClass(root));
      const outerSelected = state.mode === 'major' && root === state.tonic;
      const innerSelected = state.mode === 'minor' && MINOR_ROOTS[index] === state.tonic;
      return `<button type="button" class="circle-note ${outerSelected ? 'selected' : ''} ${roleIndex === 0 ? 'is-two' : roleIndex === 1 ? 'is-five' : ''}" style="--x:${x}%;--y:${y}%" data-action="tonic-major" data-value="${root}" data-focus="circle-${index}" aria-pressed="${outerSelected}" aria-label="${root}メジャースケールとⅡ–Ⅴ–Ⅰ"><strong>${root}</strong><span>${SIGNATURES[index]}</span></button>
      <button type="button" class="relative-minor ${innerSelected ? 'selected' : ''}" style="--x:${(50 + Math.cos(angle) * 26.5).toFixed(3)}%;--y:${(50 + Math.sin(angle) * 26.5).toFixed(3)}%" data-action="tonic-minor" data-value="${MINOR_ROOTS[index]}" data-focus="minor-${index}" aria-pressed="${innerSelected}" aria-label="${MINOR_ROOTS[index]}ナチュラルマイナースケールとⅡ–Ⅴ–Ⅰ">${RELATIVE_MINORS[index]}</button>`;
    }).join('')}
    <div class="circle-center"><span>選択中のルート</span><strong>${state.tonic}</strong><span class="center-mode">${state.mode === 'major' ? 'MAJOR' : 'MINOR'}</span></div>
  </div>`;
}

function circleView() {
  const progression = selectedProgression();
  return `<header class="page-heading"><div><p class="section-caption">CIRCLE OF FIFTHS</p><h1>つながりから、覚える。</h1><p class="page-description">外側はメジャー、内側はナチュラルマイナー。音を選んでスケールとⅡ–Ⅴ–Ⅰを確認。</p></div><span class="header-mark" aria-hidden="true">${icon('circle')}</span></header>
  <section class="circle-overview" aria-label="五度圏と解決先">
    <div class="wheel-panel">${circleWheel(progression)}<p class="wheel-caption">外側をタップ：メジャー ／ 内側をタップ：ナチュラルマイナー</p><p class="wheel-caption">同じ方向に並ぶ長調と短調は、同じ調号を使う平行調です。</p></div>
    <div class="resolution-panel"><div class="panel-title"><h2>解決先を選ぶ</h2><span>DESTINATION</span></div>
      <div class="mode-switch" role="group" aria-label="解決先の調性"><button type="button" data-action="mode" data-value="major" data-focus="mode-major" aria-pressed="${state.mode === 'major'}">メジャー</button><button type="button" data-action="mode" data-value="minor" data-focus="mode-minor" aria-pressed="${state.mode === 'minor'}">マイナー</button></div>
      <h2 class="destination-title">${state.tonic}<span> ${state.mode === 'major' ? 'major' : 'minor'}</span></h2>
      <p class="destination-description">${state.mode === 'major' ? 'Ⅱm7 → Ⅴ7 → Ⅰmaj7' : 'Ⅱm7♭5 → Ⅴ7 → Ⅰm(maj7)'}</p>
      <p class="voicing-caption">ルート入り4音 · ${state.voicing === 'root' ? '基本形' : '転回形でつなぐ'}</p>
      <p class="resolution-copy">準備から緊張へ、そして解決へ。<br />3つの響きの移り変わりを聴いてみよう。</p>
      <button type="button" class="button primary" data-action="play-progression" data-focus="play-progression">${icon('play')}<span>Ⅱ–Ⅴ–Ⅰを聴く</span></button>
      <div class="fifths-tip"><span class="rotation-symbol" aria-hidden="true">↻</span><p><strong>時計回りに完全5度</strong><br />C → G → D … と、7半音ずつ進みます。Ⅱ → Ⅴ → Ⅰは、五度圏を反時計回りに2つ戻る動きです。</p></div>
      ${state.mode === 'minor' ? '<p class="minor-explainer">マイナーのⅡ–Ⅴ–Ⅰは、解決感を作るためⅤ7とⅠm(maj7)に導音（上げた第7音）を使います。下のナチュラルマイナースケールとは第7音が異なります。</p>' : '<p class="enharmonic-note">G♭とF♯は、同じ鍵盤で鳴る異名同音です。</p>'}
    </div>
  </section>
  ${scaleSection()}
  <section class="progression-section" aria-label="Ⅱ–Ⅴ–Ⅰの3つのコード"><div class="progression-heading"><h2><span class="sequence-title">Ⅱ <i>→</i> Ⅴ <i>→</i> Ⅰ</span><span class="sequence-subtitle">${state.tonic}へのツーファイブワン</span></h2><span>3つのコードを、並べて確認</span></div>
    <div class="voicing-panel"><div class="voicing-heading"><h3>ルート入りのフォーノート</h3><div class="mode-switch" role="group" aria-label="Ⅱ–Ⅴ–Ⅰのヴォイシング"><button type="button" data-action="voicing" data-value="root" data-focus="voicing-root" aria-pressed="${state.voicing === 'root'}">基本形</button><button type="button" data-action="voicing" data-value="connected" data-focus="voicing-connected" aria-pressed="${state.voicing === 'connected'}">転回形でつなぐ</button></div></div><p>${state.voicing === 'root' ? '各コードをルートから積み重ねます。まずは4つの構成音を覚えましょう。' : 'Ⅱは基本形から。Ⅴ・Ⅰは4つの音の移動が少なくなる転回形の一例です。ルートは濃い緑で示し、最低音とは限りません。'}</p><span class="voicing-note">ルート・3度・5度・7度を各1音。音名と度数は、低い音 → 高い音の順です。</span></div>
    ${keyPractice(state.tonic, 'circle')}
    <div class="progression-grid">${progression.map((chord, index) => `<article class="progression-card" data-step="${index}"><div class="progression-card-top"><span class="roman-label degree-${index}">${chord.roman}</span><span>${chord.role}<span class="function-name"> · ${chord.functionName}</span></span><button type="button" class="icon-button" data-action="play-step" data-value="${index}" data-focus="step-${index}" aria-label="${chord.symbol}を聴く">${icon('play')}</button></div><h3 class="progression-chord">${chordSymbol(chord)}</h3><p class="voicing-caption">${chord.positionName} · 最低音 ${chord.notes[0].name}</p><p class="progression-notes">${chord.notes.map(note => note.name).join('<span> · </span>')}</p>${keyboard(chord, `step-${index}`, true)}<div class="card-bottom"><span aria-label="低い音からの度数">${chord.notes.map(note => note.degree).join(' · ')}</span><button type="button" data-action="inspect" data-value="${index}" data-focus="inspect-${index}">基本形を見る ${icon('arrow')}</button></div></article>`).join('')}</div>
  </section>`;
}

function scaleSection() {
  const scale = getScale(state.tonic, state.mode);
  return `<section class="scale-section" aria-label="${scale.root}${scale.name}"><div class="scale-heading"><div><h2><span>${scale.root}</span> ${scale.name}</h2><p>${state.mode === 'major' ? '外側の音をルートにした、1オクターブのメジャースケール。' : '内側の音をルートにした、1オクターブのナチュラルマイナースケール。'}</p></div><button type="button" class="button secondary" data-action="play-scale" data-focus="play-scale">${icon('notes')}<span>スケールを聴く</span></button></div>
    <div class="scale-layout"><div class="instrument-panel"><div class="instrument-heading"><span>${icon('keyboard')} スケールの鍵盤</span><span>タップして音を聴く</span></div>${keyboard(scale, 'scale')}<div class="key-legend"><span><i class="root-dot"></i>ルート</span><span><i class="tone-dot"></i>構成音</span><span class="range-label">C3 — C5</span></div></div><div class="scale-details"><h3>スケールの構成音</h3><div class="scale-tones">${scale.notes.map(note => `<div class="scale-tone ${note.isRoot ? 'is-root' : ''}"><span>${note.degree}</span><strong>${note.name}</strong></div>`).join('')}</div><div class="scale-steps"><span>音の間隔</span><strong>${scale.steps.join(' · ')}</strong><p>全＝全音（2半音）／ 半＝半音</p></div>${state.mode === 'minor' ? '<p class="scale-note">第7音を上げずに弾くのがナチュラルマイナーです。</p>' : '<p class="scale-note">半音になるのは3–4度と7–8度の間。それ以外は全音です。</p>'}</div></div></section>`;
}

function render() {
  const focusKey = document.activeElement?.dataset.focus;
  const staffScroll = [...app.querySelectorAll('.staff-scroll')].map(element => element.scrollLeft);
  app.innerHTML = `<div class="app-shell">
    <aside class="sidebar"><a class="brand" href="#chords" data-action="home" aria-label="voicing. コード一覧へ"><span class="brand-icon">${icon('keyboard')}</span><span>voicing<span class="brand-period">.</span></span></a><p class="brand-caption">JAZZ PIANO PRACTICE</p>
      <nav class="main-nav" aria-label="練習メニュー"><button type="button" data-action="view" data-value="chords" data-focus="nav-chords" ${state.view === 'chords' ? 'aria-current="page"' : ''}>${icon('keyboard')}<span>コードを覚える</span></button><button type="button" data-action="view" data-value="circle" data-focus="nav-circle" ${state.view === 'circle' ? 'aria-current="page"' : ''}>${icon('circle')}<span>五度圏とⅡ–Ⅴ–Ⅰ</span></button><button type="button" data-action="view" data-value="reading" data-focus="nav-reading" ${state.view === 'reading' ? 'aria-current="page"' : ''}>${icon('book')}<span>楽譜の読み方</span></button></nav>
      <div class="sidebar-bottom"><div class="small-keys" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><p>ひとつずつ、<br />音を自分のものに。</p></div>
    </aside>
    <div class="main-shell"><main id="main" tabindex="-1">${state.view === 'chords' ? chordLibrary() : state.view === 'circle' ? circleView() : readingView(state.reading, { keyboard, icon })}</main><footer class="page-footer"><span>voicing. <span>小さな練習を、毎日の音楽に。</span></span><span>12 KEYS, ENDLESS POSSIBILITIES.</span></footer></div>
  </div>`;
  if (focusKey) [...app.querySelectorAll('[data-focus]')].find(element => element.dataset.focus === focusKey)?.focus({ preventScroll: true });
  app.querySelectorAll('.staff-scroll').forEach((element, index) => { element.scrollLeft = staffScroll[index] ?? 0; });
  persist();
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
    if (button) button.innerHTML = `${icon(state.playing === action ? 'stop' : ['arpeggio', 'play-scale'].includes(action) ? 'notes' : 'play')}<span>${state.playing === action ? '停止する' : label}</span>`;
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
  document.querySelector('#audio-error').hidden = true;
  await audio.play(chords.map(chord => chord.notes), {
    arpeggio,
    onStep: index => {
      app.querySelectorAll('.is-playing').forEach(element => element.classList.remove('is-playing'));
      if (action === 'play-progression' || stepIndex !== null) app.querySelector(`[data-step="${stepIndex ?? index}"]`)?.classList.add('is-playing');
      if (midi !== null) app.querySelectorAll(`[data-midi="${midi}"]`).forEach(element => element.classList.add('sounding'));
    },
    onEnd: () => { state.playing = null; app.querySelectorAll('.is-playing, .sounding').forEach(element => element.classList.remove('is-playing', 'sounding')); syncPlayback(); },
  });
}

app.addEventListener('click', async event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action, value } = target.dataset;
  try {
    if (action === 'reading-note') {
      const { clef, midi } = target.dataset;
      const note = staffNote(Number(midi), clef);
      stopPlayback();
      state.reading[clef] = note.midi;
      render();
      revealStaffNote(clef);
      announce(`${CLEFS.find(item => item.id === clef).name}、${note.syllable} ${note.label}、${note.position}${note.middleC ? '、中央ド' : ''}`);
      return await play([{ notes: [note] }], 'note', { midi: note.midi });
    }
    if (action === 'note') return await play([{ notes: [{ midi: Number(target.dataset.midi) }] }], 'note', { midi: Number(target.dataset.midi) });
    if (action === 'play-chord' || action === 'arpeggio') return await play([getChord(state.root, state.quality)], action, { arpeggio: action === 'arpeggio' });
    if (action === 'play-progression') return await play(selectedProgression(), action);
    if (action === 'play-scale') return await play([getScale(state.tonic, state.mode)], action, { arpeggio: true });
    if (action === 'play-step') return await play([selectedProgression()[Number(value)]], `step-${value}`, { stepIndex: Number(value) });
    stopPlayback();
    const oldView = state.view;
    if (action === 'root') state.root = value;
    if (action === 'quality') state.quality = value;
    if (action === 'tonic-major') { state.tonic = value; state.mode = 'major'; }
    if (action === 'tonic-minor') { state.tonic = value; state.mode = 'minor'; }
    if (action === 'mode') { state.mode = value; state.tonic = circleTonic(state.tonic, value); }
    if (action === 'voicing') state.voicing = value;
    if (action === 'practice-key') {
      if (target.dataset.target === 'chords') state.root = practiceKey(state.root, Number(value));
      else state.tonic = practiceKey(state.tonic, Number(value), state.mode);
    }
    if (action === 'view') state.view = value;
    if (action === 'reading-middle') { state.reading.treble = 60; state.reading.bass = 60; }
    if (action === 'home') { event.preventDefault(); state.view = 'chords'; }
    if (action === 'to-circle') { state.tonic = circleTonic(state.root, state.mode); state.view = 'circle'; }
    if (action === 'inspect') {
      const chord = selectedProgression()[Number(value)];
      state.root = chord.root;
      state.quality = chord.quality.id;
      state.view = 'chords';
    }
    render();
    if (action === 'reading-middle') CLEFS.forEach(clef => revealStaffNote(clef.id));
    if (oldView !== state.view) { document.querySelector('#main').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
    if (action === 'voicing') announce(`ルート入りの4音、${state.voicing === 'root' ? '基本形' : '転回形でつなぐ'}。${selectedProgression().map(chord => `${chord.symbol} ${chord.positionName} ${chord.notes.map(note => note.name).join('、')}`).join('。')}`);
    else if (state.view === 'reading') announce(action === 'reading-middle' ? '中央ド C4。ト音記号の下の加線、ヘ音記号の上の加線。同じ鍵盤の音です。' : '楽譜の読み方。ト音記号とヘ音記号の音符を選ぶと、鍵盤で確認できます。');
    else announce(state.view === 'chords' ? `${getChord(state.root, state.quality).symbol}、構成音 ${getChord(state.root, state.quality).notes.map(note => note.name).join('、')}` : `${state.tonic}${getScale(state.tonic, state.mode).name}、${getScale(state.tonic, state.mode).notes.map(note => note.name).join('、')}。Ⅱ–Ⅴ–Ⅰは${selectedProgression().map(chord => chord.symbol).join('、')}`);
  } catch (error) {
    stopPlayback();
    const banner = document.querySelector('#audio-error');
    banner.textContent = error.message || '音声を再生できませんでした。もう一度お試しください。';
    banner.hidden = false;
  }
});

app.addEventListener('change', event => {
  if (event.target.id !== 'quality-select') return;
  stopPlayback();
  state.quality = event.target.value;
  render();
  announce(`${getChord(state.root, state.quality).symbol}、構成音 ${getChord(state.root, state.quality).notes.map(note => note.name).join('、')}`);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { stopPlayback(); document.querySelector('#audio-error').hidden = true; }
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
