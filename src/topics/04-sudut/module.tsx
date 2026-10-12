import { ExploreSudut } from './Explore';
import { poinKonsep, rumusKonsep } from './concept';
import { buatSoalSudut } from './generator';
import { describeSudut } from '../descriptions';
import type { TopicModule } from '../types';
import { WARNA_GEOMETRI } from '../../lib/tokens';

export const topicModule: TopicModule = {
  meta: { id: '04-sudut', nomor: 4, ikon: 'sudut', nama: 'Sudut pusat dan sudut keliling', ringkasan: 'Buktikan hubungan sudut pusat dan sudut keliling secara langsung.', tersedia: true, warna: WARNA_GEOMETRI.busur, rumpun: 'rumpun-2' },
  Explore: ExploreSudut,
  concept: { poin: poinKonsep, rumus: rumusKonsep },
  generator: buatSoalSudut,
  jenisSoal: ['pilihan'],
  describe: (state) => describeSudut((state as { sudutPusat?: number; sudutKeliling?: number; sudutKelilingD?: number } | undefined) ?? { sudutPusat: 80, sudutKeliling: 40 })
};
