import { describe, expect, it } from 'vitest';
import { buatPaketKuis, buatSoal, jawabanSama, parseNumericAnswer, parseNumericCandidates } from './generator';
import generatorSource from './generator.ts?raw';
import conceptSource from '../../topics/05-tali-busur/concept.ts?raw';
import exploreSource from '../../topics/05-tali-busur/Explore.tsx?raw';

describe('regresi perbaikan audit generator', () => {
  it('membangun segitiga sumber yang sah untuk seluruh soal Topik 7', () => {
    for (let seed = 0; seed < 2000; seed += 1) {
      const soal = buatSoal('07-dalam-segitiga', seed);
      const sumber = soal.sumberGeometri;
      if (soal.data?.jenis === 'luas' || soal.data?.jenis === 'siku-siku' || soal.data?.jenis === 'radius') {
        expect(sumber?.jenis).toBe('segitiga');
        const a = Number(sumber?.a);
        const b = Number(sumber?.b);
        const c = Number(sumber?.c);
        const s = Number(sumber?.setengahKeliling);
        const luas = Number(sumber?.luas);
        const r = Number(sumber?.jariJariDalam);
        expect(a + b).toBeGreaterThan(c);
        expect(a + c).toBeGreaterThan(b);
        expect(b + c).toBeGreaterThan(a);
        expect(s).toBeCloseTo((a + b + c) / 2, 8);
        expect(s).toBeGreaterThanOrEqual(3 * Math.sqrt(3) * r - 1e-8);
        expect(luas).toBeCloseTo(Math.sqrt(s * (s - a) * (s - b) * (s - c)), 8);
        expect(luas).toBeCloseTo(r * s, 8);
      }
    }
  });

  it('memakai istilah secan untuk perpotongan di luar lingkaran', () => {
    for (let seed = 0; seed < 2000; seed += 1) {
      const soal = buatSoal('05-tali-busur', seed);
      if (soal.data?.mode === 'luar') {
        expect(soal.pertanyaan).toContain('Perpanjangan dua tali busur');
        expect(soal.pertanyaan).toContain('secan');
        expect(soal.pertanyaan).not.toContain(['Dua tali busur', 'berpotongan di luar'].join(' '));
      }
    }
  });

  it('tidak menyisakan istilah lama pada generator, konsep, atau eksplorasi', () => {
    const istilahLama = ['Dua tali busur', 'berpotongan di luar'].join(' ');
    expect(generatorSource).not.toContain(istilahLama);
    expect(conceptSource).not.toContain(istilahLama);
    expect(exploreSource).not.toContain(istilahLama);
  });

  it('menerima satuan, koma atau titik, serta menangani pemisah ambigu berbasis kunci', () => {
    const kasus: Array<[string, number, boolean]> = [
      ['12,5', 12.5, true], ['12.5', 12.5, true], [' 12.5 ', 12.5, true],
      ['−7', -7, true], ['70°', 70, true], ['70 derajat', 70, true],
      ['154 cm2', 154, true], ['154 cm²', 154, true], ['22 satuan', 22, true],
      ['1e3', 1000, false], ['1/2', 0.5, false], ['1,2,3', 1.23, false],
      ['1.234,5', 1234.5, false], ['1,234.5', 1234.5, false], ['1.234.567', 1234567, false],
      ['  ', 0, false], ['NaN', 0, false], ['∞', 0, false], ['+5', 5, true],
      ['-0', 0, true], ['.5', 0.5, true], ['5.', 5, true]
    ];
    for (const [input, expected, valid] of kasus) {
      const nilai = parseNumericAnswer(input);
      expect(nilai !== null, input).toBe(valid);
      if (valid) expect(nilai).toBe(expected);
    }
    expect(parseNumericCandidates('1,234')).toEqual([1.234, 1234]);
    expect(parseNumericCandidates('1.386')).toEqual([1.386, 1386]);
    const soal = buatSoal('01-unsur', 2);
    const kunci = Number(soal.jawabanBenar);
    expect(jawabanSama({ ...soal, jawabanBenar: 1234, toleransi: 0.01 }, '1,234')).toBe(true);
    expect(jawabanSama({ ...soal, jawabanBenar: 1.234, toleransi: 0.01 }, '1,234')).toBe(true);
    expect(kunci).toBeGreaterThan(0);
  });

  it('paket kuis tidak menggandakan soal atau tiga jenis berturut-turut', () => {
    for (const topik of ['01-unsur', '02-keliling', '03-luas', '04-sudut', '05-tali-busur', '06-segi-empat', '07-dalam-segitiga', '08-luar-segitiga', '09-garis-singgung', '10-kedudukan'] as const) {
      for (let seed = 0; seed < 200; seed += 1) {
        const paket = buatPaketKuis(topik, seed);
        expect(new Set(paket.map((soal) => `${soal.pertanyaan}|${soal.jawabanBenar}`)).size).toBe(5);
        for (let indeks = 2; indeks < paket.length && topik !== '04-sudut'; indeks += 1) {
          const sebelumnya = String(paket[indeks - 1].data?.jenis);
          expect(String(paket[indeks - 2].data?.jenis) === sebelumnya && String(paket[indeks].data?.jenis) === sebelumnya).toBe(false);
        }
      }
    }
  });

  it('menyertakan sumber geometri dan domain berantai yang valid pada Topik 8 sampai 10', () => {
    for (let seed = 0; seed < 2000; seed += 1) {
      const luar = buatSoal('08-luar-segitiga', seed);
      const sumberLuar = luar.sumberGeometri;
      expect(sumberLuar?.jenis).toBe('segitiga');
      const a = Number(sumberLuar?.a); const b = Number(sumberLuar?.b); const c = Number(sumberLuar?.c);
      expect(a + b).toBeGreaterThan(c);
      expect(a + c).toBeGreaterThan(b);
      expect(b + c).toBeGreaterThan(a);

      const singgung = buatSoal('09-garis-singgung', seed);
      const sumberSinggung = singgung.sumberGeometri;
      expect(sumberSinggung?.jenis).toBeDefined();
      if (singgung.data?.jenis === 'luar' || singgung.data?.jenis === 'dalam') {
        const R = Number(sumberSinggung?.R); const r = Number(sumberSinggung?.r); const d = Number(sumberSinggung?.d);
        expect(R).toBeGreaterThan(r);
        expect(d).toBeGreaterThan(singgung.data.jenis === 'luar' ? R - r : R + r);
      }

      const kedudukan = buatSoal('10-kedudukan', seed);
      const sumberKedudukan = kedudukan.sumberGeometri;
      const R = Number(sumberKedudukan?.R); const r = Number(sumberKedudukan?.r); const d = Number(sumberKedudukan?.d);
      expect(R).toBeGreaterThan(r);
      expect(d).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(d)).toBe(true);
    }
  });
});
