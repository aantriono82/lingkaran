import { ExploreSegiEmpat } from './Explore';
import { poinKonsep, rumusKonsep } from './concept';
import { buatSoalSegiEmpat } from './generator';
import { describeSegiEmpat } from '../descriptions';
import type { TopicModule } from '../types';
import { WARNA_GEOMETRI } from '../../lib/tokens';

export const topicModule: TopicModule = {
  meta: { id: '06-segi-empat', nomor: 6, ikon: 'segi-empat', nama: 'Segi empat tali busur', ringkasan: 'Temukan jumlah sudut berhadapan pada segi empat tali busur.', tersedia: true, warna: WARNA_GEOMETRI.segiEmpatA, rumpun: 'rumpun-2' },
  Explore: ExploreSegiEmpat,
  concept: { poin: poinKonsep, rumus: rumusKonsep },
  generator: buatSoalSegiEmpat,
  jenisSoal: ['pilihan'],
  describe: (state) => describeSegiEmpat((state as { jumlahSudut?: number; mode?: string } | undefined) ?? { jumlahSudut: 180 })
};
