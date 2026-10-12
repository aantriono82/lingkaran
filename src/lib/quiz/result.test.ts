import { describe, expect, it } from 'vitest';
import { formatProgresKuis, pesanHasilKuis, tentukanAksiHasilKuis } from './result';

describe('quiz result', () => {
  it('pesanHasilKuis mengembalikan pesan dan status sesuai skor', () => {
    const sempurna = pesanHasilKuis(5, 5);
    expect(sempurna.sempurna).toBe(true);
    expect(sempurna.lulus).toBe(true);
    expect(sempurna.judul).toBe('Luar Biasa Sempurna!');

    const bagus = pesanHasilKuis(4, 5);
    expect(bagus.sempurna).toBe(false);
    expect(bagus.lulus).toBe(true);

    const cukup = pesanHasilKuis(3, 5);
    expect(cukup.sempurna).toBe(false);
    expect(cukup.lulus).toBe(true);

    const remidi = pesanHasilKuis(2, 5);
    expect(remidi.sempurna).toBe(false);
    expect(remidi.lulus).toBe(false);
  });

  it('tentukanAksiHasilKuis memilih "Lanjut ke Topik Berikutnya" untuk topik selain terakhir', () => {
    const aksi = tentukanAksiHasilKuis('01-unsur');
    expect(aksi.adalahTopikTerakhir).toBe(false);
    expect(aksi.labelPrimer).toBe('Lanjut ke Topik Berikutnya');
    expect(aksi.targetTautan).toBe('/topik/02-keliling');
  });

  it('tentukanAksiHasilKuis memilih "Kembali ke Beranda" untuk topik terakhir (Topik 10)', () => {
    const aksi = tentukanAksiHasilKuis('10-kedudukan');
    expect(aksi.adalahTopikTerakhir).toBe(true);
    expect(aksi.labelPrimer).toBe('Kembali ke Beranda');
    expect(aksi.targetTautan).toBe('/');
  });

  it('formatProgresKuis menghitung label dan persentase dengan tepat', () => {
    const prog1 = formatProgresKuis(0, 5);
    expect(prog1.label).toBe('Soal 1 dari 5');
    expect(prog1.persentase).toBe(20);

    const prog3 = formatProgresKuis(2, 5);
    expect(prog3.label).toBe('Soal 3 dari 5');
    expect(prog3.persentase).toBe(60);

    const prog5 = formatProgresKuis(4, 5);
    expect(prog5.label).toBe('Soal 5 dari 5');
    expect(prog5.persentase).toBe(100);
  });
});
