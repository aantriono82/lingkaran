import { afterEach, describe, expect, it } from 'vitest';
import { bacaSesiKuis, hapusSesiKuis, simpanSesiKuis, type QuizSession } from './session';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

const storage = new MemoryStorage();
const sesi: QuizSession = {
  versi: 1,
  topikId: '01-unsur',
  seed: 123,
  indeks: 2,
  jawaban: '12',
  skor: 1,
  sudahDijawab: true,
  diperbaruiPada: Date.now()
};

describe('sesi kuis', () => {
  afterEach(() => {
    storage.removeItem('simulasi-lingkaran-sesi-kuis');
    Object.assign(globalThis, { localStorage: storage });
  });

  it('memulihkan sesi valid dan tetap membedakan topik', () => {
    Object.assign(globalThis, { localStorage: storage });
    simpanSesiKuis(sesi);
    expect(bacaSesiKuis('01-unsur')).toMatchObject(sesi);
    expect(bacaSesiKuis('02-keliling')).toBeNull();
  });

  it.each([
    ['JSON rusak', '{'],
    ['versi berbeda', JSON.stringify({ ...sesi, versi: 99 })],
    ['kedaluwarsa', JSON.stringify({ ...sesi, diperbaruiPada: Date.now() - 25 * 60 * 60 * 1000 })],
    ['topik asing', JSON.stringify({ ...sesi, topikId: 'asing' })],
    ['waktu masa depan', JSON.stringify({ ...sesi, diperbaruiPada: Date.now() + 60_000 })]
  ])('mengabaikan %s', (_nama, isi) => {
    Object.assign(globalThis, { localStorage: storage });
    storage.setItem('simulasi-lingkaran-sesi-kuis', isi);
    expect(bacaSesiKuis('01-unsur')).toBeNull();
  });

  it('menghapus sesi tanpa menyentuh skor terbaik', () => {
    Object.assign(globalThis, { localStorage: storage });
    simpanSesiKuis(sesi);
    hapusSesiKuis();
    expect(storage.getItem('simulasi-lingkaran-sesi-kuis')).toBeNull();
  });
});
