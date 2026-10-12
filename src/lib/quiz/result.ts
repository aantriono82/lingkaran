import type { TopicId } from '../../types';
import { topicRegistry } from '../../topics/metadata';

export interface PesanHasilKuis {
  judul: string;
  pesan: string;
  lulus: boolean;
  sempurna: boolean;
}

export function pesanHasilKuis(skor: number, total: number = 5): PesanHasilKuis {
  if (skor >= total) {
    return {
      judul: 'Luar Biasa Sempurna!',
      pesan: 'Semua jawabanmu tepat! Kamu sudah menguasai konsep dan perhitungan topik ini dengan sangat baik.',
      lulus: true,
      sempurna: true
    };
  }
  if (skor >= 4) {
    return {
      judul: 'Mantap Sekali!',
      pesan: 'Pemahamanmu sudah sangat kuat. Sedikit lagi menuju skor sempurna!',
      lulus: true,
      sempurna: false
    };
  }
  if (skor >= 3) {
    return {
      judul: 'Bagus!',
      pesan: 'Kamu sudah memahami konsep dasar. Coba eksplorasi kembali bagian yang masih ragu untuk memantapkan pemahaman.',
      lulus: true,
      sempurna: false
    };
  }
  return {
    judul: 'Ayo Coba Lagi!',
    pesan: 'Terus berlatih! Buka kembali tab Eksplorasi dan gerakkan simulasi untuk menemukan polanya secara visual.',
    lulus: false,
    sempurna: false
  };
}

export interface AksiHasilKuis {
  labelPrimer: string;
  targetTautan: string;
  adalahTopikTerakhir: boolean;
}

export function tentukanAksiHasilKuis(currentId: TopicId): AksiHasilKuis {
  const indeks = topicRegistry.findIndex((t) => t.id === currentId);
  const berikutnya = indeks >= 0 && indeks < topicRegistry.length - 1 ? topicRegistry[indeks + 1] : undefined;

  if (berikutnya && berikutnya.tersedia) {
    return {
      labelPrimer: 'Lanjut ke Topik Berikutnya',
      targetTautan: `/topik/${berikutnya.id}`,
      adalahTopikTerakhir: false
    };
  }

  return {
    labelPrimer: 'Kembali ke Beranda',
    targetTautan: '/',
    adalahTopikTerakhir: true
  };
}

export function formatProgresKuis(indeks: number, total: number): { label: string; persentase: number } {
  const nomorSoal = indeks + 1;
  const persentase = Math.min(100, Math.max(0, Math.round((nomorSoal / total) * 100)));
  return {
    label: `Soal ${nomorSoal} dari ${total}`,
    persentase
  };
}
