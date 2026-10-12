import { ExploreKedudukan } from './Explore';
import { poinKonsep, rumusKonsep, tabelKedudukan } from './concept';
import { buatSoalKedudukan } from './generator';
import { describeKedudukan } from '../descriptions';
import type { TopicModule } from '../types';
import { WARNA_GEOMETRI } from '../../lib/tokens';

function TabelKedudukan(): React.JSX.Element {
  return (
    <div className="concept-table-wrap">
      <h3>Tabel Ringkasan Kedudukan Dua Lingkaran</h3>
      <table className="concept-table">
        <thead>
          <tr>
            <th scope="col">Kedudukan</th>
            <th scope="col">Syarat Jarak Pusat (d)</th>
            <th scope="col" style={{ textAlign: 'center' }}>Titik Potong</th>
            <th scope="col">Garis Singgung Persekutuan</th>
          </tr>
        </thead>
        <tbody>
          {tabelKedudukan.map((baris) => (
            <tr key={baris.kedudukan}>
              <th scope="row">{baris.kedudukan}</th>
              <td><code>{baris.syarat}</code></td>
              <td style={{ textAlign: 'center', fontWeight: 600 }}>{baris.titik}</td>
              <td>{baris.garis}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const topicModule: TopicModule = {
  meta: { id: '10-kedudukan', nomor: 10, ikon: 'kedudukan', nama: 'Kedudukan dua lingkaran', ringkasan: 'Klasifikasikan posisi dua lingkaran dengan menggeser pusatnya.', tersedia: true, warna: WARNA_GEOMETRI.kedudukanA, rumpun: 'rumpun-4' },
  Explore: ExploreKedudukan,
  concept: { poin: poinKonsep, rumus: rumusKonsep },
  generator: buatSoalKedudukan,
  jenisSoal: ['numerik', 'pilihan'],
  describe: (state) => describeKedudukan((state as { jarak?: number; radiusA?: number; radiusB?: number; kedudukan?: string } | undefined) ?? { jarak: 170, radiusA: 105, radiusB: 65, kedudukan: 'bersinggungan luar' }),
  ConceptExtra: TabelKedudukan
};
