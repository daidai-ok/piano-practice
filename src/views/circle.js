import { CIRCLE, MINOR_ROOTS, RELATIVE_MINORS, SIGNATURES, getVoicedProgression, pitchClass } from '../theory.js';
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
    <div class="circle-center"><span>選択中のルート</span><strong>${state.tonic}</strong><span class="center-mode">${state.mode === 'major' ? 'MAJOR' : 'MINOR'}</span></div>
  </div>`;
}

export function renderCircleView(state) {
  const progression = getVoicedProgression(state.tonic, state.mode, state.voicing);
  return `<section class="circle-overview" aria-label="五度圏と解決先">
    <div class="wheel-panel">${circleWheel(state, progression)}</div>
    <div class="resolution-panel">
      <div class="resolution-controls"><div class="mode-switch" role="group" aria-label="解決先の調性"><button type="button" data-action="mode" data-value="major" data-focus="mode-major" aria-pressed="${state.mode === 'major'}">メジャー</button><button type="button" data-action="mode" data-value="minor" data-focus="mode-minor" aria-pressed="${state.mode === 'minor'}">マイナー</button></div></div>
      <div class="destination-heading"><button type="button" class="button primary destination-play" data-action="play-progression" data-focus="play-progression" aria-label="Ⅱ–Ⅴ–Ⅰを聴く">${icon('play')}</button></div>
      <p class="destination-description">${state.mode === 'major' ? 'Ⅱm7 → Ⅴ7 → Ⅰmaj7' : 'Ⅱm7♭5 → Ⅴ7 → Ⅰm(maj7)'}</p>
      ${state.mode === 'minor' ? '<p class="minor-explainer">マイナーのⅡ–Ⅴ–Ⅰは、解決感を作るためⅤ7とⅠm(maj7)に導音（上げた第7音）を使います。</p>' : ''}
    </div>
  </section>
  <section class="progression-section" aria-label="Ⅱ–Ⅴ–Ⅰの3つのコード"><div class="progression-heading"><h2><span class="sequence-title">Ⅱ <i>→</i> Ⅴ <i>→</i> Ⅰ</span><span class="sequence-subtitle">${state.tonic}へのツーファイブワン</span></h2></div>
    <div class="voicing-panel"><div class="voicing-heading"><h3>ルート入りのフォーノート</h3><div class="mode-switch" role="group" aria-label="Ⅱ–Ⅴ–Ⅰのヴォイシング"><button type="button" data-action="voicing" data-value="root" data-focus="voicing-root" aria-pressed="${state.voicing === 'root'}">基本形</button><button type="button" data-action="voicing" data-value="connected" data-focus="voicing-connected" aria-pressed="${state.voicing === 'connected'}">転回形でつなぐ</button></div></div>${state.voicing === 'connected' ? '<p>Ⅱは基本形から。Ⅴ・Ⅰは4つの音の移動が少なくなる転回形の一例です。ルートは濃い緑で示し、最低音とは限りません。</p>' : ''}</div>
    <div class="progression-grid">${progression.map((chord, index) => `<article class="progression-card" data-step="${index}"><div class="progression-card-top"><span class="roman-label degree-${index}">${chord.roman}</span><h3 class="progression-chord">${renderChordSymbol(chord)}</h3><button type="button" class="icon-button" data-action="play-step" data-value="${index}" data-focus="step-${index}" aria-label="${chord.symbol}を聴く">${icon('play')}</button></div>${state.voicing === 'connected' ? `<p class="voicing-caption">${chord.positionName} · 最低音 ${chord.notes[0].name}</p>` : ''}${renderKeyboard(chord, `step-${index}`, true)}</article>`).join('')}</div>
  </section>`;
}
