import type { RumpunId, TopicId, TopicMeta } from '../types';
import { WARNA_GEOMETRI } from '../lib/tokens';

export const topicRegistry: TopicMeta[] = [
  { id: '01-unsur', nomor: 1, ikon: 'lingkaran', nama: 'Unsur-unsur lingkaran', ringkasan: 'Kenali bagian-bagian lingkaran melalui gambar yang dapat digeser.', tersedia: true, warna: WARNA_GEOMETRI.radius, rumpun: 'rumpun-1' },
  { id: '02-keliling', nomor: 2, ikon: 'keliling', nama: 'Keliling lingkaran', ringkasan: 'Lihat hubungan jari-jari, diameter, dan keliling.', tersedia: true, warna: WARNA_GEOMETRI.diameter, rumpun: 'rumpun-1' },
  { id: '03-luas', nomor: 3, ikon: 'luas', nama: 'Luas lingkaran', ringkasan: 'Susun juring hingga membentuk bangun yang mendekati persegi panjang.', tersedia: true, warna: WARNA_GEOMETRI.juring, rumpun: 'rumpun-1' },
  { id: '04-sudut', nomor: 4, ikon: 'sudut', nama: 'Sudut pusat dan sudut keliling', ringkasan: 'Buktikan hubungan sudut pusat dan sudut keliling secara langsung.', tersedia: true, warna: WARNA_GEOMETRI.busur, rumpun: 'rumpun-2' },
  { id: '05-tali-busur', nomor: 5, ikon: 'tali-busur', nama: 'Sudut antara dua tali busur', ringkasan: 'Amati sudut yang terbentuk oleh dua tali busur.', tersedia: true, warna: WARNA_GEOMETRI.taliBusur, rumpun: 'rumpun-2' },
  { id: '06-segi-empat', nomor: 6, ikon: 'segi-empat', nama: 'Segi empat tali busur', ringkasan: 'Temukan jumlah sudut berhadapan pada segi empat tali busur.', tersedia: true, warna: WARNA_GEOMETRI.segiEmpatA, rumpun: 'rumpun-2' },
  { id: '07-dalam-segitiga', nomor: 7, ikon: 'dalam-segitiga', nama: 'Lingkaran dalam segitiga', ringkasan: 'Temukan pusat dan jari-jari lingkaran dalam segitiga.', tersedia: true, warna: WARNA_GEOMETRI.lingkaranDalam, rumpun: 'rumpun-3' },
  { id: '08-luar-segitiga', nomor: 8, ikon: 'luar-segitiga', nama: 'Lingkaran luar segitiga', ringkasan: 'Amati pusat lingkaran luar pada berbagai bentuk segitiga.', tersedia: true, warna: WARNA_GEOMETRI.lingkaranLuar, rumpun: 'rumpun-3' },
  { id: '09-garis-singgung', nomor: 9, ikon: 'garis-singgung', nama: 'Garis singgung lingkaran', ringkasan: 'Eksplorasi garis yang menyentuh lingkaran di satu titik.', tersedia: true, warna: WARNA_GEOMETRI.singgung, rumpun: 'rumpun-4' },
  { id: '10-kedudukan', nomor: 10, ikon: 'kedudukan', nama: 'Kedudukan dua lingkaran', ringkasan: 'Klasifikasikan posisi dua lingkaran dengan menggeser pusatnya.', tersedia: true, warna: WARNA_GEOMETRI.kedudukanA, rumpun: 'rumpun-4' }
];

export function cariTopik(id: string | undefined): TopicMeta | undefined {
  return topicRegistry.find((topik) => topik.id === id);
}

export function indeksTopik(id: TopicId): number {
  return topicRegistry.findIndex((topik) => topik.id === id);
}

export function ambilTopikPerRumpun(rumpunId: RumpunId): TopicMeta[] {
  return topicRegistry.filter((topik) => topik.rumpun === rumpunId);
}
