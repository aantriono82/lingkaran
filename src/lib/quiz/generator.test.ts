import { describe, expect, it } from 'vitest';
import { buatPaketKuis, buatSoal, jawabanSama, parseNumericAnswer } from './generator';

describe('generator soal deterministik', () => {
  it('menghasilkan soal sama untuk seed yang sama', () => {
    expect(buatSoal('01-unsur', 42)).toEqual(buatSoal('01-unsur', 42));
    expect(buatPaketKuis('04-sudut', 8)).toHaveLength(5);
  });

  it('jawaban numerik generator selalu sesuai rumus untuk banyak seed', () => {
    for (let seed = 1; seed <= 250; seed += 1) {
      const soalUnsur = buatSoal('01-unsur', seed);
      const angkaUnsur = soalUnsur.pertanyaan.match(/(\d+) cm/);
      expect(angkaUnsur).not.toBeNull();
      const nilaiUnsur = Number(angkaUnsur?.[1]);
      const expectedUnsur = soalUnsur.pertanyaan.includes('diameternya') ? nilaiUnsur * 2 : soalUnsur.pertanyaan.includes('jari-jarinya') ? nilaiUnsur / 2 : nilaiUnsur * 2 * 3.14;
      expect(Number(soalUnsur.jawabanBenar)).toBeCloseTo(expectedUnsur, 6);
      expect(jawabanSama(soalUnsur, String(expectedUnsur))).toBe(true);

      const soalSudut = buatSoal('04-sudut', seed);
      const angkaSudut = soalSudut.pertanyaan.match(/adalah (\d+)°/);
      expect(angkaSudut).not.toBeNull();
      const nilaiSudut = Number(angkaSudut?.[1]);
      expect(Number(soalSudut.jawabanBenar)).toBe(2 * nilaiSudut);
      expect(jawabanSama(soalSudut, String(2 * nilaiSudut))).toBe(true);
    }
  });

  it('menerima koma sebagai tanda desimal', () => {
    const soal = buatSoal('01-unsur', 1);
    if (typeof soal.jawabanBenar === 'number') {
      expect(jawabanSama(soal, String(soal.jawabanBenar).replace('.', ','))).toBe(true);
    }
  });

  it('menormalisasi spasi dan tanda minus Unicode pada parser angka', () => {
    expect(parseNumericAnswer(' 12,5 ')).toBe(12.5);
    expect(parseNumericAnswer('− 7')).toBe(-7);
    expect(parseNumericAnswer('abc')).toBeNull();
  });

  it('generator keliling, luas, dan dua tali busur sesuai rumus independen', () => {
    for (const topik of ['02-keliling', '03-luas', '05-tali-busur'] as const) {
      for (let seed = 1; seed <= 500; seed += 1) {
        const soal = buatSoal(topik, seed);
        const data = soal.data ?? {};
        const jenis = String(data.jenis);
        let expected: number;
        if (topik === '02-keliling') {
          const radius = Number(data.radius);
          const pi = Number(data.pi);
          if (jenis === 'ukur') {
            expect(soal.jawabanBenar).toBe('3,14');
            expect(jawabanSama(soal, '3,14')).toBe(true);
            continue;
          }
          if (jenis === 'rasio') {
            expected = Number((Number(data.keliling) / Number(data.diameter)).toFixed(2));
          } else if (jenis === 'apit') {
            expected = Number(data.batasBawah);
            expect(Number(data.batasAtas)).toBeGreaterThan(expected);
            expect(soal.jawabanBenar).toContain('π');
            expect(jawabanSama(soal, String(soal.jawabanBenar))).toBe(true);
            continue;
          } else if (jenis === 'radius') expected = 2 * pi * radius;
          else if (jenis === 'diameter') expected = pi * Number(data.diameter);
          else if (jenis === 'balik') expected = radius;
          else if (jenis === 'busur') expected = Number(data.sudut) / 360 * 2 * pi * radius;
          else expected = Number(data.putaran) * 2 * pi * radius;
        } else if (topik === '03-luas') {
          const radius = Number(data.radius);
          const pi = Number(data.pi);
          if (jenis === 'balik') expected = radius;
          else if (jenis === 'juring') expected = Number(data.sudut) / 360 * pi * radius ** 2;
          else if (jenis === 'gabungan') expected = Number(data.sisi) ** 2 - pi * radius ** 2;
          else if (jenis === 'setengah') expected = pi * radius ** 2 / 2;
          else expected = pi * radius ** 2;
        } else if (jenis === 'dua-busur') {
          const a = Number(data.busurPertama);
          const b = Number(data.busurKedua);
          expected = data.mode === 'dalam' ? (a + b) / 2 : Math.abs(a - b) / 2;
        } else {
          expected = Number(data.busurKedua);
        }
        const expectedRapi = Number(expected.toFixed(2));
        expect(Number(soal.jawabanBenar)).toBeCloseTo(expectedRapi, 6);
        expect(jawabanSama(soal, String(expectedRapi))).toBe(true);
      }
    }
  });

  it('menuliskan nilai pi yang sama pada soal dan pembahasan topik 2 dan 3', () => {
    for (const topik of ['02-keliling', '03-luas'] as const) {
      for (let seed = 1; seed <= 500; seed += 1) {
        const soal = buatSoal(topik, seed);
        if (topik === '02-keliling' && ['ukur', 'rasio', 'apit'].includes(String(soal.data?.jenis))) {
          expect(soal.pertanyaan).not.toContain('undefined');
          expect(soal.pembahasan).not.toContain('NaN');
          continue;
        }
        const pi = Number(soal.data?.pi) === 22 / 7 ? '22/7' : '3,14';
        expect(soal.pertanyaan).toContain(`π = ${pi}`);
        expect(soal.pembahasan).toContain(pi);
      }
    }
  });

  it('soal asal pi stabil, terbaca, dan tidak ambigu untuk 500 seed', () => {
    const jenisDitemukan = new Set<string>();
    for (let seed = 1; seed <= 500; seed += 1) {
      const soal = buatSoal('02-keliling', seed);
      const jenis = String(soal.data?.jenis);
      if (!['ukur', 'rasio', 'apit'].includes(jenis)) continue;
      jenisDitemukan.add(jenis);
      expect(soal.pertanyaan).not.toMatch(/undefined|NaN|Infinity/);
      expect(soal.pembahasan).not.toMatch(/undefined|NaN|Infinity/);
      if (soal.pilihan) expect(new Set(soal.pilihan).size).toBe(soal.pilihan.length);
      if (jenis === 'ukur') {
        const diameter = Number(soal.data?.diameter);
        const keliling = Number(soal.data?.keliling);
        expect(Number(soal.data?.rasio)).toBeCloseTo(keliling / diameter, 12);
        expect(soal.jawabanBenar).toBe('3,14');
      } else if (jenis === 'rasio') {
        const expected = Number((Number(soal.data?.keliling) / Number(soal.data?.diameter)).toFixed(2));
        expect(soal.jawabanBenar).toBe(expected);
        expect(jawabanSama(soal, String(expected).replace('.', ','))).toBe(true);
      } else {
        const n = Number(soal.data?.n);
        const bawah = n * Math.sin(Math.PI / n);
        const atas = n * Math.tan(Math.PI / n);
        expect(soal.pertanyaan).toContain(bawah.toFixed(3).replace(/0+$/, '').replace(/,$/, '').replace('.', ','));
        expect(Number(soal.data?.batasBawah)).toBeCloseTo(bawah, 12);
        expect(Number(soal.data?.batasAtas)).toBeCloseTo(atas, 12);
      }
    }
    expect(jenisDitemukan).toEqual(new Set(['ukur', 'rasio', 'apit']));
  });

  it('paket kuis topik 2 tetap lima soal dan paling banyak satu soal asal pi', () => {
    for (let seed = 1; seed <= 500; seed += 1) {
      const paket = buatPaketKuis('02-keliling', seed);
      expect(paket).toHaveLength(5);
      expect(paket.filter((soal) => ['ukur', 'rasio', 'apit'].includes(String(soal.data?.jenis))).length).toBeLessThanOrEqual(1);
    }
  });

  it('topik 6 sampai 8 sesuai rumus independen untuk 500 seed', () => {
    for (let seed = 1; seed <= 500; seed += 1) {
      const segiEmpat = buatSoal('06-segi-empat', seed);
      const jenisSegiEmpat = String(segiEmpat.data?.jenis);
      const expectedSegiEmpat = jenisSegiEmpat === 'berhadapan'
        ? 180 - Number(segiEmpat.data?.sudutDiketahui)
        : jenisSegiEmpat === 'aljabar'
          ? Number(segiEmpat.data?.x)
          : Number(segiEmpat.data?.sudutLuar);
      expect(Number(segiEmpat.jawabanBenar)).toBeCloseTo(expectedSegiEmpat, 6);
      expect(jawabanSama(segiEmpat, String(expectedSegiEmpat))).toBe(true);

      const dalam = buatSoal('07-dalam-segitiga', seed);
      const jenisDalam = String(dalam.data?.jenis);
      const expectedDalam = jenisDalam === 'luas'
        ? Number(dalam.data?.radius) * Number(dalam.data?.setengahKeliling)
        : (Number(dalam.data?.a) + Number(dalam.data?.b) - Number(dalam.data?.c)) / 2;
      expect(Number(dalam.jawabanBenar)).toBeCloseTo(expectedDalam, 6);
      expect(jawabanSama(dalam, String(expectedDalam))).toBe(true);

      const luar = buatSoal('08-luar-segitiga', seed);
      const jenisLuar = String(luar.data?.jenis);
      if (jenisLuar === 'klasifikasi') {
        const a = Number(luar.data?.a);
        const b = Number(luar.data?.b);
        const c = Number(luar.data?.c);
        const kuadrat = [a * a, b * b, c * c].sort((x, y) => x - y);
        const expectedJenis = kuadrat[0] + kuadrat[1] > kuadrat[2] ? 'lancip' : kuadrat[0] + kuadrat[1] === kuadrat[2] ? 'siku-siku' : 'tumpul';
        expect(luar.jawabanBenar).toBe(expectedJenis);
        expect(jawabanSama(luar, expectedJenis)).toBe(true);
      } else {
        const expectedLuar = jenisLuar === 'sama-kaki'
          ? Number(luar.data?.a) * Number(luar.data?.b) * Number(luar.data?.c) / (4 * Number(luar.data?.luas))
          : Number(luar.data?.c) / 2;
        const expectedRapi = Number(expectedLuar.toFixed(2));
        expect(Number(luar.jawabanBenar)).toBeCloseTo(expectedRapi, 6);
        expect(jawabanSama(luar, String(expectedRapi))).toBe(true);
      }
    }
  });

  it('topik 9 sesuai tripel Pythagoras dan rumus garis singgung untuk 500 seed', () => {
    for (let seed = 1; seed <= 500; seed += 1) {
      const soal = buatSoal('09-garis-singgung', seed);
      const data = soal.data ?? {};
      const jenis = String(data.jenis);
      const d = Number(data.d);
      const radius = Number(data.radius);
      const panjang = Number(data.panjang);
      let expected: number;
      if (jenis === 'panjang' || jenis === 'luar' || jenis === 'dalam') expected = panjang;
      else if (jenis === 'cari-radius') expected = Math.sqrt(d ** 2 - panjang ** 2);
      else if (jenis === 'cari-jarak') expected = Math.sqrt(radius ** 2 + panjang ** 2);
      else expected = 90;
      expect(Number(soal.jawabanBenar)).toBeCloseTo(expected, 6);
      expect(jawabanSama(soal, String(expected))).toBe(true);
      expect(Number.isFinite(Number(soal.jawabanBenar))).toBe(true);
      if (jenis !== 'sudut') {
        expect(Number.isFinite(d)).toBe(true);
        expect(Number.isFinite(Number(data.panjang))).toBe(true);
      }
    }
  });

  it('topik 10 sesuai perbandingan d, R+r, dan R-r untuk 500 seed', () => {
    for (let seed = 1; seed <= 500; seed += 1) {
      const soal = buatSoal('10-kedudukan', seed);
      const data = soal.data ?? {};
      const jenis = String(data.jenis);
      const R = Number(data.R);
      const r = Number(data.r);
      const d = Number(data.d);
      const jumlah = R + r;
      const selisih = R - r;
      if (jenis === 'klasifikasi') {
        const expected = d === 0 ? 'sepusat' : d > jumlah ? 'saling lepas' : d === jumlah ? 'bersinggungan luar' : d > selisih ? 'berpotongan di dua titik' : d === selisih ? 'bersinggungan dalam' : 'satu di dalam yang lain';
        expect(soal.jawabanBenar).toBe(expected);
        expect(jawabanSama(soal, expected)).toBe(true);
      } else if (jenis === 'jumlah-garis') {
        const expected = d > jumlah ? 4 : d === jumlah ? 3 : d > selisih ? 2 : d === selisih ? 1 : 0;
        expect(Number(soal.jawabanBenar)).toBe(expected);
        expect(jawabanSama(soal, String(expected))).toBe(true);
      } else if (jenis === 'jumlah-titik') {
        const expected = d === jumlah || d === selisih ? 1 : d > selisih && d < jumlah ? 2 : 0;
        expect(Number(soal.jawabanBenar)).toBe(expected);
        expect(jawabanSama(soal, String(expected))).toBe(true);
      } else if (jenis === 'cari-d-luar') {
        expect(Number(soal.jawabanBenar)).toBe(jumlah);
        expect(jawabanSama(soal, String(jumlah))).toBe(true);
      } else if (jenis === 'cari-d-dalam') {
        expect(Number(soal.jawabanBenar)).toBe(selisih);
        expect(jawabanSama(soal, String(selisih))).toBe(true);
      } else {
        const expected = `${selisih} < d < ${jumlah}`;
        expect(soal.jawabanBenar).toBe(expected);
        expect(jawabanSama(soal, expected)).toBe(true);
      }
      expect([R, r, d, jumlah, selisih].every(Number.isFinite)).toBe(true);
    }
  });
});
