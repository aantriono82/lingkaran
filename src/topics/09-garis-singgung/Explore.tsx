import { useState } from 'react';
import { AngleMarker, Canvas, Circle, DraggablePoint, Label, RightAngleMarker, Segment } from '../../components/svg';
import { Formula, SliderControl, ValuePanel } from '../../components';
import { formulasByTopic } from '../../lib/formulas';
import {
  garisSinggungDariTitikLuar,
  garisSinggungPersekutuan,
  panjangGarisSinggung,
  sudutArah,
  titikDariSudut,
  type CircleData,
  type Point
} from '../../lib/geometry';
import { describeSinggung } from '../descriptions';

type Mode = 'pada-lingkaran' | 'titik-luar' | 'dua-lingkaran';

const warnaSinggung = 'var(--warna-singgung)';
const warnaTitikSinggung = 'var(--warna-titik-singgung)';
const warnaPusat = 'var(--warna-radius)';

const pusatTunggal: Point = { x: 225, y: 215 };
const radiusTunggal = 118;
const lingkaranLuar: CircleData = { pusat: { x: 205, y: 215 }, jariJari: 112 };

function angka(nilai: number, satuan = ''): string {
  return Number.isFinite(nilai) ? `${nilai.toFixed(2)}${satuan}` : '—';
}

function batasiKanvas(titik: Point): Point {
  return { x: Math.max(30, Math.min(670, titik.x)), y: Math.max(38, Math.min(392, titik.y)) };
}

function batasiDiLingkaran(titik: Point, pusat: Point, radius: number): Point {
  const dx = titik.x - pusat.x;
  const dy = titik.y - pusat.y;
  const panjang = Math.hypot(dx, dy);
  if (panjang <= 1e-9) return { x: pusat.x + radius, y: pusat.y };
  return { x: pusat.x + dx / panjang * radius, y: pusat.y + dy / panjang * radius };
}

function batasiDiLuarLingkaran(titik: Point, pusat: Point, radius: number): Point {
  const dx = titik.x - pusat.x;
  const dy = titik.y - pusat.y;
  const panjang = Math.hypot(dx, dy);
  if (panjang <= radius) {
    if (panjang <= 1e-9) return { x: pusat.x + radius, y: pusat.y };
    return { x: pusat.x + dx / panjang * radius, y: pusat.y + dy / panjang * radius };
  }
  return batasiKanvas(titik);
}

function GarisTunggal({ sudut }: { sudut: number }) {
  const titikT = titikDariSudut(pusatTunggal, radiusTunggal, sudut);
  const arah = { x: -Math.sin(sudut), y: Math.cos(sudut) };
  const awal = { x: titikT.x - arah.x * 115, y: titikT.y - arah.y * 115 };
  const akhir = { x: titikT.x + arah.x * 135, y: titikT.y + arah.y * 135 };
  const titikP = { x: titikT.x + arah.x * 105, y: titikT.y + arah.y * 105 };
  return <>
    <Segment awal={awal} akhir={akhir} warna={warnaSinggung} tebal={5} />
    <Segment awal={pusatTunggal} akhir={titikT} warna={warnaPusat} tebal={4} />
    <RightAngleMarker puncak={titikT} a={pusatTunggal} b={titikP} warna={warnaTitikSinggung} />
    <AngleMarker pusat={titikT} radius={32} sudutAwal={sudutArah(titikT, pusatTunggal)} sudutAkhir={sudutArah(titikT, titikP)} label="90°" warna={warnaTitikSinggung} />
    <Circle pusat={titikT} radius={8} warna={warnaTitikSinggung} isi={warnaTitikSinggung} tebal={2} />
    <Label titik={{ x: pusatTunggal.x - 18, y: pusatTunggal.y - 15 }}>O</Label>
    <Label titik={{ x: titikT.x + 13, y: titikT.y - 14 }} warna={warnaTitikSinggung}>T</Label>
    <Label titik={{ x: titikP.x + 14, y: titikP.y - 12 }} warna={warnaSinggung}>P</Label>
  </>;
}

export function ExploreGarisSinggung() {
  const [mode, setMode] = useState<Mode>('pada-lingkaran');
  const [sudutT, setSudutT] = useState(0.35);
  const [titikP, setTitikP] = useState<Point>({ x: 505, y: 215 });
  const [pusatA, setPusatA] = useState<Point>({ x: 165, y: 215 });
  const [pusatB, setPusatB] = useState<Point>({ x: 505, y: 215 });
  const [radiusA, setRadiusA] = useState(82);
  const [radiusB, setRadiusB] = useState(58);
  const [tampilkanLuar, setTampilkanLuar] = useState(true);
  const [tampilkanDalam, setTampilkanDalam] = useState(true);

  const titikT = titikDariSudut(pusatTunggal, radiusTunggal, sudutT);
  const titikSinggung = garisSinggungDariTitikLuar(lingkaranLuar, titikP);
  const panjangT = panjangGarisSinggung(lingkaranLuar, titikP);
  const lingkaranA: CircleData = { pusat: pusatA, jariJari: radiusA };
  const lingkaranB: CircleData = { pusat: pusatB, jariJari: radiusB };
  const garisLuar = tampilkanLuar ? garisSinggungPersekutuan(lingkaranA, lingkaranB, 'luar') : [];
  const garisDalam = tampilkanDalam ? garisSinggungPersekutuan(lingkaranA, lingkaranB, 'dalam') : [];
  const jarakPusat = Math.hypot(pusatB.x - pusatA.x, pusatB.y - pusatA.y);
  const panjangLuar = Number.isFinite(jarakPusat) && jarakPusat > Math.abs(radiusA - radiusB)
    ? Math.sqrt(Math.max(0, jarakPusat ** 2 - (radiusA - radiusB) ** 2)) : 0;
  const panjangDalam = Number.isFinite(jarakPusat) && jarakPusat > radiusA + radiusB
    ? Math.sqrt(Math.max(0, jarakPusat ** 2 - (radiusA + radiusB) ** 2)) : 0;

  function reset(): void {
    setMode('pada-lingkaran');
    setSudutT(0.35);
    setTitikP({ x: 505, y: 215 });
    setPusatA({ x: 165, y: 215 });
    setPusatB({ x: 505, y: 215 });
    setRadiusA(82);
    setRadiusB(58);
    setTampilkanLuar(true);
    setTampilkanDalam(true);
  }

  function ubahPusat(setter: (nilai: Point) => void, nilai: Point): void {
    setter(batasiKanvas(nilai));
  }

  const modeLabel: Record<Mode, string> = {
    'pada-lingkaran': 'T pada lingkaran',
    'titik-luar': 'P titik luar',
    'dua-lingkaran': 'Dua lingkaran'
  };

  return <div className="explore-layout">
    <section className="canvas-card">
      <div className="canvas-heading"><span className="eyebrow">Kanvas interaktif</span><span className="instruction">{mode === 'pada-lingkaran' ? 'Geser T mengelilingi lingkaran' : mode === 'titik-luar' ? 'Geser P di luar lingkaran' : 'Geser pusat O₁ dan O₂'}</span></div>
      <Canvas label={`Eksplorasi ${modeLabel[mode]}`} description={describeSinggung({ mode, sudut: sudutT * 180 / Math.PI, jarak: jarakPusat, jumlahGaris: garisLuar.length + garisDalam.length })} grid>
        {mode === 'pada-lingkaran' && <>
          <Circle pusat={pusatTunggal} radius={radiusTunggal} warna="var(--warna-utama)" tebal={4} />
          <GarisTunggal sudut={sudutT} />
          <DraggablePoint titik={titikT} label="T" warna={warnaTitikSinggung} onChange={(nilai) => setSudutT(sudutArah(pusatTunggal, nilai))} constrain={(nilai) => batasiDiLingkaran(nilai, pusatTunggal, radiusTunggal)} />
        </>}
        {mode === 'titik-luar' && <>
          <Circle pusat={lingkaranLuar.pusat} radius={lingkaranLuar.jariJari} warna="var(--warna-utama)" tebal={4} />
          {titikSinggung.map((titik, indeks) => <g key={`garis-${indeks}`}>
            <Segment awal={titikP} akhir={titik} warna={warnaSinggung} tebal={5} />
            <Segment awal={lingkaranLuar.pusat} akhir={titik} warna={warnaPusat} tebal={4} />
            <RightAngleMarker puncak={titik} a={lingkaranLuar.pusat} b={titikP} warna={warnaTitikSinggung} />
            <Circle pusat={titik} radius={8} warna={warnaTitikSinggung} isi={warnaTitikSinggung} tebal={2} />
            <Label titik={{ x: titik.x + 14, y: titik.y - 13 }} warna={warnaTitikSinggung}>{indeks === 0 ? 'T₁' : 'T₂'}</Label>
          </g>)}
          <Circle pusat={lingkaranLuar.pusat} radius={6} warna={warnaPusat} isi={warnaPusat} tebal={1} />
          <Label titik={{ x: lingkaranLuar.pusat.x - 18, y: lingkaranLuar.pusat.y - 16 }}>O</Label>
          <DraggablePoint titik={titikP} label="P" warna={warnaSinggung} onChange={setTitikP} constrain={(nilai) => batasiDiLuarLingkaran(nilai, lingkaranLuar.pusat, lingkaranLuar.jariJari)} />
        </>}
        {mode === 'dua-lingkaran' && <>
          <Circle pusat={pusatA} radius={radiusA} warna="var(--warna-utama)" tebal={4} />
          <Circle pusat={pusatB} radius={radiusB} warna="var(--warna-utama)" tebal={4} />
          {garisLuar.map((garis, indeks) => <Segment key={`luar-${indeks}`} awal={garis.titikA} akhir={garis.titikB} warna={warnaSinggung} tebal={5} />)}
          {garisDalam.map((garis, indeks) => <Segment key={`dalam-${indeks}`} awal={garis.titikA} akhir={garis.titikB} warna={warnaTitikSinggung} tebal={4} dash="9 6" />)}
          {garisLuar.flatMap((garis, indeks) => [
            <Circle key={`titik-luar-a-${indeks}`} pusat={garis.titikA} radius={6} warna={warnaTitikSinggung} isi={warnaTitikSinggung} tebal={1} />,
            <Circle key={`titik-luar-b-${indeks}`} pusat={garis.titikB} radius={6} warna={warnaTitikSinggung} isi={warnaTitikSinggung} tebal={1} />
          ])}
          {garisDalam.flatMap((garis, indeks) => [
            <Circle key={`titik-dalam-a-${indeks}`} pusat={garis.titikA} radius={6} warna={warnaTitikSinggung} isi={warnaTitikSinggung} tebal={1} />,
            <Circle key={`titik-dalam-b-${indeks}`} pusat={garis.titikB} radius={6} warna={warnaTitikSinggung} isi={warnaTitikSinggung} tebal={1} />
          ])}
          <Circle pusat={pusatA} radius={6} warna={warnaPusat} isi={warnaPusat} tebal={1} />
          <Circle pusat={pusatB} radius={6} warna={warnaPusat} isi={warnaPusat} tebal={1} />
          <Label titik={{ x: pusatA.x, y: pusatA.y - radiusA - 14 }}>O₁</Label>
          <Label titik={{ x: pusatB.x, y: pusatB.y - radiusB - 14 }}>O₂</Label>
          <DraggablePoint titik={pusatA} label="O₁" warna={warnaPusat} onChange={(nilai) => ubahPusat(setPusatA, nilai)} constrain={batasiKanvas} />
          <DraggablePoint titik={pusatB} label="O₂" warna={warnaPusat} onChange={(nilai) => ubahPusat(setPusatB, nilai)} constrain={batasiKanvas} />
        </>}
      </Canvas>
      <div className="canvas-caption">Garis penuh menunjukkan garis singgung luar, sedangkan garis putus-putus menunjukkan garis singgung dalam. Titik berwarna gelap adalah titik singgung.</div>
    </section>
    <aside className="control-card">
      <div className="control-card-heading"><div><span className="eyebrow">Amati garis singgung</span><h2>{modeLabel[mode]}</h2></div><button className="reset-button" onClick={reset}>↻ Reset</button></div>
      <div className="mode-toggle" role="group" aria-label="Mode eksplorasi garis singgung">
        {(Object.keys(modeLabel) as Mode[]).map((item) => <button key={item} className={mode === item ? 'chip aktif' : 'chip'} style={{ '--chip-color': warnaSinggung } as React.CSSProperties} onClick={() => setMode(item)}>{modeLabel[item]}</button>)}
      </div>
      {mode === 'pada-lingkaran' && <>
        <ValuePanel items={[{ label: 'OT ⟂ PT', value: '90°', warna: warnaTitikSinggung }, { label: 'Posisi sudut T', value: `${((sudutT * 180 / Math.PI + 360) % 360).toFixed(1)}°`, warna: warnaSinggung }]} />
        <Formula rumus={formulasByTopic['09-garis-singgung'].eksplorasi[0]} label="Jari-jari tegak lurus garis singgung" />
        <p className="tip-text">Geser T mengelilingi lingkaran. Apa pun posisinya, jari-jari OT selalu tegak lurus garis singgung di T.</p>
      </>}
      {mode === 'titik-luar' && <>
        <ValuePanel items={[{ label: 'OP', value: angka(Math.hypot(titikP.x - lingkaranLuar.pusat.x, titikP.y - lingkaranLuar.pusat.y)), warna: warnaPusat }, { label: 'Jari-jari r', value: `${lingkaranLuar.jariJari} satuan`, warna: warnaPusat }, { label: 'PT₁ = PT₂', value: titikSinggung.length ? `${angka(panjangT)} satuan` : 'Tidak ada', warna: warnaSinggung }, { label: 'Titik singgung', value: titikSinggung.length === 1 ? 'Menyatu (batas)' : titikSinggung.length === 2 ? '2 titik' : 'Tidak ada', warna: warnaTitikSinggung }]} />
        <Formula rumus={formulasByTopic['09-garis-singgung'].eksplorasi[1]} label="Panjang garis singgung dari titik luar" />
        <div className={titikSinggung.length === 1 ? 'diagram-note success' : titikSinggung.length === 0 ? 'diagram-note warning' : 'diagram-note'}>{titikSinggung.length === 1 ? 'P berada pada keadaan batas: dua garis singgung menyatu.' : titikSinggung.length === 0 ? 'P berada di dalam lingkaran. Geser P ke tepi atau ke luar.' : 'Dua garis singgung dari P memiliki panjang yang sama.'}</div>
      </>}
      {mode === 'dua-lingkaran' && <>
        <SliderControl label="Jari-jari lingkaran 1 (R)" value={radiusA} minimum={35} maksimum={125} satuan=" satuan" onChange={setRadiusA} />
        <SliderControl label="Jari-jari lingkaran 2 (r)" value={radiusB} minimum={25} maksimum={110} satuan=" satuan" onChange={setRadiusB} />
        <label className="toggle-field"><input type="checkbox" checked={tampilkanLuar} onChange={(event) => setTampilkanLuar(event.target.checked)} /><span>Garis singgung luar</span></label>
        <label className="toggle-field"><input type="checkbox" checked={tampilkanDalam} onChange={(event) => setTampilkanDalam(event.target.checked)} /><span>Garis singgung dalam</span></label>
        <ValuePanel items={[{ label: 'Jarak pusat d', value: angka(jarakPusat), warna: warnaPusat }, { label: 'Panjang luar', value: garisLuar.length ? `${angka(panjangLuar)} satuan` : 'Tidak ada', warna: warnaSinggung }, { label: 'Panjang dalam', value: garisDalam.length ? `${angka(panjangDalam)} satuan` : 'Tidak ada', warna: warnaTitikSinggung }, { label: 'Banyak garis terlihat', value: `${garisLuar.length + garisDalam.length}`, warna: warnaSinggung }]} />
        <Formula rumus={formulasByTopic['09-garis-singgung'].eksplorasi[2]} label="Rumus garis singgung persekutuan" />
        <div className={garisDalam.length ? 'diagram-note' : 'diagram-note warning'}>{garisDalam.length ? 'Garis singgung dalam tersedia karena d > R + r.' : 'Garis singgung dalam tidak ada karena d ≤ R + r.'}</div>
      </>}
    </aside>
  </div>;
}
