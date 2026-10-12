import { formulasByTopic } from '../../lib/formulas';

export const poinKonsep = [
  'Prinsip Penentuan Kedudukan: Posisi relatif dua lingkaran berjari-jari R dan r (dengan R ≥ r) dan berjarak pusat d ditentukan dengan membandingkan nilai d terhadap (R + r) dan (R − r).',
  'Saling Lepas di Luar (d > R + r): Kedua lingkaran terpisah sepenuhnya tanpa persekutuan (0 titik potong). Dapat ditarik 4 garis singgung persekutuan (2 luar dan 2 dalam).',
  'Bersinggungan di Luar (d = R + r): Kedua lingkaran bersentuhan di tepat 1 titik potong di antara kedua pusat. Memiliki 3 garis singgung persekutuan.',
  'Berpotongan di Dua Titik (R − r < d < R + r): Kedua lingkaran saling beririsan sehingga mempunyai 2 titik potong sekutu. Memiliki 2 garis singgung persekutuan luar.',
  'Bersinggungan di Dalam (d = R − r): Lingkaran kecil berada di dalam dan menyentuh sisi dalam lingkaran besar di 1 titik. Memiliki 1 garis singgung persekutuan luar.',
  'Di Dalam Tanpa Sentuh & Sepusat (d < R − r): Lingkaran kecil berada sepenuhnya di dalam tanpa menyentuh (0 titik sekutu, 0 garis singgung). Jika d = 0, kedua lingkaran berpusat sama (sepusat/konsentris).'
];

export const rumusKonsep = formulasByTopic['10-kedudukan'].konsep;

export const tabelKedudukan = [
  { kedudukan: 'Saling lepas di luar', syarat: 'd > R + r', titik: '0', garis: '4 (2 luar, 2 dalam)' },
  { kedudukan: 'Bersinggungan luar', syarat: 'd = R + r', titik: '1', garis: '3 (2 luar, 1 tegak)' },
  { kedudukan: 'Berpotongan di dua titik', syarat: 'R − r < d < R + r', titik: '2', garis: '2 (garis luar)' },
  { kedudukan: 'Bersinggungan dalam', syarat: 'd = R − r (d > 0)', titik: '1', garis: '1 (garis luar)' },
  { kedudukan: 'Satu di dalam yang lain', syarat: '0 < d < R − r', titik: '0', garis: '0' },
  { kedudukan: 'Sepusat (konsentris)', syarat: 'd = 0', titik: '0', garis: '0' }
];
