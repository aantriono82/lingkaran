import { useState } from 'react';
import { AngleMarker, Canvas, Circle, DraggablePoint, Label, Segment } from '../../components/svg';
import { ValuePanel } from '../../components';
import { analisisSegiEmpatTaliBusur, derajat, titikDariSudut, urutkanTitikLingkaran, type Point } from '../../lib/geometry';
import { describeSegiEmpat } from '../descriptions';

type Mode = 'lingkaran' | 'bandingkan';

const pusat: Point = { x: 350, y: 215 };
const radius = 145;
const warnaPasangan = ['var(--warna-segi-empat-a)', 'var(--warna-segi-empat-b)'] as const;

function keSudut(titik: Point): number {
  return Math.atan2(titik.y - pusat.y, titik.x - pusat.x);
}

function diLingkaran(titik: Point): Point {
  const dx = titik.x - pusat.x;
  const dy = titik.y - pusat.y;
  const panjang = Math.max(1, Math.hypot(dx, dy));
  return { x: pusat.x + dx / panjang * radius, y: pusat.y + dy / panjang * radius };
}

function dalamKanvas(titik: Point): Point {
  return { x: Math.max(28, Math.min(672, titik.x)), y: Math.max(35, Math.min(395, titik.y)) };
}

function formatSudut(nilai: number): string {
  return `${derajat(nilai).toFixed(1)}°`;
}

export function ExploreSegiEmpat() {
  const [mode, setMode] = useState<Mode>('lingkaran');
  const [sudut, setSudut] = useState([0.15, 1.65, 3.25, 5.15]);
  const [titikBebas, setTitikBebas] = useState<Point[]>([
    { x: 190, y: 125 }, { x: 510, y: 125 }, { x: 510, y: 310 }, { x: 190, y: 310 }
  ]);
  const titikLingkaran = sudut.map((nilai) => titikDariSudut(pusat, radius, nilai));
  const terurut = urutkanTitikLingkaran(titikLingkaran, pusat);
  const titik = mode === 'lingkaran' ? terurut.map((item) => item.titik) : titikBebas;
  const analisis = analisisSegiEmpatTaliBusur(titik);
  const busurWarna = (indeks: number) => warnaPasangan[indeks % 2];

  function geserLingkaran(indeks: number, nilai: Point): void {
    setSudut((sebelumnya) => sebelumnya.map((item, i) => i === indeks ? keSudut(nilai) : item));
  }

  function geserBebas(indeks: number, nilai: Point): void {
    setTitikBebas((sebelumnya) => sebelumnya.map((item, i) => i === indeks ? dalamKanvas(nilai) : item));
  }

  function reset(): void {
    setMode('lingkaran');
    setSudut([0.15, 1.65, 3.25, 5.15]);
    setTitikBebas([{ x: 190, y: 125 }, { x: 510, y: 125 }, { x: 510, y: 310 }, { x: 190, y: 310 }]);
  }

  return <div className="explore-layout">
    <section className="canvas-card">
      <div className="canvas-heading"><span className="eyebrow">Kanvas interaktif</span><span className="instruction">Geser A, B, C, atau D</span></div>
      <Canvas label={mode === 'lingkaran' ? 'Segi empat tali busur pada lingkaran' : 'Pemeriksaan empat titik bebas'} description={describeSegiEmpat({ jumlahSudut: analisis.sederhana ? analisis.jumlahBerhadapan[0] : 0, mode })} grid>
        {mode === 'lingkaran' && <Circle pusat={pusat} radius={radius} warna="var(--warna-utama)" tebal={4} />}
        {titik.map((nilai, indeks) => <Segment key={`sisi-${indeks}`} awal={nilai} akhir={titik[(indeks + 1) % 4]} warna={busurWarna(indeks)} tebal={5} />)}
        {analisis.sederhana && analisis.sudut.map((nilai, indeks) => {
          const puncak = titik[indeks];
          const sebelum = titik[(indeks + 3) % 4];
          const sesudah = titik[(indeks + 1) % 4];
          return <AngleMarker key={`sudut-${indeks}`} pusat={puncak} radius={28} sudutAwal={Math.atan2(sebelum.y - puncak.y, sebelum.x - puncak.x)} sudutAkhir={Math.atan2(sesudah.y - puncak.y, sesudah.x - puncak.x)} label={formatSudut(nilai)} warna={busurWarna(indeks)} />;
        })}
        {mode === 'lingkaran' && <Circle pusat={pusat} radius={5} warna="var(--warna-utama)" isi="var(--warna-utama)" tebal={1} />}
        {titik.map((nilai, indeks) => <DraggablePoint key={`titik-${indeks}`} titik={nilai} label={String.fromCharCode(65 + indeks)} warna={busurWarna(indeks)} onChange={(baru) => mode === 'lingkaran' ? geserLingkaran(terurut[indeks]?.indeks ?? indeks, baru) : geserBebas(indeks, baru)} constrain={mode === 'lingkaran' ? diLingkaran : dalamKanvas} />)}
        {mode === 'lingkaran' && <Label titik={{ x: pusat.x, y: 32 }} warna="var(--warna-segi-empat-a)">A + C = 180° · B + D = 180°</Label>}
      </Canvas>
      <div className="canvas-caption">Pada mode lingkaran, titik diurutkan lagi berdasarkan sudut terhadap pusat setiap kali digeser. Gunakan mode Bandingkan untuk menguji empat titik bebas.</div>
    </section>
    <aside className="control-card">
      <div className="control-card-heading"><div><span className="eyebrow">Amati sifat segi empat</span><h2>{mode === 'lingkaran' ? 'Sudut berhadapan' : 'Bandingkan'}</h2></div><button className="reset-button" onClick={reset}>↻ Reset</button></div>
      <div className="mode-toggle" aria-label="Mode segi empat"><button className={mode === 'lingkaran' ? 'chip aktif' : 'chip'} aria-pressed={mode === 'lingkaran'} onClick={() => setMode('lingkaran')}>Pada lingkaran</button><button className={mode === 'bandingkan' ? 'chip aktif' : 'chip'} aria-pressed={mode === 'bandingkan'} onClick={() => setMode('bandingkan')}>Bandingkan</button></div>
      {mode === 'bandingkan' && <div className={analisis.siklik ? 'diagram-note success' : analisis.sederhana ? 'diagram-note' : 'diagram-note warning'}>{!analisis.sederhana ? 'Peringatan: sisi saling memotong atau ada titik yang bertumpuk. Susun menjadi segi empat sederhana terlebih dahulu.' : analisis.siklik ? 'Ya, ada lingkaran yang melalui keempat titik' : 'Bukan segi empat tali busur'}</div>}
      {mode === 'lingkaran' && <div className="proof-box active"><strong>✓ Syarat segi empat tali busur terpenuhi</strong><span>Setiap pasangan sudut yang berhadapan berjumlah 180°.</span></div>}
      {analisis.sederhana ? <ValuePanel items={analisis.sudut.map((nilai, indeks) => ({ label: `Sudut ${String.fromCharCode(65 + indeks)}`, value: formatSudut(nilai), warna: busurWarna(indeks) })).concat([
        { label: 'Jumlah A + C', value: formatSudut(analisis.jumlahBerhadapan[0]), warna: warnaPasangan[0] },
        { label: 'Jumlah B + D', value: formatSudut(analisis.jumlahBerhadapan[1]), warna: warnaPasangan[1] }
      ])} /> : <div className="diagram-note warning">Nilai sudut disembunyikan sampai keempat titik membentuk segi empat sederhana.</div>}
      <p className="tip-text">Pasangan sudut yang berhadapan diberi warna sama. Sudut luar pada segi empat tali busur sama dengan sudut dalam yang berhadapan.</p>
    </aside>
  </div>;
}
