import { FOCUS_QUALITIES, QUALITIES, ROOTS, ROOT_SPELLINGS, getChord, pitchClass } from '../theory.js';
import { escapeHtml, icon, renderChordSymbol, renderKeyboard } from './shared.js';

function qualityChoices(state, qualities) {
  return qualities.map(q => `<button type="button" class="quality-choice" data-action="quality" data-value="${q.id}" data-focus="quality-${q.id}" aria-pressed="${state.quality === q.id}"><span class="quality-symbol">${state.root}<span>${q.symbol}</span></span><span class="quality-name">${q.name}</span><span class="choice-mark" aria-hidden="true">${state.quality === q.id ? icon('check') : ''}</span></button>`).join('');
}

export function renderChordLibrary(state) {
  const chord = getChord(state.root, state.quality);
  const alternative = ROOT_SPELLINGS[pitchClass(state.root)].find(root => root !== state.root);
  const focused = FOCUS_QUALITIES.map(id => QUALITIES.find(q => q.id === id));
  const remaining = QUALITIES.filter(q => !FOCUS_QUALITIES.includes(q.id));
  return `<div class="chord-workbench">
    <section class="library-panel" aria-label="コードを選択">
      <div class="panel-title"><h2>ルート音</h2></div>
      <div class="root-selector" role="group" aria-label="ルート音">${ROOTS.map((root, index) => { const selected = pitchClass(state.root) === index; const label = selected ? state.root : root; return `<button type="button" data-action="root" data-value="${label}" data-focus="root-${index}" aria-pressed="${selected}">${label}</button>`; }).join('')}</div>
      <div class="enharmonic-control">${alternative ? `<button type="button" data-action="root" data-value="${alternative}" data-focus="enharmonic" aria-label="ルートを${alternative}表記に切り替え">${state.root} ⇄ ${alternative}<span>異名同音</span></button>` : ''}</div>
      <div class="mobile-quality"><label for="quality-select">コードの種類</label><select id="quality-select" data-focus="quality-select">${[[focused, 'まず覚える3つ'], [remaining, 'その他のコード']].map(([qualities, label]) => `<optgroup label="${label}">${qualities.map(q => `<option value="${q.id}" ${state.quality === q.id ? 'selected' : ''}>${state.root}${q.symbol} — ${q.name}</option>`).join('')}</optgroup>`).join('')}</select></div>
      <div class="quality-groups"><div class="quality-group"><div class="panel-title"><h2>まず覚える3つ</h2></div><div class="quality-list" role="group" aria-label="優先して練習するコード">${qualityChoices(state, focused)}</div></div><details class="other-chords" ${FOCUS_QUALITIES.includes(state.quality) ? '' : 'open'}><summary>その他のコード</summary><div class="quality-list" role="group" aria-label="その他のコード">${qualityChoices(state, remaining)}</div></details></div>
    </section>
    <section class="chord-detail" aria-label="選択したコード">
      <div class="detail-heading"><div><h2 class="chord-display">${renderChordSymbol(chord)}</h2><p class="chord-name">${chord.quality.name}</p></div></div>
      <div class="instrument-panel">
        ${renderKeyboard(chord, 'main')}
        <div class="key-legend"><span><i class="root-dot"></i>ルート</span><span><i class="tone-dot"></i>構成音</span><span class="range-label">C3 — C5</span></div>
      </div>
      <div class="tone-heading"><h3>コードの構成音</h3><span>${chord.quality.formula.join(' · ')}</span></div>
      <div class="tone-list">${chord.notes.map(note => `<div class="tone-item ${note.isRoot ? 'is-root' : ''}"><span class="tone-degree">${note.isRoot ? 'ROOT' : `${note.degree} 度`}</span><strong>${note.name}</strong></div>`).join('')}</div>
      <div class="audio-controls"><button type="button" class="button primary" data-action="play-chord" data-focus="play-chord">${icon('play')}<span>コードを聴く</span></button><button type="button" class="button secondary" data-action="arpeggio" data-focus="arpeggio">${icon('notes')}<span>1音ずつ聴く</span></button></div>
      <button type="button" class="next-lesson" data-action="to-circle" data-focus="to-circle"><span>このルートへのⅡ–Ⅴ–Ⅰを見る</span>${icon('arrow')}</button>
    </section>
  </div>`;
}
