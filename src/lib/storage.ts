import { TOPIC_IDS, type TopicId } from '../types';
import { KUNCI_SESI_KUIS } from './quiz/session';

export const KUNCI_SKOR_TERBAIK = 'simulasi-lingkaran-skor-terbaik';
export const KUNCI_PREFERENSI_MODE_IFP = 'simulasi-lingkaran-preferensi-mode-ifp';
export const KUNCI_PREFERENSI_TEMA = 'simulasi-lingkaran-preferensi-tema';
export const KUNCI_TOPIK_TERAKHIR = 'simulasi-lingkaran-topik-terakhir';
export const VERSI_SKEMA_TOPIK_TERAKHIR = 1;

export const KUNCI_PROGRESS_APLIKASI = [
  KUNCI_SKOR_TERBAIK,
  KUNCI_SESI_KUIS,
  KUNCI_TOPIK_TERAKHIR
] as const;

export interface DataTopikTerakhir {
  versi: number;
  topikId: TopicId;
  waktu: number;
}

export function bacaSemuaSkor(): Partial<Record<TopicId, number>> {
  try {
    const isi = localStorage.getItem(KUNCI_SKOR_TERBAIK);
    if (!isi) return {};
    const hasil: unknown = JSON.parse(isi);
    if (typeof hasil !== 'object' || hasil === null) return {};
    const valid: Partial<Record<TopicId, number>> = {};
    for (const [topikId, skor] of Object.entries(hasil)) {
      if (TOPIC_IDS.some((id) => id === topikId) && typeof skor === 'number' && Number.isInteger(skor) && skor >= 0 && skor <= 5) {
        valid[topikId as TopicId] = skor;
      }
    }
    return valid;
  } catch {
    return {};
  }
}

export function ambilSkorTerbaik(topikId: TopicId): number | null {
  try {
    const skor = bacaSemuaSkor()[topikId];
    return typeof skor === 'number' ? skor : null;
  } catch {
    return null;
  }
}

export function simpanSkorTerbaik(topikId: TopicId, skor: number): void {
  try {
    if (!Number.isInteger(skor) || skor < 0 || skor > 5) return;
    const semua = bacaSemuaSkor();
    const sebelumnya = semua[topikId] ?? 0;
    if (skor > sebelumnya) {
      localStorage.setItem(KUNCI_SKOR_TERBAIK, JSON.stringify({ ...semua, [topikId]: skor }));
    }
  } catch {
    // Penyimpanan lokal boleh gagal pada mode privat; aplikasi tetap dapat digunakan.
  }
}

/** Menyimpan topik terakhir yang dibuka siswa beserta stempel waktu dan versi skema. */
export function simpanTopikTerakhir(topikId: TopicId): void {
  try {
    if (!TOPIC_IDS.includes(topikId)) return;
    const data: DataTopikTerakhir = {
      versi: VERSI_SKEMA_TOPIK_TERAKHIR,
      topikId,
      waktu: Date.now()
    };
    localStorage.setItem(KUNCI_TOPIK_TERAKHIR, JSON.stringify(data));
  } catch {
    // Mode privat aman
  }
}

/** Membaca topik terakhir yang dibuka siswa. Aman dari data rusak atau id yang tidak dikenal. */
export function bacaTopikTerakhir(): TopicId | null {
  try {
    const isi = localStorage.getItem(KUNCI_TOPIK_TERAKHIR);
    if (!isi) return null;
    const hasil: unknown = JSON.parse(isi);
    if (typeof hasil !== 'object' || hasil === null) return null;
    const data = hasil as Partial<DataTopikTerakhir>;
    if (data.versi !== VERSI_SKEMA_TOPIK_TERAKHIR) return null;
    if (typeof data.topikId !== 'string' || !TOPIC_IDS.includes(data.topikId as TopicId)) return null;
    return data.topikId as TopicId;
  } catch {
    return null;
  }
}

/** Menghapus hanya progres yang dikelola aplikasi pada perangkat bersama. */
export function clearAllProgress(): boolean {
  try {
    const penyimpanan = globalThis.localStorage;
    for (const kunci of KUNCI_PROGRESS_APLIKASI) penyimpanan.removeItem(kunci);
    return true;
  } catch {
    return false;
  }
}

/** Membaca preferensi mode kelas/IFP (default mati). */
export function bacaPreferensiModeIfp(): boolean {
  try {
    const nilai = localStorage.getItem(KUNCI_PREFERENSI_MODE_IFP);
    return nilai === 'true';
  } catch {
    return false;
  }
}

/** Menyimpan preferensi mode kelas/IFP (tidak terhapus saat reset progres). */
export function simpanPreferensiModeIfp(aktif: boolean): void {
  try {
    localStorage.setItem(KUNCI_PREFERENSI_MODE_IFP, aktif ? 'true' : 'false');
  } catch {
    // Mode privat aman
  }
}

export type TemaAplikasi = 'light' | 'dark';

/** Membaca preferensi tema gelap (default light jika belum diset atau preferensi sistem). */
export function bacaPreferensiTema(): TemaAplikasi {
  try {
    const nilai = localStorage.getItem(KUNCI_PREFERENSI_TEMA);
    if (nilai === 'dark' || nilai === 'light') return nilai;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

/** Menyimpan preferensi tema (tidak terhapus saat reset progres). */
export function simpanPreferensiTema(tema: TemaAplikasi): void {
  try {
    localStorage.setItem(KUNCI_PREFERENSI_TEMA, tema);
  } catch {
    // Mode privat aman
  }
}

