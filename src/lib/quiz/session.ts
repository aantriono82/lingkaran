import { TOPIC_IDS, type TopicId } from '../../types';

export const VERSI_SESI_KUIS = 1;
export const BATAS_USIA_SESI_KUIS = 24 * 60 * 60 * 1000;
export const KUNCI_SESI_KUIS = 'simulasi-lingkaran-sesi-kuis';

export interface QuizSession {
  versi: typeof VERSI_SESI_KUIS;
  topikId: TopicId;
  seed: number;
  indeks: number;
  jawaban: string;
  skor: number;
  sudahDijawab: boolean;
  diperbaruiPada: number;
}

function sesiValid(value: unknown, topikId?: TopicId): value is QuizSession {
  if (typeof value !== 'object' || value === null) return false;
  const sesi = value as Partial<QuizSession>;
  const indeks = sesi.indeks;
  const skor = sesi.skor;
  const diperbaruiPada = sesi.diperbaruiPada;
  return sesi.versi === VERSI_SESI_KUIS
    && typeof sesi.topikId === 'string' && TOPIC_IDS.some((id) => id === sesi.topikId)
    && (topikId === undefined || sesi.topikId === topikId)
    && Number.isFinite(sesi.seed)
    && typeof indeks === 'number' && Number.isInteger(indeks) && indeks >= 0 && indeks < 5
    && typeof sesi.jawaban === 'string'
    && typeof skor === 'number' && Number.isInteger(skor) && skor >= 0 && skor <= 5
    && typeof sesi.sudahDijawab === 'boolean'
    && typeof diperbaruiPada === 'number' && Number.isFinite(diperbaruiPada)
    && Date.now() - diperbaruiPada >= 0 && Date.now() - diperbaruiPada <= BATAS_USIA_SESI_KUIS;
}

export function bacaSesiKuis(topikId?: TopicId): QuizSession | null {
  try {
    const isi = localStorage.getItem(KUNCI_SESI_KUIS);
    if (!isi) return null;
    const hasil: unknown = JSON.parse(isi);
    if (!sesiValid(hasil, topikId)) {
      localStorage.removeItem(KUNCI_SESI_KUIS);
      return null;
    }
    return hasil;
  } catch {
    try { localStorage.removeItem(KUNCI_SESI_KUIS); } catch { /* Penyimpanan dapat gagal pada mode privat. */ }
    return null;
  }
}

export function simpanSesiKuis(sesi: Omit<QuizSession, 'diperbaruiPada'> & { diperbaruiPada?: number }): void {
  try {
    localStorage.setItem(KUNCI_SESI_KUIS, JSON.stringify({ ...sesi, versi: VERSI_SESI_KUIS, diperbaruiPada: sesi.diperbaruiPada ?? Date.now() }));
  } catch {
    // Kuis tetap dapat digunakan ketika kuota atau izin penyimpanan tidak tersedia.
  }
}

export function hapusSesiKuis(): void {
  try { localStorage.removeItem(KUNCI_SESI_KUIS); } catch { /* Tidak menghalangi alur kuis. */ }
}
