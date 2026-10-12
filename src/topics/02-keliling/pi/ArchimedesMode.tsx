import { useMemo, useState } from 'react';
import { Canvas, Circle, Label } from '../../../components/svg';
import { Formula, Pi, SliderControl, ValuePanel } from '../../../components';
import { formulasByTopic } from '../../../lib/formulas';
import { hitungBatasArchimedes, N_ARCHIMEDES } from './archimedes';
import { describeKeliling } from '../../descriptions';

interface Titik {
  x: number;
  y: number;
}

function formatAngka(nilai: number, desimal = 5): string {
  return nilai.toFixed(desimal).replace('.', ',');
}

function vertices(jumlahSisi: number, radius: number, pusat: Titik, sudutAwal: number): Titik[] {
  return Array.from({ length: jumlahSisi }, (_, indeks) => {
    const sudut = sudutAwal + indeks * Math.PI * 2 / jumlahSisi;
    return { x: pusat.x + radius * Math.cos(sudut), y: pusat.y + radius * Math.sin(sudut) };
  });
}

function edgePalingKanan(titik: Titik[]): [Titik, Titik] {
  let terbaik: [Titik, Titik] = [titik[0], titik[1] ?? titik[0]];
  let nilaiTerbaik = -Infinity;
  titik.forEach((awal, indeks) => {
    const akhir = titik[(indeks + 1) % titik.length];
    const nilai = (awal.x + akhir.x) / 2;
    if (nilai > nilaiTerbaik) {
      nilaiTerbaik = nilai;
      terbaik = [awal, akhir];
    }
  });
  return terbaik;
}

function Inset({ jumlahSisi, pusat, radius }: { jumlahSisi: number; pusat: Titik; radius: number }) {
  const pusatInset = { x: 110, y: 78 };
  const zoom = jumlahSisi >= 96 ? 320 : 230;
  const fokus = { x: pusat.x + radius, y: pusat.y };
  const dalam = vertices(jumlahSisi, radius, pusat, -Math.PI / 2);
  const luar = vertices(jumlahSisi, radius / Math.cos(Math.PI / jumlahSisi), pusat, -Math.PI / 2 + Math.PI / jumlahSisi);
  const petakan = (titik: Titik): Titik => ({ x: pusatInset.x + (titik.x - fokus.x) * zoom / radius, y: pusatInset.y + (titik.y - fokus.y) * zoom / radius });
  const garisDalam = edgePalingKanan(dalam).map(petakan);
  const garisLuar = edgePalingKanan(luar).map(petakan);
  return <g><rect x="500" y="25" width="225" height="170" rx="14" className="inset-frame" /><text x="612" y="49" textAnchor="middle" className="inset-title">Kaca pembesar</text><svg x="502" y="55" width="220" height="136" viewBox="0 0 220 156" role="img" aria-label="Perbesaran celah antara segi banyak dan lingkaran"><circle cx={pusatInset.x} cy={pusatInset.y} r="45" className="inset-circle" /><line x1={garisDalam[0].x} y1={garisDalam[0].y} x2={garisDalam[1].x} y2={garisDalam[1].y} className="inset-lower" /><line x1={garisLuar[0].x} y1={garisLuar[0].y} x2={garisLuar[1].x} y2={garisLuar[1].y} className="inset-upper" /><text x="110" y="143" textAnchor="middle">garis hampir menempel</text></svg></g>;
}

const pusat = { x: 260, y: 220 };
const radius = 145;

export function ArchimedesMode() {
  const [jumlahSisi, setJumlahSisi] = useState(6);
  const [tampilkanPerhitungan, setTampilkanPerhitungan] = useState(false);
  const hasil = useMemo(() => hitungBatasArchimedes(jumlahSisi), [jumlahSisi]);
  const titikDalam = useMemo(() => vertices(jumlahSisi, radius, pusat, -Math.PI / 2), [jumlahSisi]);
  const titikLuar = useMemo(() => vertices(jumlahSisi, radius / Math.cos(Math.PI / jumlahSisi), pusat, -Math.PI / 2 + Math.PI / jumlahSisi), [jumlahSisi]);

  function gandakanSisi(): void {
    const indeks = N_ARCHIMEDES.indexOf(jumlahSisi as (typeof N_ARCHIMEDES)[number]);
    if (indeks === -1) {
      setJumlahSisi(jumlahSisi < 6 ? 6 : 12);
    } else if (indeks < N_ARCHIMEDES.length - 1) {
      setJumlahSisi(N_ARCHIMEDES[indeks + 1]);
    }
  }

  return (
    <div className="explore-layout archimedes-layout">
      <section className="canvas-card">
        <div className="canvas-heading"><span className="eyebrow">Kanvas interaktif</span><span className="instruction">Segi banyak mengapit lingkaran</span></div>
        <Canvas label="Lingkaran dengan segi banyak dalam dan luar" description={describeKeliling({ radius: 1, keliling: 2 * Math.PI, mode: `apitan segi-${jumlahSisi}` })} viewBox="0 0 760 470">
          <polygon points={titikLuar.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')} className="archimedes-upper-shape" />
          <polygon points={titikDalam.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')} className="archimedes-lower-shape" />
          <Circle pusat={pusat} radius={radius} warna="var(--warna-utama)" tebal={3} />
          <Label titik={{ x: pusat.x, y: pusat.y + radius + 33 }} warna="var(--warna-teks-lembut)">diameter = 1 satuan</Label>
          <Label titik={{ x: 260, y: 28 }} warna="var(--warna-garis-batas-atas)">batas atas</Label>
          <Label titik={{ x: 260, y: 440 }} warna="var(--warna-garis-batas-bawah)">batas bawah</Label>
          {jumlahSisi >= 48 && <Inset jumlahSisi={jumlahSisi} pusat={pusat} radius={radius} />}
        </Canvas>
        <div className="canvas-caption">Segi-n di dalam memberi batas bawah. Segi-n di luar memberi batas atas. Saat n bertambah, keduanya semakin dekat dengan lingkaran.</div>
      </section>
      <aside className="control-card">
        <div className="control-card-heading"><div><span className="eyebrow">Asal usul <Pi />: mengapit</span><h2>Persempit apitan</h2></div><button className="reset-button" onClick={() => { setJumlahSisi(6); setTampilkanPerhitungan(false); }}>↻ Reset</button></div>
        <SliderControl label="Jumlah sisi n" value={jumlahSisi} minimum={3} maksimum={96} onChange={setJumlahSisi} />
        <button className="button secondary full-width" onClick={gandakanSisi} disabled={jumlahSisi === 96}>Gandakan sisi: {jumlahSisi} → {Math.min(96, jumlahSisi * 2)}</button>
        <div className="step-list" aria-label="Urutan Archimedes">{N_ARCHIMEDES.map((n) => <button key={n} className={jumlahSisi === n ? 'step-chip aktif' : 'step-chip'} onClick={() => setJumlahSisi(n)}>{n}</button>)}</div>
        <ValuePanel judul="Nilai apitan" items={[{ label: 'n', value: hasil.n, warna: 'var(--warna-utama)' }, { label: 'Batas bawah', value: formatAngka(hasil.bawah), warna: 'var(--warna-garis-batas-bawah)' }, { label: 'Batas atas', value: formatAngka(hasil.atas), warna: 'var(--warna-garis-batas-atas)' }, { label: 'Selisih batas', value: formatAngka(hasil.selisih), warna: 'var(--warna-susun)' }]} />
        <div className="pi-inequality"><strong>Batas bawah &lt; <Pi /> &lt; batas atas</strong><span>{formatAngka(hasil.bawah)} &lt; <Pi /> &lt; {formatAngka(hasil.atas)}</span></div>
        {jumlahSisi === 96 && <div className="diagram-note success">Catatan sejarah ilustratif: apitan Archimedes ditulis sebagai 223/71 &lt; <Pi /> &lt; 22/7. Desimalnya: {formatAngka(223 / 71)} &lt; <Pi /> &lt; {formatAngka(22 / 7)}.</div>}
        <button className="text-button calculation-button" onClick={() => setTampilkanPerhitungan((nilai) => !nilai)}>{tampilkanPerhitungan ? 'Sembunyikan perhitungan' : 'Tampilkan perhitungan'}</button>
        {tampilkanPerhitungan && <div className="calculation-box"><Formula rumus={formulasByTopic['02-keliling'].eksplorasi[1]} label="Rekurrensi pelipatan sisi" /><p>Contoh dari n = 6 ke n = 12: masukkan a₆ = 2√3 dan b₆ = 3 ke dua rumus pelipatan sisi.</p></div>}
      </aside>
    </div>
  );
}
