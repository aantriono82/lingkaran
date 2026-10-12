import { describe, expect, it } from 'vitest';
import { bendaLingkaran, rataRata, ukurKeliling } from './data';

describe('data pengukuran π', () => {
  it('mode ideal menghasilkan keliling berdasarkan Math.PI', () => {
    for (const benda of bendaLingkaran) {
      expect(ukurKeliling(benda.diameter, 'ideal')).toBe(Math.PI * benda.diameter);
      expect(ukurKeliling(benda.diameter, 'ideal') / benda.diameter).toBeCloseTo(Math.PI, 14);
    }
  });

  it('mode manual deterministik dan rasionya tetap dekat dengan π', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      for (const benda of bendaLingkaran) {
        const pertama = ukurKeliling(benda.diameter, 'manual', seed);
        const kedua = ukurKeliling(benda.diameter, 'manual', seed);
        expect(pertama).toBe(kedua);
        expect(pertama / benda.diameter).toBeGreaterThanOrEqual(3);
        expect(pertama / benda.diameter).toBeLessThanOrEqual(3.3);
      }
    }
  });

  it('menghitung rata-rata rasio dan aman untuk data kosong', () => {
    expect(rataRata([])).toBe(0);
    expect(rataRata([3, 3.2, 3.1])).toBeCloseTo(3.1);
  });
});
