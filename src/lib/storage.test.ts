import { afterEach, describe, expect, it } from 'vitest';
import {
  ambilSkorTerbaik,
  bacaPreferensiModeIfp,
  bacaPreferensiTema,
  bacaTopikTerakhir,
  clearAllProgress,
  KUNCI_PREFERENSI_MODE_IFP,
  KUNCI_PREFERENSI_TEMA,
  KUNCI_PROGRESS_APLIKASI,
  KUNCI_SKOR_TERBAIK,
  KUNCI_TOPIK_TERAKHIR,
  simpanPreferensiModeIfp,
  simpanPreferensiTema,
  simpanSkorTerbaik,
  simpanTopikTerakhir
} from './storage';
import { KUNCI_SESI_KUIS } from './quiz/session';


class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
  clear(): void { this.values.clear(); }
}

describe('penyimpanan skor terbaik', () => {
  const storage = new MemoryStorage();
  afterEach(() => {
    storage.clear();
    Object.assign(globalThis, { localStorage: storage });
  });

  it('mengabaikan skor rusak atau di luar rentang 0 sampai 5', () => {
    Object.assign(globalThis, { localStorage: storage });
    storage.setItem('simulasi-lingkaran-skor-terbaik', JSON.stringify({ '01-unsur': 99, '02-keliling': -1, '03-luas': 3.5, '04-sudut': 4 }));
    expect(ambilSkorTerbaik('01-unsur')).toBeNull();
    expect(ambilSkorTerbaik('02-keliling')).toBeNull();
    expect(ambilSkorTerbaik('03-luas')).toBeNull();
    expect(ambilSkorTerbaik('04-sudut')).toBe(4);
  });

  it('tidak menurunkan skor lama dan tidak menimpa topik lain', () => {
    Object.assign(globalThis, { localStorage: storage });
    simpanSkorTerbaik('01-unsur', 4);
    simpanSkorTerbaik('01-unsur', 2);
    simpanSkorTerbaik('02-keliling', 3);
    expect(ambilSkorTerbaik('01-unsur')).toBe(4);
    expect(ambilSkorTerbaik('02-keliling')).toBe(3);
  });

  it('menghapus semua kunci progres aplikasi dan mempertahankan kunci asing', () => {
    Object.assign(globalThis, { localStorage: storage });
    storage.setItem(KUNCI_SKOR_TERBAIK, JSON.stringify({ '01-unsur': 5 }));
    storage.setItem(KUNCI_SESI_KUIS, JSON.stringify({ versi: 1 }));
    storage.setItem('aplikasi-lain:catatan', 'tetap ada');

    expect(clearAllProgress()).toBe(true);
    expect(KUNCI_PROGRESS_APLIKASI).toEqual([KUNCI_SKOR_TERBAIK, KUNCI_SESI_KUIS, KUNCI_TOPIK_TERAKHIR]);
    expect(storage.getItem(KUNCI_SKOR_TERBAIK)).toBeNull();
    expect(storage.getItem(KUNCI_SESI_KUIS)).toBeNull();
    expect(storage.getItem(KUNCI_TOPIK_TERAKHIR)).toBeNull();
    expect(storage.getItem('aplikasi-lain:catatan')).toBe('tetap ada');
    expect(clearAllProgress()).toBe(true);
  });


  it('tetap kompatibel dengan skor lama dan aman ketika localStorage gagal', () => {
    Object.assign(globalThis, { localStorage: storage });
    storage.setItem(KUNCI_SKOR_TERBAIK, JSON.stringify({ '01-unsur': 4 }));
    expect(ambilSkorTerbaik('01-unsur')).toBe(4);

    const storageGagal = { removeItem: () => { throw new Error('storage unavailable'); } };
    Object.assign(globalThis, { localStorage: storageGagal });
    expect(clearAllProgress()).toBe(false);
  });

  it('menyimpan dan membaca preferensi mode kelas/IFP tanpa terhapus oleh clearAllProgress', () => {
    Object.assign(globalThis, { localStorage: storage });
    // Default mati bila belum pernah diset
    expect(bacaPreferensiModeIfp()).toBe(false);

    simpanPreferensiModeIfp(true);
    expect(bacaPreferensiModeIfp()).toBe(true);
    expect(storage.getItem(KUNCI_PREFERENSI_MODE_IFP)).toBe('true');

    // Set skor lalu jalankan clearAllProgress
    storage.setItem(KUNCI_SKOR_TERBAIK, JSON.stringify({ '01-unsur': 5 }));
    expect(clearAllProgress()).toBe(true);

    // Skor terhapus tapi preferensi IFP tetap tersimpan
    expect(storage.getItem(KUNCI_SKOR_TERBAIK)).toBeNull();
    expect(bacaPreferensiModeIfp()).toBe(true);

    simpanPreferensiModeIfp(false);
    expect(bacaPreferensiModeIfp()).toBe(false);
  });

  it('aman membaca dan menyimpan preferensi ketika localStorage melempar galat', () => {
    const storageRusak = {
      getItem: () => { throw new Error('private mode blocked'); },
      setItem: () => { throw new Error('quota exceeded'); }
    };
    Object.assign(globalThis, { localStorage: storageRusak });
    expect(bacaPreferensiModeIfp()).toBe(false);
    expect(() => simpanPreferensiModeIfp(true)).not.toThrow();
  });

  it('menyimpan dan membaca topik terakhir dibuka dengan versi skema', () => {
    Object.assign(globalThis, { localStorage: storage });
    expect(bacaTopikTerakhir()).toBeNull();

    simpanTopikTerakhir('03-luas');
    expect(bacaTopikTerakhir()).toBe('03-luas');

    const disimpan = JSON.parse(storage.getItem(KUNCI_TOPIK_TERAKHIR)!);
    expect(disimpan.versi).toBe(1);
    expect(disimpan.topikId).toBe('03-luas');
    expect(typeof disimpan.waktu).toBe('number');

    // Menimpa dengan topik lain
    simpanTopikTerakhir('07-dalam-segitiga');
    expect(bacaTopikTerakhir()).toBe('07-dalam-segitiga');

    // Terhapus oleh clearAllProgress
    expect(clearAllProgress()).toBe(true);
    expect(bacaTopikTerakhir()).toBeNull();
  });

  it('mengabaikan data topik terakhir jika versi berbeda, rusak, atau id tidak sah', () => {
    Object.assign(globalThis, { localStorage: storage });

    // Versi skema lama / tidak cocok
    storage.setItem(KUNCI_TOPIK_TERAKHIR, JSON.stringify({ versi: 99, topikId: '01-unsur', waktu: 123 }));
    expect(bacaTopikTerakhir()).toBeNull();

    // Id tidak dikenal
    storage.setItem(KUNCI_TOPIK_TERAKHIR, JSON.stringify({ versi: 1, topikId: 'topik-palsu', waktu: 123 }));
    expect(bacaTopikTerakhir()).toBeNull();

    // JSON rusak
    storage.setItem(KUNCI_TOPIK_TERAKHIR, '{ rusak');
    expect(bacaTopikTerakhir()).toBeNull();
  });

  it('menyimpan dan membaca preferensi tema (dark mode) tanpa terhapus oleh clearAllProgress', () => {
    Object.assign(globalThis, { localStorage: storage });
    expect(bacaPreferensiTema()).toBe('light');

    simpanPreferensiTema('dark');
    expect(bacaPreferensiTema()).toBe('dark');
    expect(storage.getItem(KUNCI_PREFERENSI_TEMA)).toBe('dark');

    // Skor terhapus tapi preferensi tema tetap tersimpan
    storage.setItem(KUNCI_SKOR_TERBAIK, JSON.stringify({ '01-unsur': 5 }));
    expect(clearAllProgress()).toBe(true);
    expect(storage.getItem(KUNCI_SKOR_TERBAIK)).toBeNull();
    expect(bacaPreferensiTema()).toBe('dark');

    simpanPreferensiTema('light');
    expect(bacaPreferensiTema()).toBe('light');
  });
});

