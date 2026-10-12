import { describe, expect, it } from 'vitest';
import { hitungBatasArchimedes, hitungBatasTrigonometri } from './archimedes';

describe('batas Archimedes', () => {
  it('rekurrensi pelipatan sisi cocok dengan trigonometri', () => {
    for (const n of [6, 12, 24, 48, 96]) {
      const rekurrensi = hitungBatasArchimedes(n);
      const trigonometri = hitungBatasTrigonometri(n);
      expect(rekurrensi.bawah).toBeCloseTo(trigonometri.bawah, 9);
      expect(rekurrensi.atas).toBeCloseTo(trigonometri.atas, 9);
    }
  });

  it('selalu mengapit Math.PI untuk n 3 sampai 96', () => {
    for (let n = 3; n <= 96; n += 1) {
      const batas = hitungBatasArchimedes(n);
      expect(batas.bawah).toBeLessThan(Math.PI);
      expect(batas.atas).toBeGreaterThan(Math.PI);
      expect([batas.bawah, batas.atas, batas.selisih].every(Number.isFinite)).toBe(true);
    }
  });

  it('selisih batas mengecil saat jumlah sisi bertambah', () => {
    let sebelumnya = hitungBatasArchimedes(3).selisih;
    for (let n = 4; n <= 96; n += 1) {
      const sekarang = hitungBatasArchimedes(n).selisih;
      expect(sekarang).toBeLessThan(sebelumnya);
      sebelumnya = sekarang;
    }
  });

  it('sesuai nilai acuan', () => {
    expect(hitungBatasArchimedes(6).bawah).toBeCloseTo(3, 4);
    expect(hitungBatasArchimedes(6).atas).toBeCloseTo(3.4641, 4);
    expect(hitungBatasArchimedes(12).bawah).toBeCloseTo(3.1058, 4);
    expect(hitungBatasArchimedes(12).atas).toBeCloseTo(3.2154, 4);
    expect(hitungBatasArchimedes(96).bawah).toBeCloseTo(3.14103, 4);
    expect(hitungBatasArchimedes(96).atas).toBeCloseTo(3.14271, 4);
    expect(hitungBatasArchimedes(96).bawah).toBeGreaterThan(223 / 71 - 1e-6);
    expect(hitungBatasArchimedes(96).atas).toBeLessThan(22 / 7 + 1e-6);
  });
});

