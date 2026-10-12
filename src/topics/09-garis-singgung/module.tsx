import { ExploreGarisSinggung } from './Explore';
import { poinKonsep, rumusKonsep } from './concept';
import { buatSoalGarisSinggung } from './generator';
import { describeSinggung } from '../descriptions';
import type { TopicModule } from '../types';
import { WARNA_GEOMETRI } from '../../lib/tokens';

export const topicModule: TopicModule = {
  meta: { id: '09-garis-singgung', nomor: 9, ikon: 'garis-singgung', nama: 'Garis singgung lingkaran', ringkasan: 'Eksplorasi garis yang menyentuh lingkaran di satu titik.', tersedia: true, warna: WARNA_GEOMETRI.singgung, rumpun: 'rumpun-4' },
  Explore: ExploreGarisSinggung,
  concept: { poin: poinKonsep, rumus: rumusKonsep },
  generator: buatSoalGarisSinggung,
  jenisSoal: ['numerik', 'pilihan'],
  describe: (state) => describeSinggung((state as { mode?: string; sudut?: number; jarak?: number; jumlahGaris?: number } | undefined) ?? { mode: 'pada-lingkaran', sudut: 45 })
};
