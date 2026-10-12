import { useState, type ReactNode } from 'react';
import { Arc, Canvas, Circle, Label, Segment } from '../../components/svg';
import { Formula, Pi, PiText, SliderControl, ValuePanel } from '../../components';
import { formulasByTopic } from '../../lib/formulas';
import { MeasureMode } from './pi/MeasureMode';
import { ArchimedesMode } from './pi/ArchimedesMode';
import { describeKeliling } from '../descriptions';

const pusat = { x: 205, y: 205 };
const PI_STANDAR = 3.14;

function nilaiPi(radius: number): number {
  return radius % 7 === 0 ? 22 / 7 : PI_STANDAR;
}

function ExploreKelilingDasar() {
  const [radius, setRadius] = useState(7);
  const [kemajuan, setKemajuan] = useState(0);
  const pi = nilaiPi(radius);
  const keliling = 2 * pi * radius;
  const radiusVisual = 70 + (radius - 4) * 7;
  const panjangGarisVisual = 230;
  const ujungGaris = 405 + panjangGarisVisual * kemajuan / 100;

  function reset(): void {
    setRadius(7);
    setKemajuan(0);
  }

  return <div className="explore-layout">
    <section className="canvas-card">
      <div className="canvas-heading"><span className="eyebrow">Kanvas interaktif</span><span className="instruction">Geser slider pembukaan</span></div>
      <Canvas label="Lingkaran yang dibuka menjadi garis keliling" description={describeKeliling({ radius, keliling, kemajuan, mode: 'dasar' })} grid>
        <Circle pusat={pusat} radius={radiusVisual} warna="var(--warna-utama)" tebal={4} />
        <Arc pusat={pusat} radius={radiusVisual} sudutAwal={-Math.PI / 2} sudutAkhir={-Math.PI / 2 + Math.PI * 2 * kemajuan / 100} warna="var(--warna-busur)" tebal={9} />
        <Circle pusat={{ x: pusat.x + radiusVisual, y: pusat.y }} radius={7} warna="var(--warna-busur)" isi="var(--warna-busur)" tebal={1} />
        <Label titik={{ x: pusat.x, y: pusat.y + 7 }}>O</Label>
        <Label titik={{ x: 205, y: 385 }} warna="var(--warna-busur)">K = {keliling.toFixed(2)} cm</Label>
        <line x1="405" y1="205" x2="635" y2="205" className="unwrapped-track" />
        <line x1="405" y1="205" x2={ujungGaris} y2="205" className="unwrapped-line" />
        <circle cx={ujungGaris} cy="205" r="10" fill="var(--warna-busur)" />
        <Label titik={{ x: 520, y: 180 }} warna="var(--warna-susun)">garis lurus = keliling</Label>
        <Label titik={{ x: 520, y: 242 }} warna="var(--warna-teks-lembut)">{kemajuan}% terbuka</Label>
        <Segment awal={pusat} akhir={{ x: pusat.x + radiusVisual, y: pusat.y }} warna="var(--warna-radius)" tebal={4} />
      </Canvas>
      <div className="canvas-caption">Saat busur dibuka penuh, panjang garis lurusnya sama dengan keliling lingkaran.</div>
    </section>
    <aside className="control-card">
      <div className="control-card-heading"><div><span className="eyebrow">Amati keliling</span><h2>Lingkaran menjadi garis</h2></div><button className="reset-button" onClick={reset}>↻ Reset</button></div>
      <SliderControl label="Jari-jari" value={radius} minimum={4} maksimum={14} satuan=" cm" onChange={setRadius} />
      <SliderControl label="Pembukaan busur" value={kemajuan} minimum={0} maksimum={100} satuan="%" onChange={setKemajuan} />
      <ValuePanel items={[{ label: 'Jari-jari r', value: `${radius} cm`, warna: 'var(--warna-radius)' }, { label: 'Diameter d', value: `${2 * radius} cm`, warna: 'var(--warna-diameter)' }, { label: 'Keliling K', value: `${keliling.toFixed(2)} cm`, warna: 'var(--warna-busur)' }, { label: 'Rasio K ÷ d', value: (keliling / (2 * radius)).toFixed(3), warna: 'var(--warna-susun)' }]} />
      <Formula rumus={formulasByTopic['02-keliling'].eksplorasi[0]} label="Rumus keliling lingkaran" />
      <p className="tip-text"><PiText text="Rasio K/d mendekati π. Pada soal, gunakan π = 22/7 jika jari-jari kelipatan 7; gunakan 3,14 selain itu." /></p>
    </aside>
  </div>;
}

type ModeKeliling = 'dasar' | 'ukur' | 'apit';

export function ExploreKeliling() {
  const [mode, setMode] = useState<ModeKeliling>('dasar');
  const pilihan: Array<{ id: ModeKeliling; label: ReactNode }> = [
    { id: 'dasar', label: 'Keliling dan jari-jari' },
    { id: 'ukur', label: <>Asal usul <Pi />: mengukur</> },
    { id: 'apit', label: <>Asal usul <Pi />: mengapit (Archimedes)</> }
  ];
  return <div className="topic-explore"><nav className="mode-selector" aria-label="Mode eksplorasi keliling">{pilihan.map((item) => <button key={item.id} className={mode === item.id ? 'mode-option aktif' : 'mode-option'} onClick={() => setMode(item.id)}>{item.label}</button>)}</nav>{mode === 'dasar' ? <ExploreKelilingDasar /> : mode === 'ukur' ? <MeasureMode /> : <ArchimedesMode />}</div>;
}
