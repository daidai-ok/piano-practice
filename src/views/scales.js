import { ROOTS, SCALE_TYPES, getScale, pitchClass } from '../theory.js';
import { icon, renderKeyboard } from './shared.js';

const lessons = {
  major: 'メジャースケールは、明るく安定した響きの基本となる7音の音階です。全音・全音・半音・全音・全音・全音・半音の順に進みます。',
  melodicMinor: 'メロディックマイナーは、ナチュラルマイナーの第6音と第7音を半音上げた音階です。ジャズでは上行・下行とも同じ音列を使います。',
  majorPentatonic: 'メジャーペンタトニックは、メジャースケールから第4音と第7音を抜いた5音の音階です。隣り合う音の半音のぶつかりがなく、親しみやすい響きになります。',
  minorPentatonic: 'マイナーペンタトニックは、1・♭3・4・5・♭7の5音でできた音階です。ロックやブルースなどでよく使われ、ブルーススケールの土台になります。',
  blues: 'ブルーススケールは、マイナーペンタトニックにブルーノートの♭5を加えた6音の音階です。♭5から5度へ半音でつなぐ動きが、ブルースらしい緊張感を生みます。',
  diminishedWholeHalf: '全音・半音の順を交互にくり返す、8音のディミニッシュスケールです。全音・半音型と呼ばれる対称的な音階です。',
  diminishedHalfWhole: '半音・全音の順を交互にくり返す、8音のディミニッシュスケールです。全音・半音型とは始まりが半音ずれた関係で、こちらも対称的な音階です。',
};

export function renderScalesView(state) {
  const scale = getScale(state.scaleRoot, state.scaleType);
  const selectedIndex = ROOTS.findIndex(root => pitchClass(root) === pitchClass(state.scaleRoot));
  const isMelodicMinor = state.scaleType === 'melodicMinor';
  const isBlues = state.scaleType === 'blues';
  return `<div class="scale-page">
    <section class="scale-controls" aria-label="スケールの選択">
      <div class="scale-root-control"><div class="panel-title"><h2>ルート音</h2></div><div class="root-selector" role="group" aria-label="スケールのルート音">${ROOTS.map((root, index) => { const selected = selectedIndex === index; const label = selected ? state.scaleRoot : root; return `<button type="button" data-action="scale-root" data-value="${label}" data-focus="scale-root-${index}" aria-pressed="${selected}">${label}</button>`; }).join('')}</div></div>
      <div class="scale-type-control"><div class="panel-title"><h2>スケールの種類</h2></div><div class="mode-switch scale-type-switch" role="group" aria-label="スケールの種類">${SCALE_TYPES.map(item => `<button type="button" data-action="scale-type" data-value="${item.id}" data-focus="scale-type-${item.id}" aria-pressed="${state.scaleType === item.id}">${item.label}</button>`).join('')}</div></div>
    </section>
    <section class="scale-lesson" aria-label="${scale.root}${scale.name}">
      <div class="scale-lesson-heading"><h2><span>${scale.root}</span> ${scale.name}</h2><button type="button" class="button secondary" data-action="play-scale" data-focus="play-scale">${icon('notes')}<span>スケールを聴く</span></button></div>
      <p class="scale-explanation">${lessons[state.scaleType]}${isMelodicMinor ? ' クラシックの旋律的短音階では、下行形をナチュラルマイナーにする扱いもあります。' : ''}</p>
      ${isBlues ? `<aside class="scale-evolution" aria-label="マイナーペンタトニックからブルーススケールへの発展"><div class="scale-evolution-formula"><div><span>マイナーペンタトニック</span><strong>1 · ♭3 · 4 · 5 · ♭7</strong></div><span class="scale-evolution-add">＋ ♭5</span><div class="scale-evolution-result"><span>ブルーススケール</span><strong>1 · ♭3 · 4 · ♭5 · 5 · ♭7</strong></div></div><p>4度と5度のあいだに♭5（ブルーノート）を加えると、音の流れにブルースらしい揺れが生まれます。</p><button type="button" data-action="scale-type" data-value="minorPentatonic" data-focus="scale-type-minorPentatonic">マイナーペンタトニックと比べる ${icon('arrow')}</button></aside>` : ''}
      <div class="instrument-panel"><div class="instrument-heading"><span>${icon('keyboard')} 鍵盤で確認</span><span>C3 — C5</span></div>${renderKeyboard(scale, 'scale')}<div class="key-legend"><span><i class="root-dot"></i>ルート</span><span><i class="tone-dot"></i>構成音</span></div></div>
    </section>
  </div>`;
}
