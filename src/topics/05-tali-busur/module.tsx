import { ExploreTaliBusur } from './Explore';
import { poinKonsep, rumusKonsep } from './concept';
import { buatSoalTaliBusur } from './generator';
import { describeTaliBusur } from '../descriptions';
import type { TopicModule } from '../types';
import { WARNA_GEOMETRI } from '../../lib/tokens';

export const topicModule: TopicModule = {
  meta: { id: '05-tali-busur', nomor: 5, ikon: 'tali-busur', nama: 'Sudut antara dua tali busur', ringkasan: 'Amati sudut yang terbentuk oleh dua tali busur.', tersedia: true, warna: WARNA_GEOMETRI.taliBusur, rumpun: 'rumpun-2' },
  Explore: ExploreTaliBusur,
  concept: { poin: poinKonsep, rumus: rumusKonsep },
  generator: buatSoalTaliBusur,
  jenisSoal: ['pilihan'],
  describe: (state) => describeTaliBusur((state as { sudut?: number; mode?: string } | undefined) ?? { sudut: 55 })
};
