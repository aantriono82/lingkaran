import { useMemo, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { Arc, Canvas, Circle, DraggablePoint, Label, RightAngleMarker, Segment } from '../../components/svg';
import { Formula, SliderControl, ValuePanel } from '../../components';
import { formulasByTopic } from '../../lib/formulas';
import { type Point } from '../../lib/geometry';
import { buatPathTembereng, hitungGeometriUnsur } from './geometry';
import { hitungLayoutLabel, type PenempatanLabel } from './labelLayout';
import { describeUnsur } from '../descriptions';
import {
  adalahSemuaUnsur,
  buatSemuaUnsur,
  buatUnsurAwal,
  kosongkanUnsur,
  SEMUA_UNSUR,
  toggleUnsur,
  UNSUR_INFO,
  type Unsur
} from './unsur';

const pusat: Point = { x: 350, y: 215 };
type ModeTampilan = 'satu' | 'bebas';

function batasiKeLingkaran(titik: Point, radius: number): Point {
  const dx = titik.x - pusat.x;
  const dy = titik.y - pusat.y;
  const panjang = Math.max(1, Math.hypot(dx, dy));
  return { x: pusat.x + (dx / panjang) * radius, y: pusat.y + (dy / panjang) * radius };
}

function SelectableUnsur({ id, redup, onFocus, children }: { id: Unsur; redup: boolean; onFocus: (id: Unsur) => void; children: ReactNode }) {
  const info = UNSUR_INFO[id];
  function pilih(): void {
    onFocus(id);
  }

  function tekan(event: KeyboardEvent<SVGGElement>): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    pilih();
  }

  return (
    <g
      className="unsur-layer"
      role="button"
      tabIndex={0}
      aria-label={`${info.nama}, ditampilkan`}
      opacity={redup ? 0.4 : 1}
      onClick={(event) => {
        event.stopPropagation();
        pilih();
      }}
      onKeyDown={tekan}
    >
      {children}
    </g>
  );
}

function VisualLabel({ penempatan, onFocus, redup }: { penempatan: PenempatanLabel; onFocus: (id: Unsur) => void; redup: boolean }) {
  const info = UNSUR_INFO[penempatan.id];
  return (
    <SelectableUnsur id={penempatan.id} redup={redup} onFocus={onFocus}>
      {penempatan.badge ? (
        <g>
          <line className="label-leader" x1={penempatan.titik.x} y1={penempatan.titik.y} x2={penempatan.target.x} y2={penempatan.target.y} stroke={info.warna} strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" pointerEvents="none" />
          <circle cx={penempatan.titik.x} cy={penempatan.titik.y} r="12" fill="#ffffff" stroke={info.warna} strokeWidth="2.5" />
          <text className="svg-badge" x={penempatan.titik.x} y={penempatan.titik.y + 4} fill={info.warna} textAnchor="middle">{info.nomor}</text>
        </g>
      ) : (
        <Label titik={penempatan.titik} warna={info.warna}>{info.label}</Label>
      )}
    </SelectableUnsur>
  );
}

function DefinisiUnsur({ id }: { id: Unsur }) {
  const info = UNSUR_INFO[id];
  return (
    <div>
      <div className="definition-name"><span className={`legend-swatch ${info.gaya}`} style={{ '--legend-color': info.warna } as CSSProperties} aria-hidden="true" /><strong>{info.nama}</strong></div>
      <p className="definition-text">{info.definisi}</p>
    </div>
  );
}

export function ExploreUnsur() {
  const [radius, setRadius] = useState(145);
  const [sudutA, setSudutA] = useState(-0.45);
  const [sudutB, setSudutB] = useState(2.25);
  const [tampil, setTampil] = useState<Set<Unsur>>(() => buatUnsurAwal());
  const [fokus, setFokus] = useState<Unsur | null>('jariJari');
  const [modeTampilan, setModeTampilan] = useState<ModeTampilan>('satu');

  const geometri = useMemo(() => hitungGeometriUnsur(pusat, radius, sudutA, sudutB), [radius, sudutA, sudutB]);
  const tampilYangBisaDigambar = useMemo(() => {
    const hasil = new Set(tampil);
    if (!geometri.adaTaliBusur) {
      hasil.delete('taliBusur');
      hasil.delete('busur');
      hasil.delete('juring');
      hasil.delete('tembereng');
    }
    if (!geometri.adaTaliBusur || geometri.apotemaNol) hasil.delete('apotema');
    return hasil;
  }, [geometri, tampil]);
  const fokusAktif = fokus && tampil.has(fokus) ? fokus : null;
  const semuaAktif = adalahSemuaUnsur(tampil);
  const satuPerSatuAktif = modeTampilan === 'satu';
  const penempatanLabel = useMemo(() => hitungLayoutLabel({
    pusat,
    radius,
    titikA: geometri.titikA,
    titikB: geometri.titikB,
    awalBusur: geometri.rentangBusur.awal,
    akhirBusur: geometri.rentangBusur.akhir,
    tampil: SEMUA_UNSUR.filter((id) => {
      if (!tampilYangBisaDigambar.has(id)) return false;
      const labelRingkas = modeTampilan !== 'satu' && tampilYangBisaDigambar.size >= 4;
      const bergantungPadaTaliPendek = id === 'taliBusur' || id === 'busur' || id === 'juring' || id === 'tembereng' || id === 'apotema';
      return labelRingkas || geometri.labelTaliMuatan || !bergantungPadaTaliPendek;
    }),
    ringkas: modeTampilan !== 'satu' && (semuaAktif || tampilYangBisaDigambar.size >= 4)
  }), [geometri, modeTampilan, radius, semuaAktif, tampilYangBisaDigambar]);
  const pathTembereng = buatPathTembereng(geometri, pusat, radius);
  const namaJudul = fokusAktif
    ? UNSUR_INFO[fokusAktif].nama
    : tampilYangBisaDigambar.size > 1
      ? (semuaAktif ? 'Semua unsur' : 'Unsur pilihan')
      : tampilYangBisaDigambar.size === 1
        ? UNSUR_INFO[Array.from(tampilYangBisaDigambar)[0]].nama
        : 'Belum ada unsur';

  function redupkan(id: Unsur): boolean {
    return fokusAktif !== null && fokusAktif !== id;
  }

  function fokuskan(id: Unsur): void {
    if (!tampil.has(id)) {
      setTampil((sebelumnya) => new Set(sebelumnya).add(id));
      setModeTampilan('satu');
    }
    setFokus((sebelumnya) => (sebelumnya === id ? null : id));
  }

  function ubahTampilan(id: Unsur): void {
    const sedangTampil = tampil.has(id);
    const berikutnya = toggleUnsur(tampil, id);
    setTampil(berikutnya);
    setFokus((sebelumnya) => sedangTampil && sebelumnya === id ? null : sedangTampil ? sebelumnya : id);
    if (modeTampilan === 'bebas' && !adalahSemuaUnsur(berikutnya)) {
      setModeTampilan('satu');
    }
  }

  function tampilkanSemua(): void {
    setModeTampilan('bebas');
    setTampil(buatSemuaUnsur());
    setFokus(null);
  }

  function kosongkan(): void {
    setModeTampilan('bebas');
    setTampil(kosongkanUnsur());
    setFokus(null);
  }

  function tampilkanSatu(): void {
    const pilihan: Unsur = fokus && tampil.has(fokus) ? fokus : 'jariJari';
    setModeTampilan('satu');
    setTampil(new Set([pilihan]));
    setFokus(pilihan);
  }

  function reset(): void {
    setRadius(145);
    setSudutA(-0.45);
    setSudutB(2.25);
    setModeTampilan('satu');
    setTampil(buatUnsurAwal());
    setFokus('jariJari');
  }

  function ubahSudutA(titik: Point): void {
    setSudutA(Math.atan2(titik.y - pusat.y, titik.x - pusat.x));
  }

  function ubahSudutB(titik: Point): void {
    setSudutB(Math.atan2(titik.y - pusat.y, titik.x - pusat.x));
  }

  const rumus = fokusAktif === 'diameter'
    ? formulasByTopic['01-unsur'].eksplorasi[0]
    : fokusAktif === 'jariJari'
      ? formulasByTopic['01-unsur'].eksplorasi[1]
      : fokusAktif === 'taliBusur'
        ? formulasByTopic['01-unsur'].eksplorasi[2]
        : formulasByTopic['01-unsur'].eksplorasi[0];

  return (
    <div className="explore-layout">
      <section className="canvas-card">
        <div className="canvas-heading"><span className="eyebrow">Kanvas interaktif</span><span className="instruction">Geser titik A atau B</span></div>
        <Canvas label="Diagram unsur-unsur lingkaran" description={describeUnsur({ radius, sudutA, sudutB })} grid onClick={() => setFokus(null)}>
          {tampilYangBisaDigambar.has('juring') && (
            <SelectableUnsur id="juring" redup={redupkan('juring')} onFocus={fokuskan}>
              <Arc pusat={pusat} radius={radius} sudutAwal={geometri.rentangBusur.awal} sudutAkhir={geometri.rentangBusur.akhir} warna={UNSUR_INFO.juring.warna} isi={UNSUR_INFO.juring.warna} isiOpasitas={0.12} tebal={2} />
            </SelectableUnsur>
          )}
          {tampilYangBisaDigambar.has('tembereng') && pathTembereng && (
            <SelectableUnsur id="tembereng" redup={redupkan('tembereng')} onFocus={fokuskan}>
              <path d={pathTembereng} fill={UNSUR_INFO.tembereng.warna} fillOpacity="0.46" stroke={UNSUR_INFO.tembereng.warna} strokeWidth="2.5" />
            </SelectableUnsur>
          )}
          <Circle pusat={pusat} radius={radius} warna="var(--warna-utama)" tebal={4} />
          {tampilYangBisaDigambar.has('diameter') && (
            <SelectableUnsur id="diameter" redup={redupkan('diameter')} onFocus={fokuskan}>
              <Segment awal={geometri.titikA} akhir={geometri.titikDiameter} warna={UNSUR_INFO.diameter.warna} tebal={6} />
            </SelectableUnsur>
          )}
          {tampilYangBisaDigambar.has('jariJari') && (
            <SelectableUnsur id="jariJari" redup={redupkan('jariJari')} onFocus={fokuskan}>
              <Segment awal={pusat} akhir={geometri.titikA} warna={UNSUR_INFO.jariJari.warna} tebal={5} />
            </SelectableUnsur>
          )}
          {tampilYangBisaDigambar.has('taliBusur') && geometri.adaTaliBusur && (
            <SelectableUnsur id="taliBusur" redup={redupkan('taliBusur')} onFocus={fokuskan}>
              <Segment awal={geometri.titikA} akhir={geometri.titikB} warna={UNSUR_INFO.taliBusur.warna} tebal={5} dash="6 4" />
            </SelectableUnsur>
          )}
          {tampilYangBisaDigambar.has('apotema') && !geometri.apotemaNol && (
            <SelectableUnsur id="apotema" redup={redupkan('apotema')} onFocus={fokuskan}>
              <Segment awal={pusat} akhir={geometri.kakiApotema} warna={UNSUR_INFO.apotema.warna} tebal={4} dash="8 6" />
              <RightAngleMarker puncak={geometri.kakiApotema} a={pusat} b={geometri.titikA} ukuran={Math.max(10, Math.min(18, radius * 0.11))} warna={UNSUR_INFO.apotema.warna} />
            </SelectableUnsur>
          )}
          {tampilYangBisaDigambar.has('busur') && geometri.adaTaliBusur && (
            <SelectableUnsur id="busur" redup={redupkan('busur')} onFocus={fokuskan}>
              <Arc pusat={pusat} radius={radius} sudutAwal={geometri.rentangBusur.awal} sudutAkhir={geometri.rentangBusur.akhir} warna={UNSUR_INFO.busur.warna} tebal={9} />
            </SelectableUnsur>
          )}
          {tampilYangBisaDigambar.has('pusat') && (
            <SelectableUnsur id="pusat" redup={redupkan('pusat')} onFocus={fokuskan}>
              <Circle pusat={pusat} radius={6} warna={UNSUR_INFO.pusat.warna} isi={UNSUR_INFO.pusat.warna} tebal={1} />
            </SelectableUnsur>
          )}
          {penempatanLabel.map((penempatan) => <VisualLabel key={penempatan.id} penempatan={penempatan} onFocus={fokuskan} redup={redupkan(penempatan.id)} />)}
          <DraggablePoint titik={geometri.titikA} label="A" warna={UNSUR_INFO.taliBusur.warna} onChange={ubahSudutA} constrain={(titik) => batasiKeLingkaran(titik, radius)} />
          <DraggablePoint titik={geometri.titikB} label="B" warna={UNSUR_INFO.taliBusur.warna} onChange={ubahSudutB} constrain={(titik) => batasiKeLingkaran(titik, radius)} />
        </Canvas>
        <div className="canvas-caption">Pilih chip untuk menampilkan unsur. Ketuk garis, bidang, atau lencana pada gambar untuk memfokuskannya. Pada mode semua, garis penunjuk menghubungkan setiap lencana dengan unsurnya. Titik A dan B dapat digeser pada keliling.</div>
        {!geometri.adaTaliBusur && <p className="diagram-note warning">Titik A dan B berimpit. Tali busur, busur, juring, dan tembereng disembunyikan.</p>}
        {geometri.apotemaNol && tampil.has('apotema') && <p className="diagram-note">Apotema = 0 karena tali busur melalui pusat.</p>}
      </section>
      <aside className="control-card">
        <div className="control-card-heading"><div><span className="eyebrow">Pilih unsur</span><h2>{namaJudul}</h2></div><button type="button" className="reset-button" onClick={reset}>↻ Reset</button></div>
        <div className="unsur-actions" aria-label="Mode tampilan unsur">
          <button type="button" className={satuPerSatuAktif ? 'all-button aktif' : 'all-button'} aria-pressed={satuPerSatuAktif} onClick={tampilkanSatu}>Satu per satu</button>
          <button type="button" className={semuaAktif ? 'all-button aktif' : 'all-button'} aria-pressed={semuaAktif} onClick={tampilkanSemua}>Tampilkan semua</button>
          <button type="button" className="reset-button" onClick={kosongkan}>Kosongkan</button>
        </div>
        <div className="chip-grid unsur-chips" aria-label="Saklar unsur lingkaran">
          {SEMUA_UNSUR.map((id) => (
            <button
              type="button"
              key={id}
              className={tampil.has(id) ? 'chip aktif' : 'chip'}
              style={{ '--chip-color': UNSUR_INFO[id].warna } as CSSProperties}
              aria-pressed={tampil.has(id)}
              onClick={() => ubahTampilan(id)}
            >
              <span className="chip-number" aria-hidden="true">{UNSUR_INFO[id].nomor}.</span>
              <span>{UNSUR_INFO[id].nama}</span>
            </button>
          ))}
        </div>
        <section className="definition-panel" aria-label="Definisi unsur lingkaran">
          {fokusAktif ? (
            <DefinisiUnsur id={fokusAktif} />
          ) : tampilYangBisaDigambar.size > 1 ? (
            <>
              <h3>Legenda unsur</h3>
              <div className="legend-list">
                {SEMUA_UNSUR.map((id) => {
                  const info = UNSUR_INFO[id];
                  return (
                    <button type="button" key={id} className="legend-item" style={{ '--legend-color': info.warna } as CSSProperties} onClick={() => fokuskan(id)}>
                      <span className={`legend-swatch ${info.gaya}`} aria-hidden="true" />
                      <span><strong>{info.nomor}. {info.nama}</strong><p>{info.definisi}</p></span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : tampilYangBisaDigambar.size === 1 ? (
            <DefinisiUnsur id={Array.from(tampilYangBisaDigambar)[0]} />
          ) : (
            <p className="empty-note">Belum ada unsur yang ditampilkan. Nyalakan chip untuk mulai mengamati.</p>
          )}
        </section>
        <SliderControl label="Jari-jari" value={radius} minimum={100} maksimum={175} satuan=" cm" onChange={setRadius} />
        <ValuePanel items={[
          { label: 'Jari-jari r', value: `${radius} cm`, warna: UNSUR_INFO.jariJari.warna },
          { label: 'Diameter d', value: `${radius * 2} cm`, warna: UNSUR_INFO.diameter.warna },
          { label: 'Panjang tali busur AB', value: `${geometri.panjangTaliBusur.toFixed(1)} cm`, warna: UNSUR_INFO.taliBusur.warna },
          { label: 'Apotema', value: geometri.adaTaliBusur ? `${geometri.panjangApotema.toFixed(1)} cm` : '—', warna: UNSUR_INFO.apotema.warna }
        ]} />
        <Formula rumus={rumus} label="Rumus unsur lingkaran" />
        <p className="tip-text">Garis fokus tampil penuh; unsur lain tetap terlihat lebih redup. Pada layar sempit, angka pada lencana cocok dengan legenda.</p>
      </aside>
    </div>
  );
}
