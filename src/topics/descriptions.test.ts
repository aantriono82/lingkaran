import { describe, expect, it } from 'vitest';
import {
  describeDalam, describeKedudukan, describeKeliling, describeLuas, describeLuar, describeSegiEmpat,
  describeSinggung, describeSudut, describeTaliBusur, describeUnsur
} from './descriptions';

describe('ringkasan aksesibilitas setiap topik', () => {
  const ringkasan = [
    describeUnsur({ radius: 145, sudutA: 0.5, sudutB: 2 }),
    describeKeliling({ radius: 7, keliling: 43.96, kemajuan: 50 }),
    describeLuas({ radius: 7, jumlahJuring: 16, luas: 153.86 }),
    describeSudut({ sudutPusat: 80, sudutKeliling: 40, sudutKelilingD: 40 }),
    describeTaliBusur({ sudut: 55 }),
    describeSegiEmpat({ jumlahSudut: 180 }),
    describeDalam({ radius: 2, valid: true }),
    describeLuar({ radius: 4, valid: true, letak: 'di dalam' }),
    describeSinggung({ mode: 'pada-lingkaran', sudut: 45 }),
    describeKedudukan({ jarak: 170, radiusA: 105, radiusB: 65, kedudukan: 'bersinggungan luar' })
  ];

  it('tidak memuat NaN atau undefined dan menyebut besaran utama', () => {
    for (const teks of ringkasan) {
      expect(teks).not.toMatch(/NaN|undefined/);
      expect(teks.length).toBeGreaterThan(20);
    }
  });
});
