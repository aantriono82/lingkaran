import { useState } from 'react';
import { Canvas, Circle, DraggablePoint, Label, Segment } from '../../components/svg';
import { SliderControl, ValuePanel } from '../../components';
import { analisisKedudukanDuaLingkaran, type Point } from '../../lib/geometry';
import { describeKedudukan } from '../descriptions';

const warnaLingkaranA = 'var(--warna-kedudukan-a)';
const warnaLingkaranB = 'var(--warna-kedudukan-b)';
const warnaPotong = 'var(--warna-titik-persekutuan)';

function angka(nilai: number): string {
  return Number.isFinite(nilai) ? nilai.toFixed(2) : '—';
}

function batasiKanvas(titik: Point): Point {
  return { x: Math.max(30, Math.min(670, titik.x)), y: Math.max(38, Math.min(392, titik.y)) };
}

function titikDenganSnap(titik: Point, pusat: Point, radiusA: number, radiusB: number, aktif: boolean): Point {
  const dx = titik.x - pusat.x;
  const dy = titik.y - pusat.y;
  const jarak = Math.hypot(dx, dy);
  if (!aktif) return batasiKanvas(titik);
  const sasaran = [0, Math.abs(radiusA - radiusB), radiusA + radiusB];
  const terdekat = sasaran.reduce((sebelumnya, nilai) => Math.abs(nilai - jarak) < Math.abs(sebelumnya - jarak) ? nilai : sebelumnya, sasaran[0]);
  if (Math.abs(terdekat - jarak) > 28) return batasiKanvas(titik);
  if (terdekat === 0) return pusat;
  if (jarak <= 1e-9) return { x: pusat.x + terdekat, y: pusat.y };
  return batasiKanvas({ x: pusat.x + dx / jarak * terdekat, y: pusat.y + dy / jarak * terdekat });
}

export function ExploreKedudukan() {
  const [pusatA, setPusatA] = useState<Point>({ x: 185, y: 215 });
  const [pusatB, setPusatB] = useState<Point>({ x: 500, y: 215 });
  const [radiusA, setRadiusA] = useState(105);
  const [radiusB, setRadiusB] = useState(65);
  const [snap, setSnap] = useState(false);
  const lingkaranA = { pusat: pusatA, jariJari: radiusA };
  const lingkaranB = { pusat: pusatB, jariJari: radiusB };
  const analisis = analisisKedudukanDuaLingkaran(lingkaranA, lingkaranB);
  const garisPusat = analisis.d > 1e-9 ? <Segment awal={pusatA} akhir={pusatB} warna="var(--warna-sumbu-sisi)" tebal={3} dash="8 7" /> : null;

  function reset(): void {
    setPusatA({ x: 185, y: 215 });
    setPusatB({ x: 500, y: 215 });
    setRadiusA(105);
    setRadiusB(65);
    setSnap(false);
  }

  function geserB(nilai: Point): void {
    setPusatB(titikDenganSnap(nilai, pusatA, radiusA, radiusB, snap));
  }

  return <div className="explore-layout">
    <section className="canvas-card">
      <div className="canvas-heading"><span className="eyebrow">Kanvas interaktif</span><span className="instruction">Geser O₁ atau O₂, lalu ubah jari-jari</span></div>
      <Canvas label="Kedudukan dua lingkaran" description={describeKedudukan({ jarak: analisis.d, radiusA, radiusB, kedudukan: analisis.kedudukan })} grid>
        {garisPusat}
        <Circle pusat={pusatA} radius={radiusA} warna={warnaLingkaranA} tebal={4} />
        <Circle pusat={pusatB} radius={radiusB} warna={warnaLingkaranB} tebal={4} />
        {analisis.titikPersekutuan.map((titik, indeks) => <g key={`potong-${indeks}`}>
          <Circle pusat={titik} radius={9} warna={warnaPotong} isi={warnaPotong} tebal={2} />
          <Label titik={{ x: titik.x + 15, y: titik.y - 13 }} warna={warnaPotong}>{indeks === 0 ? 'P₁' : 'P₂'}</Label>
        </g>)}
        <Circle pusat={pusatA} radius={6} warna={warnaLingkaranA} isi={warnaLingkaranA} tebal={1} />
        <Circle pusat={pusatB} radius={6} warna={warnaLingkaranB} isi={warnaLingkaranB} tebal={1} />
        <Label titik={{ x: pusatA.x, y: pusatA.y - radiusA - 14 }} warna={warnaLingkaranA}>O₁</Label>
        <Label titik={{ x: pusatB.x, y: pusatB.y - radiusB - 14 }} warna={warnaLingkaranB}>O₂</Label>
        <DraggablePoint titik={pusatA} label="O₁" warna={warnaLingkaranA} onChange={(nilai) => setPusatA(batasiKanvas(nilai))} constrain={batasiKanvas} />
        <DraggablePoint titik={pusatB} label="O₂" warna={warnaLingkaranB} onChange={geserB} constrain={batasiKanvas} />
      </Canvas>
      <div className="canvas-caption">Titik P₁ dan P₂ muncul saat kedua lingkaran memiliki titik persekutuan. Toleransi kecil dipakai agar klasifikasi tetap stabil saat digeser dengan jari.</div>
    </section>
    <aside className="control-card">
      <div className="control-card-heading"><div><span className="eyebrow">Klasifikasi otomatis</span><h2>{analisis.kedudukan}</h2></div><button className="reset-button" onClick={reset}>↻ Reset</button></div>
      <SliderControl label="Jari-jari besar R" value={radiusA} minimum={45} maksimum={125} satuan=" satuan" onChange={(nilai) => setRadiusA(Math.max(nilai, radiusB))} />
      <SliderControl label="Jari-jari kecil r" value={radiusB} minimum={25} maksimum={105} satuan=" satuan" onChange={(nilai) => setRadiusB(Math.min(nilai, radiusA))} />
      <label className="toggle-field"><input type="checkbox" checked={snap} onChange={(event) => setSnap(event.target.checked)} /><span>Snap ke kondisi singgung</span></label>
      <ValuePanel items={[{ label: 'Jarak pusat d', value: angka(analisis.d), warna: 'var(--warna-sumbu-sisi)' }, { label: 'R + r', value: angka(analisis.jumlahRadius), warna: warnaLingkaranA }, { label: 'R − r', value: angka(analisis.selisihRadius), warna: warnaLingkaranB }, { label: 'Titik persekutuan', value: analisis.jumlahTitikPersekutuan, warna: warnaPotong }, { label: 'Garis singgung persekutuan', value: analisis.jumlahGarisSinggungPersekutuan, warna: 'var(--warna-singgung)' }]} />
      <div className={analisis.jumlahTitikPersekutuan > 0 ? 'diagram-note success' : 'diagram-note'}>{analisis.jumlahTitikPersekutuan === 2 ? 'Dua lingkaran berpotongan di dua titik.' : analisis.jumlahTitikPersekutuan === 1 ? 'Kedua lingkaran bersinggungan di satu titik.' : 'Tidak ada titik persekutuan.'}</div>
      <p className="tip-text">Bandingkan d dengan R + r dan R − r. Aktifkan snap, lalu geser O₂ perlahan untuk mencapai keadaan bersinggungan luar atau dalam.</p>
    </aside>
  </div>;
}
