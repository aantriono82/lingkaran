import { ExploreLuas } from './Explore';
import { poinKonsep, rumusKonsep } from './concept';
import { buatSoalLuas } from './generator';
import { describeLuas } from '../descriptions';
import type { TopicModule } from '../types';
import { WARNA_GEOMETRI } from '../../lib/tokens';

export const topicModule: TopicModule = {
  meta: { id: '03-luas', nomor: 3, ikon: 'luas', nama: 'Luas lingkaran', ringkasan: 'Susun juring hingga membentuk bangun yang mendekati persegi panjang.', tersedia: true, warna: WARNA_GEOMETRI.juring, rumpun: 'rumpun-1' },
  Explore: ExploreLuas,
  concept: { poin: poinKonsep, rumus: rumusKonsep },
  generator: buatSoalLuas,
  jenisSoal: ['numerik', 'pilihan'],
  describe: (state) => describeLuas((state as { radius?: number; jumlahJuring?: number; luas?: number } | undefined) ?? { radius: 7, jumlahJuring: 16, luas: 153.86 })
};
