import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { allFormulas, formulasByTopic } from './formulas';

describe('registry rumus KaTeX', () => {
  it('memuat rumus untuk semua 10 topik', () => {
    expect(Object.keys(formulasByTopic)).toHaveLength(10);
    for (const [topik, kumpulan] of Object.entries(formulasByTopic)) {
      expect(kumpulan.konsep.length, topik).toBeGreaterThan(0);
      expect([...kumpulan.konsep, ...kumpulan.eksplorasi].length, topik).toBeGreaterThan(0);
    }
  });

  it.each([...new Set(allFormulas)])('merender rumus tanpa error: %s', (rumus) => {
    const hasil = katex.renderToString(rumus, { throwOnError: true });
    expect(hasil).toBeTruthy();
    if (rumus.includes(String.raw`\pi`)) expect(hasil).toContain('π');
  });

  it('tidak memiliki pi sebagai teks biasa di dalam rumus', () => {
    for (const rumus of allFormulas) {
      expect(rumus).not.toMatch(/(?<!\\)\bpi\b/i);
    }
  });
});
