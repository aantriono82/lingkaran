import { useEffect, useMemo, useState } from 'react';
import { Canvas, Circle, Label, Segment } from '../../components/svg';
import { Formula, Pi, PiText, SliderControl, ValuePanel } from '../../components';
import { formulasByTopic } from '../../lib/formulas';
import { describeLuas } from '../descriptions';

interface Point {
  x: number;
  y: number;
}

interface DiagramLayout {
  viewBox: string;
  circleCenter: Point;
  circleRadius: number;
  shapeLeft: number;
  shapeTop: number;
  shapeWidth: number;
  dimensionY: number;
  verticalBracketX: number;
}

function useCompactLayout(): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 520px)');
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return compact;
}

function titikPolar(pusat: Point, radius: number, sudut: number): Point {
  return { x: pusat.x + radius * Math.cos(sudut), y: pusat.y + radius * Math.sin(sudut) };
}

function pathJuring(pusat: Point, radius: number, sudutAwal: number, sudutAkhir: number): string {
  const awal = titikPolar(pusat, radius, sudutAwal);
  const akhir = titikPolar(pusat, radius, sudutAkhir);
  const besarBusur = sudutAkhir - sudutAwal > Math.PI ? 1 : 0;
  return `M ${pusat.x} ${pusat.y} L ${awal.x} ${awal.y} A ${radius} ${radius} 0 ${besarBusur} 1 ${akhir.x} ${akhir.y} Z`;
}

function layoutDiagram(compact: boolean): DiagramLayout {
  return compact
    ? {
        viewBox: '0 0 360 450',
        circleCenter: { x: 180, y: 88 },
        circleRadius: 88,
        shapeLeft: 42,
        shapeTop: 250,
        shapeWidth: 276,
        dimensionY: 370,
        verticalBracketX: 24
      }
    : {
        viewBox: '0 0 700 360',
        circleCenter: { x: 135, y: 142 },
        circleRadius: 83,
        shapeLeft: 390,
        shapeTop: 95,
        shapeWidth: 260,
        dimensionY: 240,
        verticalBracketX: 360
      };
}

export function ExploreLuas() {
  const [radius, setRadius] = useState(7);
  const [jumlahJuring, setJumlahJuring] = useState(16);
  const compact = useCompactLayout();
  const layout = useMemo(() => layoutDiagram(compact), [compact]);
  const pi = radius % 7 === 0 ? 22 / 7 : 3.14;
  const luas = pi * radius * radius;
  const lebarTeoritis = pi * radius;
  const radiusVisual = layout.circleRadius;
  const sudutJuring = (Math.PI * 2) / jumlahJuring;
  const jarakPusat = radiusVisual * sudutJuring / 2;
  const setengahLebar = radiusVisual * Math.sin(sudutJuring / 2);
  const shapeRight = layout.shapeLeft + layout.shapeWidth;
  const shapeBottom = layout.shapeTop + radiusVisual;
  const warnaJuring = 'var(--warna-utama)';
  const warnaSelang = 'var(--warna-juring)';
  const warnaUntuk = (indeks: number): string => indeks % 2 === 0 ? warnaJuring : warnaSelang;
  const lingkaranJuring = useMemo(() => Array.from({ length: jumlahJuring }, (_, indeks) => {
    const awal = -Math.PI / 2 + indeks * sudutJuring;
    return {
      indeks,
      path: pathJuring(layout.circleCenter, radiusVisual, awal, awal + sudutJuring)
    };
  }), [jumlahJuring, layout, radiusVisual, sudutJuring]);

  function reset(): void {
    setRadius(7);
    setJumlahJuring(16);
  }

  const juring = useMemo<Array<{ key: string; path: string; indeks: number }>>(() => jumlahJuring % 2 === 0
    ? [
        {
          key: 'setengah-kiri',
          path: pathJuring(
            { x: layout.shapeLeft + setengahLebar, y: shapeBottom },
            radiusVisual,
            -Math.PI / 2 - sudutJuring / 2,
            -Math.PI / 2
          ),
          indeks: 0
        },
        ...Array.from({ length: jumlahJuring - 1 }, (_, offset) => {
          const indeks = offset + 1;
          const menghadapAtas = indeks % 2 === 0;
          const pusat = {
            x: layout.shapeLeft + indeks * jarakPusat,
            y: menghadapAtas ? shapeBottom : layout.shapeTop
          };
          const arah = menghadapAtas ? -Math.PI / 2 : Math.PI / 2;
          return {
            key: `penuh-${indeks}`,
            path: pathJuring(pusat, radiusVisual, arah - sudutJuring / 2, arah + sudutJuring / 2),
            indeks
          };
        }),
        {
          key: 'setengah-kanan',
          path: pathJuring(
            { x: shapeRight - setengahLebar, y: shapeBottom },
            radiusVisual,
            -Math.PI / 2,
            -Math.PI / 2 + sudutJuring / 2
          ),
          indeks: 0
        }
      ]
    : Array.from({ length: jumlahJuring }, (_, indeks) => {
        const menghadapAtas = indeks % 2 === 0;
        const arah = menghadapAtas ? -Math.PI / 2 : Math.PI / 2;
        const pusat = {
          x: layout.shapeLeft + setengahLebar + indeks * jarakPusat,
          y: menghadapAtas ? shapeBottom : layout.shapeTop
        };
        return {
          key: `penuh-${indeks}`,
          path: pathJuring(pusat, radiusVisual, arah - sudutJuring / 2, arah + sudutJuring / 2),
          indeks
        };
      })
  , [jumlahJuring, layout, radiusVisual, sudutJuring, jarakPusat, setengahLebar, shapeBottom, shapeRight]);

  const titikRadius = titikPolar(layout.circleCenter, radiusVisual, -Math.PI / 3);
  const labelLebarX = layout.shapeLeft + layout.shapeWidth / 2;
  const labelTinggiY = layout.shapeTop + radiusVisual / 2;

  return <div className="explore-layout">
    <section className="canvas-card">
      <div className="canvas-heading"><span className="eyebrow">Kanvas interaktif</span><span className="instruction">Iris lalu susun kembali</span></div>
      <Canvas viewBox={layout.viewBox} label="Juring lingkaran disusun menjadi bangun yang mendekati persegi panjang" description={describeLuas({ radius, jumlahJuring, luas })} grid>
        <defs>
          <marker id="luas-dimension-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto-start-reverse" markerUnits="strokeWidth">
            <path d="M 0 0 L 7 3.5 L 0 7 Z" fill="var(--warna-teks-lembut)" />
          </marker>
        </defs>
        {lingkaranJuring.map(({ indeks, path }) => <path key={`lingkaran-juring-${indeks}`} d={path} className="sector-shape" style={{ fill: warnaUntuk(indeks), stroke: warnaUntuk(indeks) }} />)}
        <Circle pusat={layout.circleCenter} radius={radiusVisual} warna="var(--warna-utama)" tebal={4} />
        <Segment awal={layout.circleCenter} akhir={titikRadius} warna="var(--warna-radius)" tebal={4} />
        <Label titik={{ x: (layout.circleCenter.x + titikRadius.x) / 2 + 8, y: (layout.circleCenter.y + titikRadius.y) / 2 - 8 }} warna="var(--warna-radius)">r</Label>
        <Label titik={{ x: layout.circleCenter.x, y: layout.circleCenter.y + radiusVisual + 28 }} warna="var(--warna-teks-lembut)">{jumlahJuring} juring</Label>

        <rect x={layout.shapeLeft} y={layout.shapeTop} width={layout.shapeWidth} height={radiusVisual} fill="none" stroke="var(--warna-garis)" strokeWidth="1.5" strokeDasharray="6 5" />
        {juring.map(({ key, path, indeks }) => <path key={key} d={path} className="sector-shape" style={{ fill: warnaUntuk(indeks), stroke: warnaUntuk(indeks) }} />)}

        <line x1={layout.shapeLeft} y1={layout.dimensionY} x2={shapeRight} y2={layout.dimensionY} stroke="var(--warna-teks-lembut)" strokeWidth="1.5" markerStart="url(#luas-dimension-arrow)" markerEnd="url(#luas-dimension-arrow)" />
        <text className="svg-label diagram-dimension" x={labelLebarX} y={layout.dimensionY + 20} textAnchor="middle">
          <tspan x={labelLebarX} dy="0">lebar ≈ <Pi svg />r</tspan>
          <tspan x={labelLebarX} dy="18">≈ {lebarTeoritis.toFixed(2)} cm</tspan>
        </text>
        <line x1={layout.verticalBracketX} y1={layout.shapeTop} x2={layout.verticalBracketX} y2={shapeBottom} stroke="var(--warna-teks-lembut)" strokeWidth="1.5" markerStart="url(#luas-dimension-arrow)" markerEnd="url(#luas-dimension-arrow)" />
        <text className="svg-label diagram-dimension" x={layout.verticalBracketX - 12} y={labelTinggiY} textAnchor="middle" transform={`rotate(-90 ${layout.verticalBracketX - 12} ${labelTinggiY})`}>tinggi = r</text>
      </Canvas>
      <div className="canvas-caption"><PiText text="Semakin banyak juring, susunannya semakin mendekati persegi panjang. Tinggi bangun adalah r dan lebarnya sekitar πr." /></div>
    </section>
    <aside className="control-card">
      <div className="control-card-heading"><div><span className="eyebrow">Amati luas</span><h2>Juring disusun berselang-seling</h2></div><button className="reset-button" onClick={reset}>↻ Reset</button></div>
      <SliderControl label="Jari-jari" value={radius} minimum={3} maksimum={15} satuan=" cm" onChange={setRadius} />
      <SliderControl label="Jumlah juring" value={jumlahJuring} minimum={4} maksimum={64} langkah={2} onChange={setJumlahJuring} />
      <ValuePanel items={[{ label: 'Jari-jari r', value: `${radius} cm`, warna: 'var(--warna-radius)' }, { label: 'Luas L', value: `${luas.toFixed(2)} cm²`, warna: 'var(--warna-juring)' }, { label: <><span>Lebar susunan ≈ </span><Pi />r</>, value: `${lebarTeoritis.toFixed(2)} cm`, warna: 'var(--warna-susun)' }, { label: 'Tinggi susunan', value: `${radius} cm`, warna: 'var(--warna-radius)' }]} />
      <Formula rumus={formulasByTopic['03-luas'].eksplorasi[0]} label="Rumus luas lingkaran" />
      <p className="tip-text"><PiText text="Gunakan π = 22/7 jika jari-jari kelipatan 7; gunakan 3,14 selain itu. Luas juring juga dapat dihitung sebagai bagian sudut dari luas penuh." /></p>
    </aside>
  </div>;
}
