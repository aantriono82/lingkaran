export const TOPIC_IDS = [
  '01-unsur', '02-keliling', '03-luas', '04-sudut', '05-tali-busur',
  '06-segi-empat', '07-dalam-segitiga', '08-luar-segitiga', '09-garis-singgung', '10-kedudukan'
] as const;

export type TopicId = typeof TOPIC_IDS[number];

export const RUMPUN_IDS = ['rumpun-1', 'rumpun-2', 'rumpun-3', 'rumpun-4'] as const;
export type RumpunId = typeof RUMPUN_IDS[number];

export interface RumpunMeta {
  id: RumpunId;
  nomorRomawi: string;
  judul: string;
  deskripsi: string;
  topikIds: readonly TopicId[];
}

export const DAFTAR_RUMPUN: readonly RumpunMeta[] = [
  {
    id: 'rumpun-1',
    nomorRomawi: 'I',
    judul: 'Bagian-Bagian dan Ukuran Lingkaran',
    deskripsi: 'Fondasi memahami anatomi geometri, konstanta π, dan luas juring',
    topikIds: ['01-unsur', '02-keliling', '03-luas']
  },
  {
    id: 'rumpun-2',
    nomorRomawi: 'II',
    judul: 'Sudut-Sudut pada Lingkaran',
    deskripsi: 'Hubungan sudut pusat, sudut keliling, tali busur, dan segi empat tali busur',
    topikIds: ['04-sudut', '05-tali-busur', '06-segi-empat']
  },
  {
    id: 'rumpun-3',
    nomorRomawi: 'III',
    judul: 'Segitiga dan Lingkaran',
    deskripsi: 'Lingkaran dalam (incircle) dan lingkaran luar (circumcircle)',
    topikIds: ['07-dalam-segitiga', '08-luar-segitiga']
  },
  {
    id: 'rumpun-4',
    nomorRomawi: 'IV',
    judul: 'Garis Singgung dan Kedudukan',
    deskripsi: 'Persinggungan titik luar dan relasi kedudukan dua lingkaran',
    topikIds: ['09-garis-singgung', '10-kedudukan']
  }
] as const;

export type TabId = 'eksplorasi' | 'konsep' | 'latihan' | 'kuis';

export interface TopicMeta {
  id: TopicId;
  nomor: number;
  nama: string;
  ikon: string;
  ringkasan: string;
  tersedia: boolean;
  warna: string;
  rumpun: RumpunId;
}

