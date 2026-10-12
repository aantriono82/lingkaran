import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Circle, Canvas, Label } from '../../../components/svg';
import { Pi, SliderControl, ValuePanel } from '../../../components';
import { bendaLingkaran, rataRata, ukurKeliling, type ModePengukuran } from './data';
import { describeKeliling } from '../../descriptions';

interface CatatanPengukuran {
  id: number;
  nama: string;
  diameter: number;
  keliling: number;
  rasio: number;
}

const START_X = 70;
const BASELINE_Y = 292;
const RULER_Y = 350;

function formatAngka(nilai: number, desimal = 2): string {
  return nilai.toFixed(desimal).replace('.', ',');
}

function formatDiameter(nilai: number): string {
  return Number.isInteger(nilai) ? String(nilai) : formatAngka(nilai, 1);
}

function batasi(nilai: number, minimum: number, maksimum: number): number {
  return Math.min(maksimum, Math.max(minimum, nilai));
}

function ScatterPlot({ catatan }: { catatan: CatatanPengukuran[] }) {
  const width = 360;
  const height = 190;
  const left = 42;
  const right = 18;
  const top = 14;
  const bottom = 35;
  const maxD = 100;
  const maxK = Math.PI * maxD;
  const x = (diameter: number) => left + (diameter / maxD) * (width - left - right);
  const y = (keliling: number) => height - bottom - (keliling / maxK) * (height - top - bottom);
  return (
    <div className="scatter-wrap">
      <div className="subheading"><h3>Grafik sebar</h3><span>datar: d, tegak: K</span></div>
      <svg className="scatter-plot" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Grafik sebar diameter dan keliling">
        <line x1={left} y1={height - bottom} x2={width - right} y2={height - bottom} className="plot-axis" />
        <line x1={left} y1={height - bottom} x2={left} y2={top} className="plot-axis" />
        <line x1={left} y1={height - bottom} x2={width - right} y2={top} className="plot-reference" />
        <text x={width - right} y={height - 8} textAnchor="end">d (cm)</text>
        <text x={10} y={top + 4}>K</text>
        <text x={left} y={height - bottom + 18}>0</text>
        <text x={width - right} y={height - bottom + 18} textAnchor="end">100</text>
        <text x={width - right - 2} y={top + 14} textAnchor="end" className="plot-note">kemiringan <Pi svg /></text>
        {catatan.map((item) => <circle key={item.id} cx={x(item.diameter)} cy={y(item.keliling)} r="5" className="plot-point" />)}
      </svg>
    </div>
  );
}

export function MeasureMode() {
  const [bendaId, setBendaId] = useState(bendaLingkaran[0].id);
  const [diameterSendiri, setDiameterSendiri] = useState(40);
  const [mode, setMode] = useState<ModePengukuran>('manual');
  const [kemajuan, setKemajuan] = useState(0);
  const [sedangMenggulir, setSedangMenggulir] = useState(false);
  const [catatan, setCatatan] = useState<CatatanPengukuran[]>([]);

  const bendaTerpilih = bendaLingkaran.find((benda) => benda.id === bendaId);
  const adalahAturSendiri = bendaId === 'sendiri';
  const diameter = adalahAturSendiri ? diameterSendiri : bendaTerpilih?.diameter ?? bendaLingkaran[0].diameter;
  const indeksBenda = bendaLingkaran.findIndex((benda) => benda.id === bendaId);
  const seedPengukuran = 2026 + Math.max(0, indeksBenda) * 97 + catatan.length * 31 + Math.round(diameter * 10);
  const kelilingTerukur = ukurKeliling(diameter, mode, seedPengukuran);
  const rasioSaatIni = kelilingTerukur / diameter;
  const kelilingIdeal = Math.PI * diameter;
  const skala = Math.min(6, 600 / Math.max(1, kelilingIdeal));
  const panjangLintasan = kelilingIdeal * skala;
  const lingkaranRadius = batasi(38 + (66 - Math.min(diameter, 66)) * 0.16, 34, 48);
  const posisiX = START_X + panjangLintasan * kemajuan;
  const penandaSudut = Math.PI / 2 + Math.PI * 2 * kemajuan;
  const penanda = { x: posisiX + lingkaranRadius * Math.cos(penandaSudut), y: BASELINE_Y - lingkaranRadius + lingkaranRadius * Math.sin(penandaSudut) };
  const jumlahTanda = Math.min(12, Math.max(4, Math.ceil(kelilingIdeal / 10)));
  const catatanBerbeda = new Set(catatan.map((item) => item.diameter)).size;
  const rataRasio = useMemo(() => rataRata(catatan.map((item) => item.rasio)), [catatan]);

  useEffect(() => {
    if (!sedangMenggulir) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setKemajuan(1);
      setSedangMenggulir(false);
      return undefined;
    }
    const mulai = performance.now();
    const durasi = 1400;
    let frame = 0;
    const gerak = (sekarang: number) => {
      const nilai = batasi((sekarang - mulai) / durasi, 0, 1);
      setKemajuan(nilai);
      if (nilai < 1) frame = requestAnimationFrame(gerak);
      else setSedangMenggulir(false);
    };
    frame = requestAnimationFrame(gerak);
    return () => cancelAnimationFrame(frame);
  }, [sedangMenggulir]);

  function pilihBenda(id: string): void {
    setBendaId(id);
    setKemajuan(0);
  }

  function gulirkan(): void {
    if (sedangMenggulir) return;
    setKemajuan(0);
    setSedangMenggulir(true);
  }

  function catatHasil(): void {
    if (catatan.length >= 12) return;
    setCatatan((lama) => [...lama, {
      id: Date.now() + lama.length,
      nama: adalahAturSendiri ? 'Atur sendiri' : bendaTerpilih?.nama ?? 'Benda',
      diameter,
      keliling: kelilingTerukur,
      rasio: rasioSaatIni
    }]);
  }

  return (
    <div className="explore-layout measure-layout">
      <section className="canvas-card">
        <div className="canvas-heading"><span className="eyebrow">Kanvas interaktif</span><span className="instruction">Satu putaran mengukur K</span></div>
        <Canvas label="Lingkaran digulirkan pada penggaris" description={describeKeliling({ radius: diameter / 2, keliling: kelilingIdeal, kemajuan: Math.round(kemajuan * 100), mode: 'pengukuran' })} viewBox="0 0 760 430">
          <line x1={START_X} y1={BASELINE_Y} x2={START_X + panjangLintasan} y2={BASELINE_Y} className="measure-track" />
          <line x1={START_X} y1={BASELINE_Y} x2={posisiX} y2={BASELINE_Y} className="measure-progress" />
          <Circle pusat={{ x: posisiX, y: BASELINE_Y - lingkaranRadius }} radius={lingkaranRadius} warna="var(--warna-utama)" isi="var(--warna-utama-muda)" tebal={4} />
          <circle cx={penanda.x} cy={penanda.y} r="7" fill="var(--warna-garis-ukur)" stroke="#fff" strokeWidth="3" />
          <line x1={START_X} y1={RULER_Y} x2={START_X + panjangLintasan} y2={RULER_Y} className="ruler-line" />
          {Array.from({ length: jumlahTanda + 1 }, (_, indeks) => {
            const x = START_X + panjangLintasan * indeks / jumlahTanda;
            const nilai = kelilingIdeal * indeks / jumlahTanda;
            return <g key={indeks}><line x1={x} y1={RULER_Y - 9} x2={x} y2={RULER_Y + 9} className="ruler-tick" /><Label titik={{ x, y: RULER_Y + 29 }} warna="var(--warna-teks-lembut)">{formatAngka(nilai, 1)}</Label></g>;
          })}
          <Label titik={{ x: START_X, y: RULER_Y - 19 }} warna="var(--warna-garis-ukur)">0 cm</Label>
          <Label titik={{ x: START_X + panjangLintasan, y: RULER_Y - 19 }} warna="var(--warna-garis-ukur)">K = {formatAngka(kelilingIdeal)} cm</Label>
          <Label titik={{ x: posisiX, y: 86 }} warna="var(--warna-utama)">{formatAngka(diameter, 1)} cm</Label>
          <Label titik={{ x: 380, y: 408 }} warna="var(--warna-teks-lembut)">{Math.round(kemajuan * 100)}% satu putaran</Label>
        </Canvas>
        <div className="canvas-caption">Titik penanda bergerak bersama lingkaran. Setelah satu putaran, jarak lintasan sama dengan keliling.</div>
      </section>
      <aside className="control-card">
        <div className="control-card-heading"><div><span className="eyebrow">Asal usul <Pi />: mengukur</span><h2>Gulir dan bandingkan</h2></div><button className="reset-button" onClick={() => { setKemajuan(0); setCatatan([]); }}>↻ Reset</button></div>
        <div className="object-picker"><span className="control-label"><span>Pilih benda</span><strong>{formatDiameter(diameter)} cm</strong></span><div className="chip-grid">{bendaLingkaran.map((benda) => <button key={benda.id} className={bendaId === benda.id ? 'chip aktif' : 'chip'} style={{ '--chip-color': 'var(--warna-garis-ukur)' } as CSSProperties} onClick={() => pilihBenda(benda.id)}><svg className="object-icon" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="10" /><circle cx="11" cy="11" r="2" fill="#fff" stroke="none" /></svg><span>{benda.nama}</span><small>d = {formatDiameter(benda.diameter)} cm</small></button>)}<button className={adalahAturSendiri ? 'chip aktif' : 'chip'} style={{ '--chip-color': 'var(--warna-garis-ukur)' } as CSSProperties} onClick={() => pilihBenda('sendiri')}><svg className="object-icon" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="10" /><path d="M 14 8 V 20 M 8 14 H 20" fill="none" /></svg><span>Atur sendiri</span><small>d = {formatDiameter(diameterSendiri)} cm</small></button></div></div>
        {adalahAturSendiri && <SliderControl label="Diameter sendiri" value={diameterSendiri} minimum={1} maksimum={100} satuan=" cm" onChange={(nilai) => { setDiameterSendiri(nilai); setKemajuan(0); }} />}
        <label className="toggle-field"><input type="checkbox" checked={mode === 'ideal'} onChange={(event) => setMode(event.target.checked ? 'ideal' : 'manual')} /><span>{mode === 'ideal' ? 'Ukur ideal' : 'Ukur manual (ada galat)'}</span></label>
        <div className="measure-actions"><button className="button primary" onClick={gulirkan}>{sedangMenggulir ? 'Menggulir…' : 'Gulirkan 1 putaran'}</button><button className="button secondary" onClick={catatHasil} disabled={catatan.length >= 12}>Catat hasil</button></div>
        <ValuePanel items={[{ label: 'Diameter d', value: `${formatDiameter(diameter)} cm`, warna: 'var(--warna-diameter)' }, { label: 'Keliling terukur K', value: `${formatAngka(kelilingTerukur)} cm`, warna: 'var(--warna-garis-ukur)' }, { label: <>K ÷ d</>, value: formatAngka(rasioSaatIni, 3), warna: 'var(--warna-susun)' }]} />
        <section className="measurement-data"><div className="subheading"><h3>Catatan pengukuran</h3><button className="text-button" onClick={() => setCatatan([])} disabled={catatan.length === 0}>Hapus semua</button></div>{catatan.length === 0 ? <p className="empty-note">Belum ada catatan. Tekan “Catat hasil” setelah mengamati satu putaran.</p> : <div className="data-table-wrap"><table className="data-table"><thead><tr><th>No.</th><th>Benda</th><th>d (cm)</th><th>K (cm)</th><th>K ÷ d</th></tr></thead><tbody>{catatan.map((item, indeks) => <tr key={item.id} className={indeks === catatan.length - 1 ? 'latest-row' : ''}><td>{indeks + 1}</td><th scope="row">{item.nama}</th><td>{formatAngka(item.diameter, 1)}</td><td>{formatAngka(item.keliling)}</td><td>{formatAngka(item.rasio, 3)}</td></tr>)}</tbody></table></div>}{catatan.length > 0 && <p className="average-note">Rata-rata K ÷ d = <strong>{formatAngka(rataRasio, 3)}</strong></p>}</section>
        {catatan.length > 0 && <ScatterPlot catatan={catatan} />}
        <p className="diagram-note">{catatanBerbeda >= 3 ? <>Apa pun ukuran lingkarannya, K ÷ d selalu ≈ 3,14. Nilai inilah yang disebut <Pi />.</> : 'Bagaimana K ÷ d untuk lingkaran besar dan kecil? Catat beberapa benda dan amati.'}</p>
      </aside>
    </div>
  );
}
