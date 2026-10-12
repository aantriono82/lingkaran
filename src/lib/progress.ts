import { TOPIC_IDS, type TopicId } from '../types';

export interface RingkasanProgres {
  /** Jumlah topik yang kuisnya sudah pernah diselesaikan dan skornya tersimpan. */
  jumlahSelesai: number;
  /** Total topik dalam kurikulum (10). */
  totalTopik: number;
  /** Persentase kemajuan 0 - 100. */
  persentase: number;
  /** Rata-rata skor kuis dari topik-topik yang sudah selesai (skala 5). null jika belum ada. */
  rataRataSkor: number | null;
  /** Peta status selesai per topik. */
  statusSelesai: Record<TopicId, boolean>;
}

/**
 * Menghitung kemajuan belajar siswa di seluruh kurikulum.
 *
 * DEFINISI TOPIK SELESAI:
 * Sebuah topik dianggap "selesai" bila kuisnya pernah diselesaikan dan skornya tersimpan
 * di penyimpanan terpusat (skor !== null dan merupakan bilangan bulat 0 sampai 5).
 * Aktivitas hanya membaca konsep atau menggeser kanvas tanpa menyelesaikan kuis
 * belum dihitung sebagai topik selesai.
 */
export function hitungProgresBelajar(
  ambilSkor: (id: TopicId) => number | null
): RingkasanProgres {
  let jumlahSelesai = 0;
  let totalSkor = 0;
  const statusSelesai = {} as Record<TopicId, boolean>;

  for (const id of TOPIC_IDS) {
    const skor = ambilSkor(id);
    const valid = typeof skor === 'number' && Number.isInteger(skor) && skor >= 0 && skor <= 5;
    statusSelesai[id] = valid;
    if (valid) {
      jumlahSelesai += 1;
      totalSkor += skor;
    }
  }

  const totalTopik = TOPIC_IDS.length;
  const persentase = totalTopik > 0 ? Math.round((jumlahSelesai / totalTopik) * 100) : 0;
  const rataRataSkor = jumlahSelesai > 0 ? Number((totalSkor / jumlahSelesai).toFixed(1)) : null;

  return {
    jumlahSelesai,
    totalTopik,
    persentase,
    rataRataSkor,
    statusSelesai
  };
}

export interface InfoTombolAksi {
  tipe: 'mulai' | 'lanjutkan';
  targetTopikId: TopicId;
  label: string;
}

/**
 * Menentukan target navigasi tombol primer hero (Mulai vs Lanjutkan).
 *
 * Jika topik terakhir dibuka tersedia dan sah, arahkan ke topik tersebut dengan label
 * "Lanjutkan: Topik N · Nama topik".
 * Jika belum ada kemajuan, data rusak, atau id tidak dikenal, jatuh ke "Mulai dari Topik 1"
 * yang mengarah ke '01-unsur'.
 */
export function tentukanTombolAksiHero({
  topikTerakhirId,
  cariMeta
}: {
  topikTerakhirId: TopicId | null;
  cariMeta: (id: TopicId) => { nomor: number; nama: string } | undefined;
}): InfoTombolAksi {
  if (topikTerakhirId && TOPIC_IDS.includes(topikTerakhirId)) {
    const meta = cariMeta(topikTerakhirId);
    if (meta) {
      return {
        tipe: 'lanjutkan',
        targetTopikId: topikTerakhirId,
        label: `Lanjutkan: Topik ${meta.nomor} · ${meta.nama}`
      };
    }
  }

  return {
    tipe: 'mulai',
    targetTopikId: '01-unsur',
    label: 'Mulai dari Topik 1'
  };
}
