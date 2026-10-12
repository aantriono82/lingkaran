import { memo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const mathCache = new Map<string, string>();

function renderMath(teks: string): string {
  const cached = mathCache.get(teks);
  if (cached !== undefined) return cached;

  const formula = teks
    .replace(/π/g, '\\pi')
    .replace(/×/g, '\\times ')
    .replace(/÷/g, '\\div ')
    .replace(/√\(([^)]*)\)/g, '\\sqrt{$1}')
    .replace(/√([A-Za-z0-9]+)/g, '\\sqrt{$1}')
    .replace(/²/g, '^2')
    .replace(/−/g, '-')
    .replace(/°/g, '^\\circ');
  const hasil = katex.renderToString(formula, { throwOnError: false, displayMode: false });
  if (mathCache.size > 250) {
    mathCache.clear();
  }
  mathCache.set(teks, hasil);
  return hasil;
}

/** Menampilkan langkah matematika sebagai KaTeX tanpa menghilangkan teks penjelasan. */
export const MathText = memo(function MathText({ text }: { text: string }) {
  const bagian = text.split(/(?<=[.!?])\s+/);
  return <>{bagian.map((potongan, indeks) => {
    const memilikiRumus = /[=<>]|π|√|×|÷|²/.test(potongan);
    if (!memilikiRumus) return <span key={indeks}>{potongan}{indeks < bagian.length - 1 ? ' ' : ''}</span>;
    return <span key={indeks} className="math-explanation" dangerouslySetInnerHTML={{ __html: renderMath(potongan) + (indeks < bagian.length - 1 ? ' ' : '') }} />;
  })}</>;
});
