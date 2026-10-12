import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { Point } from '../../lib/geometry';
import { useIfp } from '../../lib/ifpContext';
import { clientToSvg } from './coordinates';
import { buatPenjadwalFrame, type FrameScheduler } from './dragFrame';
import { terapkanLangkah, type SvgKeyboardKey } from './keyboard';

interface DraggablePointProps {
  titik: Point;
  label?: string;
  warna?: string;
  aktif?: boolean;
  utama?: boolean;
  onChange: (titik: Point) => void;
  constrain?: (titik: Point) => Point;
  ariaLabel?: string;
  onKeyboardMove?: (titik: Point, key: SvgKeyboardKey, shift: boolean) => Point | null;
}

export function DraggablePoint({ titik, label, warna = 'var(--warna-aksen)', aktif = true, utama = true, onChange, constrain = (nilai) => nilai, ariaLabel, onKeyboardMove }: DraggablePointProps) {
  const { skalaGaris } = useIfp();
  const [sedangGeser, setSedangGeser] = useState(false);
  const [pernahDisentuh, setPernahDisentuh] = useState(false);
  const offset = useRef<Point>({ x: 0, y: 0 });
  const pointerId = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  const scheduler = useRef<FrameScheduler<Point> | null>(null);
  onChangeRef.current = onChange;
  if (!scheduler.current) {
    scheduler.current = buatPenjadwalFrame(
      (nilai) => onChangeRef.current(nilai),
      (callback) => window.requestAnimationFrame(callback),
      (handle) => window.cancelAnimationFrame(handle)
    );
  }

  useEffect(() => () => scheduler.current?.batal(), []);

  function mulai(event: PointerEvent<SVGCircleElement>): void {
    if (!aktif) return;
    setSedangGeser(true);
    setPernahDisentuh(true);
    const svg = event.currentTarget.ownerSVGElement;
    const posisiPointer = svg ? clientToSvg(svg, event.clientX, event.clientY) : null;
    offset.current = posisiPointer ? { x: titik.x - posisiPointer.x, y: titik.y - posisiPointer.y } : { x: 0, y: 0 };
    pointerId.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function gerak(event: PointerEvent<SVGCircleElement>): void {
    if (pointerId.current !== event.pointerId || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const posisiPointer = clientToSvg(svg, event.clientX, event.clientY);
    if (!posisiPointer) return;
    const titikBaru = constrain({ x: posisiPointer.x + offset.current.x, y: posisiPointer.y + offset.current.y });
    scheduler.current?.masukkan(titikBaru);
  }

  function selesai(event: PointerEvent<SVGCircleElement>): void {
    if (pointerId.current !== event.pointerId) return;
    setSedangGeser(false);
    const svg = event.currentTarget.ownerSVGElement;
    const posisiPointer = svg ? clientToSvg(svg, event.clientX, event.clientY) : null;
    if (posisiPointer) {
      scheduler.current?.masukkan(constrain({ x: posisiPointer.x + offset.current.x, y: posisiPointer.y + offset.current.y }));
    }
    scheduler.current?.flush();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    pointerId.current = null;
  }

  function batal(event: PointerEvent<SVGCircleElement>): void {
    if (pointerId.current !== event.pointerId) return;
    setSedangGeser(false);
    scheduler.current?.flush();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    pointerId.current = null;
  }

  function tekan(event: KeyboardEvent<SVGCircleElement>): void {
    if (!aktif) return;
    const key = event.key;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
    setPernahDisentuh(true);
    event.preventDefault();
    const berikutnya = onKeyboardMove
      ? onKeyboardMove(titik, key as SvgKeyboardKey, event.shiftKey)
      : terapkanLangkah(titik, key as SvgKeyboardKey, event.shiftKey, constrain);
    if (berikutnya) onChange(berikutnya);
  }

  const tampilkanHalo = aktif && utama && !sedangGeser && !pernahDisentuh;

  return (
    <g className="draggable-point" style={{ pointerEvents: aktif ? 'auto' : 'none' }} onClick={(event) => event.stopPropagation()}>
      <circle
        className="drag-hit-area"
        cx={titik.x}
        cy={titik.y}
        r={46 * skalaGaris}
        fill="transparent"
        onPointerDown={mulai}
        onPointerMove={gerak}
        onPointerUp={selesai}
        onPointerCancel={batal}
        onKeyDown={tekan}
        style={{ touchAction: 'none', cursor: 'grab' }}
        role="button"
        tabIndex={aktif ? 0 : -1}
        focusable="true"
        aria-label={ariaLabel ?? (label ? `Titik ${label}, posisi (${Math.round(titik.x)}, ${Math.round(titik.y)}). Gunakan tombol panah untuk menggeser.` : 'Titik yang dapat digeser. Gunakan tombol panah untuk menggeser.')}
      />
      {tampilkanHalo && (
        <circle
          className="draggable-halo"
          cx={titik.x}
          cy={titik.y}
          r={12 * skalaGaris}
          fill="none"
          stroke={warna}
          strokeWidth={2.5 * skalaGaris}
          pointerEvents="none"
        />
      )}
      <circle cx={titik.x} cy={titik.y} r={10 * skalaGaris} fill={warna} stroke="#ffffff" strokeWidth={4 * skalaGaris} pointerEvents="none" />
      {label && <text className="svg-point-label" x={titik.x + 14 * skalaGaris} y={titik.y - 14 * skalaGaris}>{label}</text>}
    </g>
  );
}
