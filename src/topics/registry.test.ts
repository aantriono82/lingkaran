import { describe, expect, it } from 'vitest';
import { ambilTopikPerRumpun, topicModules, topicRegistry } from './registry';
import { DAFTAR_RUMPUN, RUMPUN_IDS } from '../types';

describe('kontrak modul topik', () => {
  it('menemukan 10 topik dalam urutan nomor', () => {
    expect(topicModules).toHaveLength(10);
    expect(topicRegistry.map((topik) => topik.nomor)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const modul of topicModules) {
      expect(modul.meta.id).toMatch(/^\d{2}-/);
      expect(modul.meta.ikon).toBeTruthy();
      expect(modul.concept.poin.length).toBeGreaterThan(0);
      expect(modul.concept.rumus.length).toBeGreaterThan(0);
      expect(modul.jenisSoal.length).toBeGreaterThan(0);
    }
  });

  it('setiap generator menghasilkan lima soal dan describe aman', () => {
    for (const modul of topicModules) {
      const soal = Array.from({ length: 5 }, (_, indeks) => modul.generator(1000 + indeks));
      expect(soal).toHaveLength(5);
      expect(soal.every((item) => item.pertanyaan && item.jawabanBenar !== undefined)).toBe(true);
      expect(modul.describe()).not.toMatch(/NaN|undefined/);
    }
  });

  it('semua 10 topik memiliki metadata rumpun yang sah dan terdistribusi benar', () => {
    expect(DAFTAR_RUMPUN).toHaveLength(4);
    for (const modul of topicModules) {
      expect(RUMPUN_IDS).toContain(modul.meta.rumpun);
      expect(modul.rumpun).toBe(modul.meta.rumpun);
    }

    const topikRumpun1 = ambilTopikPerRumpun('rumpun-1');
    const topikRumpun2 = ambilTopikPerRumpun('rumpun-2');
    const topikRumpun3 = ambilTopikPerRumpun('rumpun-3');
    const topikRumpun4 = ambilTopikPerRumpun('rumpun-4');

    expect(topikRumpun1.map((t) => t.id)).toEqual(['01-unsur', '02-keliling', '03-luas']);
    expect(topikRumpun2.map((t) => t.id)).toEqual(['04-sudut', '05-tali-busur', '06-segi-empat']);
    expect(topikRumpun3.map((t) => t.id)).toEqual(['07-dalam-segitiga', '08-luar-segitiga']);
    expect(topikRumpun4.map((t) => t.id)).toEqual(['09-garis-singgung', '10-kedudukan']);

    const totalTerhitung = topikRumpun1.length + topikRumpun2.length + topikRumpun3.length + topikRumpun4.length;
    expect(totalTerhitung).toBe(10);

    const setSemuaId = new Set(topicRegistry.map((t) => t.id));
    expect(setSemuaId.size).toBe(10);
  });
});

