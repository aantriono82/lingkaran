import { PerhitunganUnsur } from './Calculations';
import { ExploreUnsur } from './Explore';
import { poinKonsep, rumusKonsep } from './concept';
import { buatSoalUnsur } from './generator';
import { describeUnsur } from '../descriptions';
import type { TopicModule } from '../types';
import { WARNA_GEOMETRI } from '../../lib/tokens';

export const topicModule: TopicModule = {
  meta: { id: '01-unsur', nomor: 1, ikon: 'lingkaran', nama: 'Unsur-unsur lingkaran', ringkasan: 'Kenali bagian-bagian lingkaran melalui gambar yang dapat digeser.', tersedia: true, warna: WARNA_GEOMETRI.radius, rumpun: 'rumpun-1' },
  Explore: ExploreUnsur,
  concept: { poin: poinKonsep, rumus: rumusKonsep },
  generator: buatSoalUnsur,
  jenisSoal: ['numerik', 'pilihan'],
  describe: (state) => describeUnsur((state as { radius?: number; sudutA?: number; sudutB?: number } | undefined) ?? { radius: 145, sudutA: 0, sudutB: 0 }),
  ConceptExtra: PerhitunganUnsur
};
