import { useState } from 'react';
import { AngleMarker, Arc, Canvas, Circle, DraggablePoint, Label, Segment } from '../../components/svg';
import { Formula, ValuePanel } from '../../components';
import { formulasByTopic } from '../../lib/formulas';
import { analisisDuaTaliBusur, derajat, rentangBusurTanpaTitik, titikDariSudut, type Point } from '../../lib/geometry';
import { describeTaliBusur } from '../descriptions';

type Mode = 'dalam' | 'luar';
const pusat: Point = { x: 350, y: 215 };
const radius = 145;

function keSudut(titik: Point): number {
  return Math.atan2(titik.y - pusat.y, titik.x - pusat.x);
}

function diLingkaran(titik: Point): Point {
  const dx = titik.x - pusat.x;
  const dy = titik.y - pusat.y;
  const panjang = Math.max(1, Math.hypot(dx, dy));
  return { x: pusat.x + dx / panjang * radius, y: pusat.y + dy / panjang * radius };
}

function perpanjangan(awal: Point, akhir: Point, jarak: number): [Point, Point] {
  const dx = akhir.x - awal.x;
  const dy = akhir.y - awal.y;
  const panjang = Math.max(1, Math.hypot(dx, dy));
  const ux = dx / panjang;
  const uy = dy / panjang;
  return [{ x: awal.x - ux * jarak, y: awal.y - uy * jarak }, { x: akhir.x + ux * jarak, y: akhir.y + uy * jarak }];
}

export function ExploreTaliBusur() {
  const [mode, setMode] = useState<Mode>('dalam');
  const [sudut, setSudut] = useState([0.1, Math.PI, Math.PI / 2, Math.PI * 1.5]);
  const titik = sudut.map((nilai) => titikDariSudut(pusat, radius, nilai));
  const hasil = analisisDuaTaliBusur(titik, pusat, radius);
  const sesuaiMode = (mode === 'dalam') === hasil.diDalam;
  const rentangBusur = hasil.diDalam
    ? [rentangBusurTanpaTitik(sudut[0], sudut[2], [sudut[1], sudut[3]]), rentangBusurTanpaTitik(sudut[1], sudut[3], [sudut[0], sudut[2]])]
    : [rentangBusurTanpaTitik(sudut[hasil.indeksJauh[0]], sudut[hasil.indeksJauh[1]], [sudut[hasil.indeksDekat[0]], sudut[hasil.indeksDekat[1]]]), rentangBusurTanpaTitik(sudut[hasil.indeksDekat[0]], sudut[hasil.indeksDekat[1]], [sudut[hasil.indeksJauh[0]], sudut[hasil.indeksJauh[1]]])];
  const titikSudutA = hasil.diDalam ? titik[0] : titik[hasil.indeksDekat[0]];
  const titikSudutB = hasil.diDalam ? titik[2] : titik[hasil.indeksDekat[1]];

  function geser(indeks: number, nilai: Point): void {
    setSudut((sebelumnya) => sebelumnya.map((item, i) => i === indeks ? keSudut(nilai) : item));
  }

  function reset(): void {
    setMode('dalam');
    setSudut([0.1, Math.PI, Math.PI / 2, Math.PI * 1.5]);
  }

  function ubahMode(modeBaru: Mode): void {
    setMode(modeBaru);
    setSudut(modeBaru === 'dalam' ? [0.1, Math.PI, Math.PI / 2, Math.PI * 1.5] : [0.2, 0.9, 2.2, 3]);
  }

  return <div className="explore-layout">
    <section className="canvas-card">
      <div className="canvas-heading"><span className="eyebrow">Kanvas interaktif</span><span className="instruction">Geser A, B, C, atau D</span></div>
      <Canvas label="Sudut antara dua tali busur" description={describeTaliBusur({ sudut: hasil.potong ? derajat(hasil.sudut) : 0, mode })} grid>
        <Circle pusat={pusat} radius={radius} warna="var(--warna-utama)" tebal={4} />
        {mode === 'luar' && <><Segment awal={perpanjangan(titik[0], titik[1], 90)[0]} akhir={perpanjangan(titik[0], titik[1], 90)[1]} warna="var(--warna-potong)" tebal={3} dash="8 6" /><Segment awal={perpanjangan(titik[2], titik[3], 90)[0]} akhir={perpanjangan(titik[2], titik[3], 90)[1]} warna="var(--warna-potong)" tebal={3} dash="8 6" /></>}
        <Segment awal={titik[0]} akhir={titik[1]} warna="var(--warna-tali-busur)" tebal={6} />
        <Segment awal={titik[2]} akhir={titik[3]} warna="var(--warna-tali-busur)" tebal={6} />
        {rentangBusur.map(([awal, akhir], indeks) => <Arc key={indeks} pusat={pusat} radius={radius + 7} sudutAwal={awal} sudutAkhir={akhir} warna={indeks === 0 ? 'var(--warna-busur)' : 'var(--warna-potong)'} tebal={10} />)}
        {hasil.potong && <><Circle pusat={hasil.potong} radius={7} warna="var(--warna-aksen)" isi="var(--warna-aksen)" tebal={1} /><AngleMarker pusat={hasil.potong} radius={30} sudutAwal={Math.atan2(titikSudutA.y - hasil.potong.y, titikSudutA.x - hasil.potong.x)} sudutAkhir={Math.atan2(titikSudutB.y - hasil.potong.y, titikSudutB.x - hasil.potong.x)} label={`${derajat(hasil.sudut).toFixed(1)}°`} warna="var(--warna-aksen)" /></>}
        {titik.map((nilai, indeks) => <DraggablePoint key={indeks} titik={nilai} label={String.fromCharCode(65 + indeks)} warna={indeks < 2 ? 'var(--warna-tali-busur)' : 'var(--warna-potong)'} onChange={(baru) => geser(indeks, baru)} constrain={diLingkaran} />)}
        <Label titik={{ x: 350, y: 35 }} warna="var(--warna-busur)">{mode === 'dalam' ? 'busur yang dijumlahkan' : 'busur yang dikurangkan'}</Label>
      </Canvas>
      <div className="canvas-caption">Busur yang disorot menjadi sumber perhitungan sudut. Pengurutan titik dihitung ulang setiap kali titik digeser.</div>
    </section>
    <aside className="control-card">
      <div className="control-card-heading"><div><span className="eyebrow">Amati hubungan sudut</span><h2>Dua tali busur</h2></div><button className="reset-button" onClick={reset}>↻ Reset</button></div>
      <div className="mode-toggle" aria-label="Mode perpotongan tali busur"><button className={mode === 'dalam' ? 'chip aktif' : 'chip'} aria-pressed={mode === 'dalam'} onClick={() => ubahMode('dalam')}>Tali busur berpotongan di dalam</button><button className={mode === 'luar' ? 'chip aktif' : 'chip'} aria-pressed={mode === 'luar'} onClick={() => ubahMode('luar')}>Perpanjangan berpotongan di luar</button></div>
      {!sesuaiMode && <div className="diagram-note warning">Setelah titik digeser, kedua garis saat ini berpotongan {hasil.diDalam ? 'di dalam' : 'di luar'} lingkaran. Pilih mode yang sesuai untuk membaca rumusnya.</div>}
      <ValuePanel items={[{ label: 'Sudut perpotongan', value: hasil.potong ? `${derajat(hasil.sudut).toFixed(1)}°` : 'Belum berpotongan', warna: 'var(--warna-aksen)' }, { label: mode === 'dalam' ? 'Busur pertama' : 'Busur besar', value: `${derajat(hasil.busurPertama).toFixed(1)}°`, warna: 'var(--warna-busur)' }, { label: mode === 'dalam' ? 'Busur lawan' : 'Busur kecil', value: `${derajat(hasil.busurKedua).toFixed(1)}°`, warna: 'var(--warna-potong)' }]} />
      <Formula rumus={mode === 'dalam' ? formulasByTopic['05-tali-busur'].eksplorasi[0] : formulasByTopic['05-tali-busur'].eksplorasi[1]} label="Rumus sudut antara dua tali busur" />
      <p className="tip-text">Di dalam lingkaran, sudut memakai setengah jumlah dua busur yang dihadapinya. Di luar lingkaran, sudut memakai setengah selisih busur besar dan busur kecil.</p>
    </aside>
  </div>;
}
