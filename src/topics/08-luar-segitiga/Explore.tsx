import { useState } from 'react';
import { Canvas, Circle, DraggablePoint, Label, Segment } from '../../components/svg';
import { Formula, ValuePanel } from '../../components';
import { formulasByTopic } from '../../lib/formulas';
import { analisisSegitiga, garisSumbuSisi, type Point } from '../../lib/geometry';
import { describeLuar } from '../descriptions';

const warnaSumbu = 'var(--warna-sumbu-sisi)';
const warnaLuar = 'var(--warna-lingkaran-luar)';

const LEBAR_KANVAS = 700;
const TINGGI_KANVAS = 450;
const BANTALAN = 14;

const TITIK_AWAL: Point[] = [
  { x: 210, y: 275 },
  { x: 490, y: 275 },
  { x: 350, y: 65 }
];

function angka(nilai: number, satuan = ''): string {
  return Number.isFinite(nilai) ? `${nilai.toFixed(2).replace('.', ',')}${satuan}` : '—';
}

function lingkaranMasukKanvas(analisis: ReturnType<typeof analisisSegitiga>): boolean {
  if (!analisis.valid) return true;
  const { pusatLuar, radiusLuar } = analisis;
  if (!Number.isFinite(radiusLuar) || radiusLuar <= 0) return true;
  if (radiusLuar > TINGGI_KANVAS / 2 + 15) return false;
  const minX = pusatLuar.x - radiusLuar;
  const maxX = pusatLuar.x + radiusLuar;
  const minY = pusatLuar.y - radiusLuar;
  const maxY = pusatLuar.y + radiusLuar;
  return (
    minX >= BANTALAN &&
    maxX <= LEBAR_KANVAS - BANTALAN &&
    minY >= BANTALAN &&
    maxY <= TINGGI_KANVAS - BANTALAN
  );
}

function batasiTitik(indeks: number, baru: Point, saatIni: Point[]): Point {
  const titikKlem = {
    x: Math.max(BANTALAN * 2, Math.min(LEBAR_KANVAS - BANTALAN * 2, baru.x)),
    y: Math.max(BANTALAN * 2, Math.min(TINGGI_KANVAS - BANTALAN * 2, baru.y))
  };

  const segitigaBaru = saatIni.map((p, i) => (i === indeks ? titikKlem : p));
  const analisisBaru = analisisSegitiga(segitigaBaru[0], segitigaBaru[1], segitigaBaru[2]);

  if (lingkaranMasukKanvas(analisisBaru)) {
    return titikKlem;
  }

  const titikLama = saatIni[indeks];
  let low = 0;
  let high = 1;
  let terbaik = titikLama;

  for (let step = 0; step < 8; step++) {
    const mid = (low + high) / 2;
    const titikTengah = {
      x: titikLama.x + (titikKlem.x - titikLama.x) * mid,
      y: titikLama.y + (titikKlem.y - titikLama.y) * mid
    };
    const segitigaUji = saatIni.map((p, i) => (i === indeks ? titikTengah : p));
    const analisisUji = analisisSegitiga(segitigaUji[0], segitigaUji[1], segitigaUji[2]);
    if (lingkaranMasukKanvas(analisisUji)) {
      terbaik = titikTengah;
      low = mid;
    } else {
      high = mid;
    }
  }

  return terbaik;
}

export function ExploreLingkaranLuar() {
  const [titik, setTitik] = useState<Point[]>(TITIK_AWAL);
  const [a, b, c] = titik;
  const analisis = analisisSegitiga(a, b, c);
  const sumbu = [garisSumbuSisi(b, c, 260), garisSumbuSisi(a, c, 260), garisSumbuSisi(a, b, 260)];
  const pusatTerbatas = analisis.valid && Number.isFinite(analisis.pusatLuar.x) && Number.isFinite(analisis.pusatLuar.y)
    && Math.abs(analisis.pusatLuar.x) < 3000 && Math.abs(analisis.pusatLuar.y) < 3000;
  const lingkaranTampil = pusatTerbatas && analisis.radiusLuar > 0 && analisis.radiusLuar <= 240;

  function geser(indeks: number, nilai: Point): void {
    setTitik((sebelumnya) => {
      const aman = batasiTitik(indeks, nilai, sebelumnya);
      return sebelumnya.map((item, i) => (i === indeks ? aman : item));
    });
  }

  function reset(): void {
    setTitik(TITIK_AWAL);
  }

  return <div className="explore-layout">
    <section className="canvas-card">
      <div className="canvas-heading"><span className="eyebrow">Kanvas interaktif</span><span className="instruction">Geser A, B, atau C</span></div>
      <Canvas viewBox={`0 0 ${LEBAR_KANVAS} ${TINGGI_KANVAS}`} label="Lingkaran luar segitiga" description={describeLuar({ radius: analisis.valid ? analisis.radiusLuar : 0, valid: analisis.valid, letak: analisis.valid ? analisis.letakPusatLuar : undefined })} grid>
        {analisis.valid && <polygon points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`} fill="var(--warna-tali-busur)" fillOpacity={0.12} stroke="none" />}
        {sumbu.map((garis, indeks) => garis && <Segment key={indeks} awal={garis.awal} akhir={garis.akhir} warna={warnaSumbu} tebal={3} dash="8 6" />)}
        {lingkaranTampil && <>
          <Circle pusat={analisis.pusatLuar} radius={analisis.radiusLuar} warna={warnaLuar} tebal={4} />
          <Segment awal={analisis.pusatLuar} akhir={a} warna={warnaLuar} tebal={3} />
        </>}
        <Segment awal={a} akhir={b} warna="var(--warna-tali-busur)" tebal={5} />
        <Segment awal={b} akhir={c} warna="var(--warna-tali-busur)" tebal={5} />
        <Segment awal={c} akhir={a} warna="var(--warna-tali-busur)" tebal={5} />
        {pusatTerbatas && Math.abs(analisis.pusatLuar.x) < 1000 && Math.abs(analisis.pusatLuar.y) < 1000 && <>
          <Circle pusat={analisis.pusatLuar} radius={6} warna={warnaLuar} isi={warnaLuar} tebal={1} />
          <Label titik={{ x: analisis.pusatLuar.x + 15, y: analisis.pusatLuar.y - 12 }} warna={warnaLuar}>O</Label>
        </>}
        {titik.map((nilai, indeks) => <DraggablePoint key={indeks} titik={nilai} label={String.fromCharCode(65 + indeks)} warna="var(--warna-tali-busur)" onChange={(baru) => geser(indeks, baru)} constrain={(baru) => batasiTitik(indeks, baru, titik)} />)}
      </Canvas>
      <div className="canvas-caption">Garis putus-putus adalah garis sumbu sisi. Ketiganya bertemu di O, lalu O menjadi pusat lingkaran yang melalui A, B, dan C.</div>
    </section>
    <aside className="control-card">
      <div className="control-card-heading"><div><span className="eyebrow">Amati pusat dan jari-jari</span><h2>Lingkaran luar</h2></div><button className="reset-button" onClick={reset}>↻ Reset</button></div>
      {!analisis.valid && <div className="diagram-note warning">Peringatan: titik-titik hampir segaris atau bertumpuk. Geser salah satu titik agar membentuk segitiga yang memiliki luas.</div>}
      {analisis.valid && !lingkaranTampil && <div className="diagram-note warning">Lingkaran luar sangat besar karena segitiga hampir degenerat atau sangat tumpul. Tampilan lingkaran disembunyikan agar kanvas tetap terbaca.</div>}
      <div className="proof-box active"><strong>{analisis.valid ? `Segitiga ${analisis.jenis}` : 'Jenis segitiga belum dapat ditentukan'}</strong><span>{analisis.valid ? `Pusat O berada ${analisis.letakPusatLuar} segitiga.` : 'Bentuk segitiga belum valid.'}</span></div>
      <ValuePanel items={[
        { label: 'Sisi a, b, c', value: analisis.valid ? `${angka(analisis.sisi.a)}; ${angka(analisis.sisi.b)}; ${angka(analisis.sisi.c)}` : '—', warna: 'var(--warna-tali-busur)' },
        { label: 'Luas L', value: angka(analisis.luas, ' satuan²'), warna: warnaLuar },
        { label: 'Pusat O', value: analisis.valid ? `(${angka(analisis.pusatLuar.x)}, ${angka(analisis.pusatLuar.y)})` : '—', warna: warnaSumbu },
        { label: 'Jari-jari luar R', value: analisis.valid ? angka(analisis.radiusLuar) : '—', warna: warnaLuar },
        { label: 'Letak O', value: analisis.valid ? analisis.letakPusatLuar : '—', warna: warnaSumbu }
      ]} />
      <Formula rumus={formulasByTopic['08-luar-segitiga'].eksplorasi[0]} label="Rumus jari-jari lingkaran luar" />
      <p className="tip-text">Untuk segitiga siku-siku, O berada di tengah sisi miring dan R = ½ sisi miring. Toleransi kecil dipakai agar bentuk yang sangat dekat dengan siku-siku tidak berubah-ubah karena pembulatan.</p>
    </aside>
  </div>;
}
