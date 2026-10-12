import type { Point } from './types';
import { kurang, normalisasiSudut, sudutArah } from './point';

export function sudutDiTitik(puncak: Point, a: Point, b: Point): number {
  const v1 = kurang(a, puncak);
  const v2 = kurang(b, puncak);
  const pembilang = v1.x * v2.x + v1.y * v2.y;
  const penyebut = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (!Number.isFinite(pembilang) || !Number.isFinite(penyebut) || penyebut <= 1e-12) return 0;
  return Math.acos(Math.max(-1, Math.min(1, pembilang / penyebut)));
}

export function sudutBerarah(pusat: Point, a: Point, b: Point): number {
  return normalisasiSudut(sudutArah(pusat, b) - sudutArah(pusat, a));
}

export function titikDiBusurKecil(sudutA: number, sudutB: number, sudutTitik: number): boolean {
  const a = normalisasiSudut(sudutA);
  const b = normalisasiSudut(sudutB);
  const t = normalisasiSudut(sudutTitik);
  const maju = normalisasiSudut(b - a);
  const dariA = normalisasiSudut(t - a);
  if (maju <= Math.PI) return dariA <= maju;
  return normalisasiSudut(a - t) <= normalisasiSudut(a - b);
}

export function sudutPusatUntukBusurBerhadapan(sudutA: number, sudutB: number, sudutC: number): number {
  const busurKecil = Math.min(sudutBerarah({ x: 0, y: 0 }, { x: Math.cos(sudutA), y: Math.sin(sudutA) }, { x: Math.cos(sudutB), y: Math.sin(sudutB) }), sudutBerarah({ x: 0, y: 0 }, { x: Math.cos(sudutB), y: Math.sin(sudutB) }, { x: Math.cos(sudutA), y: Math.sin(sudutA) }));
  return titikDiBusurKecil(sudutA, sudutB, sudutC) ? Math.PI * 2 - busurKecil : busurKecil;
}
