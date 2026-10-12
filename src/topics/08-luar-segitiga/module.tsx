import { ExploreLingkaranLuar } from './Explore';
import { poinKonsep, rumusKonsep } from './concept';
import { buatSoalLingkaranLuar } from './generator';
import { describeLuar } from '../descriptions';
import type { TopicModule } from '../types';
import { WARNA_GEOMETRI } from '../../lib/tokens';

export const topicModule: TopicModule = {
  meta: { id: '08-luar-segitiga', nomor: 8, ikon: 'luar-segitiga', nama: 'Lingkaran luar segitiga', ringkasan: 'Amati pusat lingkaran luar pada berbagai bentuk segitiga.', tersedia: true, warna: WARNA_GEOMETRI.lingkaranLuar, rumpun: 'rumpun-3' },
  Explore: ExploreLingkaranLuar,
  concept: { poin: poinKonsep, rumus: rumusKonsep },
  generator: buatSoalLingkaranLuar,
  jenisSoal: ['numerik', 'pilihan'],
  describe: (state) => describeLuar((state as { radius?: number; valid?: boolean; letak?: string } | undefined) ?? { radius: 4, valid: true })
};
