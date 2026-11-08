import { CLEFS, staffNotes, staffNote } from './notation.js';

function staff(clef, selectedMidi) {
  const notes = staffNotes(clef.id);
  const baseline = 36 + Math.max(10, notes.at(-1).step) * 9;
  const noteHeight = baseline - Math.min(-2, notes[0].step) * 9 + 20;
  const height = noteHeight + 44;
  const width = 704 + Math.max(0, notes.length - 13) * 48;
  const noteY = step => baseline - step * 9;
  return `<div class="staff-scroll"><div class="staff-diagram" style="--staff-width:${width}px;--staff-height:${height}px;--staff-note-height:${noteHeight}px;--staff-note-count:${notes.length}" role="group" aria-label="${clef.name}の音符を選択">
    <svg class="staff-background" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      ${[0, 2, 4, 6, 8].map(step => `<path d="M16 ${noteY(step)}H${width - 16}"/>`).join('')}
    </svg>
    <svg class="staff-clef" viewBox="0 0 80 ${height}" aria-hidden="true"><text x="16" y="${noteY(clef.referenceStep)}" class="music-glyph">${clef.glyph}</text></svg>
    <div class="staff-notes">${notes.map(note => {
      const y = noteY(note.step);
      const up = note.step < 4;
      const landmark = clef.id === 'bass' && (note.name === 'C' || note.name === 'G');
      return `<button type="button" class="staff-note${landmark ? ' staff-note-landmark' : ''}" data-action="reading-note" data-clef="${clef.id}" data-midi="${note.midi}" data-focus="staff-${clef.id}-${note.midi}" aria-pressed="${note.midi === selectedMidi}" aria-label="${clef.name} ${note.syllable} ${note.label}、${note.position}${note.middleC ? '、中央ド' : ''}">
        <svg viewBox="0 0 44 ${noteHeight}" aria-hidden="true">
          ${note.ledgerSteps.map(step => `<path class="ledger-line" d="M7 ${noteY(step)}H37"/>`).join('')}
          <ellipse class="note-head" cx="22" cy="${y}" rx="9" ry="6.4" transform="rotate(-18 22 ${y})"/>
          <path class="note-stem" d="M${up ? 30 : 14} ${y}v${up ? -40 : 40}"/>
        </svg>
        <span class="staff-syllable">${note.syllable}</span><span class="staff-pitch">${note.label}</span>
      </button>`;
    }).join('')}</div>
  </div></div>`;
}

export function readingView(selected, { keyboard, icon }) {
  return `<header class="page-heading"><div><h1>楽譜と鍵盤を、つなげる。</h1><p class="page-description">音符を選ぶと、弾く鍵盤が光ります。音の高さを、目と耳で確かめましょう。</p></div><span class="header-mark" aria-hidden="true">${icon('notes')}</span></header>
    <div class="reading-intro"><p>五線は<strong>下から第1線〜第5線</strong>。線 → 間 → 線と上がるたびに、ドレミもひとつずつ上がります。</p><button type="button" class="button secondary" data-action="reading-middle" data-focus="reading-middle">中央ドを両方で見る ${icon('arrow')}</button></div>
    <div class="reading-clefs">${CLEFS.map(clef => {
      const note = staffNote(selected[clef.id], clef.id);
      return `<section class="reading-clef" aria-labelledby="${clef.id}-title">
        <div class="reading-clef-heading"><div><h2 id="${clef.id}-title">${clef.name}</h2><p>${clef.description}</p></div><div class="reading-selection"><span>選択中の音</span><strong>${note.syllable} <small>${note.label}</small></strong><span>${note.middleC ? '中央ド · ' : ''}${note.position}</span></div></div>
        ${staff(clef, note.midi)}
        <div class="staff-hint"><span>音符をタップして選択・試聴</span><span>低い音 ← → 高い音 · 横にスクロール</span></div>
        <div class="reading-memory"><p><span>線の上</span>${clef.lines}</p><p><span>線の間</span>${clef.spaces}</p><span>どちらも下から読む</span></div>
        <div class="instrument-panel reading-instrument"><div class="instrument-heading"><span>${icon('keyboard')} ${note.syllable}（${note.label}）の鍵盤</span><span>緑色が、選んだ音</span></div>
          ${keyboard({ symbol: `${clef.name} ${note.syllable} ${note.label}`, notes: [{ ...note, isRoot: true }] }, `reading-${clef.id}`, false, { start: clef.keyboardStart, end: clef.keyboardEnd, reading: true, clef: clef.id })}
        </div>
      </section>`;
    }).join('')}</div>
    <aside class="learning-note reading-note"><span class="note-icon">${icon('book')}</span><div><h3>ふたつの五線をつなぐ「中央ド」</h3><p>中央ドはC4。ト音記号では五線の下、ヘ音記号では五線の上の加線に書きます。位置が違っても、同じ鍵盤・同じ高さの音です。ピアノでは上下の五線を組み合わせた「大譜表」をよく使います。</p><p>このページは♯・♭のない白鍵の音を表示しています。C・D・E・F・G・A・Bは、ド・レ・ミ・ファ・ソ・ラ・シ。数字が1増えると1オクターブ高くなります。右手でト音記号、左手でヘ音記号を弾くことが多いですが、必ずその組み合わせになるわけではありません。</p></div></aside>`;
}
