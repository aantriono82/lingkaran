import { useMemo, useState } from 'react';
import { AngleMarker, Arc, Canvas, Circle, DraggablePoint, Label, RightAngleMarker, Segment } from '../../components/svg';
import { Formula, SliderControl, ValuePanel } from '../../components';
import { formulasByTopic } from '../../lib/formulas';
import { derajat, normalisasiSudut, sudutDiTitik, sudutPusatUntukBusurBerhadapan, titikDariSudut, titikDiBusurKecil, type Point } from '../../lib/geometry';
import { describeSudut } from '../descriptions';

const pusat: Point = { x: 350, y: 215 };
const radius = 145;

function keSudut(titik: Point): number {
  return Math.atan2(titik.y - pusat.y, titik.x - pusat.x);
}

function diLingkaran(titik: Point): Point {
  const dx = titik.x - pusat.x;
  const dy = titik.y - pusat.y;
  const panjang = Math.max(1, Math.hypot(dx, dy));
  return { x: pusat.x + (dx / panjang) * radius, y: pusat.y + (dy / panjang) * radius };
}

function sudutCValid(sudutA: number, sudutB: number, sudutC: number): number {
  if (!titikDiBusurKecil(sudutA, sudutB, sudutC)) return sudutC;
  const maju = normalisasiSudut(sudutB - sudutA);
  const awalKecil = maju <= Math.PI ? sudutA : sudutB;
  const akhirKecil = maju <= Math.PI ? sudutB : sudutA;
  const dariAwal = normalisasiSudut(sudutC - awalKecil);
  const keAkhir = normalisasiSudut(akhirKecil - sudutC);
  return normalisasiSudut(dariAwal <= keAkhir ? awalKecil - 0.06 : akhirKecil + 0.06);
}

function sudutTitikPembanding(sudutA: number, sudutB: number, sudutC: number): number {
  const maju = normalisasiSudut(sudutB - sudutA);
  const busurKecil = maju <= Math.PI ? normalisasiSudut(sudutA + maju / 2) : normalisasiSudut(sudutA - (Math.PI * 2 - maju) / 2);
  const titikCDiBusurKecil = titikDiBusurKecil(sudutA, sudutB, sudutC);
  const calon = normalisasiSudut(busurKecil + (titikCDiBusurKecil ? 0.32 : Math.PI + 0.32));
  return titikDiBusurKecil(sudutA, sudutB, calon) === titikCDiBusurKecil ? calon : (titikCDiBusurKecil ? busurKecil : normalisasiSudut(busurKecil + Math.PI));
}

export function ExploreSudut() {
  const [sudutA, setSudutA] = useState(3.45);
  const [sudutB, setSudutB] = useState(5.55);
  const [sudutC, setSudutC] = useState(1.35);
  const [izinkanRefleks, setIzinkanRefleks] = useState(false);
  const titikA = titikDariSudut(pusat, radius, sudutA);
  const titikB = titikDariSudut(pusat, radius, sudutB);
  const sudutCTampil = izinkanRefleks ? sudutC : sudutCValid(sudutA, sudutB, sudutC);
  const titikC = titikDariSudut(pusat, radius, sudutCTampil);
  const sudutD = sudutTitikPembanding(sudutA, sudutB, sudutCTampil);
  const titikD = titikDariSudut(pusat, radius, sudutD);
  const majuAB = normalisasiSudut(sudutB - sudutA);
  const sudutPusatKecil = Math.min(majuAB, Math.PI * 2 - majuAB);
  const awalBusurKecil = majuAB <= Math.PI ? sudutA : sudutB;
  const akhirBusurKecil = awalBusurKecil + sudutPusatKecil;
  const sudutPusat = izinkanRefleks ? sudutPusatUntukBusurBerhadapan(sudutA, sudutB, sudutCTampil) : sudutPusatKecil;
  const sudutKeliling = sudutDiTitik(titikC, titikA, titikB);
  const sudutKelilingD = sudutDiTitik(titikD, titikA, titikB);
  const menghadapDiameter = Math.abs(sudutPusat - Math.PI) < 0.04;
  const diBusurKecil = titikDiBusurKecil(sudutA, sudutB, sudutCTampil);
  const sudutBusurAwal = izinkanRefleks ? (diBusurKecil ? sudutB : sudutA) : awalBusurKecil;
  const sudutBusurAkhir = izinkanRefleks ? (diBusurKecil ? sudutA + Math.PI * 2 : sudutB) : akhirBusurKecil;
  const perbandingan = useMemo(() => Math.abs(derajat(sudutPusat) - 2 * derajat(sudutKeliling)) < 0.2, [sudutPusat, sudutKeliling]);
  const sudutKelilingSama = Math.abs(sudutKeliling - sudutKelilingD) < 0.2;

  function reset(): void {
    setSudutA(3.45);
    setSudutB(5.55);
    setSudutC(1.35);
    setIzinkanRefleks(false);
  }

  return (
    <div className="explore-layout">
      <section className="canvas-card">
        <div className="canvas-heading"><span className="eyebrow">Kanvas interaktif</span><span className="instruction">Geser A, B, atau C</span></div>
        <Canvas label="Diagram sudut pusat dan sudut keliling" description={describeSudut({ sudutPusat: derajat(sudutPusat), sudutKeliling: derajat(sudutKeliling), sudutKelilingD: derajat(sudutKelilingD) })} grid>
          <Circle pusat={pusat} radius={radius} warna="var(--warna-utama)" tebal={4} />
          <Segment awal={pusat} akhir={titikA} warna="var(--warna-radius)" tebal={4} />
          <Segment awal={pusat} akhir={titikB} warna="var(--warna-radius)" tebal={4} />
          <Segment awal={titikC} akhir={titikA} warna="var(--warna-tali-busur)" tebal={5} />
          <Segment awal={titikC} akhir={titikB} warna="var(--warna-tali-busur)" tebal={5} />
          <Segment awal={titikD} akhir={titikA} warna="var(--warna-tali-busur)" tebal={3} dash="7 6" />
          <Segment awal={titikD} akhir={titikB} warna="var(--warna-tali-busur)" tebal={3} dash="7 6" />
          <Arc pusat={pusat} radius={radius} sudutAwal={sudutBusurAwal} sudutAkhir={sudutBusurAkhir} warna="var(--warna-busur)" tebal={9} />
          <AngleMarker pusat={pusat} radius={48} sudutAwal={sudutBusurAwal} sudutAkhir={sudutBusurAkhir} label={`${derajat(sudutPusat).toFixed(1)}°`} />
          <AngleMarker pusat={titikC} radius={32} sudutAwal={Math.atan2(titikA.y - titikC.y, titikA.x - titikC.x)} sudutAkhir={Math.atan2(titikB.y - titikC.y, titikB.x - titikC.x)} label={`${derajat(sudutKeliling).toFixed(1)}°`} warna="var(--warna-tali-busur)" />
          {menghadapDiameter && <RightAngleMarker puncak={titikC} a={titikA} b={titikB} />}
          <Circle pusat={pusat} radius={6} warna="var(--warna-utama)" isi="var(--warna-utama)" tebal={1} />
          <Label titik={{ x: pusat.x, y: pusat.y - 15 }}>O</Label>
          <DraggablePoint titik={titikA} label="A" warna="var(--warna-tali-busur)" onChange={(titik) => setSudutA(keSudut(titik))} constrain={diLingkaran} />
          <DraggablePoint titik={titikB} label="B" warna="var(--warna-tali-busur)" onChange={(titik) => setSudutB(keSudut(titik))} constrain={diLingkaran} />
          <DraggablePoint titik={titikC} label="C" warna="var(--warna-aksen)" onChange={(titik) => setSudutC(izinkanRefleks ? keSudut(titik) : sudutCValid(sudutA, sudutB, keSudut(titik)))} constrain={(titik) => izinkanRefleks ? diLingkaran(titik) : titikDariSudut(pusat, radius, sudutCValid(sudutA, sudutB, keSudut(titik)))} />
          <circle cx={titikD.x} cy={titikD.y} r="8" fill="var(--warna-busur)" stroke="#ffffff" strokeWidth="3" />
          <Label titik={{ x: titikD.x + 14, y: titikD.y - 12 }} warna="var(--warna-busur)">D</Label>
        </Canvas>
        <div className="canvas-caption">Sudut pusat dan sudut keliling menghadap busur AB yang sama. Geser C melewati busur untuk melihat perubahan sudut.</div>
      </section>
      <aside className="control-card">
        <div className="control-card-heading"><div><span className="eyebrow">Amati hubungan sudut</span><h2>{perbandingan ? 'Hubungan terbukti' : 'Geser titik untuk mencoba'}</h2></div><button className="reset-button" onClick={reset}>↻ Reset</button></div>
        <ValuePanel items={[{ label: 'Sudut pusat ∠AOB', value: `${derajat(sudutPusat).toFixed(1)}°`, warna: 'var(--warna-aksen)' }, { label: 'Sudut keliling ∠ACB', value: `${derajat(sudutKeliling).toFixed(1)}°`, warna: 'var(--warna-tali-busur)' }, { label: 'Sudut keliling ∠ADB', value: `${derajat(sudutKelilingD).toFixed(1)}°`, warna: 'var(--warna-busur)' }, { label: '2 × ∠ACB', value: `${(2 * derajat(sudutKeliling)).toFixed(1)}°`, warna: 'var(--warna-busur)' }]} />
        <div className={perbandingan && sudutKelilingSama ? 'proof-box active' : 'proof-box'}><strong>{perbandingan ? '✓ Sudut pusat = 2 × sudut keliling' : 'Geser titik untuk menguji hubungan sudut'}</strong><span>{menghadapDiameter ? 'AB adalah diameter, sehingga ∠ACB dan ∠ADB sama-sama 90°.' : `∠ACB = ∠ADB karena keduanya menghadap busur AB yang sama (${derajat(sudutPusat).toFixed(1)}°).`}</span></div>
        <label className="toggle-field"><input type="checkbox" checked={izinkanRefleks} onChange={(event) => { const aktif = event.target.checked; setIzinkanRefleks(aktif); if (!aktif) setSudutC(sudutCValid(sudutA, sudutB, sudutC)); }} /> <span>Izinkan sudut refleks (&gt;180°)</span></label>
        <SliderControl label="Posisi C" value={Math.round((sudutCTampil / (Math.PI * 2)) * 360)} minimum={0} maksimum={359} satuan="°" onChange={(nilai) => setSudutC(izinkanRefleks ? (nilai * Math.PI) / 180 : sudutCValid(sudutA, sudutB, (nilai * Math.PI) / 180))} />
        <Formula rumus={menghadapDiameter ? formulasByTopic['04-sudut'].eksplorasi[0] : formulasByTopic['04-sudut'].eksplorasi[1]} label="Hubungan sudut pusat dan sudut keliling" />
        <p className="tip-text">Saat opsi mati, C dibatasi pada busur yang membuat sudut pusat memakai busur kecil (maksimal 180°). Saat aktif, C boleh melewati busur dan sudut pusat refleks ditampilkan.</p>
      </aside>
    </div>
  );
}
