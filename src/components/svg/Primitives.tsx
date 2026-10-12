import { memo, type ReactNode } from 'react';
import type { Point } from '../../lib/geometry';
import { useIfp } from '../../lib/ifpContext';

interface CircleProps {
  pusat: Point;
  radius: number;
  warna?: string;
  isi?: string;
  tebal?: number;
  dash?: string;
}

export const Circle = memo(function Circle({ pusat, radius, warna = 'var(--warna-utama)', isi = 'none', tebal = 3, dash }: CircleProps) {
  const { skalaGaris } = useIfp();
  return <circle cx={pusat.x} cy={pusat.y} r={radius} fill={isi} stroke={warna} strokeWidth={tebal * skalaGaris} strokeDasharray={dash} />;
});

interface SegmentProps {
  awal: Point;
  akhir: Point;
  warna?: string;
  tebal?: number;
  dash?: string;
  anak?: ReactNode;
}

export const Segment = memo(function Segment({ awal, akhir, warna = 'var(--warna-teks)', tebal = 3, dash, anak }: SegmentProps) {
  const { skalaGaris } = useIfp();
  return <g>{anak}<line x1={awal.x} y1={awal.y} x2={akhir.x} y2={akhir.y} stroke={warna} strokeWidth={tebal * skalaGaris} strokeDasharray={dash} strokeLinecap="round" /></g>;
});

interface ArcProps {
  pusat: Point;
  radius: number;
  sudutAwal: number;
  sudutAkhir: number;
  warna?: string;
  tebal?: number;
  isi?: string;
  panjang?: number;
  isiOpasitas?: number;
}

export const Arc = memo(function Arc({ pusat, radius, sudutAwal, sudutAkhir, warna = 'var(--warna-busur)', tebal = 5, isi = 'none', panjang = 1, isiOpasitas = 0.18 }: ArcProps) {
  const { skalaGaris } = useIfp();
  const start = { x: pusat.x + radius * Math.cos(sudutAwal), y: pusat.y + radius * Math.sin(sudutAwal) };
  const end = { x: pusat.x + radius * Math.cos(sudutAkhir), y: pusat.y + radius * Math.sin(sudutAkhir) };
  const delta = sudutAkhir - sudutAwal;
  const largeArc = Math.abs(delta) > Math.PI ? 1 : 0;
  const sweep = delta >= 0 ? 1 : 0;
  const d = isi === 'none'
    ? `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`
    : `M ${pusat.x} ${pusat.y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y} Z`;
  return <path d={d} fill={isi} fillOpacity={isi === 'none' ? 0 : isiOpasitas} stroke={warna} strokeWidth={tebal * skalaGaris} strokeLinecap="round" pathLength="1" strokeDasharray={isi === 'none' ? `${panjang} ${1 - panjang}` : undefined} />;
});

interface AngleMarkerProps {
  pusat: Point;
  radius: number;
  sudutAwal: number;
  sudutAkhir: number;
  warna?: string;
  label?: string;
}

export const AngleMarker = memo(function AngleMarker({ pusat, radius, sudutAwal, sudutAkhir, warna = 'var(--warna-aksen)', label }: AngleMarkerProps) {
  const { skalaGaris } = useIfp();
  const start = { x: pusat.x + radius * Math.cos(sudutAwal), y: pusat.y + radius * Math.sin(sudutAwal) };
  const end = { x: pusat.x + radius * Math.cos(sudutAkhir), y: pusat.y + radius * Math.sin(sudutAkhir) };
  const tengah = (sudutAwal + sudutAkhir) / 2;
  const labelPoint = { x: pusat.x + (radius + 20) * Math.cos(tengah), y: pusat.y + (radius + 20) * Math.sin(tengah) };
  const largeArc = Math.abs(sudutAkhir - sudutAwal) > Math.PI ? 1 : 0;
  const sweep = sudutAkhir >= sudutAwal ? 1 : 0;
  return <g><path d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`} fill="none" stroke={warna} strokeWidth={5 * skalaGaris} /><text className="svg-angle-label" x={labelPoint.x} y={labelPoint.y}>{label}</text></g>;
});

export const RightAngleMarker = memo(function RightAngleMarker({ puncak, a, b, ukuran = 15, warna = 'var(--warna-aksen)' }: { puncak: Point; a: Point; b: Point; ukuran?: number; warna?: string }) {
  const { skalaGaris } = useIfp();
  const unit = (titik: Point): Point => {
    const panjang = Math.hypot(titik.x, titik.y);
    return { x: titik.x / panjang, y: titik.y / panjang };
  };
  const vA = { x: a.x - puncak.x, y: a.y - puncak.y };
  const vB = { x: b.x - puncak.x, y: b.y - puncak.y };
  if (Math.hypot(vA.x, vA.y) < 1e-9 || Math.hypot(vB.x, vB.y) < 1e-9) return null;
  const va = unit(vA);
  const vb = unit(vB);
  const p1 = { x: puncak.x + va.x * ukuran, y: puncak.y + va.y * ukuran };
  const p2 = { x: p1.x + vb.x * ukuran, y: p1.y + vb.y * ukuran };
  const p3 = { x: puncak.x + vb.x * ukuran, y: puncak.y + vb.y * ukuran };
  return <path d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`} fill="none" stroke={warna} strokeWidth={3 * skalaGaris} />;
});

export const Label = memo(function Label({ titik, children, warna = 'var(--warna-teks)', anchor = 'middle' }: { titik: Point; children: ReactNode; warna?: string; anchor?: 'start' | 'middle' | 'end' }) {
  return <text className="svg-label" x={titik.x} y={titik.y} fill={warna} textAnchor={anchor}>{children}</text>;
});

export const LandmarkPoint = memo(function LandmarkPoint({ titik, warna = 'var(--warna-utama)', r = 5.5, label }: { titik: Point; warna?: string; r?: number; label?: string }) {
  const { skalaGaris } = useIfp();
  return (
    <g className="svg-landmark-point" pointerEvents="none">
      <circle cx={titik.x} cy={titik.y} r={r * skalaGaris} fill="#ffffff" stroke={warna} strokeWidth={3 * skalaGaris} />
      {label && <text className="svg-point-label" x={titik.x + 10 * skalaGaris} y={titik.y - 10 * skalaGaris}>{label}</text>}
    </g>
  );
});

