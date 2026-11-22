import { CIRCLE, MINOR_ROOTS, RELATIVE_MINORS, SIGNATURES, getRootlessProgression, getVoicedProgression, pitchClass } from '../theory.js';
import { icon, renderChordSymbol, renderKeyboard } from './shared.js';

function circleWheel(state, progression) {
  return `<div class="circle-wheel" role="group" aria-label="五度圏。外側でメジャー、内側でナチュラルマイナーのルートを選択">
    <svg class="wheel-guide" viewBox="0 0 400 400" aria-hidden="true"><circle cx="200" cy="200" r="163"/><circle cx="200" cy="200" r="111"/>${CIRCLE.map((_, i) => { const angle = (i * 30 - 75) * Math.PI / 180; return `<path d="M${200 + Math.cos(angle) * 140} ${200 + Math.sin(angle) * 140} L${200 + Math.cos(angle) * 184} ${200 + Math.sin(angle) * 184}"/>`; }).join('')}</svg>
    ${CIRCLE.map((root, index) => {
      const angle = (index * 30 - 90) * Math.PI / 180;
      const x = (50 + Math.cos(angle) * 40.5).toFixed(3);
      const y = (50 + Math.sin(angle) * 40.5).toFixed(3);
      const roleIndex = progression.findIndex(chord => pitchClass(chord.root) === pitchClass(root));
      const outerSelected = state.mode === 'major' && root === state.tonic;
      const innerSelected = state.mode === 'minor' && MINOR_ROOTS[index] === state.tonic;
      return `<button type="button" class="circle-note ${outerSelected ? 'selected' : ''} ${roleIndex === 0 ? 'is-two' : roleIndex === 1 ? 'is-five' : ''}" style="--x:${x}%;--y:${y}%" data-action="tonic-major" data-value="${root}" data-focus="circle-${index}" aria-pressed="${outerSelected}" aria-label="${root}メジャーキーとⅡ–Ⅴ–Ⅰ"><strong>${root}</strong><span>${SIGNATURES[index]}</span></button>
      <button type="button" class="relative-minor ${innerSelected ? 'selected' : ''}" style="--x:${(50 + Math.cos(angle) * 26.5).toFixed(3)}%;--y:${(50 + Math.sin(angle) * 26.5).toFixed(3)}%" data-action="tonic-minor" data-value="${MINOR_ROOTS[index]}" data-focus="minor-${index}" aria-pressed="${innerSelected}" aria-label="${MINOR_ROOTS[index]}マイナーキーとⅡ–Ⅴ–Ⅰ">${RELATIVE_MINORS[index]}</button>`;
    }).join('')}
    <div class="circle-center"><strong>${state.tonic}</strong><span class="center-mode">${state.mode === 'major' ? 'MAJOR' : 'MINOR'}</span></div>
  </div>`;
}

export function renderCircleView(state) {
  const progression = getVoicedProgression(state.tonic, state.mode, state.voicing);
  const rootlessProgression = getRootlessProgression(state.tonic, state.mode, state.rootlessType);
  return `<section class="circle-overview" aria-label="五度圏と解決先">
    <div class="wheel-panel">${circleWheel(state, progression)}</div>
    <div class="resolution-panel">
      <div class="resolution-controls"><div class="mode-switch" role="group" aria-label="解決先の調性"><button type="button" data-action="mode" data-value="major" data-focus="mode-major" aria-pressed="${state.mode === 'major'}">メジャー</button><button type="button" data-action="mode" data-value="minor" data-focus="mode-minor" aria-pressed="${state.mode === 'minor'}">マイナー</button></div></div>
      <div class="destination-heading"><button type="button" class="button primary destination-play" data-action="play-progression" data-focus="play-progression" aria-label="Ⅱ–Ⅴ–Ⅰを聴く">${icon('play')}</button></div>
      <p class="destination-description">${state.mode === 'major' ? 'Ⅱm7 → Ⅴ7 → Ⅰmaj7' : 'Ⅱm7♭5 → Ⅴ7 → Ⅰm(maj7)'}</p>
      ${state.mode === 'minor' ? '<p class="minor-explainer">マイナーのⅡ–Ⅴ–Ⅰは、解決感を作るためⅤ7とⅠm(maj7)に導音（上げた第7音）を使います。</p>' : ''}
    </div>
  </section>
  <section class="progression-section" aria-label="Ⅱ–Ⅴ–Ⅰの3つのコード">
    <div class="voicing-panel"><div class="voicing-heading"><h3>ルート入りのフォーノート</h3><div class="mode-switch" role="group" aria-label="Ⅱ–Ⅴ–Ⅰのヴォイシング"><button type="button" data-action="voicing" data-value="root" data-focus="voicing-root" aria-pressed="${state.voicing === 'root'}">基本形</button><button type="button" data-action="voicing" data-value="connected" data-focus="voicing-connected" aria-pressed="${state.voicing === 'connected'}">転回形でつなぐ</button></div></div>${state.voicing === 'connected' ? '<p>Ⅱは基本形から。Ⅴ・Ⅰは4つの音の移動が少なくなる転回形の一例です。ルートは濃い緑で示し、最低音とは限りません。</p>' : ''}</div>
    <div class="progression-grid">${progression.map((chord, index) => `<article class="progression-card" data-step="${index}"><div class="progression-card-top"><span class="roman-label degree-${index}">${chord.roman}</span><h3 class="progression-chord">${renderChordSymbol(chord)}</h3><button type="button" class="icon-button" data-action="play-step" data-value="${index}" data-focus="step-${index}" aria-label="${chord.symbol}を聴く">${icon('play')}</button></div>${state.voicing === 'connected' ? `<p class="voicing-caption">${chord.positionName} · 最低音 ${chord.notes[0].name}</p>` : ''}${renderKeyboard(chord, `step-${index}`, true)}</article>`).join('')}</div>
  </section>
  <section class="rootless-section" aria-label="両手で弾くルートレスヴォイシング">
    <div class="rootless-heading"><div><h2>両手のルートレス</h2><p>ルートを省いた4音を、左手2音・右手2音に分けて弾きます。</p></div><div class="rootless-controls"><div class="mode-switch" role="group" aria-label="ルートレスヴォイシングのタイプ"><button type="button" data-action="rootless-type" data-value="A" data-focus="rootless-A" aria-pressed="${state.rootlessType === 'A'}">Aタイプ</button><button type="button" data-action="rootless-type" data-value="B" data-focus="rootless-B" aria-pressed="${state.rootlessType === 'B'}">Bタイプ</button></div><button type="button" class="button primary" data-action="play-rootless" data-focus="play-rootless" aria-label="ルートレスのⅡ–Ⅴ–Ⅰを聴く">${icon('play')}<span>再生</span></button></div></div>
    <p class="rootless-explainer">A/Bは通常、左手で弾くルートレスの形の分類です。AはⅡで3度→Ⅴで7度→Ⅰで3度、Bはその逆の順で最低音が移ります。ここでは各4音を左手2音・右手2音に分けて表示します。</p>
    <div class="progression-grid">${rootlessProgression.map((chord, index) => {
      const handNotes = notes => notes.map(note => `${note.name}${Math.floor(note.midi / 12) - 1}`).join(' · ');
      return `<article class="progression-card rootless-card" data-rootless-step="${index}"><div class="progression-card-top"><span class="roman-label degree-${index}">${chord.roman}</span><h3 class="progression-chord">${renderChordSymbol(chord)}</h3><button type="button" class="icon-button" data-action="play-rootless-step" data-value="${index}" data-focus="rootless-step-${index}" aria-label="${chord.symbol}のルートレスを聴く">${icon('play')}</button></div><div class="rootless-hands"><p><span>左手</span><strong>${handNotes(chord.notes.slice(0, 2))}</strong></p><p><span>右手</span><strong>${handNotes(chord.notes.slice(2))}</strong></p></div>${renderKeyboard(chord, `rootless-${index}`, true, { start: 36, end: 72 })}</article>`;
    }).join('')}</div>
  </section>`;
}
