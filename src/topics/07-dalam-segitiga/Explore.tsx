import { useState } from 'react';
import { Canvas, Circle, DraggablePoint, Label, Segment } from '../../components/svg';
import { Formula, ValuePanel } from '../../components';
import { formulasByTopic } from '../../lib/formulas';
import { analisisSegitiga, jarakKeSisi, type Point } from '../../lib/geometry';
import { describeDalam } from '../descriptions';

const warnaBagi = 'var(--warna-garis-bagi)';
const warnaDalam = 'var(--warna-lingkaran-dalam)';

function dalamKanvas(titik: Point): Point {
  return { x: Math.max(28, Math.min(672, titik.x)), y: Math.max(35, Math.min(395, titik.y)) };
}

function angka(nilai: number, satuan = ''): string {
  return Number.isFinite(nilai) ? `${nilai.toFixed(2)}${satuan}` : '—';
}

export function ExploreLingkaranDalam() {
  const [titik, setTitik] = useState<Point[]>([
    { x: 180, y: 335 }, { x: 520, y: 335 }, { x: 270, y: 105 }
  ]);
  const [a, b, c] = titik;
  const analisis = analisisSegitiga(a, b, c);

  function geser(indeks: number, nilai: Point): void {
    setTitik((sebelumnya) => sebelumnya.map((item, i) => i === indeks ? dalamKanvas(nilai) : item));
  }

  function reset(): void {
    setTitik([{ x: 180, y: 335 }, { x: 520, y: 335 }, { x: 270, y: 105 }]);
  }

  const jarakSisi = analisis.valid ? [
    jarakKeSisi(analisis.pusatDalam, b, c),
    jarakKeSisi(analisis.pusatDalam, a, c),
    jarakKeSisi(analisis.pusatDalam, a, b)
  ] : [0, 0, 0];

  return <div className="explore-layout">
    <section className="canvas-card">
      <div className="canvas-heading"><span className="eyebrow">Kanvas interaktif</span><span className="instruction">Geser A, B, atau C</span></div>
      <Canvas label="Lingkaran dalam segitiga" description={describeDalam({ radius: analisis.valid ? analisis.radiusDalam : 0, valid: analisis.valid })} grid>
        <Segment awal={a} akhir={b} warna="var(--warna-tali-busur)" tebal={5} />
        <Segment awal={b} akhir={c} warna="var(--warna-tali-busur)" tebal={5} />
        <Segment awal={c} akhir={a} warna="var(--warna-tali-busur)" tebal={5} />
        {analisis.valid && <>
          <Segment awal={a} akhir={analisis.pusatDalam} warna={warnaBagi} tebal={3} dash="8 6" />
          <Segment awal={b} akhir={analisis.pusatDalam} warna={warnaBagi} tebal={3} dash="8 6" />
          <Segment awal={c} akhir={analisis.pusatDalam} warna={warnaBagi} tebal={3} dash="8 6" />
          <Circle pusat={analisis.pusatDalam} radius={analisis.radiusDalam} warna={warnaDalam} isi={warnaDalam} tebal={4} />
          {analisis.titikSinggung.map((nilai, indeks) => <Circle key={indeks} pusat={nilai} radius={5} warna={warnaDalam} isi="#ffffff" tebal={3} />)}
          <Circle pusat={analisis.pusatDalam} radius={6} warna={warnaDalam} isi={warnaDalam} tebal={1} />
          <Label titik={{ x: analisis.pusatDalam.x + 15, y: analisis.pusatDalam.y - 12 }} warna={warnaDalam}>I</Label>
        </>}
        {titik.map((nilai, indeks) => <DraggablePoint key={indeks} titik={nilai} label={String.fromCharCode(65 + indeks)} warna="var(--warna-tali-busur)" onChange={(baru) => geser(indeks, baru)} constrain={dalamKanvas} />)}
      </Canvas>
      <div className="canvas-caption">Garis putus-putus adalah garis bagi sudut. Titik I berjarak sama dari ketiga sisi, sehingga lingkaran berpusat di I menyinggung semuanya.</div>
    </section>
    <aside className="control-card">
      <div className="control-card-heading"><div><span className="eyebrow">Amati pusat dan jari-jari</span><h2>Lingkaran dalam</h2></div><button className="reset-button" onClick={reset}>↻ Reset</button></div>
      {!analisis.valid && <div className="diagram-note warning">Peringatan: titik-titik hampir segaris atau bertumpuk. Geser salah satu titik agar membentuk segitiga yang memiliki luas.</div>}
      <ValuePanel items={[
        { label: 'Sisi a, b, c', value: analisis.valid ? `${angka(analisis.sisi.a)}; ${angka(analisis.sisi.b)}; ${angka(analisis.sisi.c)}` : '—', warna: 'var(--warna-tali-busur)' },
        { label: 'Luas L', value: angka(analisis.luas, ' satuan²'), warna: 'var(--warna-lingkaran-dalam)' },
        { label: 'Setengah keliling s', value: angka(analisis.setengahKeliling), warna: warnaBagi },
        { label: 'Jari-jari dalam r', value: analisis.valid ? angka(analisis.radiusDalam) : '—', warna: warnaDalam },
        { label: 'Jarak I ke sisi a', value: analisis.valid ? angka(jarakSisi[0]) : '—', warna: warnaDalam },
        { label: 'Jarak I ke sisi b', value: analisis.valid ? angka(jarakSisi[1]) : '—', warna: warnaDalam },
        { label: 'Jarak I ke sisi c', value: analisis.valid ? angka(jarakSisi[2]) : '—', warna: warnaDalam }
      ]} />
      <Formula rumus={formulasByTopic['07-dalam-segitiga'].eksplorasi[0]} label="Rumus jari-jari lingkaran dalam" />
      <p className="tip-text">Ketiga jarak dari I ke sisi selalu sama dengan r. Saat segitiga hampir degenerat, perhitungan dihentikan agar luas dan jari-jari tidak menyesatkan.</p>
    </aside>
  </div>;
}
