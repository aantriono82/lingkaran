import { describe, expect, it } from 'vitest';
import { hitungProgresBelajar, tentukanTombolAksiHero } from './progress';
import type { TopicId } from '../types';

describe('logika progres belajar dan tombol aksi hero', () => {
  describe('hitungProgresBelajar', () => {
    it('mengembalikan status kosong saat belum ada kuis yang diselesaikan', () => {
      const progres = hitungProgresBelajar(() => null);
      expect(progres.jumlahSelesai).toBe(0);
      expect(progres.totalTopik).toBe(10);
      expect(progres.persentase).toBe(0);
      expect(progres.rataRataSkor).toBeNull();
      expect(Object.values(progres.statusSelesai).every((s) => s === false)).toBe(true);
    });

    it('menghitung topik selesai dan rata-rata skor dengan akurat', () => {
      const skorData: Partial<Record<TopicId, number>> = {
        '01-unsur': 5,
        '02-keliling': 4,
        '03-luas': 3
      };
      const progres = hitungProgresBelajar((id) => skorData[id] ?? null);
      expect(progres.jumlahSelesai).toBe(3);
      expect(progres.totalTopik).toBe(10);
      expect(progres.persentase).toBe(30);
      expect(progres.rataRataSkor).toBe(4.0);
      expect(progres.statusSelesai['01-unsur']).toBe(true);
      expect(progres.statusSelesai['02-keliling']).toBe(true);
      expect(progres.statusSelesai['03-luas']).toBe(true);
      expect(progres.statusSelesai['04-sudut']).toBe(false);
    });

    it('mengabaikan skor rusak atau di luar rentang valid 0 sampai 5', () => {
      const skorData: Record<string, unknown> = {
        '01-unsur': 5,
        '02-keliling': -2,
        '03-luas': 99,
        '04-sudut': 3.5,
        '05-tali-busur': NaN
      };
      const progres = hitungProgresBelajar((id) => (skorData[id] as number) ?? null);
      expect(progres.jumlahSelesai).toBe(1);
      expect(progres.rataRataSkor).toBe(5);
    });

    it('menghitung 10 topik selesai saat seluruh kurikulum tuntas', () => {
      const progres = hitungProgresBelajar(() => 5);
      expect(progres.jumlahSelesai).toBe(10);
      expect(progres.persentase).toBe(100);
      expect(progres.rataRataSkor).toBe(5);
    });
  });

  describe('tentukanTombolAksiHero', () => {
    const metaMap: Record<string, { nomor: number; nama: string }> = {
      '01-unsur': { nomor: 1, nama: 'Unsur-unsur lingkaran' },
      '03-luas': { nomor: 3, nama: 'Luas lingkaran' },
      '07-dalam-segitiga': { nomor: 7, nama: 'Lingkaran dalam segitiga' }
    };

    it('jatuh ke "Mulai dari Topik 1" jika topik terakhir null', () => {
      const tombol = tentukanTombolAksiHero({
        topikTerakhirId: null,
        cariMeta: (id) => metaMap[id]
      });
      expect(tombol.tipe).toBe('mulai');
      expect(tombol.targetTopikId).toBe('01-unsur');
      expect(tombol.label).toBe('Mulai dari Topik 1');
    });

    it('menampilkan "Lanjutkan: Topik N · Nama" jika topik terakhir sah', () => {
      const tombol = tentukanTombolAksiHero({
        topikTerakhirId: '03-luas',
        cariMeta: (id) => metaMap[id]
      });
      expect(tombol.tipe).toBe('lanjutkan');
      expect(tombol.targetTopikId).toBe('03-luas');
      expect(tombol.label).toBe('Lanjutkan: Topik 3 · Luas lingkaran');
    });

    it('aman dan jatuh ke Topik 1 jika id topik terakhir asing atau data rusak', () => {
      const tombolAsing = tentukanTombolAksiHero({
        topikTerakhirId: 'topik-tidak-dikenal' as TopicId,
        cariMeta: (id) => metaMap[id]
      });
      expect(tombolAsing.tipe).toBe('mulai');
      expect(tombolAsing.targetTopikId).toBe('01-unsur');
      expect(tombolAsing.label).toBe('Mulai dari Topik 1');
    });
  });
});
