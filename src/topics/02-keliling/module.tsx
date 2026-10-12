import { Pi, PiText } from '../../components';
import { ExploreKeliling } from './Explore';
import { poinAsalPi, poinKonsep, rumusKonsep, sejarahPi } from './concept';
import { buatSoalKeliling } from './generator';
import { describeKeliling } from '../descriptions';
import type { TopicModule } from '../types';
import { WARNA_GEOMETRI } from '../../lib/tokens';

function AsalPi(): React.JSX.Element {
  return <section className="pi-origin-section"><span className="eyebrow">Dari mana <Pi />?</span><ul>{poinAsalPi.map((butir) => <li key={butir}><PiText text={butir} /></li>)}</ul><div className="history-box"><h3>Catatan sejarah ilustratif</h3>{sejarahPi.map((butir) => <p key={butir}><PiText text={butir} /></p>)}</div></section>;
}

export const topicModule: TopicModule = {
  meta: { id: '02-keliling', nomor: 2, ikon: 'keliling', nama: 'Keliling lingkaran', ringkasan: 'Lihat hubungan jari-jari, diameter, dan keliling.', tersedia: true, warna: WARNA_GEOMETRI.diameter, rumpun: 'rumpun-1' },
  Explore: ExploreKeliling,
  concept: { poin: poinKonsep, rumus: rumusKonsep },
  generator: buatSoalKeliling,
  jenisSoal: ['numerik', 'pilihan'],
  describe: (state) => describeKeliling((state as { radius?: number; keliling?: number; kemajuan?: number; mode?: string } | undefined) ?? { radius: 7, keliling: 43.96 }),
  ConceptExtra: AsalPi
};
