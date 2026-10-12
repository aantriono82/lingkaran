import { ExploreLingkaranDalam } from './Explore';
import { poinKonsep, rumusKonsep } from './concept';
import { buatSoalLingkaranDalam } from './generator';
import { describeDalam } from '../descriptions';
import type { TopicModule } from '../types';
import { WARNA_GEOMETRI } from '../../lib/tokens';

export const topicModule: TopicModule = {
  meta: { id: '07-dalam-segitiga', nomor: 7, ikon: 'dalam-segitiga', nama: 'Lingkaran dalam segitiga', ringkasan: 'Temukan pusat dan jari-jari lingkaran dalam segitiga.', tersedia: true, warna: WARNA_GEOMETRI.lingkaranDalam, rumpun: 'rumpun-3' },
  Explore: ExploreLingkaranDalam,
  concept: { poin: poinKonsep, rumus: rumusKonsep },
  generator: buatSoalLingkaranDalam,
  jenisSoal: ['numerik', 'pilihan'],
  describe: (state) => describeDalam((state as { radius?: number; valid?: boolean } | undefined) ?? { radius: 2, valid: true })
};
