import { describe, expect, it } from 'vitest';
import { hitungGeometriUnsur } from './geometry';

describe('geometri unsur lingkaran', () => {
  it('apotema tepat nol ketika tali busur menjadi diameter', () => {
    const hasil = hitungGeometriUnsur({ x: 0, y: 0 }, 100, 0, Math.PI);
    expect(hasil.adaTaliBusur).toBe(true);
    expect(hasil.apotemaNol).toBe(true);
    expect(hasil.panjangApotema).toBe(0);
  });

  it('menyembunyikan geometri tali busur saat A dan B berimpit', () => {
    const hasil = hitungGeometriUnsur({ x: 0, y: 0 }, 100, 0.75, 0.75);
    expect(hasil.adaTaliBusur).toBe(false);
    expect(hasil.rentangBusur.panjang).toBe(0);
    expect(Object.values(hasil).every((nilai) => typeof nilai !== 'number' || Number.isFinite(nilai))).toBe(true);
  });
});
